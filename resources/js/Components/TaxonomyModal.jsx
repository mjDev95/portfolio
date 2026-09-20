import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';

export default function TaxonomyModal({
    isOpen,
    onClose,
    title = 'Nuevo elemento',
    placeholder = 'Nombre',
    endpoint,
    showDescription = false,
    onSuccess,
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    ...(showDescription && description ? { description: description.trim() } : {}),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors?.name) {
                    setError(data.errors.name[0]);
                } else if (data.message) {
                    setError(data.message);
                } else {
                    setError('Ocurrió un error al guardar.');
                }
                setLoading(false);
                return;
            }

            setName('');
            setDescription('');
            setLoading(false);
            if (onSuccess) onSuccess(data);
            onClose();
        } catch (err) {
            setError('Error de conexión con el servidor.');
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setName('');
            setDescription('');
            setError(null);
            onClose();
        }
    };

    return (
        <Modal show={isOpen} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <InputLabel htmlFor="taxonomy_name" value="Nombre" />
                        <TextInput
                            id="taxonomy_name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={placeholder}
                            className="mt-1 block w-full text-base"
                            isFocused
                            required
                        />
                        {error && (
                            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </div>

                    {showDescription && (
                        <div>
                            <InputLabel htmlFor="taxonomy_description" value="Descripción (Opcional)" />
                            <textarea
                                id="taxonomy_description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Breve descripción o propósito..."
                                className="mt-1 block w-full rounded-2xl border border-slate-200/80 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-[#12161f] dark:text-white dark:placeholder:text-slate-500"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <SecondaryButton onClick={handleClose} disabled={loading}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={loading || !name.trim()}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Plus className="h-4 w-4" />
                                Guardar
                            </span>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

