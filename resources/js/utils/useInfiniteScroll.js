import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook reutilizable para Scroll Infinito con IntersectionObserver.
 * 
 * @param {Object|Array} initialData - Objeto paginado de Laravel ({ data, next_page_url, total, current_page, last_page }) o Array simple.
 * @param {Object} options
 * @param {string} [options.rootMargin='250px'] - Margen previo para cargar el lote antes de que el usuario llegue al fondo absoluto.
 * @param {Function} [options.transformItem] - Función opcional para transformar cada elemento al cargarse.
 */
export function useInfiniteScroll(initialData, options = {}) {
    const { rootMargin = '250px', transformItem = null } = options;

    const parseInitialItems = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return Array.isArray(data.data) ? data.data : [];
    };

    const [items, setItems] = useState(() => parseInitialItems(initialData));
    const [nextPageUrl, setNextPageUrl] = useState(() => initialData?.next_page_url || null);
    const [total, setTotal] = useState(() => initialData?.total ?? (Array.isArray(initialData) ? initialData.length : 0));
    const [currentPage, setCurrentPage] = useState(() => initialData?.current_page || 1);
    const [lastPage, setLastPage] = useState(() => initialData?.last_page || 1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(() => Boolean(initialData?.next_page_url));

    const sentinelRef = useRef(null);
    const loadingRef = useRef(false);

    // Sincronizar estado cuando cambian las props iniciales (ej. búsqueda, cambio de filtro)
    useEffect(() => {
        const newItems = parseInitialItems(initialData);
        setItems(newItems);
        setNextPageUrl(initialData?.next_page_url || null);
        setTotal(initialData?.total ?? newItems.length);
        setCurrentPage(initialData?.current_page || 1);
        setLastPage(initialData?.last_page || 1);
        setHasMore(Boolean(initialData?.next_page_url));
        setLoading(false);
        loadingRef.current = false;
    }, [initialData]);

    const loadMore = useCallback(async () => {
        if (!nextPageUrl || loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(nextPageUrl, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const json = await res.json();
            const incomingItems = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
            const processedItems = transformItem ? incomingItems.map(transformItem) : incomingItems;

            setItems((prev) => [...prev, ...processedItems]);
            setNextPageUrl(json.next_page_url || null);
            setCurrentPage(json.current_page || currentPage + 1);
            setLastPage(json.last_page || lastPage);
            setTotal(json.total ?? (items.length + processedItems.length));
            setHasMore(Boolean(json.next_page_url));
        } catch (err) {
            console.error('Error al cargar la siguiente página en useInfiniteScroll:', err);
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [nextPageUrl, currentPage, lastPage, items.length, transformItem]);

    // IntersectionObserver para detectar cuando el sentinel entra en el margen de visión
    useEffect(() => {
        if (!hasMore || loading) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry && firstEntry.isIntersecting && hasMore && !loadingRef.current) {
                    loadMore();
                }
            },
            { rootMargin }
        );

        observer.observe(sentinel);

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
            observer.disconnect();
        };
    }, [hasMore, loading, loadMore, rootMargin]);

    return {
        items,
        setItems,
        loading,
        hasMore,
        total,
        currentPage,
        lastPage,
        sentinelRef,
        loadMore,
    };
}

