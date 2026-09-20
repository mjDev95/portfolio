import ApplicationLogo from '@/Components/ApplicationLogo';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CommandPalette from '@/Components/CommandPalette';
import GlobalBanner from '@/Components/GlobalBanner';
import LocomotiveScrollbar from '@/Components/LocomotiveScrollbar';
import RoundThemeToggle from '@/Components/RoundThemeToggle';
import SidebarMorphingDock from '@/Components/Sidebar/SidebarMorphingDock';
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
    Search,
    Menu,
    X,
    ChevronDown,
    Share2,
    Bell,
    ExternalLink,
    LayoutGrid,
    Type,
    SunMoon,
    Activity,
    Cpu,
    ShieldCheck,
    ArrowLeft,
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
    const [isNavigating, setIsNavigating] = useState(false);

    // Detección reactiva de mobile (< 768px) y pantallas flotantes (< 1024px)
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });

    const [isFloating, setIsFloating] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 1024;
        }
        return false;
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsFloating(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Estado del Sidebar colapsable (con persistencia en localStorage y default responsive)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin_sidebar_collapsed');
            if (saved !== null) {
                return saved === 'true';
            }
            return window.innerWidth < 1024;
        }
        return false;
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('admin_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    // Estado del Command Palette flotante
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchContext, setSearchContext] = useState(null);

    // Atajo global ⌘K / Ctrl+K
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

    // Sincronizar notificaciones flash y errores globales
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
            setFeedback(null);
            const visit = event?.detail?.visit;
            const method = visit?.method?.toLowerCase() || 'get';
            const isMutation = method !== 'get';
            const isBackgroundVisit = Boolean(
                visit?.preserveState || (visit?.only && visit.only.length > 0)
            );

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

    // Detección reactiva de ruta activa
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
            case 'messages':
                return url.startsWith('/admin/messages');
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

    const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

    // Icono Toggle Animado con Framer Motion (2 Líneas Asimétricas <-> X Centrada con microinteracción continua)
    const SidebarToggleIcon = ({ isOpen, className = 'h-4 w-4' }) => (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Línea 1: de barra horizontal superior a diagonal 45° */}
            <motion.span
                className="absolute h-[2.2px] rounded-full bg-current"
                initial={false}
                animate={
                    isOpen
                        ? { rotate: 45, y: 0, width: 16, x: 0 }
                        : { rotate: 0, y: -3.2, width: 10, x: -3 }
                }
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 24,
                    mass: 0.8,
                }}
            />
            {/* Línea 2: de barra horizontal inferior a diagonal -45° */}
            <motion.span
                className="absolute h-[2.2px] rounded-full bg-current"
                initial={false}
                animate={
                    isOpen
                        ? { rotate: -45, y: 0, width: 16, x: 0 }
                        : { rotate: 0, y: 3.2, width: 16, x: 0 }
                }
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 24,
                    mass: 0.8,
                }}
            />
        </div>
    );

    // Componente del Contenido del Sidebar con Píldora Deslizante y Rutas Reales
    const LeftSidebarContent = () => {
        const [sidebarNavMode, setSidebarNavMode] = useState(() => {
            if (typeof window !== 'undefined') {
                const path = window.location.pathname;
                if (path.includes('/admin/preferences') || path.includes('/admin/brand') || path.includes('/admin/profile')) {
                    return 'settings';
                }
            }
            return 'menu';
        });

        // 1. Opciones del Menú Principal
        const navItems = [
            {
                key: 'dashboard',
                href: route('admin.dashboard'),
                label: 'Dashboard',
                icon: <LayoutDashboard className="h-4 w-4" />,
            },
            {
                key: 'media',
                href: route('admin.media.index'),
                label: 'Medios',
                icon: <Images className="h-4 w-4" />,
            },
            {
                key: 'messages',
                href: route('admin.messages.index'),
                label: 'Mensajes',
                icon: <MessageSquare className="h-4 w-4" />,
            },
            ...(isAdmin
                ? [
                      {
                          key: 'users',
                          href: route('admin.users.index'),
                          label: 'Usuarios',
                          icon: <Users className="h-4 w-4" />,
                      },
                      {
                          key: 'brand',
                          href: route('admin.brand.index'),
                          label: 'Identidad',
                          icon: <Palette className="h-4 w-4" />,
                      },
                  ]
                : []),
        ];

        // 2. Opciones de Módulos & CPTs
        const modulesItems = [
            ...(isAdmin
                ? [
                      {
                          key: 'content-types',
                          href: route('admin.content-types.index'),
                          label: 'Tipos de Contenido',
                          icon: <Boxes className="h-4 w-4" />,
                      },
                      {
                          key: 'content-types-create',
                          href: route('admin.content-types.create'),
                          label: 'Crear Tipo de Contenido',
                          icon: <Layers className="h-4 w-4" />,
                      },
                  ]
                : []),
            ...contentTypes.map((type) => ({
                key: `cpt-${type.slug}`,
                href: route('admin.content.index', type.slug),
                label: type.name,
                icon: renderNavIcon(type.icon),
            })),
        ];

        // 3. Anclas y Subsecciones de Ajustes
        const settingsItems = [
            {
                key: 'brand-palette',
                href: route('admin.brand.index'),
                label: 'Paleta & Colores',
                icon: <Palette className="h-4 w-4" />,
            },
            {
                key: 'brand-typography',
                href: route('admin.brand.index') + '#typography-section',
                label: 'Tipografía & Tokens',
                icon: <Type className="h-4 w-4" />,
            },
            {
                key: 'pref-theme',
                href: route('admin.preferences.edit') + '#theme-section',
                label: 'Tema Visual',
                icon: <SunMoon className="h-4 w-4" />,
            },
            {
                key: 'pref-telemetry',
                href: route('admin.preferences.edit') + '#telemetry-section',
                label: 'Telemetría',
                icon: <Activity className="h-4 w-4" />,
            },
            {
                key: 'pref-cache',
                href: route('admin.preferences.edit') + '#cache-section',
                label: 'Caché & Sistema',
                icon: <Cpu className="h-4 w-4" />,
            },
            {
                key: 'user-profile',
                href: route('admin.profile.edit'),
                label: 'Perfil & Seguridad',
                icon: <ShieldCheck className="h-4 w-4" />,
            },
        ];

        return (
            <div className="flex flex-col justify-between min-h-full gap-6">
                <div>
                    {/* Saludo Personalizado o Título de Sección con botón Volver */}
                    <div className="my-3 flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                                {sidebarNavMode === 'settings'
                                    ? 'Ajustes'
                                    : sidebarNavMode === 'modules'
                                    ? 'Módulos'
                                    : 'Hola,'}
                                {sidebarNavMode === 'menu' && <><br />{firstName}</>}
                            </h1>
                            <p className="mt-1 text-xs text-slate-400 font-medium">
                                {sidebarNavMode === 'settings'
                                    ? 'Configuración del Sistema'
                                    : sidebarNavMode === 'modules'
                                    ? 'Catálogo y Taxonomías'
                                    : 'Panel de Administración'}
                            </p>
                        </div>
                        {sidebarNavMode !== 'menu' && (
                            <button
                                type="button"
                                onClick={() => setSidebarNavMode('menu')}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-[#1a212d] px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-slate-200 transition"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Menú
                            </button>
                        )}
                    </div>

                    {/* Contenedor de Navegación Real con Píldora Deslizante (layoutId) */}
                    <nav className={`bg-[#f8f9fb] p-2 space-y-1 dark:bg-[#161b24] border border-slate-100 dark:border-slate-800/80 h-[285px] overflow-y-auto custom-scrollbar transition-[border-radius] duration-200 ${
                        sidebarNavMode === 'menu'
                            ? 'rounded-t-[24px] rounded-bl-none rounded-br-[24px]'
                            : 'rounded-[24px]'
                    }`}>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={sidebarNavMode}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.16 }}
                                className="space-y-1"
                            >
                                {(sidebarNavMode === 'settings'
                                    ? settingsItems
                                    : sidebarNavMode === 'modules'
                                    ? modulesItems
                                    : navItems
                                ).map((item) => {
                                    const active = isLinkActive(item.key) || (sidebarNavMode === 'settings' && pagePath.includes(item.href.split('#')[0]));
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            onClick={() => {
                                                if (isFloating) {
                                                    setIsSidebarCollapsed(true);
                                                }
                                            }}
                                            className={`relative flex items-center gap-3.5 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                                                active
                                                    ? 'text-brand-primary font-bold'
                                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                            }`}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="sidebarActivePill"
                                                    className="absolute inset-0 rounded-2xl bg-white shadow-xs dark:bg-[#202735]"
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                    }}
                                                    style={{ zIndex: 0 }}
                                                />
                                            )}
                                            <span
                                                className={`relative z-10 shrink-0 transition-colors duration-200 ${
                                                    active ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400'
                                                }`}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="relative z-10 truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </nav>

                    {/* Botonera con Muesca Líquida (Morphing Notch Dock) */}
                    <SidebarMorphingDock
                        activeMode={sidebarNavMode}
                        onSelectMode={setSidebarNavMode}
                        className="relative z-10 -mt-px w-full"
                    />
                </div>

                {/* 2. Tarjeta Inferior de Administrador con Avatar y Acceso al Sitio Web */}
                <div className="mt-8 rounded-[28px] bg-[#f4f5f8] p-5 pt-8 text-center dark:bg-[#161b24] border border-slate-100 dark:border-slate-800/80 relative">
                    {/* Avatar con iniciales saliendo del contenedor */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm shadow-md ring-4 ring-[#f4f5f8] dark:ring-[#161b24]">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                    </div>

                    {/* Badge del Rol con brand-primary */}
                    <div className="mt-1">
                        <span className="inline-block rounded-full bg-brand-primary px-3 py-0.5 text-[10px] font-bold text-white shadow-xs shadow-brand-primary/30 uppercase tracking-wider">
                            {isAdmin ? 'Super Admin' : 'Editor'}
                        </span>
                    </div>

                    {/* Nombre y correo real */}
                    <div className="mt-2.5">
                        <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white truncate">
                            {user?.name || 'Administrador'}
                        </h3>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-400 truncate">
                            {user?.email || 'admin@portfolio.test'}
                        </p>
                    </div>

                    {/* Botón Ver Sitio Web Público */}
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-full bg-[#172935] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-black dark:bg-[#1f2633] dark:hover:bg-[#283244]"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver Sitio Web
                    </a>
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen w-full bg-[#f0f2f6] dark:bg-[#0a0d14] font-sans text-slate-800 dark:text-white flex flex-col lg:flex-row antialiased relative">
            {/* Backdrop oscuro para móvil y tablet al expandir el sidebar (< 1024px) */}
            <AnimatePresence>
                {!isSidebarCollapsed && isFloating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Spacer animado de layout que empuja el contenido cuando el sidebar está expandido exclusivamente en desktop (>= 1024px) */}
            <motion.div
                initial={false}
                animate={{
                    width: isSidebarCollapsed || isFloating ? 0 : 344,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 28,
                    mass: 0.9,
                }}
                className="hidden lg:block shrink-0 h-screen pointer-events-none"
            />

            {/* Sidebar Flotante/Fijo con Animación Prémium de Framer Motion (Anclado en Top/Left, crece SOLO hacia derecha y abajo) */}
            <motion.aside
                initial={false}
                animate={
                    isSidebarCollapsed
                        ? {
                              width: 48,
                              height: 48,
                              borderRadius: 24,
                              top: isFloating ? 16 : 24,
                              left: isFloating ? 16 : 24,
                              boxShadow:
                                  '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                          }
                        : {
                              width: isMobile ? 'calc(100vw - 32px)' : 320,
                              height: isFloating ? 'calc(100vh - 32px)' : 'calc(100vh - 48px)',
                              borderRadius: 28,
                              top: isFloating ? 16 : 24,
                              left: isFloating ? 16 : 24,
                              boxShadow: isFloating
                                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
                                  : '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                          }
                }
                transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 28,
                    mass: 0.9,
                }}
                className={`flex fixed z-50 bg-white dark:bg-[#11151d] overflow-hidden flex-col ${
                    isSidebarCollapsed
                        ? 'border-none'
                        : 'border border-slate-200/80 dark:border-slate-800/80'
                }`}
            >
                {/* 1. Header Persistente: Logo a la izquierda + Botón Toggle a la derecha (vuela de izq a der sin desmontarse) */}
                <div
                    className={`shrink-0 flex items-center justify-between w-full transition-all duration-300 ${
                        isSidebarCollapsed ? 'p-1 h-12' : 'p-4 sm:p-5 pb-2'
                    }`}
                >
                    {/* Logo Isotipo a la izquierda (aparece solo cuando está expandido) */}
                    <AnimatePresence>
                        {!isSidebarCollapsed && (
                            <motion.div
                                key="sidebar-logo"
                                initial={{ opacity: 0, scale: 0.85, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.85, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <Link
                                    href={route('admin.dashboard')}
                                    className="group flex items-center gap-2.5"
                                    title="Inicio"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-md shadow-brand-primary/30 transition-transform duration-200 group-hover:scale-105">
                                        <svg className="h-5 w-5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" />
                                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="block font-heading text-sm font-black text-slate-900 dark:text-white leading-tight">
                                            Portfolio
                                        </span>
                                        <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                                            Dashboard
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Botón Circular Toggle Persistente — NUNCA se desmonta para garantizar microinteracción continua */}
                    <motion.button
                        layout="position"
                        type="button"
                        onClick={toggleSidebar}
                        transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 28,
                            mass: 0.9,
                        }}
                        className={`group/btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none transition-colors duration-200 hover:scale-105 active:scale-95 ${
                            isSidebarCollapsed
                                ? 'bg-transparent text-slate-800 dark:text-slate-200'
                                : 'bg-slate-100 text-slate-800 shadow-xs hover:bg-slate-200/90 dark:bg-[#1c222e] dark:text-slate-200 dark:hover:bg-[#232b3a]'
                        }`}
                        title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Cerrar barra lateral'}
                        aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Cerrar barra lateral'}
                    >
                        <SidebarToggleIcon isOpen={!isSidebarCollapsed} className="h-4 w-4" />
                    </motion.button>
                </div>

                {/* 2. Cuerpo del Sidebar: Saludo + Navegación con Píldora Deslizante + Botones Circulares + Tarjeta Inferior */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: isSidebarCollapsed ? 0 : 1,
                        pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
                    }}
                    transition={{
                        duration: isSidebarCollapsed ? 0.12 : 0.22,
                        delay: isSidebarCollapsed ? 0 : 0.08,
                    }}
                    className="flex-1 w-full p-4 sm:p-5 pt-0 flex flex-col justify-between overflow-y-auto overscroll-contain"
                >
                    <LeftSidebarContent />
                </motion.div>
            </motion.aside>

            {/* Columna Derecha: Área de Contenido a Pantalla Completa descansando sobre el Fondo Gris Maestro */}
            <div className="flex-1 min-w-0 min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col gap-6 overflow-y-auto">
                {/* ── Top Bar: Breadcrumb Contextual + Herramientas Globales + Notificaciones + Perfil ── */}
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Contenedor Izquierdo: Clon Fantasma + Breadcrumb Contextual */}
                    <div className="flex items-center gap-3">
                        {/* Clon fantasma animado: reserva exactamente el espacio del botón flotante en móvil/tablet y en desktop colapsado */}
                        <motion.div
                            initial={false}
                            animate={{
                                width: isSidebarCollapsed || isFloating ? 56 : 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 280,
                                damping: 28,
                                mass: 0.9,
                            }}
                            className="h-10 shrink-0 pointer-events-none"
                            aria-hidden="true"
                        />

                        {/* Breadcrumbs Escalables con Auto-Resolución y Microdatos Schema.org */}
                        <div className="flex items-center gap-2">
                            <Breadcrumbs items={props.breadcrumbs} />
                        </div>
                    </div>

                    {/* Zona Derecha: Herramientas Globales (Buscar ⌘K, Tema, Notificaciones, Mensajes, Perfil) */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Botón Buscar (⌘K) */}
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs border border-slate-200/70 transition hover:bg-slate-50 dark:bg-[#161b24] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#202735]"
                            title="Buscar en el panel (⌘K)"
                            aria-label="Buscar"
                        >
                            <Search className="h-4 w-4" />
                        </button>

                        {/* Botón Selector de Tema Claro/Oscuro */}
                        <RoundThemeToggle className="!h-10 !w-10 bg-white text-slate-700 shadow-xs border border-slate-200/70 hover:bg-slate-50 dark:bg-[#161b24] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#202735]" />

                        {/* Campana con punto naranja de alerta */}
                        <Link
                            href={route('admin.messages.index')}
                            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs border border-slate-200/70 transition hover:bg-slate-50 dark:bg-[#161b24] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#202735]"
                            title="Notificaciones"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#161b24]" />
                        </Link>

                        {/* Burbuja de chat/mensajes */}
                        <Link
                            href={route('admin.messages.index')}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs border border-slate-200/70 transition hover:bg-slate-50 dark:bg-[#161b24] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#202735]"
                            title="Mensajes"
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Link>

                        {/* Chip del Perfil del Usuario */}
                        <Link
                            href={route('admin.profile.edit')}
                            className="flex items-center gap-2.5 rounded-full py-1 pe-3 ps-1 transition hover:bg-white/70 dark:hover:bg-[#161b24]"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-sm ring-2 ring-white dark:ring-slate-800">
                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                            </div>
                            <div className="hidden text-left xl:block">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                    Hola, {user?.name || 'Administrador'}
                                </p>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    {user?.email || 'admin@portfolio.test'}
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Banner Global de Notificaciones Flash */}
                <GlobalBanner
                    feedback={feedback}
                    onClose={() => setFeedback(null)}
                />

                {/* Buscador Flotante (⌘K) */}
                <CommandPalette
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                    contextCpt={searchContext}
                />

                {/* Scrollbar estilizado */}
                <LocomotiveScrollbar />

                {/* Contenido Principal */}
                <main
                    className={`flex-1 w-full transition-all duration-200 ${
                        isNavigating ? 'pointer-events-none select-none' : ''
                    }`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={pagePath}
                            className="w-full"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{
                                opacity: isNavigating ? 0.6 : 1,
                                y: 0,
                                transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                            }}
                            exit={{
                                opacity: 0,
                                y: -6,
                                transition: { duration: 0.12, ease: [0.7, 0, 0.84, 0] },
                            }}
                            style={{ willChange: 'transform, opacity' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}