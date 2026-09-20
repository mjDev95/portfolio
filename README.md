# Portfolio & Universal CMS Platform

A hybrid Laravel 13 application:
- **Public Site**: **Blade + Barba.js v2 + GSAP + Lenis** (SEO-first, fluid page transitions) with dynamic universal rendering for any Custom Post Type (CPT).
- **Admin Panel** (`/admin`): **Inertia.js + React + Tailwind CSS** (Laravel Breeze) featuring a multi-tenant Universal Custom Post Type engine, visual EAV custom field builder, role-based client delegation (Super Admin vs Client), and borderless modern UI.

## Documentation

Full technical documentation lives in [`/docs`](./docs):

1. [Architecture & Stack](./docs/01-ARCHITECTURE-AND-STACK.md)
2. [Local Setup — Herd + DBeaver](./docs/02-LOCAL-SETUP-HERD-DBEAVER.md)
3. [Front-End Animations Lifecycle](./docs/03-FRONTEND-ANIMATIONS-LIFECYCLE.md)
4. [Admin Panel & API Guide](./docs/04-ADMIN-AND-API-GUIDE.md)
5. [Security Checklist](./docs/05-SECURITY-CHECKLIST.md)
6. [Blog & Transitions](./docs/06-BLOG-AND-FLIP-TRANSITIONS.md)
7. [Database Schema & Models](./docs/07-DATABASE-SCHEMA.md)
8. [Telemetry & Analytics](./docs/08-TELEMETRY-AND-ANALYTICS.md)
9. [Project Structure](./docs/PROJECT-STRUCTURE.md)

## Quick Start

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run dev
```

### Default Accounts

- **Super Admin**: `admin@admin.com` / `admin` (Full access to CPT schema, client delegation, and system settings)
- **Client User**: `mjgaliciab@gmail.com` / `admin` (Restricted access to delegated CPTs and live public visibility control)

## License

Private/personal project — not licensed for redistribution.
