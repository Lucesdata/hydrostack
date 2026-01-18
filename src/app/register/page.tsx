"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Comunidad'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const userTypes = [
        'Comunidad',
        'Acueducto rural',
        'Profesional técnico',
        'Empresa / proveedor',
        'Entidad / ONG'
    ];

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
                        role: formData.role,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Note: In Supabase, if email confirmation is enabled, user won't be signed in immediately usually.
            // But for this MVP assume auto-confirm or handling "Check email" state if necessary.
            // If auto-confirm is off, we should show a message. 
            // For simplicity in MVP, we often disable confirm email or just redirect.

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '480px', padding: '4rem 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Crear Cuenta</h1>
                {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        label="Nombre completo"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        label="Correo electrónico"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label="Contraseña"
                        placeholder="******"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <div className="input-group">
                        <label htmlFor="role" className="label">Tipo de usuario</label>
                        <select
                            id="role"
                            name="role"
                            className="input"
                            value={formData.role}
                            onChange={handleChange}
                            style={{ backgroundColor: 'white' }}
                        >
                            {userTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <Button type="submit" fullWidth>Registrarse</Button>
                    </div>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
                    ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}
