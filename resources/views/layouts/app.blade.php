<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name'))</title>
    <meta name="description" content="@yield('meta_description', $__env->yieldContent('description', config('app.name').' — Creative Developer & UX/UI Designer portfolio.'))">

    {{-- Open Graph / Social Media Meta Tags --}}
    <meta property="og:title" content="@yield('og_title', $__env->yieldContent('title', config('app.name')))">
    <meta property="og:description" content="@yield('og_description', $__env->yieldContent('meta_description', $__env->yieldContent('description', config('app.name'))))">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:type" content="@yield('og_type', 'website')">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:300,400,500,600&display=swap" rel="stylesheet" />

    @vite(['resources/css/fluid-system.css', 'resources/css/public.css', 'resources/js/public/main.js'])
    @include('partials.theme-styles')
    @stack('head')
</head>
<body data-barba="wrapper">

    {{-- Persistent elements: survive every Barba transition untouched --}}
    @auth
        @include('partials.admin-bar')
    @endauth

    @include('partials.cursor')

    @include('partials.navbar')

    <div id="transition-wipe" class="position-fixed inset-0 z-index-50" aria-hidden="true"></div>

    <main data-barba="container" 
          data-barba-namespace="@yield('namespace', 'default')"
          @hasSection('edit_url') data-edit-url="@yield('edit_url')" @endif
          @hasSection('edit_label') data-edit-label="@yield('edit_label')" @endif>
        @yield('content')
    </main>

    @include('partials.footer')

    @include('partials.cookie-banner')

</body>
</html>

