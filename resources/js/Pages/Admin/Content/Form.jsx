import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MediaLibraryModal from '@/Components/MediaLibraryModal';
import SeoPreviewBox from '@/Components/SeoPreviewBox';
import GalleryManager from '@/Components/GalleryManager';
import ContentMainFields from '@/Components/ContentForm/ContentMainFields';
import CustomFieldsSection from '@/Components/ContentForm/CustomFieldsSection';
import ContentImageField from '@/Components/ContentForm/ContentImageField';
import PublishingSidebar from '@/Components/ContentForm/PublishingSidebar';
import TaxonomySidebar from '@/Components/ContentForm/TaxonomySidebar';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';

export default function Form({
    contentType,
    content = null,
    categories = [],
    tags = [],
}) {
    const isEditing = Boolean(content?.id);

    // Listas de taxonomías y selección inicial
    const [categoryList, setCategoryList] = useState(categories);
    const [tagList, setTagList] = useState(tags);

    const selectedCategoryIds = (content?.categories ?? []).map((c) => c.id);
    const selectedTagIds = (content?.tags ?? []).map((t) => t.id);

    // Imágenes actuales guardadas en BD
    const currentThumbnail =
        content?.media?.find((m) => m.collection === 'thumbnail') ??
        content?.thumbnail ??
        null;
    const currentHero =
        content?.media?.find((m) => m.collection === 'hero') ??
        content?.hero_image ??
        null;
    const galleryImages = (content?.media ?? []).filter(
        (m) => m.collection === 'gallery'
    );

    // Formulario reactivo de Inertia
    const { data, setData, post, processing, errors, transform } = useForm({
        title: content?.title ?? '',
        slug: content?.slug ?? '',
        excerpt: content?.excerpt ?? '',
        body: content?.body ?? '',
        status: content?.status ?? 'published',
        published_at: content?.published_at
            ? new Date(content.published_at).toISOString().slice(0, 16)
            : '',
        featured: Boolean(content?.featured ?? false),
        sort_order: content?.sort_order ?? 0,
        meta_title: content?.meta_title ?? '',
        meta_description: content?.meta_description ?? '',
        meta_keywords: content?.meta_keywords ?? '',
        custom_values: content?.custom_values ?? {},
        categories: selectedCategoryIds,
        tags: selectedTagIds,
        thumbnail: null,
        hero_image: null,
        remove_thumbnail: false,
        remove_hero_image: false,
        thumbnail_media_id: null,
        hero_media_id: null,
    });

    // Estados para previsualización de imágenes seleccionadas en biblioteca
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [thumbnailFileInfo, setThumbnailFileInfo] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);
    const [heroFileInfo, setHeroFileInfo] = useState(null);

    // Modal Picker de Medios
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState(null); // 'thumbnail' | 'hero' | 'gallery'
    const [mediaPickerTitle, setMediaPickerTitle] = useState('Biblioteca de Medios');

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const openMediaPicker = (target, title) => {
        setMediaPickerTarget(target);
        setMediaPickerTitle(title);
        setIsMediaPickerOpen(true);
    };

    // Callback al seleccionar imagen desde el Modal Picker
    const handleMediaSelect = async (media) => {
        if (mediaPickerTarget === 'thumbnail') {
            setData((prev) => ({
                ...prev,
                thumbnail_media_id: media.id,
                thumbnail: null,
                remove_thumbnail: false,
            }));
            setThumbnailPreview(media.url);
            setThumbnailFileInfo({
                name: media.file_name,
                size: formatFileSize(media.file_size),
                fromLibrary: true,
            });
        } else if (mediaPickerTarget === 'hero') {
            setData((prev) => ({
                ...prev,
                hero_media_id: media.id,
                hero_image: null,
                remove_hero_image: false,
            }));
            setHeroPreview(media.url);
            setHeroFileInfo({
                name: media.file_name,
                size: formatFileSize(media.file_size),
                fromLibrary: true,
            });
        } else if (mediaPickerTarget === 'gallery' && isEditing) {
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            try {
                const res = await fetch(route('admin.media.attach'), {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        media_id: media.id,
                        content_id: content.id,
                        collection: 'gallery',
                    }),
                });
                if (res.ok) {
                    const attached = await res.json();
                    window.dispatchEvent(
                        new CustomEvent('gallery-image-added', { detail: attached })
                    );
                    window.dispatchEvent(
                        new CustomEvent('admin-feedback', {
                            detail: {
                                type: 'success',
                                title: 'Imagen añadida',
                                message: 'Se añadió la imagen a la galería.',
                            },
                        })
                    );
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const toggleArrayItem = (key, id) => {
        setData(
            key,
            data[key].includes(id)
                ? data[key].filter((x) => x !== id)
                : [...data[key], id]
        );
    };

    const handleCustomFieldChange = (fieldName, value) => {
        setData('custom_values', {
            ...data.custom_values,
            [fieldName]: value,
        });
    };

    const handleCategoryCreated = (newCat) => {
        setCategoryList((prev) => [...prev, newCat]);
        setData('categories', [...data.categories, newCat.id]);
    };

    const handleTagCreated = (newTag) => {
        setTagList((prev) => [...prev, newTag]);
        setData('tags', [...data.tags, newTag.id]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            ...(isEditing ? { _method: 'put' } : {}),
        }));

        const url = isEditing
            ? route('admin.content.update', [contentType.slug, content.id])
            : route('admin.content.store', contentType.slug);

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setThumbnailPreview(null);
                setHeroPreview(null);
                setThumbnailFileInfo(null);
                setHeroFileInfo(null);
            },
        });
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Editar ${contentType.singular_name}: ${content.title}`
                        : `Nuevo ${contentType.singular_name}`
                }
            />

            <div className="w-full space-y-8">
                {/* Botón Volver */}
                    <div>
                        <Link
                            href={route('admin.content.index', contentType.slug)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-primary dark:text-slate-400"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a {contentType.name}
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Layout de 2 Columnas estilo WordPress */}
                        <div className="grid grid-cols-12 gap-6 lg:gap-8">
                            {/* COLUMNA PRINCIPAL (Izquierda - 8 columnas) */}
                            <div className="col-span-12 space-y-6 lg:col-span-8">
                                {/* Bloque 1: Título, Permalink, Extracto y Markdown Body */}
                                <ContentMainFields
                                    contentType={contentType}
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                />

                                {/* Bloque 2: Campos Personalizados Dinámicos (EAV) */}
                                <CustomFieldsSection
                                    contentType={contentType}
                                    data={data}
                                    onChange={handleCustomFieldChange}
                                    errors={errors}
                                />

                                {/* Bloque 3: Optimización SEO & SERP Preview */}
                                <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                                    <div className="flex items-center gap-2.5 mb-6">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-brand-primary dark:bg-[#12161f]">
                                            <Globe className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                                Optimización para Motores de Búsqueda (SEO)
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Controla los metadatos y cómo se indexa este contenido en Google.
                                            </p>
                                        </div>
                                    </div>

                                    <SeoPreviewBox
                                        metaTitle={data.meta_title}
                                        metaDescription={data.meta_description}
                                        metaKeywords={data.meta_keywords}
                                        slug={data.slug || data.title}
                                        defaultTitle={data.title}
                                        defaultDescription={data.excerpt}
                                        onChange={(key, val) => setData(key, val)}
                                        errors={errors}
                                    />
                                </div>

                                {/* Bloque 4: Galería de Medios (disponible al editar) */}
                                {isEditing && (
                                    <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] sm:p-8">
                                        <GalleryManager
                                            content={content}
                                            galleryImages={galleryImages}
                                            onOpenLibrary={() =>
                                                openMediaPicker('gallery', 'Añadir Imagen a la Galería')
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* BARRA LATERAL (Derecha - 4 columnas) */}
                            <div className="col-span-12 space-y-6 lg:col-span-4">
                                {/* Sidebar 1: Estado y Publicación */}
                                <PublishingSidebar
                                    data={data}
                                    setData={setData}
                                    processing={processing}
                                />

                                {/* Sidebar 2: Taxonomías (Categorías y Tags) */}
                                <TaxonomySidebar
                                    contentType={contentType}
                                    categoryList={categoryList}
                                    tagList={tagList}
                                    selectedCategories={data.categories}
                                    selectedTags={data.tags}
                                    onToggleCategory={(id) => toggleArrayItem('categories', id)}
                                    onToggleTag={(id) => toggleArrayItem('tags', id)}
                                    onCategoryCreated={handleCategoryCreated}
                                    onTagCreated={handleTagCreated}
                                />

                                {/* Sidebar 3: Imagen Destacada (Thumbnail) */}
                                <ContentImageField
                                    label="Imagen Destacada"
                                    currentImage={currentThumbnail}
                                    previewUrl={thumbnailPreview}
                                    fileInfo={thumbnailFileInfo}
                                    isMarkedForRemoval={data.remove_thumbnail}
                                    heightClass="h-40"
                                    emptyText="Sin miniatura asignada"
                                    onOpenLibrary={() =>
                                        openMediaPicker(
                                            'thumbnail',
                                            currentThumbnail || thumbnailPreview
                                                ? 'Cambiar Miniatura desde Biblioteca'
                                                : 'Seleccionar Miniatura de Biblioteca'
                                        )
                                    }
                                    onMarkRemove={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            thumbnail_media_id: null,
                                            remove_thumbnail: Boolean(currentThumbnail),
                                        }));
                                        setThumbnailPreview(null);
                                        setThumbnailFileInfo(null);
                                    }}
                                    onUndoRemove={() =>
                                        setData((prev) => ({ ...prev, remove_thumbnail: false }))
                                    }
                                />

                                {/* Sidebar 4: Banner Cabecera (Hero) */}
                                <ContentImageField
                                    label="Banner Cabecera (Hero)"
                                    currentImage={currentHero}
                                    previewUrl={heroPreview}
                                    fileInfo={heroFileInfo}
                                    isMarkedForRemoval={data.remove_hero_image}
                                    heightClass="h-36"
                                    emptyText="Sin banner seleccionado"
                                    onOpenLibrary={() =>
                                        openMediaPicker(
                                            'hero',
                                            currentHero || heroPreview
                                                ? 'Cambiar Banner (Hero) desde Biblioteca'
                                                : 'Seleccionar Banner (Hero) de Biblioteca'
                                        )
                                    }
                                    onMarkRemove={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            hero_media_id: null,
                                            remove_hero_image: Boolean(currentHero),
                                        }));
                                        setHeroPreview(null);
                                        setHeroFileInfo(null);
                                    }}
                                    onUndoRemove={() =>
                                        setData((prev) => ({ ...prev, remove_hero_image: false }))
                                    }
                                />
                            </div>
                        </div>
                    </form>

                    {/* Modal Selector de Biblioteca de Medios (Picker) */}
                    <MediaLibraryModal
                        show={isMediaPickerOpen}
                        onClose={() => {
                            setIsMediaPickerOpen(false);
                            setMediaPickerTarget(null);
                        }}
                        title={mediaPickerTitle}
                        onSelect={handleMediaSelect}
                        contentId={content?.id}
                        collection={
                            mediaPickerTarget === 'hero'
                                ? 'hero'
                                : mediaPickerTarget === 'gallery'
                                ? 'gallery'
                                : 'thumbnail'
                        }
                    />
            </div>
        </>
    );
}

Form.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
