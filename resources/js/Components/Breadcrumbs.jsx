import { Link, usePage, Head } from '@inertiajs/react';
import { Home, ChevronRight } from 'lucide-react';
import React, { useMemo } from 'react';

/**
 * Diccionario de segmentos para la inferencia automática de títulos amigables.
 */
const ROUTE_LABELS = {
    admin: 'Inicio',
    dashboard: 'Panel de Control',
    content: 'Contenidos',
    'content-types': 'Tipos de Contenido',
    media: 'Biblioteca de Medios',
    messages: 'Bandeja de Mensajes',
    users: 'Usuarios',
    brand: 'Identidad de Marca',
    preferences: 'Ajustes',
    profile: 'Mi Perfil',
    create: 'Nuevo',
    edit: 'Editar',
    taxonomies: 'Taxonomías',
    categories: 'Categorías',
    tags: 'Etiquetas',
    login: 'Acceso',
};

/**
 * Componente escalable de Migas de Pan (Breadcrumbs) para Inertia + React.
 * 
 * @param {Array<{label: string, href?: string, icon?: React.ReactNode}>} items - Lista explícita de migas (opcional)
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} showHomeIcon - Si se debe mostrar el icono de Home en la raíz
 */
export default function Breadcrumbs({ items, className = '', showHomeIcon = true }) {
    const { url = '', props = {} } = usePage();
    const contentTypes = props.content_types || [];

    // Mapeo dinámico de CPTs registrados para resolver slugs como "proyectos" -> "Proyectos"
    const cptMap = useMemo(() => {
        const map = {};
        contentTypes.forEach((cpt) => {
            if (cpt.slug) map[cpt.slug] = cpt.name;
            if (cpt.public_route_slug) map[cpt.public_route_slug] = cpt.name;
        });
        return map;
    }, [contentTypes]);

    // Resolución automática si no se proporcionan items manuales
    const resolvedItems = useMemo(() => {
        if (items && Array.isArray(items) && items.length > 0) {
            return items;
        }

        // Helper seguro para llamar a route() sin que Ziggy lance errores fatales
        const safeRoute = (name, params) => {
            try {
                if (typeof route === 'function' && route().has(name)) {
                    return route(name, params);
                }
            } catch {
                // Ignore ziggy resolution error
            }
            return null;
        };

        const cleanPath = url.split('?')[0].replace(/^\/|\/$/g, '');
        if (!cleanPath) return [{ label: 'Inicio', href: safeRoute('admin.dashboard') || '/admin' }];

        const segments = cleanPath.split('/');
        const crumbs = [];

        // Siempre empezar con Inicio (Dashboard) si estamos en /admin
        if (segments[0] === 'admin') {
            crumbs.push({
                label: 'Inicio',
                href: safeRoute('admin.dashboard') || '/admin',
            });
        }

        let accumulatedPath = '';
        segments.forEach((segment, index) => {
            // Saltamos 'admin' ya que fue añadido como 'Inicio'
            if (index === 0 && segment === 'admin') {
                accumulatedPath = '/admin';
                return;
            }

            accumulatedPath += `/${segment}`;
            const isLast = index === segments.length - 1;

            // Determinar etiqueta amigable
            let label = ROUTE_LABELS[segment] || cptMap[segment];

            // Si es un ID numérico, etiquetarlo según el contexto
            if (!label) {
                if (/^\d+$/.test(segment)) {
                    label = `#${segment}`;
                } else {
                    // Capitalizar texto con guiones
                    label = segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase());
                }
            }

            // Para ítems intermedios construimos un href si coincide con rutas conocidas
            let href = null;
            if (!isLast) {
                if (segment === 'content' || segment === 'content-types') {
                    href = safeRoute('admin.content-types.index');
                } else if (cptMap[segment]) {
                    href = safeRoute('admin.content.index', segment);
                } else if (segment === 'users') {
                    href = safeRoute('admin.users.index');
                } else if (segment === 'messages') {
                    href = safeRoute('admin.messages.index');
                } else if (segment === 'media') {
                    href = safeRoute('admin.media.index');
                }
            }

            crumbs.push({
                label,
                href: isLast ? null : href,
            });
        });

        return crumbs;
    }, [items, url, cptMap]);

    // Generar JSON-LD estructurado Schema.org BreadcrumbList
    const schemaBreadcrumbList = useMemo(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const itemListElement = resolvedItems.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: item.href.startsWith('http') ? item.href : `${origin}${item.href}` } : {}),
        }));

        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement,
        };
    }, [resolvedItems]);

    return (
        <>
            {/* Metadatos estructurados para SEO */}
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(schemaBreadcrumbList)}
                </script>
            </Head>

            <nav
                aria-label="Breadcrumb"
                className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs shadow-xs border border-slate-200/70 backdrop-blur-md dark:bg-[#161b24]/95 dark:border-slate-800/80 max-w-full overflow-x-auto no-scrollbar ${className}`}
            >
                <ol className="flex items-center gap-1.5 shrink-0 list-none m-0 p-0">
                    {resolvedItems.map((crumb, idx) => {
                        const isLast = idx === resolvedItems.length - 1;
                        const isFirst = idx === 0;

                        return (
                            <li key={idx} className="flex items-center gap-1.5 shrink-0">
                                {idx > 0 && (
                                    <ChevronRight
                                        className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0"
                                        aria-hidden="true"
                                    />
                                )}

                                {isFirst && showHomeIcon && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 shrink-0">
                                        <Home className="h-3 w-3" />
                                    </span>
                                )}

                                {crumb.href && !isLast ? (
                                    <Link
                                        href={crumb.href}
                                        className="font-medium text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-white transition-colors duration-150 truncate max-w-[140px] sm:max-w-xs"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        className={`truncate max-w-[160px] sm:max-w-sm ${
                                            isLast
                                                ? 'font-bold text-slate-900 dark:text-white'
                                                : 'font-medium text-slate-500 dark:text-slate-400'
                                        }`}
                                        aria-current={isLast ? 'page' : undefined}
                                    >
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}

