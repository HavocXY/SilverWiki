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
    // Why we do this: BookStack does not support sorting or searching on native tables.
    // By dynamically transforming standard HTML tables using the 'simple-datatables' library,
    // we make wiki documents highly interactive and data-friendly, especially for spreadsheet-like logs,
    // without having to edit BookStack core code or PHP controllers (preserving update-safety).
    const initializeInteractiveTables = () => {
        // We look for page content container to prevent transforming structural layouts,
        // sidebars, settings grids, or user profile statistics tables.
        const pageContent = document.querySelector('.page-content');
        if (!pageContent) return;

        // Why we filter tables: We must skip tables being actively edited (inside WYSIWYG
        // editor container) to avoid breaking the editor's visual state or triggering draft
        // saving issues. We also skip tables without headers ('th') because layout-only grids
        // do not need sorting/searching controls.
        const tables = Array.from(pageContent.querySelectorAll('table')).filter(table => {
            if (table.closest('.wysiwyg-editor, .editor-container, [component="page-editor"]')) return false;
            // Allow manual opt-in using classes
            if (table.classList.contains('sorted') || table.classList.contains('interactive')) return true;
            return table.querySelector('th') !== null;
        });

        if (tables.length === 0) return;

        // Ensure we load the external JS/CSS only once per page view, even if multiple
        // tables exist on the same page.
        if (window.SimpleDataTableInitialized) return;
        window.SimpleDataTableInitialized = true;

        // 1. Inject Simple-DataTables CSS
        // Loaded dynamically from CDN to keep initial page load speed fast for pages
        // that do not contain any tables.
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
                    // Why we count data rows: Small tables (e.g. 4 rows or fewer) look cluttered
                    // and lose valuable screen space if search boxes and pagination elements are added.
                    // For these small tables, we keep columns sortable but hide controls.
                    const hasTbody = table.querySelector('tbody');
                    const rows = hasTbody ? table.querySelectorAll('tbody tr') : Array.from(table.querySelectorAll('tr')).slice(1);
                    const rowCount = rows.length;
                    const isCompactTable = rowCount <= 4;

                    // Why we normalize table structures: 'simple-datatables' requires strict
                    // HTML structure (thead for headers, tbody for body rows). BookStack's editor
                    // or markdown parser occasionally renders headers inside tr directly without thead.
                    // We normalize the table DOM structure programmatically before initialization.
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

                    // Resolve DataTable class which changed names/namespaces in newer simple-datatables versions
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
    // Why we do this: BookStack uses an embedded draw.io editor for diagrams, running in an iframe.
    // BookStack provides a global event 'editor-drawio::configure' allowing parent themes to
    // customize color presets, fonts, and settings before draw.io loads.
    // By listening to this event, we override the default editor choices to matching Gemini colors
    // and fonts, guaranteeing corporate brand consistency for all diagrams without editing core files.
    window.addEventListener('editor-drawio::configure', event => {
        const config = event.detail.config;
        
        // Define Gemini-themed brand color palette (Cyan, Indigo, Lila, Coral)
        // These match the fluid gradient styling declared in silverwiki.css
        const geminiPalette = [
            '#1ba1e3', '#06b6d4', '#22d3ee', '#38bdf8', // Cyan shades
            '#5b53e8', '#818cf8', '#4f46e5', '#3f51b5', // Indigo shades
            '#a445ed', '#c084fc', '#d946ef', '#7b1fa2', // Lila/Purple shades
            '#f46075', '#fb7185', '#f43f5e', '#e11d48', // Coral/Rose shades
            '#ffffff', '#f1f3f4', '#dadce0', '#9aa0a6', // Light neutrals
            '#5f6368', '#3c4043', '#202124', '#000000'  // Dark neutrals
        ];
        
        // Inject color configuration into the draw.io config schema
        config.defaultColors = geminiPalette;
        config.presetColors = ['#1ba1e3', '#5b53e8', '#a445ed', '#f46075'];
        config.customPresetColors = ['#22d3ee', '#818cf8', '#c084fc', '#fb7185'];
        
        // Prepend Outfit (headings) and Inter (body) to the default fonts dropdown.
        // This allows users to directly select SilverWiki fonts when writing diagram text labels,
        // matching the host page typography.
        if (config.defaultFonts) {
            config.defaultFonts = ['Outfit', 'Inter'].concat(config.defaultFonts);
        } else {
            config.defaultFonts = ['Outfit', 'Inter', 'Helvetica', 'Arial'];
        }
        
        console.log('✅ Draw.io editor configured with SilverWiki Gemini palette & typography.');
    });
    // ── 7. RAG KI-Chat Logic ───────────────────────────────────────────────
    // Chat Layout Settings
    const savedChatLayout = localStorage.getItem('silverwiki_chat_layout') || 'floating';
    const chatWidget = document.getElementById('ai-chat-container');
    const chatTrigger = document.getElementById('ai-chat-trigger');
    const chatClose = document.getElementById('ai-chat-close');
    const chatIsOpen = localStorage.getItem('silverwiki_chat_open') === 'true';

    if (chatWidget) {
        chatWidget.classList.add(`chat-layout-${savedChatLayout}`);
        updateActiveButton('chatLayout', savedChatLayout);

        // Restore chat open state
        if (chatIsOpen) {
            chatWidget.style.display = 'flex';
            if (chatTrigger) chatTrigger.style.display = 'none';
        }

        // Chat Layout Tweaks
        document.querySelectorAll('[data-tweak-group="chatLayout"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-tweak-value');
                chatWidget.classList.remove('chat-layout-floating', 'chat-layout-drawer');
                chatWidget.classList.add(`chat-layout-${val}`);
                localStorage.setItem('silverwiki_chat_layout', val);
                updateActiveButton('chatLayout', val);
            });
        });

        // Open/Close Chat
        if (chatTrigger) {
            chatTrigger.addEventListener('click', () => {
                chatWidget.style.display = 'flex';
                chatTrigger.style.display = 'none';
                localStorage.setItem('silverwiki_chat_open', 'true');
                document.getElementById('ai-chat-input').focus();
            });
        }
        if (chatClose) {
            chatClose.addEventListener('click', () => {
                chatWidget.style.display = 'none';
                chatTrigger.style.display = 'flex';
                localStorage.setItem('silverwiki_chat_open', 'false');
            });
        }

        // Chat Logic
        const chatInput = document.getElementById('ai-chat-input');
        const chatSendBtn = document.getElementById('ai-chat-send');
        const chatMessages = document.getElementById('ai-chat-messages');

        if (chatInput) {
            chatInput.addEventListener('input', function() {
                this.style.height = '44px';
                this.style.height = this.scrollHeight + 'px';
            });
        }

        const appendMessage = (text, sender) => {
            const msgEl = document.createElement('div');
            msgEl.className = `ai-chat-message ${sender}`;
            msgEl.textContent = text;
            chatMessages.appendChild(msgEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return msgEl;
        };

        const sendMessage = async () => {
            const question = chatInput.value.trim();
            if (!question) return;

            appendMessage(question, 'user');
            chatInput.value = '';
            chatInput.style.height = '44px';
            
            const typingMsg = appendMessage('...', 'system');
            
            const wormIcon = document.querySelector('.ai-chat-title .icon');
            if (wormIcon) wormIcon.classList.add('is-thinking');
            const chatHeader = document.querySelector('.ai-chat-header');
            if (chatHeader) chatHeader.classList.add('is-thinking');

            try {
                const csrfToken = document.querySelector('meta[name="token"]').content;
                const response = await fetch('/api/silverwiki/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({ question })
                });

                typingMsg.textContent = '';
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let buffer = '';
                let fullText = '';

                // einfache Markdown-Konvertierung
                const parseMarkdown = (text) => {
                    let html = text
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    
                    // [[1]](url) oder [1](url) Links
                    html = html.replace(/\[\[(\d+)\]\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">[$1]</a>');
                    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
                    
                    // **fett**
                    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                    
                    // Zeilenumbrüche
                    html = html.replace(/\n/g, '<br>');
                    
                    return html;
                };

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();
                    
                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.response) {
                                    fullText += parsed.response;
                                    typingMsg.innerHTML = parseMarkdown(fullText);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                            } catch (e) {
                                // Temporär unvollständiges JSON ignorieren
                            }
                        }
                    }
                }

                // Restlicher Puffer flushen
                if (buffer.trim()) {
                    try {
                        const parsed = JSON.parse(buffer);
                        if (parsed.response) {
                            fullText += parsed.response;
                            typingMsg.innerHTML = parseMarkdown(fullText);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {}
                }
            } catch (error) {
                typingMsg.textContent = 'Fehler bei der Kommunikation mit der KI.';
            } finally {
                if (wormIcon) wormIcon.classList.remove('is-thinking');
                const chatHeader = document.querySelector('.ai-chat-header');
                if (chatHeader) chatHeader.classList.remove('is-thinking');
            }
        };

        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', sendMessage);
        }
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Admin Tools
        const settingsBtn = document.getElementById('ai-chat-settings-btn');
        const settingsMenu = document.getElementById('ai-chat-settings-menu');
        
        if (settingsBtn && settingsMenu) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'flex' : 'none';
            });
            document.addEventListener('click', (e) => {
                if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
                    settingsMenu.style.display = 'none';
                }
            });
        }

        const modelSelect = document.getElementById('ollama-model-select');
        const pullInput = document.getElementById('ollama-model-pull-input');
        const pullBtn = document.getElementById('ollama-model-pull-btn');

        if (modelSelect) {
            fetch('/api/silverwiki/ollama/models')
                .then(res => res.json())
                .then(data => {
                    if (data.models) {
                        const currentVal = modelSelect.value;
                        modelSelect.innerHTML = '';
                        data.models.forEach(m => {
                            const opt = document.createElement('option');
                            opt.value = m.name;
                            opt.textContent = m.name;
                            if (m.name === currentVal) opt.selected = true;
                            modelSelect.appendChild(opt);
                        });
                    }
                }).catch(console.error);

            modelSelect.addEventListener('change', () => {
                const csrfToken = document.querySelector('meta[name="token"]').content;
                fetch('/api/silverwiki/ollama/model/set', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ model: modelSelect.value })
                });
            });
        }

        if (pullBtn && pullInput) {
            pullBtn.addEventListener('click', async () => {
                const model = pullInput.value.trim();
                if (!model) return;
                
                const origText = pullBtn.textContent;
                pullBtn.textContent = '⏳';
                pullBtn.disabled = true;

                try {
                    const csrfToken = document.querySelector('meta[name="token"]').content;
                    const response = await fetch('/api/silverwiki/ollama/model/pull', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                        body: JSON.stringify({ model })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Netzwerk-Antwort war nicht ok');
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let pullBuffer = '';
                    let pullFailed = false;
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        pullBuffer += decoder.decode(value, { stream: true });
                        const lines = pullBuffer.split('\n');
                        pullBuffer = lines.pop();
                        
                        for (const line of lines) {
                            if (line.trim()) {
                                try {
                                    const parsed = JSON.parse(line);
                                    if (parsed.error) {
                                        pullFailed = true;
                                        console.error('Ollama pull Fehler:', parsed.error);
                                    }
                                } catch (e) {}
                            }
                        }
                    }

                    if (pullFailed) {
                        throw new Error('Modell-Pull fehlgeschlagen');
                    }

                    pullBtn.textContent = '✅';
                    setTimeout(() => { pullBtn.textContent = origText; pullBtn.disabled = false; pullInput.value = ''; }, 2000);
                    
                    if (modelSelect) {
                        const opt = document.createElement('option');
                        opt.value = model;
                        opt.textContent = model;
                        modelSelect.appendChild(opt);
                        modelSelect.value = model;
                        modelSelect.dispatchEvent(new Event('change'));
                    }
                } catch (error) {
                    pullBtn.textContent = '❌';
                    setTimeout(() => { pullBtn.textContent = origText; pullBtn.disabled = false; }, 2000);
                }
            });
        }
    }
});

