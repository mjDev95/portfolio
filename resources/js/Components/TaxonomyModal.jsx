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
                <div className="flex items-center justify-between border-b border-[#f5f7fa] pb-4 dark:border-[#16191c]">
                    <h3 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-[#95aac9] hover:bg-[#ebf1f7] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:bg-[#16191c] dark:hover:text-[#ffffff]"
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
                                className="mt-1 block w-full rounded-xl border-0 bg-[#ebf1f7] p-3 text-base text-[#293951] placeholder:text-[#95aac9] focus:bg-white focus:ring-2 focus:ring-brand-primary dark:border-0 dark:bg-[#16191c] dark:text-[#ffffff] dark:placeholder:text-[#a7a6a8] dark:focus:bg-[#16191c] dark:focus:ring-brand-primary"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-[#f5f7fa] pt-4 dark:border-[#16191c]">
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

