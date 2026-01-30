"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { USER_CATEGORIES } from '@/constants/project';
import AuthLayout from '@/components/auth/AuthLayout';
import { Loader2, ChevronDown } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        user_type: USER_CATEGORIES[0]
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            setError('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        user_type: formData.user_type,
                    },
                },
            });

            if (signUpError) throw signUpError;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Crear Cuenta" subtitle="Únete a la comunidad de Hydrostack">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                        Nombre completo
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5 relative">
                    <label htmlFor="user_type" className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                        Tipo de usuario
                    </label>
                    <div className="relative">
                        <select
                            id="user_type"
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleChange}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                        >
                            {USER_CATEGORIES.map((type) => (
                                <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrarse'}
                </button>

                <div className="text-center pt-2">
                    <p className="text-slate-400 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
