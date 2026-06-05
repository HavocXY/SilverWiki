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
});

