import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { FileText, Folder, Tag as TagIcon } from 'lucide-react';

export default function ContentSubnav({
    contentType,
    activeTab = 'contents',
    onTabChange = null,
}) {
    if (!contentType.has_categories && !contentType.has_tags) {
        return null;
    }

    const tabs = [
        {
            key: 'contents',
            label: contentType.name || 'Publicaciones',
            icon: FileText,
            href: route('admin.content.index', contentType.slug),
            show: true,
        },
        {
            key: 'categories',
            label: 'Categorías',
            icon: Folder,
            href: route('admin.content.categories.index', contentType.slug),
            show: Boolean(contentType.has_categories),
        },
        {
            key: 'tags',
            label: 'Etiquetas',
            icon: TagIcon,
            href: route('admin.content.tags.index', contentType.slug),
            show: Boolean(contentType.has_tags),
        },
    ];

    return (
        <div className="relative inline-flex items-center gap-1.5 overflow-x-auto rounded-[28px] border border-slate-100/90 bg-white p-1.5 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
            {tabs
                .filter((tab) => tab.show)
                .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={(e) => {
                                if (onTabChange) {
                                    onTabChange(tab.key);
                                } else {
                                    router.get(tab.href, {}, { preserveState: true, preserveScroll: true });
                                }
                            }}
                            className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200 outline-none select-none ${
                                isActive
                                    ? 'text-white font-bold'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="contentSubnavActivePill"
                                    className="absolute inset-0 z-0 rounded-full bg-brand-primary shadow-xs"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 26,
                                        mass: 0.8,
                                    }}
                                />
                            )}
                            <Icon className="relative z-10 h-4 w-4" />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
        </div>
    );
}

