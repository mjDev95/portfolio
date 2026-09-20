import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

/**
 * LocomotiveScrollbar
 * Recrea fielmente la barra de desplazamiento flotante y minimalista de Locomotive Scroll:
 * - Pista 100% transparente.
 * - Píldora delgada flotante con bordes redondeados (rounded-full).
 * - Fades suaves: invisible en reposo, emerge al desplazarse o pasar el cursor.
 * - Expansión táctil sutil al interactuar / hover.
 * - Arrastre fluido y salto al hacer clic en cualquier parte de la pista.
 */
export default function LocomotiveScrollbar() {
    const [thumbHeight, setThumbHeight] = useState(0);
    const [thumbTop, setThumbTop] = useState(0);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const scrollTimeoutRef = useRef(null);
    const dragStartYRef = useRef(0);
    const dragStartScrollTopRef = useRef(0);
    const trackRef = useRef(null);

    const updateMetrics = useCallback(() => {
        if (typeof window === 'undefined') return;

        const clientHeight = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (scrollHeight <= clientHeight + 4) {
            setIsScrollable(false);
            return;
        }

        setIsScrollable(true);

        // Altura proporcional con mínimo de 44px
        const ratio = clientHeight / scrollHeight;
        const calculatedThumbHeight = Math.max(ratio * clientHeight, 44);
        setThumbHeight(calculatedThumbHeight);

        // Posición actual del thumb
        const maxScroll = scrollHeight - clientHeight;
        const scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        const maxThumbTop = clientHeight - calculatedThumbHeight;
        setThumbTop(scrollProgress * maxThumbTop);
    }, []);

    // Escucha de eventos de scroll y resize
    useEffect(() => {
        const handleScroll = () => {
            updateMetrics();
            setIsScrolling(true);

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            // Ocultar suavemente tras 1.2 segundos sin desplazarse
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1200);
        };

        const handleResize = () => {
            updateMetrics();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        // Actualizar métricas al completar cualquier navegación de Inertia
        const removeFinishListener = router.on('finish', () => {
            setTimeout(updateMetrics, 100);
        });

        // Observar cambios en el DOM (acordeones, tabs, carga de imágenes)
        const observer = new MutationObserver(() => {
            updateMetrics();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
        });

        updateMetrics();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            removeFinishListener();
            observer.disconnect();
        };
    }, [updateMetrics]);

    // Arrastre con el mouse (Drag)
    const handleThumbMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(true);
        dragStartYRef.current = e.clientY;
        dragStartScrollTopRef.current = window.scrollY;

        document.body.style.userSelect = 'none';

        const handleMouseMove = (moveEvent) => {
            const clientHeight = window.innerHeight;
            const scrollHeight = document.documentElement.scrollHeight;
            const maxScroll = scrollHeight - clientHeight;
            const maxThumbTop = clientHeight - thumbHeight;

            if (maxThumbTop <= 0) return;

            const deltaY = moveEvent.clientY - dragStartYRef.current;
            const scrollRatio = maxScroll / maxThumbTop;
            const targetScroll = dragStartScrollTopRef.current + deltaY * scrollRatio;

            window.scrollTo({
                top: Math.max(0, Math.min(targetScroll, maxScroll)),
                behavior: 'auto',
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Clic en la pista para salto directo
    const handleTrackClick = (e) => {
        if (e.target !== trackRef.current) return;

        const clientHeight = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const maxScroll = scrollHeight - clientHeight;
        const clickRatio = e.clientY / clientHeight;

        window.scrollTo({
            top: clickRatio * maxScroll,
            behavior: 'smooth',
        });
    };

    if (!isScrollable) return null;

    const isVisible = isScrolling || isHovered || isDragging;

    return (
        <div
            ref={trackRef}
            onClick={handleTrackClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`c-scrollbar fixed top-0 right-0 h-full w-3.5 z-50 select-none cursor-pointer transition-opacity duration-300 ease-out hidden sm:block ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
        >
            {/* Píldora estilo Locomotive Scroll */}
            <div
                onMouseDown={handleThumbMouseDown}
                style={{
                    height: `${thumbHeight}px`,
                    transform: `translate3d(0, ${thumbTop}px, 0)`,
                }}
                className={`c-scrollbar_thumb absolute right-1 rounded-full transition-all duration-150 ease-out will-change-transform ${
                    isHovered || isDragging ? 'w-2.5' : 'w-1.5'
                } ${
                    isDragging
                        ? 'bg-brand-primary dark:bg-brand-primary cursor-grabbing shadow-lg'
                        : isHovered
                        ? 'bg-[#293951]/60 hover:bg-brand-primary dark:bg-white/50 dark:hover:bg-brand-primary cursor-grab'
                        : 'bg-[#293951]/30 dark:bg-white/25 cursor-grab'
                }`}
            />
        </div>
    );
}

