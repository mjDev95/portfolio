<style>
    .admin-bar-top {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: rgba(15, 15, 18, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.25rem;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        color: #e4e4e7;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    .admin-bar-top a,
    .admin-bar-top button {
        color: #d4d4d8;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 6px;
        transition: all 0.15s ease;
        background: transparent;
        border: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
    }
    .admin-bar-top a:hover,
    .admin-bar-top button:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }
    .admin-bar-brand {
        font-weight: 700 !important;
        color: #ffffff !important;
        letter-spacing: -0.01em;
    }
    .admin-bar-badge {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
    }
    .admin-bar-sep {
        width: 1px;
        height: 16px;
        background: rgba(255, 255, 255, 0.15);
        margin: 0 4px;
    }
    .admin-bar-edit-btn {
        background: rgba(59, 130, 246, 0.2) !important;
        border: 1px solid rgba(96, 165, 250, 0.35) !important;
        color: #93c5fd !important;
    }
    .admin-bar-edit-btn:hover {
        background: rgba(59, 130, 246, 0.35) !important;
        color: #ffffff !important;
    }
    body.has-admin-bar {
        padding-top: 40px !important;
    }
</style>

<aside class="admin-bar-top" id="public-admin-bar" aria-label="Barra de herramientas de administración">
    <div style="display: flex; align-items: center; gap: 8px;">
        <a href="{{ route('admin.dashboard') }}" class="admin-bar-brand">
            <span class="admin-bar-badge"></span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            <span>Panel Admin</span>
        </a>

        <a href="{{ route('admin.content-types.index') }}" title="Tipos de Contenido">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            <span>Tipos de Contenido</span>
        </a>

        @php
            $adminBarContentTypes = \App\Models\ContentType::where('user_id', auth()->id())
                ->orderBy('name')
                ->take(3)
                ->get();
        @endphp
        @foreach($adminBarContentTypes as $cpt)
            <a href="{{ route('admin.content.create', $cpt->slug) }}" title="Crear {{ $cpt->name }}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>+ {{ $cpt->name }}</span>
            </a>
        @endforeach

        {{-- Contextual Edit Action Slot: Dynamically updated by Barba.js transitions --}}
        <div id="admin-bar-edit-slot" style="display: inline-flex; align-items: center;">
            {{-- Initial SSR injection if viewing a content directly --}}
            @if(isset($content) && !empty($content->id) && isset($contentType))
                <a href="{{ route('admin.content.edit', [$contentType->slug, $content->id]) }}" class="admin-bar-edit-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Editar {{ $contentType->name }}</span>
                </a>
            @endif
        </div>
    </div>

    <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #a1a1aa; font-size: 12px; margin-right: 4px;">
            {{ auth()->user()->name }}
        </span>

        <form method="POST" action="{{ route('admin.logout') }}" style="margin: 0; display: inline;">
            @csrf
            <button type="submit" title="Cerrar sesión del administrador" style="color: #f87171;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Salir</span>
            </button>
        </form>
    </div>
</aside>

<script>
    // Contextual edit button updater for Barba.js transitions
    function updateAdminBarContext(container) {
        var slot = document.getElementById('admin-bar-edit-slot');
        if (!slot) return;

        var el = container || document.querySelector('[data-barba="container"]');
        if (!el) {
            slot.innerHTML = '';
            return;
        }

        var editUrl = el.getAttribute('data-edit-url');
        var editLabel = el.getAttribute('data-edit-label') || 'Editar Contenido';

        if (editUrl) {
            slot.innerHTML = '<a href="' + editUrl + '" class="admin-bar-edit-btn">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M12 20h9"></path>' +
                '<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>' +
                '</svg>' +
                '<span>' + editLabel + '</span>' +
                '</a>';
        } else {
            slot.innerHTML = '';
        }
    }
    window.updateAdminBarContext = updateAdminBarContext;

    document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('has-admin-bar');
        updateAdminBarContext();
    });
</script>
