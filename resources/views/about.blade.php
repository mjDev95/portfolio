@extends('layouts.app')

@section('title', 'Sobre mí — '.config('app.name'))
@section('namespace', 'about')

@section('content')
<section class="container py-2xl" style="min-height: 100vh;">
    <h1 class="h1" data-reveal>Sobre mí</h1>
    <p class="text-fluid-lg text-muted mt-md" style="max-width: 60ch;" data-reveal>
        Soy Creative Developer &amp; UX/UI Designer. Diseño y construyo productos
        digitales cuidando tanto la experiencia visual como el rendimiento técnico.
    </p>
</section>
@endsection
