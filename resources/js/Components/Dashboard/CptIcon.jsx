import {
    FileText,
    Boxes,
    Briefcase,
    Folder,
    BookOpen,
    Sparkles,
    Tag,
    Globe,
    Award,
    Code,
    Camera,
    Layers,
} from 'lucide-react';

const CPT_ICONS = {
    FileText,
    Boxes,
    Briefcase,
    Folder,
    BookOpen,
    Sparkles,
    Tag,
    Globe,
    Award,
    Code,
    Camera,
    Layers,
};

export default function CptIcon({ name, className = 'h-3.5 w-3.5' }) {
    const IconComponent = CPT_ICONS[name] || FileText;
    return <IconComponent className={className} />;
}

