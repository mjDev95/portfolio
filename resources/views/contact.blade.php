@extends('layouts.app')

@section('title', 'Contacto — '.config('app.name'))
@section('namespace', 'contact')

@section('content')
<section class="container py-2xl" style="min-height: 100vh;">
    <h1 class="h1" data-reveal>Hablemos</h1>

    @if (session('success'))
        <p class="text-fluid-base mt-md" data-reveal>{{ session('success') }}</p>
    @endif

    <form method="POST" action="{{ route('contact.store') }}" data-contact-form class="mt-lg" style="max-width: 48ch;" data-reveal>
        @csrf

        {{-- Honeypot: real visitors never see or fill this field. --}}
        <div style="position:absolute; left:-9999px;" aria-hidden="true">
            <label for="company">Leave this field empty</label>
            <input type="text" id="company" name="company" tabindex="-1" autocomplete="off">
        </div>

        <div class="mb-md">
            <label for="name" class="text-fluid-sm text-muted d-block mb-sm">Nombre</label>
            <input type="text" id="name" name="name" value="{{ old('name') }}" required
                   class="w-100 p-sm bg-transparent text-white" style="border:1px solid var(--fluid-color-secondary);">
            @error('name') <p class="text-accent text-fluid-sm">{{ $message }}</p> @enderror
        </div>

        <div class="mb-md">
            <label for="email" class="text-fluid-sm text-muted d-block mb-sm">Email</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" required
                   class="w-100 p-sm bg-transparent text-white" style="border:1px solid var(--fluid-color-secondary);">
            @error('email') <p class="text-accent text-fluid-sm">{{ $message }}</p> @enderror
        </div>

        <div class="mb-md">
            <label for="budget_range" class="text-fluid-sm text-muted d-block mb-sm">Presupuesto</label>
            <input type="text" id="budget_range" name="budget_range" value="{{ old('budget_range') }}"
                   class="w-100 p-sm bg-transparent text-white" style="border:1px solid var(--fluid-color-secondary);">
            @error('budget_range') <p class="text-accent text-fluid-sm">{{ $message }}</p> @enderror
        </div>

        <div class="mb-md">
            <label for="message" class="text-fluid-sm text-muted d-block mb-sm">Mensaje</label>
            <textarea id="message" name="message" rows="5" required
                      class="w-100 p-sm bg-transparent text-white" style="border:1px solid var(--fluid-color-secondary);">{{ old('message') }}</textarea>
            @error('message') <p class="text-accent text-fluid-sm">{{ $message }}</p> @enderror
        </div>

        <p data-contact-feedback class="text-fluid-sm" role="status" aria-live="polite"></p>

        <button type="submit" class="p-sm px-lg bg-white text-primary" style="border:0;" data-magnetic>
            Enviar
        </button>
    </form>
</section>
@endsection
