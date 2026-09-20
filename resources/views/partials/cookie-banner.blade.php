{{-- Banner de Consentimiento de Cookies del Sitio Público (Diseño sin bordes, exclusivo para visitantes públicos) --}}
<div id="public-cookie-banner" class="cookie-banner-wrapper" style="display: none;" aria-live="polite">
    <div class="cookie-banner-content">
        <div class="cookie-banner-header">
            <div class="cookie-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M7 15v.01" />
                    <path d="M16 15v.01" />
                    <path d="M11 19v.01" />
                    <path d="M12 12v.01" />
                </svg>
            </div>
            <div>
                <h4 class="cookie-banner-title">Privacidad y Preferencias</h4>
                <p class="cookie-banner-text">
                    Utilizamos cookies técnicas necesarias y telemetría de visitas respetuosa con tu privacidad para optimizar tu experiencia y rendimiento en el portafolio.
                </p>
            </div>
        </div>

        <div class="cookie-banner-actions">
            <button type="button" id="cookie-accept-necessary" class="cookie-btn cookie-btn-secondary" data-magnetic>
                Solo necesarias
            </button>
            <button type="button" id="cookie-accept-all" class="cookie-btn cookie-btn-primary" data-magnetic>
                Aceptar todas
            </button>
        </div>
    </div>
</div>

<style>
.cookie-banner-wrapper {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    max-width: 440px;
    width: calc(100% - 3rem);
    z-index: 9999;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
}

.cookie-banner-wrapper.is-visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.cookie-banner-content {
    background: rgba(18, 22, 29, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 1.25rem;
    padding: 1.35rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    border: none !important;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #f8fafc;
}

.cookie-banner-header {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
}

.cookie-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    background: rgba(39, 135, 245, 0.15);
    color: #2787F5;
    flex-shrink: 0;
}

.cookie-banner-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
    font-family: inherit;
}

.cookie-banner-text {
    margin: 0.35rem 0 0 0;
    font-size: 0.825rem;
    line-height: 1.4;
    color: #94a3b8;
}

.cookie-banner-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.65rem;
}

.cookie-btn {
    border: none !important;
    outline: none;
    font-family: inherit;
    font-size: 0.825rem;
    font-weight: 600;
    padding: 0.55rem 1.1rem;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: filter 0.2s ease, transform 0.15s ease, background 0.2s ease;
}

.cookie-btn-primary {
    background: var(--bs-primary, #2787F5);
    color: #ffffff;
}

.cookie-btn-primary:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.cookie-btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
}

.cookie-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
}

@media (max-width: 576px) {
    .cookie-banner-wrapper {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
        width: auto;
    }
    .cookie-banner-actions {
        flex-direction: column-reverse;
        width: 100%;
    }
    .cookie-btn {
        width: 100%;
        text-align: center;
    }
}
</style>

