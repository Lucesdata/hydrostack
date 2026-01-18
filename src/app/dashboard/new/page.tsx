"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NewProjectPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        project_type: 'Agua potable rural'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();
    const { user } = useAuth();

    const projectTypes = [
        'Agua potable rural',
        'Agua potable urbano',
        'Potabilización privada',
        'Desalinización',
        'Tratamiento aguas residuales',
        'Tratamiento industrial'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            setError('El nombre del proyecto es obligatorio');
            return;
        }
        if (!user) {
            setError('Debe iniciar sesión para crear un proyecto');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: insertError } = await supabase
                .from('projects')
                .insert([
                    {
                        user_id: user.id,
                        name: formData.name,
                        description: formData.description,
                        location: formData.location,
                        project_type: formData.project_type,
                        status: 'Borrador'
                    }
                ]);

            if (insertError) throw insertError;

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '4rem 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h1 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Nuevo Proyecto</h1>
                {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <Input
                        id="name"
                        name="name"
                        label="Nombre del Proyecto"
                        placeholder="Ej: Acueducto Veredal La Esperanza"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <div className="input-group">
                        <label htmlFor="description" className="label">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            className="input"
                            placeholder="Breve descripción del alcance..."
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            style={{ fontFamily: 'inherit' }}
                        />
                    </div>

                    <Input
                        id="location"
                        name="location"
                        label="Ubicación"
                        placeholder="Ciudad, Departamento"
                        value={formData.location}
                        onChange={handleChange}
                    />

                    <div className="input-group">
                        <label htmlFor="project_type" className="label">Tipo de Proyecto</label>
                        <select
                            id="project_type"
                            name="project_type"
                            className="input"
                            value={formData.project_type}
                            onChange={handleChange}
                            style={{ backgroundColor: 'white' }}
                        >
                            {projectTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Proyecto'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
