<div id="ai-chat-container" class="ai-chat-widget chat-layout-floating" style="display: none;">
    <!-- Umschalt-Logik zwischen Floating und Drawer erfolgt dynamisch per JS-Klasse -->
    <div class="ai-chat-header">
        <div class="ai-chat-title">
            <span class="icon">🐛</span> Bookworm
        </div>
        <div class="ai-chat-actions">
            @if(userCan('settings-manage'))
            <div class="ai-chat-admin-dropdown">
                <button id="ai-chat-settings-btn" class="ai-chat-settings-btn" title="KI Einstellungen">
                    <span class="material-symbols-outlined">settings</span>
                </button>
                <div id="ai-chat-settings-menu" class="ai-chat-settings-menu" style="display: none;">
                    <div class="ai-chat-settings-title">KI-Modell Verwaltung</div>
                    <label>Aktives Modell</label>
                    <select id="ollama-model-select" class="ai-chat-model-select" title="Aktives KI-Modell wechseln">
                        <option value="{{ setting('silverwiki-llm-model', 'gemma4:e4b') }}">{{ setting('silverwiki-llm-model', 'gemma4:e4b') }}</option>
                    </select>
                    
                    <label style="margin-top: 10px;">Neues Modell laden</label>
                    <div class="ai-chat-pull-container">
                        <input type="text" id="ollama-model-pull-input" placeholder="z.B. phi3">
                        <button id="ollama-model-pull-btn" title="Herunterladen">📥</button>
                    </div>
                </div>
            </div>
            @endif
            <button id="ai-chat-close" class="ai-chat-close-btn">&times;</button>
        </div>
    </div>
    
    <div class="ai-chat-messages" id="ai-chat-messages">
        <div class="ai-chat-message system">
            Hallo, ich bin Timy, dein persönlicher Bücherwurm! Womit kann ich dir helfen?
        </div>
    </div>
    
    <div class="ai-chat-input-area">
        <textarea id="ai-chat-input" placeholder="Stelle eine Frage..." rows="1"></textarea>
        <button id="ai-chat-send" class="ai-chat-send-btn">Senden</button>
    </div>

    <!-- Link Confirmation Modal -->
    <div id="ai-chat-link-modal" class="ai-chat-modal" style="display: none;">
        <div class="ai-chat-modal-content">
            <div class="ai-chat-modal-title">Link öffnen</div>
            <p class="ai-chat-modal-text">Möchten Sie diesen Link im aktuellen Fenster oder in einem neuen Browser-Tab öffnen?</p>
            <div class="ai-chat-modal-buttons">
                <button id="ai-chat-link-new" class="ai-chat-btn primary">Neuer Tab</button>
                <button id="ai-chat-link-current" class="ai-chat-btn secondary">Aktueller Tab</button>
                <button id="ai-chat-link-cancel" class="ai-chat-btn cancel">Abbrechen</button>
            </div>
        </div>
    </div>
</div>


<button id="ai-chat-trigger" class="ai-chat-trigger-btn">
    <span class="icon">🐛</span> Bookworm
</button>
