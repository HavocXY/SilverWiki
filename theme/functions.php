<?php

use BookStack\Facades\Theme;
use Illuminate\Console\Command;
use BookStack\Entities\Models\Book;
use BookStack\Entities\Models\Page;
use BookStack\Entities\Repos\BookRepo;
use BookStack\Entities\Repos\PageRepo;
use BookStack\Users\Models\User;

/**
 * Custom Artisan Command to import SilverWiki templates.
 * Why this command exists: Seeding templates directly via migrations or SQL files is prone to
 * database state issues. This Laravel Artisan command leverages BookStack's native Repositories
 * to ensure that templates are created following all system rules, permission hierarchies,
 * and page revision tracking.
 */
class ImportTemplatesCommand extends Command
{
    protected $signature = 'silverwiki:import-templates';
    protected $description = 'Importiert die vordefinierten SilverWiki Seitenvorlagen in die Datenbank';

    public function handle(BookRepo $bookRepo, PageRepo $pageRepo): int
    {
        // Why we authenticate: When running Artisan commands in the CLI context, Laravel
        // resolves the session user to 'Guest' by default. BookStack blocks page/book creation
        // for guests. By querying the first user with an 'admin' system role and programmatically
        // logging them in, we bypass this authorization restriction safely during CLI execution.
        $this->info('Anmeldung als System-Administrator...');
        $adminUser = User::query()
            ->whereHas('roles', function ($query) {
                $query->where('system_name', '=', 'admin');
            })->first();

        if (!$adminUser) {
            $this->error('Kein Administrator-Konto in der Datenbank gefunden!');
            return 1;
        }

        auth()->login($adminUser);
        $this->info("Erfolgreich angemeldet als: {$adminUser->name} ({$adminUser->email})");

        // Find or create the Templates Book.
        // Why we group them: Placing all templates inside a dedicated Book makes it easier
        // for users to browse, edit, and discover them. Since the pages are marked as templates,
        // BookStack handles them as reusable layouts without polluting the normal search indexing.
        $bookName = 'SilverWiki Vorlagen';
        $bookDescription = 'Bibliothek für SilverWiki Vorlagen (Arbeitsanweisungen, Normen, Steckbriefe etc.)';
        
        $this->info("Prüfe Buch '{$bookName}'...");
        $book = Book::query()->where('name', '=', $bookName)->first();
        if (!$book) {
            $this->info("Erstelle Buch '{$bookName}'...");
            $book = $bookRepo->create([
                'name' => $bookName,
                'description' => $bookDescription,
            ]);
        }

        // Templates configuration mapping
        // We read local static HTML files from the theme folder and seed them as pages.
        $templatesDir = theme_path('templates');
        if (!is_dir($templatesDir)) {
            $this->error("Vorlagen-Verzeichnis nicht gefunden unter: {$templatesDir}");
            return 1;
        }

        $templateMap = [
            'arbeitsanweisung.html' => 'Arbeitsanweisung (SOP)',
            'normen_zusammenfassung.html' => 'Normen-Zusammenfassung',
            'materialdatenblatt.html' => 'Materialdatenblatt',
            'onboarding_steckbrief.html' => 'Onboarding-Steckbrief',
        ];

        foreach ($templateMap as $filename => $title) {
            $filePath = $templatesDir . '/' . $filename;
            if (!file_exists($filePath)) {
                $this->warn("Vorlagen-Datei nicht gefunden: {$filename}");
                continue;
            }

            $htmlContent = file_get_contents($filePath);
            $this->info("Importiere Vorlage: {$title}...");

            // Why we query the database before creation: To ensure idempotency. If this
            // command is run multiple times (e.g. during deployment, Docker container recreation,
            // or updates), we update the existing template page in-place instead of creating duplicates.
            $page = Page::query()
                ->where('book_id', '=', $book->id)
                ->where('name', '=', $title)
                ->where('template', '=', true)
                ->first();

            // Why we set 'editor' => 'wysiwyg': BookStack needs to know that these pages
            // contain structured HTML. If we set it to 'markdown', BookStack's editor might
            // strip out our grid CSS classes, styling definitions, and layout containers.
            if ($page) {
                $this->info("Vorlage '{$title}' existiert bereits. Aktualisiere Inhalt...");
                $pageRepo->setContentFromInput($page, [
                    'name' => $title,
                    'html' => $htmlContent,
                    'editor' => 'wysiwyg',
                ]);
            } else {
                // If it doesn't exist, we create a draft and publish it directly.
                // This ensures all database hooks (like activity logging and revisions) run normally.
                $this->info("Erstelle neue Vorlage '{$title}'...");
                $draft = $pageRepo->getNewDraftPage($book);
                $pageRepo->publishDraft($draft, [
                    'name' => $title,
                    'html' => $htmlContent,
                    'template' => 'true', // Marks this page as an editor template in BookStack
                    'editor' => 'wysiwyg',
                ]);
            }
        }

        $this->info('🎉 Alle SilverWiki Vorlagen wurden erfolgreich importiert!');
        return 0;
    }
}

// Register command with BookStack Theme Service
// This exposes our custom Artisan console command to Laravel's CLI kernel automatically.
Theme::registerCommand(new ImportTemplatesCommand());

// Include the new RAG AI Service
require_once __DIR__ . '/RagService.php';
