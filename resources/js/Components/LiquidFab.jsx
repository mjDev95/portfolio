import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import {
    Plus,
    Boxes,
    Images,
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    FileText,
    Layers,
} from 'lucide-react';

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
    Images,
};

/**
 * Liquid FAB (Floating Action Button) dinámico y reactivo para el Panel de Administración.
 * Adaptado de animaciones/v2.html usando GSAP + Filtro Gooey SVG, con acciones y paleta
 * completamente personalizadas según el rol y tipos de contenido del usuario.
 */
export default function LiquidFab({
    user,
    isAdmin = false,
    contentTypes = [],
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const timelineRef = useRef(null);
    const plusIconRef = useRef(null);
    const blobMainRef = useRef(null);
    const subBlobsRef = useRef([]);
    const subButtonsRef = useRef([]);

    // 1. Construir las acciones dinámicas según el usuario
    const actions = React.useMemo(() => {
        const list = [];

        // Acciones basadas en los CPTs asignados a este usuario (hasta 3)
        (contentTypes || []).slice(0, 3).forEach((type) => {
            const IconComponent = ICON_MAP[type.icon] || FileText;
            list.push({
                id: `cpt-${type.slug}`,
                label: `Nuevo ${type.singular_name || type.name}`,
                href: route('admin.content.create', type.slug),
                icon: <IconComponent className="h-4 w-4" />,
            });
        });

        // Si es Super Admin y hay espacio, dar acceso rápido a crear Tipos de Contenido
        if (isAdmin && list.length < 3) {
            list.push({
                id: 'create-cpt',
                label: 'Nuevo Tipo de Contenido',
                href: route('admin.content-types.create'),
                icon: <Boxes className="h-4 w-4" />,
            });
        }

        // Si aún hay espacio, añadir acceso rápido a Medios
        if (list.length < 3) {
            list.push({
                id: 'upload-media',
                label: 'Subir Medios',
                href: route('admin.media.index'),
                icon: <Images className="h-4 w-4" />,
            });
        }

        return list;
    }, [contentTypes, isAdmin]);

    // 2. Inicializar y orquestar la animación GSAP
    useEffect(() => {
        if (!containerRef.current || actions.length === 0) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                paused: true,
                defaults: { ease: 'power2.inOut' },
            });

            // 1. Rotación del icono central (+)
            if (plusIconRef.current) {
                tl.to(
                    plusIconRef.current,
                    {
                        rotation: 45,
                        duration: 0.42,
                        ease: 'back.out(1.8)',
                    },
                    0
                );
            }

            // 2. Compresión inicial de la gota base (Squash & Stretch)
            if (blobMainRef.current) {
                tl.to(
                    blobMainRef.current,
                    {
                        scaleX: 1.15,
                        scaleY: 0.86,
                        duration: 0.15,
                        ease: 'power2.out',
                    },
                    0
                ).to(
                    blobMainRef.current,
                    {
                        scaleX: 1,
                        scaleY: 1,
                        duration: 0.45,
                        ease: 'elastic.out(1.1, 0.45)',
                    },
                    0.15
                );
            }

            // 3. Deformación líquida y elevación de cada gota hija
            actions.forEach((_, index) => {
                const blob = subBlobsRef.current[index];
                const btn = subButtonsRef.current[index];
                if (!blob || !btn) return;

                // Separación equidistante y simétrica de exactamente 22px entre todos los bordes:
                // - Base (radio 29) a Gota 1 (radio 22): 73 - 51 = 22px de separación neta.
                // - Gota 1 (radio 22) a Gota 2 (radio 22): 66 - 44 = 22px de separación neta.
                // Ambos espacios son idénticos, evitando cualquier pellizco o deformación sin alejarlos.
                const targetY = -73 - index * 66;
                const delay = 0.04 * (index + 1);

                // Elevación balística de la gota
                tl.to(
                    blob,
                    {
                        y: targetY,
                        duration: 0.52 + index * 0.06,
                        ease: 'back.out(1.4)',
                    },
                    delay
                );

                // Estiramiento vertical en vuelo y rebote elástico al asentarse
                tl.fromTo(
                    blob,
                    { scaleY: 1, scaleX: 1 },
                    {
                        keyframes: [
                            {
                                scaleY: 1.45,
                                scaleX: 0.72,
                                duration: 0.22,
                                ease: 'power1.out',
                            },
                            {
                                scaleY: 1,
                                scaleX: 1,
                                duration: 0.38,
                                ease: 'elastic.out(1.2, 0.4)',
                            },
                        ],
                    },
                    delay
                );

                // Elevación del botón interactivo con sincronización de opacidad
                tl.to(
                    btn,
                    {
                        y: targetY,
                        opacity: 1,
                        duration: 0.52 + index * 0.06,
                        ease: 'back.out(1.4)',
                        onStart: () => {
                            btn.style.pointerEvents = 'auto';
                        },
                    },
                    delay
                );
            });

            timelineRef.current = tl;
        }, containerRef);

        return () => ctx.revert();
    }, [actions]);

    // 3. Toggle del estado
    const toggleFab = () => {
        if (!timelineRef.current) return;

        setIsOpen((prev) => {
            const next = !prev;
            if (next) {
                timelineRef.current.timeScale(1).play();
            } else {
                subButtonsRef.current.forEach((btn) => {
                    if (btn) btn.style.pointerEvents = 'none';
                });
                timelineRef.current.timeScale(1.35).reverse();
            }
            return next;
        });
    };

    // 4. Cerrar con Escape o clic exterior
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                toggleFab();
            }
        };

        const handleClickOutside = (e) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) {
                toggleFab();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className={`fixed bottom-6 right-6 z-40 select-none ${className}`}
            style={{ width: 64, height: 64 }}
        >
            {/* ── Filtro SVG Gooey Encapsulado (Threshold Alpha Dinámico para cualquier color) ── */}
            <svg
                style={{ position: 'absolute', width: 0, height: 0 }}
                aria-hidden="true"
                className="pointer-events-none"
            >
                <defs>
                    <filter id="liquid-fab-goo" x="-100%" y="-400%" width="300%" height="600%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="7.5" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  
                                    0 1 0 0 0  
                                    0 0 1 0 0  
                                    0 0 0 34 -11"
                            result="goo"
                        />
                    </filter>
                </defs>
            </svg>

            {/* ── Capa 1: Gotas de fluido deformables con el color reactivo del usuario ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ filter: "url('#liquid-fab-goo')" }}
            >
                {/* Gota Base Principal */}
                <div
                    ref={blobMainRef}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition-colors duration-300"
                    style={{
                        width: 58,
                        height: 58,
                        backgroundColor: 'var(--brand-primary)',
                        willChange: 'transform',
                    }}
                />

                {/* Gotas Secundarias Hijas */}
                {actions.map((act, index) => (
                    <div
                        key={act.id}
                        ref={(el) => (subBlobsRef.current[index] = el)}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300"
                        style={{
                            width: 44,
                            height: 44,
                            backgroundColor: 'var(--brand-primary)',
                            willChange: 'transform',
                        }}
                    />
                ))}
            </div>

            {/* ── Capa 2: Iconos limpios, interactivos y con máxima nitidez de píxel ── */}
            <div className="absolute inset-0">
                {/* Botones Secundarios Desplegados hacia Arriba */}
                {actions.map((act, index) => (
                    <div
                        key={act.id}
                        ref={(el) => (subButtonsRef.current[index] = el)}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none group"
                        style={{ width: 44, height: 44, willChange: 'transform, opacity' }}
                    >
                        <Link
                            href={act.href}
                            onClick={() => {
                                if (isOpen) toggleFab();
                            }}
                            aria-label={act.label}
                            className="relative flex h-full w-full items-center justify-center rounded-full text-white outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                            {act.icon}

                            {/* Tooltip flotante a la izquierda con el nombre de la acción */}
                            <span className="absolute right-full mr-3.5 hidden sm:flex items-center rounded-lg bg-slate-900/90 dark:bg-slate-800/95 px-2.5 py-1 text-xs font-semibold text-white shadow-md whitespace-nowrap opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:-translate-x-1 pointer-events-none">
                                {act.label}
                            </span>
                        </Link>
                    </div>
                ))}

                {/* Botón Disparador Principal (+) */}
                <button
                    type="button"
                    onClick={toggleFab}
                    aria-label={isOpen ? 'Cerrar menú rápido' : 'Abrir menú de creación rápida'}
                    title={isOpen ? 'Cerrar menú' : 'Acciones Rápidas'}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-white outline-none shadow-md transition-transform duration-200 hover:scale-105 active:scale-95"
                    style={{ width: 58, height: 58, zIndex: 20 }}
                >
                    <div ref={plusIconRef} className="flex items-center justify-center">
                        <Plus className="h-6 w-6 stroke-[2.4]" />
                    </div>
                </button>
            </div>
        </div>
    );
}

