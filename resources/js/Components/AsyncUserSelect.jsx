import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Check, Shield, User, Loader2 } from 'lucide-react';

export default function AsyncUserSelect({
    selectedUserIds = [],
    onChange,
    initialUsers = [],
    error = null,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(initialUsers);
    const dropdownRef = useRef(null);

    // Mantener la lista de objetos de usuarios seleccionados en sincronía
    useEffect(() => {
        if (initialUsers && initialUsers.length > 0) {
            setSelectedUsers(prev => {
                const map = new Map();
                [...prev, ...initialUsers].forEach(u => map.set(u.id, u));
                return Array.from(map.values()).filter(u => selectedUserIds.includes(u.id));
            });
        }
    }, [initialUsers, selectedUserIds]);

    // Búsqueda asíncrona con debounce (300 ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const url = route('admin.api.users.search') + (query ? `?search=${encodeURIComponent(query)}&limit=10` : '?limit=10');
            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        if (selectedUserIds.includes(user.id)) {
            // Deseleccionar
            handleRemoveUser(user.id);
        } else {
            // Seleccionar
            const newSelected = [...selectedUsers, user];
            setSelectedUsers(newSelected);
            onChange(newSelected.map(u => u.id), newSelected);
        }
    };

    const handleRemoveUser = (userId) => {
        const newSelected = selectedUsers.filter(u => u.id !== userId);
        setSelectedUsers(newSelected);
        onChange(newSelected.map(u => u.id), newSelected);
    };

    const handleSelectAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(route('admin.api.users.search') + '?limit=30', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            if (res.ok) {
                const all = await res.json();
                setSelectedUsers(all);
                onChange(all.map(u => u.id), all);
            }
        } catch (err) {
            console.error('Error selecting all:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = () => {
        setSelectedUsers([]);
        onChange([], []);
    };

    return (
        <div className="space-y-3" ref={dropdownRef}>
            {/* Barra superior de acciones rápidas */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                    {selectedUserIds.length} {selectedUserIds.length === 1 ? 'cliente asignado' : 'clientes asignados'}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="font-semibold text-brand-primary transition hover:text-brand-primary-hover hover:underline"
                    >
                        Asignar a todos los clientes
                    </button>
                    {selectedUserIds.length > 0 && (
                        <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-red-500 transition hover:text-red-600 hover:underline"
                            >
                                Limpiar selección
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Chips de usuarios seleccionados */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-3 dark:border-slate-800 dark:bg-[#12161f]">
                    {selectedUsers.map((user) => {
                        const isAdmin = user.role?.slug === 'admin' || user.role === 'admin';
                        return (
                            <span
                                key={user.id}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs dark:border-slate-700 dark:bg-[#202735] dark:text-slate-200"
                            >
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                    isAdmin ? 'bg-brand-primary/15 text-brand-primary dark:bg-brand-primary/25' : 'bg-brand-secondary/15 text-brand-secondary'
                                }`}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                                <span className="font-semibold">{user.name}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">({user.email})</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="ml-1 rounded-full p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20"
                                    title={`Remover a ${user.name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Input de Búsqueda Asíncrona */}
            <div className="relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Buscar clientes por nombre o correo para asignar..."
                        className="w-full rounded-full border border-slate-200/80 bg-white py-2 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#161b24] dark:text-white dark:placeholder-slate-500"
                    />
                    {loading ? (
                        <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-brand-primary" />
                    ) : searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                {/* Dropdown flotante con resultados */}
                {isOpen && (
                    <div className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-[#161b24]">
                        {results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((u) => {
                                    const isSelected = selectedUserIds.includes(u.id);
                                    const isAdmin = u.role?.slug === 'admin' || u.role === 'admin';
                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => handleSelectUser(u)}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                                                isSelected
                                                    ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-[#1c222e]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-brand-primary dark:bg-slate-800">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                                        {u.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                                    isAdmin
                                                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary'
                                                        : 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                                }`}>
                                                    {isAdmin ? 'Admin' : 'Cliente'}
                                                </span>
                                                {isSelected && (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                                {loading ? 'Buscando usuarios...' : 'No se encontraron clientes que coincidan con la búsqueda.'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
