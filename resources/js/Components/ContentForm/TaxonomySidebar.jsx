import TaxonomyModal from '@/Components/TaxonomyModal';
import BubblePopTag from '@/Components/BubblePopTag';
import { AnimatePresence } from 'framer-motion';
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
                <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
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
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            No hay categorías registradas.
                        </p>
                    ) : (
                        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                            {categoryList.map((cat) => (
                                <label
                                    key={cat.id}
                                    className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={() => onToggleCategory(cat.id)}
                                        className="rounded-lg border-slate-300 text-brand-primary shadow-xs focus:ring-brand-primary/20 dark:border-slate-700 dark:bg-[#12161f]"
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
                <div className="rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
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
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            No hay etiquetas creadas.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                            <AnimatePresence mode="popLayout">
                                {tagList.map((tag) => (
                                    <BubblePopTag
                                        key={tag.id}
                                        label={tag.name}
                                        selected={selectedTags.includes(tag.id)}
                                        onToggle={() => onToggleTag(tag.id)}
                                        prefix="#"
                                    />
                                ))}
                            </AnimatePresence>
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

