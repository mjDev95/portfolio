{{--
  Widget Flotante de Última Publicación en Esquina Inferior Derecha (#liquid-fab-goo)
  - Tarjeta vertical en 2 filas:
      Fila 1 = Imagen destacada en SVG <mask> (píxeles cuadrados -> círculos -> encimados hasta cubrir la posición final, con reverse).
      Fila 2 = Título completo en tipografía principal (sin categoría ni puntos decorativos).
  - Botón inferior derecho (tamaño md): Píldora "NOTICIAS" (con vibración de atención) al estar cerrado; círculo con cruz (×) al estar abierto.
--}}
@php
    $latestPost = ($latestPosts ?? collect())->first();
    $blogRouteSlug = $blogCpt?->public_route_slug ?? 'blog';
@endphp

@if ($latestPost)
    @php
        $itemThumb = $latestPost->thumbnail;
        $detailUrl = route('public.content.show', [$blogRouteSlug, $latestPost->slug]);
    @endphp
    <aside class="latest-news-pill position-fixed pointer-events-none user-select-none will-change-transform"
           id="latest-news-pill"
           data-latest-news-pill
           data-news-slug="{{ $latestPost->slug }}"
           aria-label="Última publicación del blog">

        {{-- Filtro SVG Gooey Encapsulado (#liquid-fab-goo) para el desprendimiento viscoso de la tarjeta --}}
        <svg class="latest-news-goo-svg position-absolute pointer-events-none" aria-hidden="true">
            <defs>
                <filter id="liquid-fab-goo" x="-60%" y="-150%" width="220%" height="350%" color-interpolation-filters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  
                                0 1 0 0 0  
                                0 0 1 0 0  
                                0 0 0 32 -11"
                        result="goo"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </defs>
        </svg>

        {{-- Capa 1: Silueta líquida deformable (#liquid-fab-goo) que une el botón inferior y la tarjeta --}}
        <div class="latest-news-goo-stage position-absolute inset-0 pointer-events-none" data-goo-stage aria-hidden="true">
            <div class="goo-blob-base position-absolute right-0 bottom-0 rounded-pill bg-surface will-change-transform" data-goo-base></div>
            <div class="goo-blob-bridge position-absolute right-0 bottom-0 rounded-pill bg-surface will-change-transform" data-goo-bridge></div>
            <div class="goo-blob-card position-absolute right-0 rounded-4 bg-surface will-change-transform" data-goo-card></div>
        </div>

        {{-- Capa 2: Interfaz Nítida (Tarjeta Vertical de 2 Filas + Botón MD en Esquina Inferior Derecha) --}}
        <div class="latest-news-crisp-stage position-relative w-100 d-flex flex-column align-items-end">
            {{-- Tarjeta Única Vertical (Fila 1: Imagen en SVG Mask de Píxeles->Círculos | Fila 2: Título Completo) --}}
            <div class="latest-news-panel w-100 d-flex flex-column align-items-end pointer-events-none" data-news-panel>
                <a href="{{ $detailUrl }}"
                   class="latest-news-card position-relative w-100 rounded-4 bg-surface border-0 overflow-hidden d-flex flex-column text-decoration-none text-primary will-change-transform"
                   data-news-card>
                    {{-- Fila 1: Imagen Destacada con SVG <mask> (Degradado por píxeles desde el color del flotante bg-surface a la imagen) --}}
                    <div class="latest-news-card-media w-100 overflow-hidden position-relative">
                        @if ($itemThumb)
                            <svg class="latest-news-media-svg w-100 h-100 d-block"
                                 viewBox="0 0 320 160"
                                 preserveAspectRatio="none"
                                 role="img"
                                 aria-label="{{ $latestPost->title }}">
                                <defs>
                                    <mask id="liquid-media-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="160">
                                        <rect x="0" y="0" width="320" height="160" fill="#000000" />
                                        <g fill="#ffffff">
                                            @for ($row = 0; $row < 5; $row++)
                                                @for ($col = 0; $col < 10; $col++)
                                                    <rect data-media-pixel
                                                          data-row="{{ $row }}"
                                                          data-col="{{ $col }}"
                                                          x="{{ $col * 32 }}"
                                                          y="{{ $row * 32 }}"
                                                          width="32.6"
                                                          height="32.6" />
                                                @endfor
                                            @endfor
                                        </g>
                                    </mask>
                                </defs>
                                <g mask="url(#liquid-media-mask)">
                                    <image href="{{ $itemThumb->url }}"
                                           x="0"
                                           y="0"
                                           width="320"
                                           height="160"
                                           preserveAspectRatio="xMidYMid slice"
                                           class="latest-news-card-img"
                                           data-media-image />
                                </g>
                            </svg>
                            <img src="{{ $itemThumb->url }}"
                                 alt="{{ $latestPost->title }}"
                                 class="visually-hidden"
                                 loading="lazy">
                        @else
                            <div class="latest-news-card-placeholder w-100 h-100 d-flex align-items-center justify-content-center font-heading text-fluid-xs text-muted">
                                <span>{{ $latestPost->title }}</span>
                            </div>
                        @endif
                    </div>

                    {{-- Fila 2: Título Completo con Tipografía Principal (Sin Categoría ni Recorte) --}}
                    <div class="latest-news-card-content w-100 p-sm d-flex flex-column">
                        <span class="latest-news-card-title font-heading text-fluid-sm fw-semibold text-primary lh-snug">{{ $latestPost->title }}</span>
                    </div>
                </a>
            </div>

            {{-- Esquina Inferior Derecha: Reutiliza <x-btn size="sm"> (tamaño exacto de categorías del Blog) --}}
            <div class="latest-news-base-anchor position-relative d-flex align-items-center justify-content-end" data-news-base-anchor>
                <x-btn type="button"
                       size="sm"
                       :magnetic="false"
                       class="bg-surface pointer-events-auto will-change-transform"
                       data-news-fab-trigger
                       aria-label="Ver última publicación">
                    <span>Noticias</span>
                </x-btn>

                <button type="button"
                        class="latest-news-hide-btn position-absolute right-0 bottom-0 d-inline-flex align-items-center justify-content-center rounded-circle bg-surface border-0 p-0 text-primary cursor-pointer pointer-events-none will-change-transform"
                        data-news-pill-dismiss
                        aria-label="Cerrar noticia">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    </aside>
@endif
