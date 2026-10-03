{{-- Modal de Difusión Editorial Global — Físicas Spring GSAP (100% Sistema Fluido) --}}
<div id="global-share-modal" 
     class="share-modal-backdrop position-fixed inset-0 d-flex align-items-center justify-content-center p-3" 
     role="dialog" 
     aria-modal="true" 
     aria-labelledby="share-modal-title" 
     aria-hidden="true" 
     style="visibility: hidden; opacity: 0;">
    <div class="share-modal-card position-relative w-100 overflow-hidden" id="modal-card">
        {{-- Botón de cierre --}}
        <button type="button" 
                class="share-modal-close position-absolute d-flex align-items-center justify-content-center rounded-circle" 
                id="btn-close-share-modal" 
                aria-label="Cerrar ventana de compartir" 
                data-magnetic>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        {{-- Contenedor con revelado escalonado GSAP --}}
        <div id="modal-content-wrap">
            <h2 class="modal-headline font-heading text-fluid-h3 text-primary m-0" id="share-modal-title">
                Compartir
            </h2>
            <p class="modal-sub-excerpt font-sans text-fluid-sm text-secondary mb-4 text-truncate" id="share-modal-item-title">
                {{ $content->title ?? config('app.name') }}
            </p>

            {{-- Rejilla de Canales Sociales (2 columnas) --}}
            <div class="share-pill-grid d-grid mb-4">
                {{-- X (Twitter) --}}
                <a href="https://twitter.com/intent/tweet" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="share-pill-btn d-flex align-items-center text-decoration-none" 
                   id="share-channel-x" 
                   data-magnetic 
                   title="Compartir en X">
                    <div class="share-icon-wrap rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </div>
                    <span class="share-pill-label font-sans text-fluid-xs text-truncate">Twitter / X</span>
                </a>

                {{-- LinkedIn --}}
                <a href="https://www.linkedin.com/sharing/share-offsite" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="share-pill-btn d-flex align-items-center text-decoration-none" 
                   id="share-channel-linkedin" 
                   data-magnetic 
                   title="Compartir en LinkedIn">
                    <div class="share-icon-wrap rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63z"/>
                        </svg>
                    </div>
                    <span class="share-pill-label font-sans text-fluid-xs text-truncate">LinkedIn</span>
                </a>

                {{-- WhatsApp --}}
                <a href="https://api.whatsapp.com/send" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="share-pill-btn d-flex align-items-center text-decoration-none" 
                   id="share-channel-whatsapp" 
                   data-magnetic 
                   title="Compartir en WhatsApp">
                    <div class="share-icon-wrap rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.03 2.59.12.17 1.77 2.7 4.28 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/>
                        </svg>
                    </div>
                    <span class="share-pill-label font-sans text-fluid-xs text-truncate">WhatsApp</span>
                </a>

                {{-- Nativo / Email --}}
                <button type="button" 
                        class="share-pill-btn d-flex align-items-center" 
                        id="btn-native-share" 
                        data-magnetic 
                        title="Más opciones de difusión">
                    <div class="share-icon-wrap rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </div>
                    <span class="share-pill-label font-sans text-fluid-xs text-truncate" id="native-share-text">Nativo</span>
                </button>
            </div>

            {{-- Sección de Enlace Directo --}}
            <div class="share-caption font-mono text-fluid-xs text-muted mb-1 d-flex justify-content-between align-items-center">
                <span>Enlace directo</span>
                <span class="text-uppercase tracking-wider">URL</span>
            </div>

            <div class="share-url-box d-flex align-items-center">
                <input type="text" 
                       id="share-modal-url-input" 
                       class="share-url-input font-mono text-fluid-xs flex-grow-1" 
                       value="{{ url()->current() }}" 
                       readonly 
                       onclick="this.select();">
                <button type="button" 
                        class="share-copy-btn d-inline-flex align-items-center justify-content-center rounded-pill" 
                        id="btn-copy-modal-url" 
                        data-magnetic>
                    <span id="copy-btn-label" class="font-sans text-fluid-xs fw-semibold">Copiar</span>
                </button>
            </div>
        </div>
    </div>
</div>
