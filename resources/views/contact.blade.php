@extends('layouts.app')

@section('title', 'Contacto — Mario Joaquín Galicia Blanco')
@section('meta_description', 'Ponte en contacto con Mario Joaquín Galicia Blanco para desarrollo de temas a medida en WordPress, ingeniería Front-End o diseño UI/UX.')
@section('namespace', 'contact')

@section('content')
<div class="position-relative overflow-hidden pt-2xl pb-2xl">
    <div class="container">
        
        {{-- Breadcrumbs --}}
        <div class="mb-lg text-fluid-xs font-mono text-muted">
            <a href="{{ route('home') }}" class="text-muted hover-text-accent no-underline">Inicio</a>
            <span class="mx-2">/</span>
            <span class="text-primary">Contacto</span>
        </div>

        <div class="row align-items-start">
            {{-- Columna de Información Directa --}}
            <div class="col-12 col-lg-5 mb-xl mb-lg-0" data-reveal>
                <span class="text-fluid-xs font-mono text-uppercase tracking-widest text-accent fw-semibold d-block mb-xs">
                    // Hablemos de tu proyecto
                </span>
                <h1 class="font-fluid-hero text-primary mb-md">
                    Iniciemos una conversación.
                </h1>
                <p class="font-fluid-lead text-secondary fw-light mb-lg">
                    ¿Tienes una plataforma que necesita arquitectura sólida en WordPress, un diseño en Figma listo para cobrar vida o requieres optimizar el LCP de tu portal? Escríbeme y analicemos la mejor solución técnica.
                </p>

                <div class="space-y-4 pt-md border-top-subtle mb-lg text-fluid-xs">
                    <div>
                        <span class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted fw-semibold d-block mb-xs">Email</span>
                        <a href="mailto:mjgaliciab@gmail.com" class="text-primary font-mono hover-text-accent no-underline text-fluid-base" data-magnetic>
                            mjgaliciab@gmail.com
                        </a>
                    </div>

                    <div>
                        <span class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted fw-semibold d-block mb-xs">Teléfono / WhatsApp</span>
                        <a href="tel:+525628425556" class="text-primary font-mono hover-text-accent no-underline text-fluid-base" data-magnetic>
                            +52 56 2842 5556
                        </a>
                    </div>

                    <div>
                        <span class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted fw-semibold d-block mb-xs">Ubicación</span>
                        <span class="text-primary fw-medium d-block">
                            Ciudad de México, México (GMT-6)
                        </span>
                        <span class="text-muted text-fluid-xs fw-light">Disponible para proyectos remotos globales e híbridos.</span>
                    </div>
                </div>

                <div class="p-md rounded-xl d-inline-flex align-items-center gap-2 bg-accent-subtle border-accent-subtle text-fluid-xs text-secondary">
                    <span class="pulse-beacon">
                        <span class="pulse-beacon-ping"></span>
                    </span>
                    <span>Tiempo estimado de respuesta: menos de 24 horas.</span>
                </div>
            </div>

            {{-- Columna del Formulario (Abierto, con líneas elegantes) --}}
            <div class="col-12 col-lg-7" data-reveal>
                <div class="border-top-subtle border-lg-top-0 border-lg-left-subtle pl-lg-xl pt-lg pt-lg-0">
                    @if (session('success'))
                        <div class="p-md rounded-xl mb-lg text-fluid-sm bg-accent-subtle border-accent-subtle text-accent">
                            {{ session('success') }}
                        </div>
                    @endif

                    <form method="POST" action="{{ route('contact.store') }}" data-contact-form class="space-y-4">
                        @csrf

                        {{-- Honeypot anti-spam --}}
                        <div style="position:absolute; left:-9999px;" aria-hidden="true">
                            <label for="company">Leave this field empty</label>
                            <input type="text" id="company" name="company" tabindex="-1" autocomplete="off">
                        </div>

                        <div class="row">
                            <div class="col-12 col-sm-6 mb-md mb-sm-0">
                                <label for="name" class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted d-block mb-xs">Nombre completo *</label>
                                <input type="text" id="name" name="name" value="{{ old('name') }}" required
                                       placeholder="Tu nombre o empresa"
                                       class="form-control-fluid">
                                @error('name') <p class="text-accent text-fluid-xs mt-xs">{{ $message }}</p> @enderror
                            </div>

                            <div class="col-12 col-sm-6">
                                <label for="email" class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted d-block mb-xs">Correo electrónico *</label>
                                <input type="email" id="email" name="email" value="{{ old('email') }}" required
                                       placeholder="nombre@ejemplo.com"
                                       class="form-control-fluid">
                                @error('email') <p class="text-accent text-fluid-xs mt-xs">{{ $message }}</p> @enderror
                            </div>
                        </div>

                        <div>
                            <label for="budget_range" class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted d-block mb-xs">Alcance / Presupuesto estimado</label>
                            <input type="text" id="budget_range" name="budget_range" value="{{ old('budget_range') }}"
                                   placeholder="Ej. Custom Theme WordPress, Migración, UI/UX en Figma..."
                                   class="form-control-fluid">
                            @error('budget_range') <p class="text-accent text-fluid-xs mt-xs">{{ $message }}</p> @enderror
                        </div>

                        <div>
                            <label for="message" class="text-fluid-xs font-mono text-uppercase tracking-wider text-muted d-block mb-xs">Detalles del proyecto *</label>
                            <textarea id="message" name="message" rows="5" required
                                      placeholder="Cuéntame sobre los objetivos, tiempos previstos y requerimientos técnicos..."
                                      class="form-control-fluid">{{ old('message') }}</textarea>
                            @error('message') <p class="text-accent text-fluid-xs mt-xs">{{ $message }}</p> @enderror
                        </div>

                        <p data-contact-feedback class="text-fluid-sm m-0" role="status" aria-live="polite"></p>

                        <div class="d-flex align-items-center justify-content-between pt-sm">
                            <button type="submit" class="btn-pill-cta py-sm px-xl" data-magnetic>
                                <span>Enviar mensaje</span>
                                <span style="font-size: 0.85rem; font-weight: 700; line-height: 1;">&rarr;</span>
                            </button>
                            <span class="text-fluid-xs font-mono text-muted">* Campos obligatorios</span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
