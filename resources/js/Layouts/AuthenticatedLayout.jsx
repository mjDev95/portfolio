import ApplicationLogo from '@/Components/ApplicationLogo';
import CommandPalette from '@/Components/CommandPalette';
import GlobalBanner from '@/Components/GlobalBanner';
import LocomotiveScrollbar from '@/Components/LocomotiveScrollbar';
import RoundThemeToggle from '@/Components/RoundThemeToggle';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderGit2,
    BookOpen,
    MessageSquare,
    Settings,
    LogOut,
    User,
    Boxes,
    Layers,
    Briefcase,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FileText,
    Users,
    Images,
    Palette,
} from 'lucide-react';
import { applySuperAdminPalette, resetClientPalette } from '@/Support/brandTheme';

const ICON_MAP = {
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    FileText,
    Boxes,
    Layers,
    MessageSquare,
};

export default function AuthenticatedLayout({ header, children }) {
    const { props = {}, url = '' } = usePage();
    const pagePath = url.split('?')[0];
    const user = props.auth?.user;
    const isAdmin = user?.role === 'admin';
    const contentTypes = props.content_types || [];
    const flash = props.flash || {};
    const errors = props.errors || {};

    const [feedback, setFeedback] = useState(null);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Estado del Command Palette flotante y contexto CPT
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchContext, setSearchContext] = useState(null);

    // Atajo global ⌘K / Ctrl+K y escucha de evento open-admin-search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };

        const handleOpenSearchEvent = (e) => {
            setSearchContext(e?.detail?.context || null);
            setIsSearchOpen(true);
        };

        const handleFeedbackEvent = (e) => {
            if (e.detail) {
                setFeedback(e.detail);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-admin-search', handleOpenSearchEvent);
        window.addEventListener('admin-feedback', handleFeedbackEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-admin-search', handleOpenSearchEvent);
            window.removeEventListener('admin-feedback', handleFeedbackEvent);
        };
    }, []);

    // Sincronización y reactividad de paleta de 4 colores para Super Admin
    useEffect(() => {
        const isSuperAdmin = user?.role === 'admin';
        if (isSuperAdmin) {
            const userPalette = user?.color_palette || {};
            applySuperAdminPalette({
                primary: userPalette.primary || localStorage.getItem('admin_palette_primary') || '#CB2128',
                secondary: userPalette.secondary || localStorage.getItem('admin_palette_secondary') || '#DFB136',
                tertiary: userPalette.tertiary || localStorage.getItem('admin_palette_tertiary') || '#1D4ED8',
                accent: userPalette.accent || localStorage.getItem('admin_palette_accent') || '#F59E0B',
            });
        } else {
            resetClientPalette();
        }

        const handlePaletteChange = (e) => {
            if (isSuperAdmin && e.detail) {
                applySuperAdminPalette(e.detail);
            }
        };

        window.addEventListener('admin-palette-changed', handlePaletteChange);
        return () => window.removeEventListener('admin-palette-changed', handlePaletteChange);
    }, [user?.role, user?.color_palette]);

    // Sincronizar notificaciones flash y errores globales de validación 422
    useEffect(() => {
        if (flash?.success) {
            setFeedback({
                type: 'success',
                title: '¡Operación exitosa!',
                message: flash.success,
            });
        } else if (flash?.error) {
            setFeedback({
                type: 'error',
                title: 'Error en la solicitud',
                message: flash.error,
            });
        } else if (errors && Object.keys(errors).length > 0) {
            const count = Object.keys(errors).length;
            setFeedback({
                type: 'error',
                title: 'Hay errores en el formulario',
                message:
                    count === 1
                        ? 'Revisa el campo con error señalado a continuación.'
                        : `Se encontraron ${count} campos con errores. Revisa el formulario antes de continuar.`,
            });
        }
    }, [flash, errors]);

    useEffect(() => {
        const removeStartListener = router.on('start', (event) => {
            // Limpiar notificación previa al iniciar nueva navegación de página
            setFeedback(null);

            const visit = event?.detail?.visit;
            const method = visit?.method?.toLowerCase() || 'get';
            const isMutation = method !== 'get';
            const isBackgroundVisit = Boolean(
                visit?.preserveState || (visit?.only && visit.only.length > 0)
            );

            // El desenfoque óptico solo se activa en navegación pura de páginas (GET)
            // Jamás ante guardados, actualizaciones, eliminaciones o peticiones asíncronas
            if (!isMutation && !isBackgroundVisit) {
                setIsNavigating(true);
            }
        });

        const removeFinishListener = router.on('finish', () => {
            setIsNavigating(false);
        });

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    const renderNavIcon = (iconName, className = 'h-4 w-4') => {
        const Icon = ICON_MAP[iconName] || FileText;
        return <Icon className={className} />;
    };

    // Detección reactiva de vista activa a través de la URL de Inertia
    const isLinkActive = (key) => {
        if (key === 'dashboard') {
            return (
                url === '/admin' ||
                url === '/admin/dashboard' ||
                url.startsWith('/admin/dashboard?') ||
                url.startsWith('/admin/dashboard/')
            );
        }
        if (key === 'content-types') {
            return url.startsWith('/admin/content-types');
        }
        if (key.startsWith('cpt-')) {
            const slug = key.replace('cpt-', '');
            return (
                url === `/admin/${slug}` ||
                url.startsWith(`/admin/${slug}/`) ||
                url.startsWith(`/admin/${slug}?`) ||
                url.startsWith(`/admin/c/${slug}`)
            );
        }
        switch (key) {
            case 'media':
                return url.startsWith('/admin/media');
            case 'users':
                return url.startsWith('/admin/users');
            case 'brand':
                return url.startsWith('/admin/brand');
            case 'preferences':
                return url.startsWith('/admin/preferences');
            case 'profile':
                return url.startsWith('/admin/profile');
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f7fa] font-sans text-[#293951] transition-colors duration-200 dark:bg-[#121517] dark:text-[#ffffff]">
            <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm dark:bg-[#16191c]/95 dark:shadow-none">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            {/* Logo direccionado al Home del Admin */}
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href={route('admin.dashboard')}
                                    className="group flex items-center gap-2"
                                    title="Ir al inicio del panel"
                                >
                                    <ApplicationLogo className="block h-7 w-auto fill-current text-[#293951] transition-transform group-hover:scale-105 dark:text-[#ffffff]" />
                                    <span className="hidden font-heading text-sm font-bold uppercase tracking-wider text-[#95aac9] group-hover:text-[#293951] dark:text-[#a7a6a8] dark:group-hover:text-[#ffffff] sm:inline">
                                        Admin
                                    </span>
                                </Link>
                            </div>

                            {/* Enlaces de navegación con micro-interacción de píldora deslizante (Stripe style) */}
                            <div className="hidden space-x-1 sm:-my-px sm:ms-8 sm:flex items-center">
                                {[
                                    { key: 'dashboard', href: route('admin.dashboard'), label: 'Dashboard', icon: LayoutDashboard },
                                    ...(isAdmin ? [{ key: 'content-types', href: route('admin.content-types.index'), label: 'Tipos de Contenido', icon: Boxes }] : []),
                                    ...contentTypes.map((type) => ({
                                        key: `cpt-${type.slug}`,
                                        href: route('admin.content.index', type.slug),
                                        label: type.name,
                                        iconName: type.icon,
                                    })),
                                    ...(isAdmin ? [{ key: 'users', href: route('admin.users.index'), label: 'Usuarios', icon: Users }] : []),
                                    { key: 'media', href: route('admin.media.index'), label: 'Medios', icon: Images },
                                    ...(isAdmin ? [{ key: 'brand', href: route('admin.brand.index'), label: 'Identidad', icon: Palette }] : []),
                                ].map((item) => {
                                    const active = isLinkActive(item.key);
                                    const IconComp = item.icon;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                                                active
                                                    ? 'font-semibold text-brand-primary'
                                                    : 'text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]'
                                            }`}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="activeNavIndicator"
                                                    className="absolute inset-0 rounded-xl bg-[#ebf1f7] shadow-sm dark:bg-[#1e2126]"
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                    }}
                                                    style={{ zIndex: 0 }}
                                                />
                                            )}
                                            <span className="relative z-10 inline-flex items-center gap-2">
                                                {IconComp ? <IconComp className="h-4 w-4" /> : renderNavIcon(item.iconName)}
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Botones de acción redondos: Tema (Sol/Luna), Engranaje (Preferencias), Logout */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-2.5">
                            {/* 1. Botón redondo: Tema interactivo con icono de Sol / Luna */}
                            <RoundThemeToggle />

                            {/* 2. Botón redondo: Enlace a Preferencias del administrador */}
                            <Link
                                href={route('admin.preferences.edit')}
                                title="Preferencias del administrador"
                                aria-label="Preferencias del administrador"
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                                    isLinkActive('preferences')
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-[#dfe7ef] hover:text-[#293951] dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:bg-[#282d35] dark:hover:text-[#ffffff]'
                                }`}
                            >
                                <Settings className="h-4 w-4" />
                            </Link>

                            {/* 3. Botón redondo: Perfil del administrador */}
                            <Link
                                href={route('admin.profile.edit')}
                                title="Perfil del administrador"
                                aria-label="Perfil del administrador"
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                                    isLinkActive('profile')
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-[#dfe7ef] hover:text-[#293951] dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:bg-[#282d35] dark:hover:text-[#ffffff]'
                                }`}
                            >
                                <User className="h-4 w-4" />
                            </Link>

                            {/* 4. Botón redondo: Cerrar sesión */}
                            <Link
                                href={route('admin.logout')}
                                method="post"
                                as="button"
                                title="Cerrar sesión"
                                aria-label="Cerrar sesión"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ebf1f7] text-[#95aac9] transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Trigger menú móvil */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-[#95aac9] transition hover:bg-[#ebf1f7] hover:text-[#293951] focus:outline-none dark:text-[#a7a6a8] dark:hover:bg-[#1e2126] dark:hover:text-[#ffffff]"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' bg-white shadow-xl dark:bg-[#16191c] sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <Link
                            href={route('admin.dashboard')}
                            className={`block px-4 py-2 text-sm font-medium transition-colors ${
                                isLinkActive('dashboard')
                                    ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                    : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                            }`}
                        >
                            Dashboard
                        </Link>

                        {contentTypes.map((type) => (
                            <Link
                                key={type.id}
                                href={route('admin.content.index', type.slug)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                    isLinkActive(`cpt-${type.slug}`)
                                        ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                        : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                                }`}
                            >
                                {renderNavIcon(type.icon)}
                                {type.name}
                            </Link>
                        ))}



                        {isAdmin && (
                            <>
                                <Link
                                    href={route('admin.content-types.index')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        isLinkActive('content-types')
                                            ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                            : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                                    }`}
                                >
                                    <Boxes className="h-4 w-4" />
                                    Tipos de Contenido
                                </Link>

                                <Link
                                    href={route('admin.users.index')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        isLinkActive('users')
                                            ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                            : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                                    }`}
                                >
                                    <Users className="h-4 w-4" />
                                    Usuarios
                                </Link>

                                <Link
                                    href={route('admin.brand.index')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        isLinkActive('brand')
                                            ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                            : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                                    }`}
                                >
                                    <Palette className="h-4 w-4" />
                                    Identidad
                                </Link>
                            </>
                        )}

                        <Link
                            href={route('admin.media.index')}
                            onClick={() => setShowingNavigationDropdown(false)}
                            className={`flex w-full items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                isLinkActive('media')
                                    ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                    : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                            }`}
                        >
                            <Images className="h-4 w-4" />
                            Medios
                        </Link>
                        <Link
                            href={route('admin.preferences.edit')}
                            className={`block px-4 py-2 text-sm font-medium transition-colors ${
                                isLinkActive('preferences')
                                    ? 'bg-[#ebf1f7] font-semibold text-brand-primary dark:bg-[#1e2126] dark:text-brand-primary'
                                    : 'text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]'
                            }`}
                        >
                            Preferencias
                        </Link>
                    </div>

                    <div className="pb-4 pt-4">
                        <div className="flex items-center justify-between px-4">
                            <div>
                                <div className="text-sm font-semibold text-[#293951] dark:text-[#ffffff]">
                                    {user?.name}
                                </div>
                                <div className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                                    {user?.email}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <RoundThemeToggle />
                                <Link
                                    href={route('admin.preferences.edit')}
                                    title="Preferencias"
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                                        isLinkActive('preferences')
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'bg-[#ebf1f7] text-[#95aac9] hover:bg-[#dfe7ef] dark:bg-[#1e2126] dark:text-[#a7a6a8] dark:hover:bg-[#282d35]'
                                    }`}
                                >
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <Link
                                href={route('admin.profile.edit')}
                                className="block px-4 py-2 text-sm text-[#95aac9] hover:bg-[#ebf1f7] dark:text-[#a7a6a8] dark:hover:bg-[#1e2126]"
                            >
                                Perfil
                            </Link>

                            <Link
                                method="post"
                                href={route('admin.logout')}
                                as="button"
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                                Cerrar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="py-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Notificación flotante global centrada (fuera de main para no sufrir desenfoque) */}
            <GlobalBanner
                feedback={feedback}
                onClose={() => setFeedback(null)}
            />

            {/* Buscador Flotante Híbrido (Command Palette ⌘K) */}
            <CommandPalette
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                contextCpt={searchContext}
            />


            {/* Scrollbar Flotante Estilo Locomotive Scroll */}
            <LocomotiveScrollbar />

            <main
                className={`flex-1 pb-16 overflow-x-hidden transition-all duration-200 ${
                    isNavigating ? 'pointer-events-none select-none' : ''
                }`}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={pagePath}
                        initial={{
                            opacity: 0,
                            x: 14,
                        }}
                        animate={{
                            opacity: isNavigating ? 0.6 : 1,
                            x: 0,
                            transition: {
                                duration: 0.22,
                                ease: [0.16, 1, 0.3, 1],
                            },
                        }}
                        exit={{
                            opacity: 0,
                            x: -14,
                            transition: {
                                duration: 0.14,
                                ease: [0.7, 0, 0.84, 0],
                            },
                        }}
                        style={{
                            willChange: 'transform, opacity',
                        }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}