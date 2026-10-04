{{-- Magnetic custom cursor. Persists across Barba transitions (lives outside [data-barba="container"]). --}}
<div id="magnetic-cursor" class="position-fixed z-index-50 d-none d-md-block" aria-hidden="true">
    <div class="magnetic-cursor__dot"></div>
    <div class="magnetic-cursor__circle" aria-hidden="true">
        {{-- Flecha hacia arriba para Proyectos --}}
        <svg class="cursor-arrow-up-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
        </svg>

        {{-- Ojito de lectura para Notas de Blog --}}
        <svg class="cursor-eye-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3.2"></circle>
        </svg>

        {{-- Flechas < > para Zonas de Arrastre Horizontal (Draggable Track) --}}
        <svg class="cursor-drag-arrows-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="8 7 3 12 8 17"></polyline>
            <polyline points="16 7 21 12 16 17"></polyline>
            <line x1="4" y1="12" x2="20" y2="12"></line>
        </svg>
    </div>
</div>
