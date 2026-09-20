import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import ContentTypeBasicInfo from '@/Components/ContentTypeForm/ContentTypeBasicInfo';
import ContentTypeOwnership from '@/Components/ContentTypeForm/ContentTypeOwnership';
import ContentTypeSettings from '@/Components/ContentTypeForm/ContentTypeSettings';
import CustomFieldBuilder from '@/Components/ContentTypeForm/CustomFieldBuilder';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Form({ contentType = null, users = [], assignedUsers = [] }) {
    const isEditing = Boolean(contentType?.id);
    const initialUsers = (assignedUsers && assignedUsers.length > 0) ? assignedUsers : (users || []);
    const [selectedUsersList, setSelectedUsersList] = useState(initialUsers);

    const { data, setData, post, put, processing, errors } = useForm({
        user_ids: contentType?.users?.map(u => u.id) || (contentType?.user_id ? [contentType.user_id] : (initialUsers.length > 0 ? [initialUsers[0].id] : [])),
        user_id: contentType?.user_id || (initialUsers.length > 0 ? initialUsers[0].id : ''),
        name: contentType?.name || '',
        singular_name: contentType?.singular_name || '',
        slug: contentType?.slug || '',
        icon: contentType?.icon || 'Briefcase',
        description: contentType?.description || '',
        is_public: contentType ? Boolean(contentType.is_public) : true,
        public_slug: contentType?.public_slug || '',
        has_categories: contentType ? Boolean(contentType.has_categories) : true,
        has_tags: contentType ? Boolean(contentType.has_tags) : true,
        order: contentType?.order ?? 0,
        fields:
            contentType?.custom_fields?.map((f) => ({
                id: f.id,
                user_id: f.user_id || null,
                label: f.label,
                name: f.name,
                type: f.type,
                placeholder: f.placeholder || '',
                is_required: Boolean(f.is_required),
                options: f.options || [],
                sort_order: f.sort_order ?? 0,
            })) || [],
    });

    const toSnakeCase = (str) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const addField = () => {
        setData('fields', [
            ...data.fields,
            {
                user_id: null,
                label: '',
                name: '',
                type: 'text',
                placeholder: '',
                is_required: false,
                options: [],
                sort_order: data.fields.length,
            },
        ]);
    };

    const updateField = (index, key, value) => {
        const updated = [...data.fields];
        updated[index][key] = value;

        if (key === 'label' && (!updated[index].name || updated[index]._autoName)) {
            updated[index].name = toSnakeCase(value);
            updated[index]._autoName = true;
        }

        setData('fields', updated);
    };

    const removeField = (index) => {
        const updated = data.fields.filter((_, i) => i !== index);
        setData('fields', updated);
    };

    const moveField = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= data.fields.length) return;

        const updated = [...data.fields];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);

        const reordered = updated.map((f, i) => ({ ...f, sort_order: i }));
        setData('fields', reordered);
    };

    const addSelectOption = (fieldIndex) => {
        const updated = [...data.fields];
        const options = Array.isArray(updated[fieldIndex].options)
            ? [...updated[fieldIndex].options]
            : [];
        options.push({ label: '', value: '' });
        updated[fieldIndex].options = options;
        setData('fields', updated);
    };

    const updateSelectOption = (fieldIndex, optIndex, key, value) => {
        const updated = [...data.fields];
        const options = [...updated[fieldIndex].options];
        options[optIndex][key] = value;
        if (key === 'label' && !options[optIndex].value) {
            options[optIndex].value = toSnakeCase(value);
        }
        updated[fieldIndex].options = options;
        setData('fields', updated);
    };

    const removeSelectOption = (fieldIndex, optIndex) => {
        const updated = [...data.fields];
        const options = updated[fieldIndex].options.filter((_, i) => i !== optIndex);
        updated[fieldIndex].options = options;
        setData('fields', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.content-types.update', contentType.id));
        } else {
            post(route('admin.content-types.store'));
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Editar ${contentType.name} — Admin`
                        : 'Nuevo Tipo de Contenido — Admin'
                }
            />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Botón Volver */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.content-types.index')}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#95aac9] transition hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver a Tipos de Contenido</span>
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Cabecera del formulario */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="font-heading text-2xl font-bold tracking-tight text-[#293951] dark:text-[#ffffff] sm:text-3xl">
                                    {isEditing
                                        ? `Editar ${contentType.name}`
                                        : 'Crear Nuevo Tipo de Contenido'}
                                </h1>
                                <p className="mt-1.5 text-base text-[#95aac9] dark:text-[#a7a6a8]">
                                    Diseña el esquema técnico, asigna el cliente y define los campos personalizados.
                                </p>
                            </div>

                            <PrimaryButton disabled={processing} className="gap-2 px-5 py-2.5">
                                <Save className="h-4 w-4" />
                                {processing ? 'Guardando...' : 'Guardar Tipo de Contenido'}
                            </PrimaryButton>
                        </div>

                        {/* 1. Información General del CPT */}
                        <ContentTypeBasicInfo
                            data={data}
                            setData={setData}
                            errors={errors}
                            isEditing={isEditing}
                            toSnakeCase={toSnakeCase}
                        />

                        {/* 2. Asignación de Usuario / Cliente Propietario */}
                        <ContentTypeOwnership
                            data={data}
                            setData={setData}
                            assignedUsers={initialUsers}
                            onUsersChange={setSelectedUsersList}
                            errors={errors}
                        />

                        {/* 3. Visibilidad y URLs del Sitio Público */}
                        <ContentTypeSettings
                            data={data}
                            setData={setData}
                            errors={errors}
                            toSnakeCase={toSnakeCase}
                        />

                        {/* 4. Constructor Visual de Campos Personalizados */}
                        <CustomFieldBuilder
                            fields={data.fields}
                            availableUsers={selectedUsersList}
                            addField={addField}
                            updateField={updateField}
                            removeField={removeField}
                            moveField={moveField}
                            addSelectOption={addSelectOption}
                            updateSelectOption={updateSelectOption}
                            removeSelectOption={removeSelectOption}
                            toSnakeCase={toSnakeCase}
                        />

                        {/* Botón Guardar Inferior */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href={route('admin.content-types.index')}
                                className="text-sm font-semibold text-[#95aac9] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]"
                            >
                                Cancelar
                            </Link>
                            <PrimaryButton disabled={processing} className="gap-2 px-6 py-2.5">
                                <Save className="h-4 w-4" />
                                {processing ? 'Guardando...' : 'Guardar Tipo de Contenido'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Form.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
