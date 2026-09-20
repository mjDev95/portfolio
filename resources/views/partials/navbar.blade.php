<header class="position-fixed top-0 left-0 w-100 z-index-10 px-md py-sm d-flex" data-magnetic-zone>
    <nav class="container d-flex justify-content-between align-items-center">
        <a href="{{ route('home') }}" class="h6 text-white text-decoration-none" data-magnetic>
            {{ config('app.name') }}
        </a>

        <ul class="list-unstyled d-flex gap-4" style="margin:0;">
            @php
                $navContentTypes = \Illuminate\Support\Facades\Schema::hasTable('content_types')
                    ? \App\Models\ContentType::where('is_public', true)->orderBy('order')->get()
                    : collect();
            @endphp

            @foreach ($navContentTypes as $cpt)
                <li>
                    <a href="{{ route('public.content.index', $cpt->public_route_slug) }}" class="text-white text-decoration-none text-fluid-sm" data-magnetic>
                        {{ $cpt->name }}
                    </a>
                </li>
            @endforeach

            <li><a href="{{ route('about') }}" class="text-white text-decoration-none text-fluid-sm" data-magnetic>Sobre mí</a></li>
            <li><a href="{{ route('contact') }}" class="text-white text-decoration-none text-fluid-sm" data-magnetic>Contacto</a></li>
        </ul>
    </nav>
</header>
