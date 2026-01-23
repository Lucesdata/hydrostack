"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';

export default function ViabilityForm({
    projectId,
    initialData
}: {
    projectId: string;
    initialData: any;
}) {
    const [formData, setFormData] = useState({
        gravity_arrival: initialData?.gravity_arrival ?? true,
        lot_stability: initialData?.lot_stability ?? true,
        waste_evacuation: initialData?.waste_evacuation ?? true,
        access_roads: initialData?.access_roads ?? true,
        desarenador_cleaning_days: initialData?.desarenador_cleaning_days ?? 60,
        sedimentador_cleaning_days: initialData?.sedimentador_cleaning_days ?? 45,
        filter_cleaning_days: initialData?.filter_cleaning_days ?? 15,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleToggle = (name: string) => {
        setFormData({ ...formData, [name]: !formData[name as keyof typeof formData] });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) || 0 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: upsertError } = await supabase
                .from('project_viability')
                .upsert({
                    project_id: projectId,
                    ...formData,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage('Información de viabilidad y mantenimiento guardada.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <ModuleWarning projectId={projectId} moduleKey="viability" />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                Viabilidad de Sitio y Plan de Mantenimiento
            </h2>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-gray-dark)' }}>Lista de Chequeo de Sitio</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.gravity_arrival} onChange={() => handleToggle('gravity_arrival')} style={{ width: '1.2rem', height: '1.2rem' }} />
                                <span>Llegada del agua por gravedad</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.lot_stability} onChange={() => handleToggle('lot_stability')} style={{ width: '1.2rem', height: '1.2rem' }} />
                                <span>Estabilidad geológica del lote</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.waste_evacuation} onChange={() => handleToggle('waste_evacuation')} style={{ width: '1.2rem', height: '1.2rem' }} />
                                <span>Capacidad de evacuación de lodos/lavado</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.access_roads} onChange={() => handleToggle('access_roads')} style={{ width: '1.2rem', height: '1.2rem' }} />
                                <span>Vías de acceso para químicos/camión</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-gray-dark)' }}>Calendario Sugerido (Días)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="label">Limpieza Desarenador</label>
                                <input type="number" name="desarenador_cleaning_days" value={formData.desarenador_cleaning_days} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="input-group">
                                <label className="label">Limpieza Sedimentador</label>
                                <input type="number" name="sedimentador_cleaning_days" value={formData.sedimentador_cleaning_days} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="input-group">
                                <label className="label">Lavado de Filtros</label>
                                <input type="number" name="filter_cleaning_days" value={formData.filter_cleaning_days} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
                    <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                        {loading ? 'Guardando...' : 'Guardar Información'}
                    </Button>
                    {saved && (
                        <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/tech-selection`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                            Continuar a Selección de Tecnología →
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
