import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            headline: user.headline || '',
            avatar: user.avatar || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('admin.profile.update'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    Información del Perfil
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Actualiza tu nombre, titular profesional, avatar y dirección de correo de tu cuenta.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="headline" value="Titular Profesional / Rol Público" />

                    <TextInput
                        id="headline"
                        className="mt-1 block w-full"
                        value={data.headline}
                        onChange={(e) => setData('headline', e.target.value)}
                        placeholder="ej: WordPress Architect • Creative Developer"
                    />

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Se muestra como subtítulo del autor en el pie de los artículos del blog.
                    </p>

                    <InputError className="mt-2" message={errors.headline} />
                </div>

                <div>
                    <InputLabel htmlFor="avatar" value="URL o Ruta del Avatar" />

                    <div className="mt-1 flex items-center gap-3">
                        {data.avatar && (
                            <img
                                src={data.avatar.startsWith('http') ? data.avatar : `/${data.avatar.replace(/^\//, '')}`}
                                alt="Vista previa avatar"
                                className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                        <TextInput
                            id="avatar"
                            className="block w-full"
                            value={data.avatar}
                            onChange={(e) => setData('avatar', e.target.value)}
                            placeholder="ej: images/avatar.png o https://..."
                        />
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Imagen circular del autor visible en la cabecera y en cada ensayo del blog.
                    </p>

                    <InputError className="mt-2" message={errors.avatar} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-slate-900 dark:text-white">
                            Tu dirección de correo no está verificada.
                            <Link
                                href={route('admin.verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm text-brand-primary underline hover:text-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary dark:text-brand-primary dark:hover:text-brand-primary-hover"
                            >
                                Haz clic aquí para reenviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Se ha enviado un nuevo enlace de verificación a tu correo.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                </div>
            </form>
        </section>
    );
}
