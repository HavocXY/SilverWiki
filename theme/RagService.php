<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use BookStack\Entities\Models\Page;
use Illuminate\Console\Command;
use BookStack\Facades\Theme;

// RAG Install Command
class InstallRagCommand extends Command
{
    protected $signature = 'silverwiki:install-rag';
    protected $description = 'Erstellt die benötigten Datenbanktabellen für das SilverWiki RAG System';

    public function handle()
    {
        $this->info('Prüfe Tabelle silverwiki_embeddings...');
        if (!Schema::hasTable('silverwiki_embeddings')) {
            Schema::create('silverwiki_embeddings', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('page_id')->index();
                $table->text('chunk_text');
                $table->json('vector_json');
                $table->timestamps();
                
                // BookStack uses integer IDs for pages, sometimes bigIncrements but usually int.
            });
            $this->info('Tabelle silverwiki_embeddings wurde erfolgreich erstellt!');
        } else {
            $this->info('Tabelle existiert bereits.');
        }
        return 0;
    }
}
Theme::registerCommand(new InstallRagCommand());
// RAG Index Command
class IndexRagCommand extends Command
{
    protected $signature = 'silverwiki:index-all-pages';
    protected $description = 'Vektorisiert alle bestehenden Wiki-Seiten für das KI-Chat System';

    public function handle()
    {
        $this->info('Lade alle Wiki-Seiten...');
        $pages = Page::all();
        $total = $pages->count();
        $this->info("Gefunden: {$total} Seiten. Starte Indizierung...");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($pages as $page) {
            RagService::processPage($page);
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nIndizierung abgeschlossen!");
        return 0;
    }
}
Theme::registerCommand(new IndexRagCommand());

// RAG Service Class
class RagService
{
    protected static $ollamaUrl = 'http://ollama:11434';
    protected static $embedModel = 'nomic-embed-text';

    public static function chunkText($text, $chunkSize = 500)
    {
        $text = strip_tags($text);
        $text = preg_replace('/\s+/', ' ', $text);
        $words = explode(' ', $text);
        $chunks = array_chunk($words, $chunkSize);
        return array_map(function($chunk) {
            return implode(' ', $chunk);
        }, $chunks);
    }

    public static function getEmbedding($text)
    {
        try {
            $response = Http::post(self::$ollamaUrl . '/api/embeddings', [
                'model' => self::$embedModel,
                'prompt' => $text,
            ]);
            if ($response->successful()) {
                return $response->json('embedding');
            }
        } catch (\Exception $e) {
            \Log::error('Ollama Embedding Fehler: ' . $e->getMessage());
        }
        return null;
    }

    public static function processPage(Page $page)
    {
        // First, delete old embeddings for this page
        DB::table('silverwiki_embeddings')->where('page_id', $page->id)->delete();

        // Process new content
        $content = $page->html ?: $page->text;
        if (empty(trim($content))) return;

        $chunks = self::chunkText($content);

        foreach ($chunks as $chunk) {
            if (strlen(trim($chunk)) < 10) continue; // Skip very small fragments

            $embedding = self::getEmbedding($chunk);
            if ($embedding) {
                DB::table('silverwiki_embeddings')->insert([
                    'page_id' => $page->id,
                    'chunk_text' => $chunk,
                    'vector_json' => json_encode($embedding),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public static function deletePage(Page $page)
    {
        DB::table('silverwiki_embeddings')->where('page_id', $page->id)->delete();
    }

    public static function getCosineSimilarityQuery($vectorArray)
    {
        // For MySQL 8 without vector indexes, we use JSON functions.
        // This is a slow mathematical approximation but acceptable for small datasets.
        // The dot product formula in JSON requires a custom function or cross join, 
        // but for simplicity we can also fetch all vectors and compute in PHP, 
        // or just use a simplified JSON dot product.
        // Since computing cosine similarity purely in MySQL JSON is highly complex, 
        // we'll do an in-memory dot product in PHP if the dataset is small, 
        // or a limited fetch.
        return null;
    }

    public static function searchSimilarChunks($queryText, $limit = 3)
    {
        $queryEmbedding = self::getEmbedding($queryText);
        if (!$queryEmbedding) return [];

        // Fetch all embeddings (For a large wiki, this requires MySQL vector plugin or a real vector DB! 
        // For standard small wikis (<10k pages), doing it in PHP memory takes ~10-50ms).
        $allRecords = DB::table('silverwiki_embeddings')->get(['id', 'page_id', 'chunk_text', 'vector_json']);
        
        $results = [];
        foreach ($allRecords as $record) {
            $recordVector = json_decode($record->vector_json, true);
            $similarity = self::cosineSimilarity($queryEmbedding, $recordVector);
            $results[] = [
                'id' => $record->id,
                'page_id' => $record->page_id,
                'chunk_text' => $record->chunk_text,
                'similarity' => $similarity,
            ];
        }

        // Sort descending by similarity
        usort($results, function($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });

        return array_slice($results, 0, $limit);
    }

    protected static function cosineSimilarity($vec1, $vec2)
    {
        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;
        $count = min(count($vec1), count($vec2));
        
        for ($i = 0; $i < $count; $i++) {
            $dotProduct += $vec1[$i] * $vec2[$i];
            $normA += pow($vec1[$i], 2);
            $normB += pow($vec2[$i], 2);
        }
        
        if ($normA == 0 || $normB == 0) return 0;
        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}

// Register Listeners
Page::saved(function ($page) {
    RagService::processPage($page);
});

Page::deleted(function ($page) {
    RagService::deletePage($page);
});

// Register API Routes
Route::middleware(['web'])->group(function () {
    
    // API: Chat query
    Route::post('/api/silverwiki/chat', function (\Illuminate\Http\Request $request) {
        $question = $request->input('question');
        $model = setting('silverwiki-llm-model', 'gemma4:e2b');

        if (!$question) return response()->json(['error' => 'Keine Frage übermittelt'], 400);

        // 1. Retrieve similar chunks
        $chunks = RagService::searchSimilarChunks($question, 3);
        
        $contextTexts = [];
        $sourceLinks = [];
        foreach ($chunks as $chunk) {
            $page = \BookStack\Entities\Models\Page::find($chunk['page_id']);
            $sourceUrl = $page ? url($page->getUrl()) : '';
            $sourceTitle = $page ? $page->name : 'Unbekannte Seite';
            
            $contextTexts[] = "INHALT AUS SEITE '{$sourceTitle}':\n" . $chunk['chunk_text'];
            
            if ($page && !isset($sourceLinks[$page->id])) {
                $sourceLinks[$page->id] = "- {$sourceTitle}: {$sourceUrl}";
            }
        }
        $context = implode("\n\n---\n\n", $contextTexts);
        $sourcesList = implode("\n", $sourceLinks);

        $prompt = "Du bist ein strenger KI-Wissens-Assistent für dieses Wiki. Beantworte die folgende Frage AUSSCHLIESSLICH basierend auf dem bereitgestellten Kontext. Verwende NIEMALS dein eigenes, vortrainiertes Wissen. Wenn die gesuchte Information nicht explizit im Kontext zu finden ist, antworte exakt mit: 'Dazu gibt es leider keine Informationen im Wiki.' Erfinde keine Fakten. WICHTIG: Du MUSST am Ende deiner Antwort zwingend die entsprechenden Quell-Links auflisten (unter der Überschrift 'Quellen:'), aus denen du die Information bezogen hast.\n\nVerfügbare Quellen:\n{$sourcesList}\n\nKontext:\n{$context}\n\nFrage: {$question}";

        // 2. Stream to Ollama
        $response = Http::timeout(60)->withOptions(['stream' => true])->post('http://ollama:11434/api/generate', [
            'model' => $model,
            'prompt' => $prompt,
            'stream' => true,
        ]);

        return response()->stream(function () use ($response) {
            echo $response->getBody();
        }, 200, [
            'Content-Type' => 'application/x-ndjson',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    });

    // API: List local models
    Route::get('/api/silverwiki/ollama/models', function () {
        if (!userCan('settings-manage')) return abort(403);
        try {
            $response = Http::get('http://ollama:11434/api/tags');
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // API: Set active model
    Route::post('/api/silverwiki/ollama/model/set', function (\Illuminate\Http\Request $request) {
        if (!userCan('settings-manage')) return abort(403);
        $model = $request->input('model');
        // BookStack uses setting() helper
        setting()->put('silverwiki-llm-model', $model);
        return response()->json(['success' => true]);
    });

    // API: Pull new model
    Route::post('/api/silverwiki/ollama/model/pull', function (\Illuminate\Http\Request $request) {
        if (!userCan('settings-manage')) return abort(403);
        $model = $request->input('model');
        
        // This is streaming natively from Ollama
        $response = Http::timeout(300)->withOptions(['stream' => true])->post('http://ollama:11434/api/pull', [
            'name' => $model,
            'stream' => true,
        ]);

        return response()->stream(function () use ($response) {
            echo $response->getBody();
        }, 200, [
            'Content-Type' => 'application/x-ndjson',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    });
});
