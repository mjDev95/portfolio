import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#ebf1f7] px-4 py-8 transition-colors dark:bg-[#121517]">
            <div className="mb-6">
                <Link href="/" className="transition hover:opacity-80">
                    <ApplicationLogo className="h-14 w-auto fill-current text-brand-primary" />
                </Link>
            </div>

            <div className="w-full overflow-hidden rounded-2xl bg-white p-7 shadow-xl shadow-black/5 dark:bg-[#1e2126] dark:shadow-none sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
