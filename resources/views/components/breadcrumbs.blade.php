@props([
    'items' => [],
    'class' => '',
])

@php
    $resolvedItems = [];

    if (!empty($items) && is_array($items)) {
        $resolvedItems = $items;
    } else {
        // Auto-resolución según los segmentos de la URL pública
        $segments = request()->segments();
        $resolvedItems[] = [
            'label' => 'Inicio',
            'url' => route('home'),
        ];

        $accumulated = '';
        foreach ($segments as $index => $segment) {
            $accumulated .= '/' . $segment;
            $isLast = ($index === count($segments) - 1);

            // Mapeo amigable de rutas públicas conocidas
            $label = match ($segment) {
                'proyectos' => 'Proyectos',
                'blog' => 'Blog',
                'sobre-mi' => 'Sobre mí',
                'contacto' => 'Contacto',
                default => str($segment)->replace('-', ' ')->title(),
            };

            $resolvedItems[] = [
                'label' => $label,
                'url' => $isLast ? null : url($accumulated),
            ];
        }
    }

    // Estructurar JSON-LD para Schema.org
    $jsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => array_map(function ($item, $index) {
            $element = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => (string) $item['label'],
            ];
            if (!empty($item['url'])) {
                $element['item'] = (string) $item['url'];
            }
            return $element;
        }, $resolvedItems, array_keys($resolvedItems)),
    ];
@endphp

@if(count($resolvedItems) > 1)
    {{-- Inyección Schema.org estructurada para motores de búsqueda --}}
    <script type="application/ld+json">
        {!! json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
    </script>

    <nav aria-label="breadcrumb" class="public-breadcrumbs {{ $class }}" itemscope itemtype="https://schema.org/BreadcrumbList">
        <ol class="list-unstyled d-inline-flex align-items-center flex-wrap gap-2 m-0 p-0" style="font-size: 0.8125rem;">
            @foreach($resolvedItems as $index => $crumb)
                @php
                    $isLast = ($index === count($resolvedItems) - 1);
                @endphp

                <li class="d-inline-flex align-items-center gap-2 text-muted" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    @if($index > 0)
                        <span class="text-muted opacity-50" aria-hidden="true">&rsaquo;</span>
                    @endif

                    @if(!empty($crumb['url']) && !$isLast)
                        <a href="{{ $crumb['url'] }}" class="text-muted text-decoration-none transition-opacity hover:opacity-100" itemprop="item">
                            <span itemprop="name">{{ $crumb['label'] }}</span>
                        </a>
                    @else
                        <span class="text-white font-medium" aria-current="page" itemprop="name">
                            {{ $crumb['label'] }}
                        </span>
                    @endif

                    <meta itemprop="position" content="{{ $index + 1 }}" />
                </li>
            @endforeach
        </ol>
    </nav>
@endif

