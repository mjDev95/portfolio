import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import {
    User,
    SlidersHorizontal,
    Sparkles,
    LogOut,
    ChevronDown,
    Shield,
} from 'lucide-react';

/**
 * Topbar Profile Dropdown con Apertura Líquida Orgánica y Bordes Neutros Limpios
 * Reacciona tanto a hover como a click con física de rebote elástico.
 * Estilo visual limpio y neutral: sin bordes de colores ni anillos chillones.
 */
export default function TopbarProfileDropdown({ user, isAdmin }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    const clearCloseTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Apertura reactiva en hover
    const handleMouseEnter = () => {
        clearCloseTimeout();
        setIsOpen(true);
    };

    // Cierre suave con delay de protección para transferir el cursor sin cortes
    const handleMouseLeave = () => {
        clearCloseTimeout();
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 220);
    };

    // Toggle en click / tap
    const handleClick = () => {
        clearCloseTimeout();
        setIsOpen((prev) => !prev);
    };

    // Cierre por click exterior o Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        return () => {
            clearCloseTimeout();
        };
    }, []);

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'AD';

    // Opciones del menú (Mi Perfil, Preferencias, Identidad)
    const menuItems = [
        {
            key: 'profile',
            href: route('admin.profile.edit'),
            label: 'Mi Perfil',
            sublabel: 'Credenciales y cuenta',
            icon: User,
        },
        {
            key: 'preferences',
            href: route('admin.preferences.edit'),
            label: 'Preferencias',
            sublabel: 'Tema, paleta y apariencia',
            icon: SlidersHorizontal,
        },
        ...(isAdmin
            ? [
                  {
                      key: 'brand',
                      href: route('admin.brand.index'),
                      label: 'Identidad y Marca',
                      sublabel: 'Colores y sistema visual',
                      icon: Sparkles,
                  },
              ]
            : []),
    ];

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* ── Cápsula del Perfil con Deformación Gelatinosa y Bordes Neutros ── */}
            <motion.button
                type="button"
                onClick={handleClick}
                aria-expanded={isOpen}
                aria-haspopup="true"
                animate={
                    isOpen
                        ? {
                              scaleX: [1, 1.04, 0.98, 1],
                              scaleY: [1, 0.94, 1.02, 1],
                          }
                        : { scaleX: 1, scaleY: 1 }
                }
                transition={{ duration: 0.32, ease: 'easeOut' }}
                whileTap={{ scale: 0.95 }}
                className={`group relative z-30 flex items-center gap-2.5 rounded-full py-1 pe-3 ps-1 transition-colors duration-200 border cursor-pointer select-none ${
                    isOpen
                        ? 'bg-white shadow-sm border-slate-300 dark:bg-[#1a202c] dark:border-slate-700'
                        : 'bg-white/80 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs dark:bg-[#161b24]/80 dark:border-slate-800/80 dark:hover:bg-[#1a202c]'
                }`}
            >
                {/* Avatar con iniciales neutras y punto de pulso */}
                <motion.div
                    className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs ring-2 ring-white dark:bg-slate-800 dark:ring-slate-800"
                    animate={
                        isOpen
                            ? {
                                  scale: [1, 1.1, 1],
                                  rotate: [0, -4, 2, 0],
                              }
                            : { scale: 1, rotate: 0 }
                    }
                    transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 20,
                    }}
                >
                    {initials}
                    <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161b24]" />
                    </span>
                </motion.div>

                {/* Texto del Usuario */}
                <div className="hidden text-left xl:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {user?.name || 'Administrador'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                        {user?.email || 'admin@portfolio.test'}
                    </p>
                </div>

                {/* Chevron con rotación spring */}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className="text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </motion.div>
            </motion.button>

            {/* ── Menú Dropdown Flotante con Apertura Líquida Elástica Limpia ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scaleY: 0.35,
                            scaleX: 0.75,
                            y: -16,
                            borderRadius: '28px',
                        }}
                        animate={{
                            opacity: 1,
                            scaleY: 1,
                            scaleX: 1,
                            y: 0,
                            borderRadius: '20px',
                        }}
                        exit={{
                            opacity: 0,
                            scaleY: 0.45,
                            scaleX: 0.8,
                            y: -12,
                            transition: { duration: 0.14, ease: 'easeIn' },
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 440,
                            damping: 24,
                            mass: 0.75,
                        }}
                        style={{ originX: 0.85, originY: 0 }}
                        className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-[20px] border border-slate-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#161b24]/95 z-50 overflow-hidden"
                    >
                        {/* Cabecera del Dropdown con Tarjeta Resumen Neutra */}
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut', delay: 0.03 }}
                            className="rounded-xl bg-slate-50/90 p-3 dark:bg-[#12161f]/90 border border-slate-100 dark:border-slate-800/60 shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs dark:bg-slate-800">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                        {user?.name || 'Administrador'}
                                    </p>
                                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                        {user?.email}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            <Shield className="h-2.5 w-2.5" />
                                            {user?.role_name || (isAdmin ? 'Super Administrador' : 'Cliente')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Enlaces de Navegación con Cascada Elástica Limpia */}
                        <div className="mt-1.5 space-y-0.5">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.key}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.16,
                                            ease: 'easeOut',
                                            delay: 0.04 + index * 0.03,
                                        }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#1e2533] dark:hover:text-white"
                                        >
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-white transition-colors">
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {item.label}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                    {item.sublabel}
                                                </p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Separador Neutro */}
                        <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800/80" />

                        {/* Cerrar Sesión */}
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.16,
                                ease: 'easeOut',
                                delay: 0.04 + menuItems.length * 0.03,
                            }}
                        >
                            <Link
                                href={route('admin.logout')}
                                method="post"
                                as="button"
                                onClick={() => setIsOpen(false)}
                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600 dark:bg-red-950/40 dark:text-red-400 transition-colors">
                                    <LogOut className="h-3.5 w-3.5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-red-600 dark:text-red-400">Cerrar Sesión</p>
                                    <p className="text-[10px] text-red-400/80 dark:text-red-400/60">Finalizar sesión segura</p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
