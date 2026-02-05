"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type CONSUMPTION_DATA = {
    project_id: string;
    main_uses: string[] | null;
    daily_availability: string | null;
    peak_hours: string[] | null;
    has_storage: string | null;
};

export default function ConsumptionForm({ projectId, initialData }: { projectId: string; initialData: CONSUMPTION_DATA | null }) {
    const [formData, setFormData] = useState({
        main_uses: initialData?.main_uses ?? [] as string[],
        daily_availability: initialData?.daily_availability ?? '',
        peak_hours: initialData?.peak_hours ?? [] as string[],
        has_storage: initialData?.has_storage ?? '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'main_uses' | 'peak_hours') => {
        const { value, checked } = e.target;
        let newArray = [...formData[field]];
        if (checked) {
            newArray.push(value);
        } else {
            newArray = newArray.filter(item => item !== value);
        }
        setFormData({ ...formData, [field]: newArray });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const consumptionData = {
            project_id: projectId,
            main_uses: formData.main_uses,
            daily_availability: formData.daily_availability,
            peak_hours: formData.peak_hours,
            has_storage: formData.has_storage,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_consumption')
                .upsert(consumptionData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Datos de consumo guardados exitosamente.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos de consumo');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        router.push(`/dashboard/projects/${projectId}/quality`);
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <ModuleWarning projectId={projectId} moduleKey="consumption" />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                Consumo de Agua
            </h2>

            {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>

                {/* Uso Principal */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Uso principal del agua</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Uso doméstico', 'Riego', 'Animales'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    value={opt}
                                    checked={formData.main_uses.includes(opt)}
                                    onChange={(e) => handleCheckboxChange(e, 'main_uses')}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Disponibilidad Diaria */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿Tienen agua todos los días actualmente?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Sí', 'No'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="daily_availability"
                                    value={opt}
                                    checked={formData.daily_availability === opt}
                                    onChange={handleRadioChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Horarios Mayor Consumo */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Horarios de mayor consumo</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Mañana', 'Tarde', 'Noche'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    value={opt}
                                    checked={formData.peak_hours.includes(opt)}
                                    onChange={(e) => handleCheckboxChange(e, 'peak_hours')}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Tanque Almacenamiento */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿Las viviendas tienen tanque de almacenamiento?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Sí', 'No'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="has_storage"
                                    value={opt}
                                    checked={formData.has_storage === opt}
                                    onChange={handleRadioChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                        {loading ? 'Guardando...' : 'Guardar Información'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.push(`/dashboard/projects/${projectId}/source`)}
                        disabled={!saved}
                    >
                        Siguiente: Fuente de Agua →
                    </Button>
                </div>
            </form>

            <ModuleNavigation projectId={projectId} currentModuleKey="consumption" />
        </div>
    );
}
