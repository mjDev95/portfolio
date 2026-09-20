import { Link } from '@inertiajs/react';
import { User as UserIcon, Shield, Mail, UserCog, ArrowRight } from 'lucide-react';

export default function UserProfileCard({ user }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1e2126] dark:shadow-none sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                {/* Avatar y Datos del Usuario */}
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-xl font-bold text-white shadow-md shadow-brand-primary/20">
                            {user?.name
                                ? user.name
                                      .split(' ')
                                      .filter(Boolean)
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join('')
                                      .toUpperCase()
                                : <UserIcon className="h-7 w-7" />}
                        </div>
                        {/* Indicador de sesión activa */}
                        <span
                            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm dark:ring-[#1e2126]"
                            title="Sesión activa"
                        />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-bold text-[#293951] dark:text-[#ffffff]">
                                {user?.name}
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary">
                                <Shield className="h-3 w-3" />
                                Administrador
                            </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-[#95aac9] dark:text-[#a7a6a8]">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{user?.email}</span>
                        </div>
                    </div>
                </div>

                {/* Botón de acción */}
                <div className="flex items-center">
                    <Link
                        href={route('admin.profile.edit')}
                        className="group inline-flex items-center gap-2.5 rounded-xl bg-[#ebf1f7] px-4 py-2.5 text-sm font-semibold text-[#293951] transition-all hover:bg-[#dfe7ef] hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-[#16191c] dark:text-[#ffffff] dark:hover:bg-[#20252b] dark:hover:text-brand-primary"
                    >
                        <UserCog className="h-4 w-4 text-brand-primary transition-transform group-hover:rotate-12" />
                        <span>Editar Perfil & Seguridad</span>
                        <ArrowRight className="h-4 w-4 text-[#95aac9] transition-transform group-hover:translate-x-0.5 dark:text-[#a7a6a8]" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

