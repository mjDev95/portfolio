import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fb] px-4 py-8 transition-colors dark:bg-[#0e1217]">
            <div className="mb-6">
                <Link href="/" className="transition hover:opacity-80">
                    <ApplicationLogo className="h-14 w-auto fill-current text-brand-primary" />
                </Link>
            </div>

            <div className="w-full overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-7 shadow-xl shadow-black/5 dark:border-slate-800/80 dark:bg-[#161b24] dark:shadow-none sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
