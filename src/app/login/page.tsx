"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            router.push('/dashboard/new');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
                setError('No se pudo conectar con el servidor (Supabase). Verifique su conexión a internet.');
            } else {
                setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Bienvenido de nuevo" subtitle="Ingresa a tu cuenta para continuar">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
                </button>

                <div className="text-center pt-2">
                    <p className="text-slate-400 text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
