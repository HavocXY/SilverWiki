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
 */
class ImportTemplatesCommand extends Command
{
    protected $signature = 'silverwiki:import-templates';
    protected $description = 'Importiert die vordefinierten SilverWiki Seitenvorlagen in die Datenbank';

    public function handle(BookRepo $bookRepo, PageRepo $pageRepo): int
    {
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

        // Find or create the Templates Book
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

            // Check if page template already exists in this book
            $page = Page::query()
                ->where('book_id', '=', $book->id)
                ->where('name', '=', $title)
                ->where('template', '=', true)
                ->first();

            if ($page) {
                $this->info("Vorlage '{$title}' existiert bereits. Aktualisiere Inhalt...");
                $pageRepo->setContentFromInput($page, [
                    'name' => $title,
                    'html' => $htmlContent,
                    'editor' => 'wysiwyg',
                ]);
            } else {
                $this->info("Erstelle neue Vorlage '{$title}'...");
                $draft = $pageRepo->getNewDraftPage($book);
                $pageRepo->publishDraft($draft, [
                    'name' => $title,
                    'html' => $htmlContent,
                    'template' => 'true',
                    'editor' => 'wysiwyg',
                ]);
            }
        }

        $this->info('🎉 Alle SilverWiki Vorlagen wurden erfolgreich importiert!');
        return 0;
    }
}

// Register command with BookStack Theme Service
Theme::registerCommand(new ImportTemplatesCommand());
