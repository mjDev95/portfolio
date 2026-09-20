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
                <span className="font-medium text-[#95aac9] dark:text-[#a7a6a8]">
                    {selectedUserIds.length} {selectedUserIds.length === 1 ? 'cliente asignado' : 'clientes asignados'}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="font-semibold text-brand-primary transition hover:text-[#1e6ec7] hover:underline"
                    >
                        Asignar a todos los clientes
                    </button>
                    {selectedUserIds.length > 0 && (
                        <>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
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
                <div className="flex flex-wrap gap-2 rounded-xl bg-[#f8fafc] p-3 dark:bg-[#16191c]">
                    {selectedUsers.map((user) => {
                        const isAdmin = user.role?.slug === 'admin' || user.role === 'admin';
                        return (
                            <span
                                key={user.id}
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#293951] shadow-xs dark:bg-[#1e2126] dark:text-white"
                            >
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                    isAdmin ? 'bg-brand-primary/15 text-brand-primary dark:bg-brand-primary/25' : 'bg-brand-secondary/15 text-brand-secondary'
                                }`}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                                <span className="font-semibold">{user.name}</span>
                                <span className="text-[10px] text-[#95aac9] dark:text-[#a7a6a8]">({user.email})</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="ml-1 rounded-full p-0.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20"
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
                    <Search className="absolute left-3.5 h-4 w-4 text-[#95aac9] dark:text-[#a7a6a8]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Buscar clientes por nombre o correo para asignar..."
                        className="w-full rounded-xl border-0 bg-[#f8fafc] py-2.5 pl-10 pr-10 text-sm text-[#293951] placeholder-[#95aac9] shadow-xs focus:bg-white focus:ring-2 focus:ring-brand-primary dark:bg-[#16191c] dark:text-white dark:placeholder-[#a7a6a8] dark:focus:bg-[#1e2126]"
                    />
                    {loading ? (
                        <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-brand-primary" />
                    ) : searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                {/* Dropdown flotante con resultados */}
                {isOpen && (
                    <div className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-[#1e2126] dark:ring-white/10">
                        {results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((u) => {
                                    const isSelected = selectedUserIds.includes(u.id);
                                    const isAdmin = u.role?.slug === 'admin' || u.role === 'admin';
                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => handleSelectUser(u)}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                                                isSelected
                                                    ? 'bg-[#ebf1f7] text-brand-primary dark:bg-[#16191c]'
                                                    : 'hover:bg-[#f8fafc] dark:hover:bg-[#16191c]/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f8fafc] font-bold text-brand-primary dark:bg-[#16191c]">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-[#293951] dark:text-white truncate">
                                                        {u.name}
                                                    </p>
                                                    <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8] truncate">
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
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
                            <div className="p-4 text-center text-xs text-[#95aac9] dark:text-[#a7a6a8]">
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
