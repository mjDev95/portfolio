@extends('layouts.app')

@section('title', 'Mario Joaquín Galicia — WordPress Architect & Front-End Engineer')
@section('meta_description', 'Portafolio de Mario Joaquín Galicia: WordPress Architect & Front-End Engineer. Custom Themes en PHP nativo, sistemas de diseño en Figma y optimización Core Web Vitals.')
@section('namespace', 'home')

@section('content')
<div class="position-relative">
    {{-- 0. Hero Curtain: Split-Screen Inverted ScrollTrigger Reveal (Lo primero que se ve al entrar) --}}
    @include('partials.home.hero-curtain')

    {{-- 1. Hero Editorial & Estadísticas Monumentales (section #hero-editorial-2) --}}
    @include('partials.home.hero-editorial')

    {{-- 2. Servicios / What I do? (Editorial Cards Stack) --}}
    @include('partials.home.services')

    {{-- 3. Casos Seleccionados (Editorial Rows & CMS CPTs) --}}
    @include('partials.home.selected-cases')

    {{-- 3. Metodología & Trayectoria en 4 Pasos (Wabi-Sabi) --}}
    @include('partials.home.methodology')

    {{-- 4. Call To Action Editorial & Contacto Final --}}
    @include('partials.home.cta-contact')
</div>
@endsection
