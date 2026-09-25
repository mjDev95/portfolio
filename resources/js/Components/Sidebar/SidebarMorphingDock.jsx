import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

/**
 * Botonera del Sidebar integrada directamente con la caja de navegación.
 * 
 * Requisitos del usuario:
 * - Sin flechas hacia abajo.
 * - Sin fondo propio en la botonera (bg-transparent).
 * - El fondo activo es del color de la caja (bg-[#f8f9fb] dark:bg-[#161b24]).
 * - Nace directamente desde la base de la caja (sin mt-6), actuando como una pestaña (tab)
 *   que se desliza horizontalmente al botón pulsado con esquinas cóncavas orgánicas.
 * - Logout removido (ubicado en el dropdown superior de perfil).
 */
export default function SidebarMorphingDock({
    activeMode = 'menu',
    onSelectMode,
    className = '',
}) {
    const tabs = [
        {
            id: 'menu',
            label: 'Menú',
            icon: LayoutGrid,
            title: 'Menú Principal',
        },
    ];

    return (
        <div className={`relative flex items-center bg-transparent px-0 pt-0 ${className}`}>
            {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = true;
                const isFirst = index === 0;

                return (
                    <motion.button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectMode?.(tab.id)}
                        whileTap={{ scale: 0.88 }}
                        title={tab.title}
                        aria-label={tab.label}
                        className="group relative flex h-11 w-20 shrink-0 items-center justify-center text-xs font-semibold"
                    >
                        {/* ── Pestaña activa (Tab) del color de la caja, extendiéndose desde la caja ── */}
                        {isActive && (
                            <motion.div
                                layoutId="sidebarBoxActiveTab"
                                className={`absolute -top-px bottom-0 z-0 bg-[#f8f9fb] dark:bg-[#161b24] shadow-xs ${
                                    isFirst
                                        ? '-left-px right-0 rounded-bl-[18px] rounded-br-[18px] border-l border-b border-r border-slate-100 dark:border-slate-800/80'
                                        : 'left-0 right-0 rounded-b-[18px] border-l border-b border-r border-slate-100 dark:border-slate-800/80'
                                }`}
                                transition={{
                                    type: 'spring',
                                    stiffness: 450,
                                    damping: 32,
                                    mass: 0.85,
                                }}
                            >
                                {/* Esquina cóncava izquierda (hacia arriba y afuera con la base de la caja) */}
                                {!isFirst && (
                                    <svg
                                        className="absolute top-0 -left-[14px] w-[14px] h-[14px] text-[#f8f9fb] dark:text-[#161b24] pointer-events-none"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                    >
                                        <path d="M 14 0 L 0 0 A 14 14 0 0 1 14 14 Z" fill="currentColor" />
                                        <path d="M 0 0 A 14 14 0 0 1 14 14" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-100 dark:text-slate-800/80" />
                                    </svg>
                                )}

                                {/* Esquina cóncava derecha (hacia arriba y afuera con la base de la caja) */}
                                <svg
                                    className="absolute top-0 -right-[14px] w-[14px] h-[14px] text-[#f8f9fb] dark:text-[#161b24] pointer-events-none"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                >
                                    <path d="M 0 0 L 14 0 A 14 14 0 0 0 0 14 Z" fill="currentColor" />
                                    <path d="M 14 0 A 14 14 0 0 0 0 14" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-100 dark:text-slate-800/80" />
                                </svg>
                            </motion.div>
                        )}

                        {/* Icono del botón: círculo con resorte activo como en la imagen de referencia */}
                        {isActive ? (
                            <motion.div
                                layoutId="sidebarActiveIconCircle"
                                className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white shadow-xs"
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 28,
                                }}
                            >
                                <Icon className="h-3.5 w-3.5 stroke-[2.5]" />
                            </motion.div>
                        ) : (
                            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors">
                                <Icon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
