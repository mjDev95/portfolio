<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>401 — Sitio Suspendido | {{ config('app.name') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: #0b0d11;
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            line-height: 1.6;
        }
        .container {
            max-width: 580px;
            width: 100%;
            text-align: center;
            background: rgba(22, 27, 34, 0.75);
            border: 1px solid rgba(248, 113, 113, 0.2);
            border-radius: 1.5rem;
            padding: 3rem 2rem;
            backdrop-filter: blur(12px);
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px -10px rgba(239, 68, 68, 0.12);
        }
        .icon-wrap {
            width: 72px;
            height: 72px;
            margin: 0 auto 1.75rem;
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f87171;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
            margin-bottom: 1.25rem;
        }
        .title {
            font-size: 1.75rem;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
        }
        .description {
            font-size: 1rem;
            color: #94a3b8;
            margin-bottom: 1.75rem;
        }
        .info-card {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 1rem;
            padding: 1.25rem;
            text-align: left;
            font-size: 0.875rem;
            color: #cbd5e1;
            border-left: 3px solid #ef4444;
            margin-bottom: 2rem;
        }
        .info-card strong {
            color: #ffffff;
            display: block;
            margin-bottom: 0.25rem;
        }
        .footer-note {
            font-size: 0.8rem;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon-wrap">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
        </div>

        <span class="badge">
            HTTP 401 &bull; Suspensión de Servicio
        </span>

        <h1 class="title">Sitio Web Suspendido Temporalmente</h1>

        <p class="description">
            El acceso público a este portafolio y sus contenidos ha sido pausado de manera temporal debido a una mensualidad pendiente de regularizar.
        </p>

        <div class="info-card">
            <strong>Aviso para el titular o propietario:</strong>
            Para reactivar de inmediato el acceso al panel administrativo y restaurar la visibilidad de tu sitio web público, por favor comunícate con el administrador del servicio.
        </div>

        <p class="footer-note">
            &copy; {{ date('Y') }} {{ config('app.name') }} &mdash; Plataforma de Portafolios y Servicios Web
        </p>
    </div>
</body>
</html>

