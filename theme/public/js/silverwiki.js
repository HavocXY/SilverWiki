/* ============================================================================
   SilverWiki — Tweaks Panel Interaction Logic
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── 1. Settings Init from LocalStorage ───────────────────────────────────
    const htmlEl = document.documentElement;
    
    // Density
    const savedDensity = localStorage.getItem('silverwiki_density') || 'normal';
    if (savedDensity === 'dense') {
        htmlEl.classList.add('density-dense');
    } else {
        htmlEl.classList.add('density-normal');
    }
    
    // Background Style
    const savedBgStyle = localStorage.getItem('silverwiki_bg_style') || 'gradient';
    if (savedBgStyle === 'gradient') {
        htmlEl.classList.add('bg-gradient');
    } else {
        htmlEl.classList.add('bg-flat');
    }

    // ── 2. Tweaks Panel Toggle ───────────────────────────────────────────────
    const tweaksBtn = document.querySelector('.silverwiki-tweaks-btn');
    const tweaksPanel = document.querySelector('.silverwiki-tweaks-panel');
    
    if (tweaksBtn && tweaksPanel) {
        tweaksBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tweaksPanel.classList.toggle('open');
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!tweaksPanel.contains(e.target) && !tweaksBtn.contains(e.target)) {
                tweaksPanel.classList.remove('open');
            }
        });
    }

    // ── 3. Wire Up Option Buttons ────────────────────────────────────────────
    const updateActiveButton = (groupName, activeValue) => {
        const buttons = document.querySelectorAll(`[data-tweak-group="${groupName}"]`);
        buttons.forEach(btn => {
            if (btn.getAttribute('data-tweak-value') === activeValue) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // Set initial active button states
    updateActiveButton('density', savedDensity);
    updateActiveButton('bgStyle', savedBgStyle);
    
    // Density Handlers
    document.querySelectorAll('[data-tweak-group="density"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-tweak-value');
            if (val === 'dense') {
                htmlEl.classList.add('density-dense');
                htmlEl.classList.remove('density-normal');
            } else {
                htmlEl.classList.add('density-normal');
                htmlEl.classList.remove('density-dense');
            }
            localStorage.setItem('silverwiki_density', val);
            updateActiveButton('density', val);
        });
    });

    // Background Style Handlers
    document.querySelectorAll('[data-tweak-group="bgStyle"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-tweak-value');
            if (val === 'gradient') {
                htmlEl.classList.add('bg-gradient');
                htmlEl.classList.remove('bg-flat');
            } else {
                htmlEl.classList.add('bg-flat');
                htmlEl.classList.remove('bg-gradient');
            }
            localStorage.setItem('silverwiki_bg_style', val);
            updateActiveButton('bgStyle', val);
        });
    });

    // Dark/Light Theme Handler (BookStack Integration)
    // BookStack defines if dark-mode is active by presence of class "dark-mode" on <html>.
    // We store the initial state on page load to prevent conflicts with temporary style previews
    // (e.g. in Settings -> Customization, where BookStack toggles the class for color preview).
    const isActualDarkOnLoad = htmlEl.classList.contains('dark-mode');
    updateActiveButton('theme', isActualDarkOnLoad ? 'dark' : 'light');

    document.querySelectorAll('[data-tweak-group="theme"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-tweak-value');
            
            // If user clicked a state different from the saved initial state, submit the BookStack dark-mode form
            if ((val === 'dark' && !isActualDarkOnLoad) || (val === 'light' && isActualDarkOnLoad)) {
                const nativeForm = document.querySelector('form[action*="toggle-dark-mode"]');
                if (nativeForm) {
                    nativeForm.submit();
                } else {
                    // Fallback: Submit manually via dynamic form if native one is not found
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/preferences/toggle-dark-mode';
                    
                    const methodInput = document.createElement('input');
                    methodInput.type = 'hidden';
                    methodInput.name = '_method';
                    methodInput.value = 'PATCH';
                    form.appendChild(methodInput);
                    
                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = '_token';
                    // Grab CSRF token from page meta
                    const metaToken = document.querySelector('meta[name="token"]');
                    tokenInput.value = metaToken ? metaToken.content : '';
                    form.appendChild(tokenInput);

                    const returnInput = document.createElement('input');
                    returnInput.type = 'hidden';
                    returnInput.name = '_return';
                    returnInput.value = window.location.href;
                    form.appendChild(returnInput);
                    
                    document.body.appendChild(form);
                    form.submit();
                }
            }
        });
    });

    // ── 4. Interactive 3D Parallax Tilt Effect ──────────────────────────────
    // Applies a dynamic tilt effect to 3D books relative to the mouse pointer.
    const initialize3DParallax = () => {
        // Skip on mobile/touch devices or in compact mode
        if (window.matchMedia('(pointer: coarse)').matches || htmlEl.classList.contains('density-dense')) {
            return;
        }

        const cards = document.querySelectorAll('.grid-card[data-entity-type="book"]');
        cards.forEach(card => {
            const book = card.querySelector('.book-3d');
            if (!book) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within element
                const y = e.clientY - rect.top;  // y position within element
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate percentages (-1 to 1)
                const percentX = (x - centerX) / centerX;
                const percentY = (y - centerY) / centerY;
                
                // Book baseline rotation is rotateY(-18deg) rotateX(8deg).
                // On normal hover (without JS) it's rotateY(-36deg) rotateX(12deg).
                // We map percentX to rotateY between -15deg (left side) and -39deg (right side).
                const rotY = -27 + (percentX * 12); 
                const rotX = 10 + (percentY * 8);   
                
                book.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(15px)`;
            });

            card.addEventListener('mouseleave', () => {
                // Restore default CSS state
                book.style.transform = '';
            });
        });
    };

    // Initialize parallax
    initialize3DParallax();

    // Re-initialize parallax when density changes
    document.querySelectorAll('[data-tweak-group="density"]').forEach(btn => {
        btn.addEventListener('click', () => {
            // Give class transition time to settle
            setTimeout(initialize3DParallax, 50);
        });
    });

    // ── 5. Interactive Sortable Tables (Option 2) ───────────────────────────
    const initializeInteractiveTables = () => {
        // Find tables in the page content
        const pageContent = document.querySelector('.page-content');
        if (!pageContent) return;

        // Target tables that have table headers (th) - layout tables usually don't have th
        const tables = Array.from(pageContent.querySelectorAll('table')).filter(table => {
            // Skip tables that are already processed or are inside editor/nested elements
            if (table.closest('.wysiwyg-editor, .editor-container, [component="page-editor"]')) return false;
            // Also support tables with explicit sorted or interactive class regardless of th
            if (table.classList.contains('sorted') || table.classList.contains('interactive')) return true;
            return table.querySelector('th') !== null;
        });

        if (tables.length === 0) return;

        // Ensure we only load the script and CSS once
        if (window.SimpleDataTableInitialized) return;
        window.SimpleDataTableInitialized = true;

        // 1. Inject Simple-DataTables CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/style.css';
        document.head.appendChild(cssLink);

        // 2. Inject Simple-DataTables JS
        const jsScript = document.createElement('script');
        jsScript.src = 'https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/umd/simple-datatables.js';
        jsScript.defer = true;
        
        jsScript.onload = () => {
            tables.forEach(table => {
                try {
                    // Count data rows in tbody (or tr in general if tbody not set yet)
                    const hasTbody = table.querySelector('tbody');
                    const rows = hasTbody ? table.querySelectorAll('tbody tr') : Array.from(table.querySelectorAll('tr')).slice(1);
                    const rowCount = rows.length;
                    
                    // If table has very few rows (e.g. less than 4), disable search/pagination
                    // so it doesn't clutter the layout with controls.
                    const isCompactTable = rowCount <= 4;

                    // Ensure the table has a proper thead/tbody structure
                    const hasThead = table.querySelector('thead');
                    
                    if (!hasThead) {
                        const firstRow = table.querySelector('tr');
                        if (firstRow) {
                            const thead = document.createElement('thead');
                            thead.appendChild(firstRow);
                            table.insertBefore(thead, table.firstChild);
                        }
                    }

                    if (!hasTbody) {
                        const tbody = document.createElement('tbody');
                        const remainingRows = Array.from(table.querySelectorAll('tr')).filter(row => !row.closest('thead'));
                        remainingRows.forEach(row => tbody.appendChild(row));
                        table.appendChild(tbody);
                    }

                    const dtClass = (window.simpleDatatables && window.simpleDatatables.DataTable) || window.DataTable;
                    if (dtClass) {
                        new dtClass(table, {
                            searchable: !isCompactTable,
                            paging: !isCompactTable,
                            fixedHeight: false,
                            perPage: 10,
                            labels: {
                                placeholder: "Suchen...",
                                perPage: "Einträge pro Seite",
                                noRows: "Keine Einträge gefunden",
                                info: "Zeige {start} bis {end} von {rows} Einträgen",
                            }
                        });
                    } else {
                        console.error('DataTable class could not be resolved from loaded simple-datatables script.');
                    }
                } catch (err) {
                    console.error('Error initializing simple-datatables on table:', err);
                }
            });
        };
        
        document.body.appendChild(jsScript);
    };

    initializeInteractiveTables();

    // ── 6. Draw.io Custom Theme & Palette Integration (Option 4) ─────────────
    window.addEventListener('editor-drawio::configure', event => {
        const config = event.detail.config;
        
        // Define Gemini-themed brand color palette (Cyan, Indigo, Lila, Coral)
        const geminiPalette = [
            '#1ba1e3', '#06b6d4', '#22d3ee', '#38bdf8', // Cyan shades
            '#5b53e8', '#818cf8', '#4f46e5', '#3f51b5', // Indigo shades
            '#a445ed', '#c084fc', '#d946ef', '#7b1fa2', // Lila/Purple shades
            '#f46075', '#fb7185', '#f43f5e', '#e11d48', // Coral/Rose shades
            '#ffffff', '#f1f3f4', '#dadce0', '#9aa0a6', // Light neutrals
            '#5f6368', '#3c4043', '#202124', '#000000'  // Dark neutrals
        ];
        
        // Inject color configuration
        config.defaultColors = geminiPalette;
        config.presetColors = ['#1ba1e3', '#5b53e8', '#a445ed', '#f46075'];
        config.customPresetColors = ['#22d3ee', '#818cf8', '#c084fc', '#fb7185'];
        
        // Configure default fonts to match SilverWiki typography
        if (config.defaultFonts) {
            config.defaultFonts = ['Outfit', 'Inter'].concat(config.defaultFonts);
        } else {
            config.defaultFonts = ['Outfit', 'Inter', 'Helvetica', 'Arial'];
        }
        
        console.log('✅ Draw.io editor configured with SilverWiki Gemini palette & typography.');
    });
});

