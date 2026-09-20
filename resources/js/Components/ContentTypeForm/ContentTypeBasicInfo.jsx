import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    Briefcase,
    BookOpen,
    Scale,
    Stethoscope,
    Award,
    Sparkles,
    FolderGit2,
    FileText,
    Layers,
    Boxes,
    MessageSquare,
    Check,
} from 'lucide-react';

export const AVAILABLE_ICONS = [
    { name: 'Briefcase', label: 'Portafolio / Negocios', Icon: Briefcase },
    { name: 'BookOpen', label: 'Blog / Artículos', Icon: BookOpen },
    { name: 'Scale', label: 'Leyes / Jurídico', Icon: Scale },
    { name: 'Stethoscope', label: 'Salud / Médico', Icon: Stethoscope },
    { name: 'Award', label: 'Premios / Reconocimientos', Icon: Award },
    { name: 'Sparkles', label: 'Servicios / Creativo', Icon: Sparkles },
    { name: 'FolderGit2', label: 'Proyectos / Código', Icon: FolderGit2 },
    { name: 'FileText', label: 'Documentos / Reportes', Icon: FileText },
    { name: 'Layers', label: 'Módulos / Secciones', Icon: Layers },
    { name: 'Boxes', label: 'Productos / Inventario', Icon: Boxes },
    { name: 'MessageSquare', label: 'Testimonios / Reseñas', Icon: MessageSquare },
];

export default function ContentTypeBasicInfo({
    data,
    setData,
    errors,
    isEditing,
    toSnakeCase,
}) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] sm:p-8">
            <div className="border-b border-[#f5f7fa] pb-4 dark:border-[#16191c]">
                <h2 className="font-heading text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                    1. Información General del CPT
                </h2>
                <p className="text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                    Nombres y datos base para identificar este modelo en el sistema.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Nombre en plural */}
                <div>
                    <InputLabel htmlFor="name" className="font-semibold">
                        Nombre en Plural *
                    </InputLabel>
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 w-full"
                        value={data.name}
                        onChange={(e) => {
                            setData((prev) => ({
                                ...prev,
                                name: e.target.value,
                                ...(!isEditing && !prev.slug
                                    ? { slug: toSnakeCase(e.target.value) }
                                    : {}),
                            }));
                        }}
                        placeholder="ej: Casos de Éxito, Tratamientos, Proyectos"
                        required
                    />
                    {errors.name && <InputError message={errors.name} className="mt-1" />}
                </div>

                {/* Nombre en singular */}
                <div>
                    <InputLabel htmlFor="singular_name" className="font-semibold">
                        Nombre en Singular
                    </InputLabel>
                    <TextInput
                        id="singular_name"
                        type="text"
                        className="mt-1 w-full"
                        value={data.singular_name}
                        onChange={(e) => setData('singular_name', e.target.value)}
                        placeholder="ej: Caso de Éxito, Tratamiento, Proyecto"
                    />
                    {errors.singular_name && (
                        <InputError message={errors.singular_name} className="mt-1" />
                    )}
                </div>

                {/* Slug de URL interna */}
                <div>
                    <InputLabel htmlFor="slug" className="font-semibold">
                        Identificador de URL (Slug) *
                    </InputLabel>
                    <TextInput
                        id="slug"
                        type="text"
                        className="mt-1 w-full font-mono text-sm"
                        value={data.slug}
                        onChange={(e) => setData('slug', toSnakeCase(e.target.value))}
                        placeholder="ej: casos, tratamientos, proyectos"
                        required
                    />
                    <p className="mt-1 text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                        Ruta del panel: <code>/admin/{data.slug || 'slug'}</code>
                    </p>
                    {errors.slug && <InputError message={errors.slug} className="mt-1" />}
                </div>

                {/* Orden en el menú */}
                <div>
                    <InputLabel htmlFor="order" className="font-semibold">
                        Posición en el Menú
                    </InputLabel>
                    <TextInput
                        id="order"
                        type="number"
                        className="mt-1 w-full"
                        value={data.order}
                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                    />
                </div>

                {/* Selector de Icono */}
                <div className="sm:col-span-2">
                    <InputLabel className="mb-2 font-semibold">
                        Icono Representativo
                    </InputLabel>
                    <div className="flex flex-wrap gap-2.5">
                        {AVAILABLE_ICONS.map((item) => {
                            const isSelected = data.icon === item.name;
                            const Icon = item.Icon;
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setData('icon', item.name)}
                                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                                        isSelected
                                            ? 'bg-[#ebf1f7] text-brand-primary font-semibold shadow-xs dark:bg-[#16191c]'
                                            : 'bg-[#f8fafc] text-[#95aac9] hover:text-[#293951] dark:bg-[#16191c] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]'
                                    }`}
                                    title={item.label}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                    {isSelected && <Check className="h-3 w-3 text-brand-primary" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="description" className="font-semibold">
                        Descripción o Propósito
                    </InputLabel>
                    <textarea
                        id="description"
                        rows={2}
                        className="mt-1 w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-[#293951] placeholder-[#95aac9] transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:bg-[#16191c] dark:text-[#ffffff] dark:placeholder-[#606770]"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Breve explicación sobre para qué se usa este tipo de contenido..."
                    />
                </div>
            </div>
        </div>
    );
}

