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
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm dark:bg-[#1e2126]">
            {tabs
                .filter((tab) => tab.show)
                .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                isActive
                                    ? 'bg-[#ebf1f7] text-brand-primary shadow-xs dark:bg-[#16191c] dark:text-brand-primary'
                                    : 'text-[#95aac9] hover:bg-[#f8fafc] hover:text-[#293951] dark:text-[#a7a6a8] dark:hover:bg-[#16191c]/50 dark:hover:text-white'
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

