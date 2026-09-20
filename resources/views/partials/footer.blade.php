<footer class="px-md py-lg" data-magnetic-zone>
    <div class="container d-flex justify-content-between align-items-center flex-wrap gap-2">
        <p class="text-fluid-sm text-muted" style="margin:0;">
            &copy; {{ now()->year }} {{ config('app.name') }}. Todos los derechos reservados.
        </p>

        <ul class="list-unstyled d-flex gap-3 align-items-center" style="margin:0;">
            <li>
                <button type="button" onclick="if (window.openCookieSettings) window.openCookieSettings();" class="text-fluid-sm text-muted text-decoration-none bg-transparent p-0 border-0 cursor-pointer" style="cursor: pointer; background: transparent; border: none; font-family: inherit;" data-magnetic>
                    Cookies
                </button>
            </li>
            <li><a href="{{ route('contact') }}" class="text-fluid-sm text-white text-decoration-none" data-magnetic>Hablemos</a></li>
        </ul>
    </div>
</footer>
