{{-- Magnetic custom cursor. Persists across Barba transitions (lives outside [data-barba="container"]). --}}
<div id="magnetic-cursor" class="position-fixed z-index-50 d-none d-md-block" aria-hidden="true">
    <div class="magnetic-cursor__dot"></div>
    <div class="magnetic-cursor__circle" aria-hidden="true">
        <svg class="cursor-arrow-up-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
    </div>
</div>
