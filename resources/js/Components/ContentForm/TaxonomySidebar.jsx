import TaxonomyModal from '@/Components/TaxonomyModal';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TaxonomySidebar({
    contentType,
    categoryList = [],
    tagList = [],
    selectedCategories = [],
    selectedTags = [],
    onToggleCategory = () => {},
    onToggleTag = () => {},
    onCategoryCreated = () => {},
    onTagCreated = () => {},
}) {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);

    if (!contentType.has_categories && !contentType.has_tags) {
        return null;
    }

    return (
        <>
            {/* Sidebar Card: Categorías */}
            {contentType.has_categories && (
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                            Categorías
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                        >
                            <Plus className="h-3 w-3" />
                            Nueva
                        </button>
                    </div>

                    {categoryList.length === 0 ? (
                        <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                            No hay categorías registradas.
                        </p>
                    ) : (
                        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                            {categoryList.map((cat) => (
                                <label
                                    key={cat.id}
                                    className="flex items-center gap-2.5 text-xs font-medium text-[#293951] dark:text-[#ffffff] cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={() => onToggleCategory(cat.id)}
                                        className="rounded border-0 bg-[#ebf1f7] text-brand-primary focus:ring-brand-primary dark:bg-[#121517]"
                                    />
                                    <span>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sidebar Card: Etiquetas / Tags */}
            {contentType.has_tags && (
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-base font-bold text-[#293951] dark:text-[#ffffff]">
                            Etiquetas (Tags)
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsTagModalOpen(true)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                        >
                            <Plus className="h-3 w-3" />
                            Nueva
                        </button>
                    </div>

                    {tagList.length === 0 ? (
                        <p className="text-xs text-[#95aac9] dark:text-[#a7a6a8]">
                            No hay etiquetas creadas.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                            {tagList.map((tag) => {
                                const isSelected = selectedTags.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => onToggleTag(tag.id)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                                            isSelected
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-[#f5f7fa] text-[#95aac9] hover:bg-[#ebf1f7] hover:text-[#293951] dark:bg-[#121517] dark:text-[#a7a6a8] dark:hover:text-[#ffffff]'
                                        }`}
                                    >
                                        #{tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modales de Creación Rápida */}
            {contentType.has_categories && (
                <TaxonomyModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    title="Nueva Categoría"
                    placeholder="ej: Consultoría, Diseño..."
                    endpoint={route('admin.categories.store')}
                    onSuccess={(newCat) => {
                        onCategoryCreated(newCat);
                        setIsCategoryModalOpen(false);
                    }}
                />
            )}

            {contentType.has_tags && (
                <TaxonomyModal
                    isOpen={isTagModalOpen}
                    onClose={() => setIsTagModalOpen(false)}
                    title="Nueva Etiqueta (Tag)"
                    placeholder="ej: React, Finanzas..."
                    endpoint={route('admin.tags.store')}
                    onSuccess={(newTag) => {
                        onTagCreated(newTag);
                        setIsTagModalOpen(false);
                    }}
                />
            )}
        </>
    );
}

