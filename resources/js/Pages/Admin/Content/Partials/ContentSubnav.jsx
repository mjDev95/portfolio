import { Link } from '@inertiajs/react';
import { FileText, Folder, Tag as TagIcon } from 'lucide-react';

export default function ContentSubnav({ contentType, activeTab = 'contents' }) {
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
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-[28px] border border-slate-100/90 bg-white p-1.5 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24]">
            {tabs
                .filter((tab) => tab.show)
                .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                                isActive
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#12161f] dark:hover:text-white'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
        </div>
    );
}

