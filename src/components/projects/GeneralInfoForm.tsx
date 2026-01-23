"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';
import { PROJECT_TYPES, PROJECT_STATUSES } from '@/constants/project';

type Project = {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    project_type: string | null;
    status: string;
    latitude: number | null;
    longitude: number | null;
};

export default function GeneralInfoForm({ project }: { project: Project }) {
    const [formData, setFormData] = useState({
        name: project.name || '',
        description: project.description || '',
        location: project.location || '',
        project_type: project.project_type || PROJECT_TYPES[0],
        status: project.status || PROJECT_STATUSES[0],
        latitude: project.latitude || '',
        longitude: project.longitude || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    name: formData.name,
                    description: formData.description,
                    location: formData.location,
                    project_type: formData.project_type,
                    status: formData.status,
                    latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
                    longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id);

            if (updateError) throw updateError;

            setMessage('Proyecto actualizado exitosamente');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el proyecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <ModuleWarning projectId={project.id} moduleKey="general" />
            {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <Input
                            id="name"
                            name="name"
                            label="Nombre del Proyecto"
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <div className="input-group">
                            <label htmlFor="description" className="label">Descripción</label>
                            <textarea
                                id="description"
                                name="description"
                                className="input"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                style={{ fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    <div>
                        <Input
                            id="location"
                            name="location"
                            label="Ubicación"
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
                                {PROJECT_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="status" className="label">Estado</label>
                            <select
                                id="status"
                                name="status"
                                className="input"
                                value={formData.status}
                                onChange={handleChange}
                                style={{ backgroundColor: 'white' }}
                            >
                                {PROJECT_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                id="latitude"
                                name="latitude"
                                label="Latitud"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={handleChange}
                            />
                            <Input
                                id="longitude"
                                name="longitude"
                                label="Longitud"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
