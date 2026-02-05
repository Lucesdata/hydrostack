"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type SOURCE_DATA = {
    project_id: string;
    source_type: string | null;
    is_permanent: string | null;
    water_quality_rainy: string[] | null;
    is_protected: string | null;
    distance_to_community: number | null;
};

export default function SourceForm({ projectId, initialData }: { projectId: string; initialData: SOURCE_DATA | null }) {
    const [formData, setFormData] = useState({
        source_type: initialData?.source_type ?? '',
        is_permanent: initialData?.is_permanent ?? '',
        water_quality_rainy: initialData?.water_quality_rainy ?? [] as string[],
        is_protected: initialData?.is_protected ?? '',
        distance_to_community: initialData?.distance_to_community ?? '',
        water_table_level: (initialData as any)?.water_table_level ?? '',
        well_depth: (initialData as any)?.well_depth ?? '',
        seasonal_risk_factor: (initialData as any)?.seasonal_risk_factor ?? 'Bajo'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        let newQuality = [...formData.water_quality_rainy];
        if (checked) {
            newQuality.push(value);
        } else {
            newQuality = newQuality.filter(item => item !== value);
        }
        setFormData({ ...formData, water_quality_rainy: newQuality });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const distance = Number(formData.distance_to_community);

        const sourceData = {
            project_id: projectId,
            source_type: formData.source_type,
            is_permanent: formData.is_permanent,
            water_quality_rainy: formData.water_quality_rainy,
            is_protected: formData.is_protected,
            distance_to_community: distance || null,
            water_table_level: parseFloat(formData.water_table_level.toString()) || null,
            well_depth: parseFloat(formData.well_depth.toString()) || null,
            seasonal_risk_factor: formData.seasonal_risk_factor,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_sources')
                .upsert(sourceData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Datos de fuente guardados exitosamente.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos de la fuente');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        router.push(`/dashboard/projects/${projectId}/quality`);
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <ModuleWarning projectId={projectId} moduleKey="source" />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                Fuente de Agua
            </h2>

            {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>

                {/* Tipo de fuente */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Tipo de fuente de agua</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Quebrada', 'Río', 'Nacimiento', 'Pozo', 'Otra'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="source_type"
                                    value={opt}
                                    checked={formData.source_type === opt}
                                    onChange={handleTextChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Permanente */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿La fuente es permanente todo el año?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Sí', 'No', 'No se sabe'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="is_permanent"
                                    value={opt}
                                    checked={formData.is_permanent === opt}
                                    onChange={handleTextChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Calidad en lluvias */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">En época de lluvias, el agua:</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Se mantiene clara', 'Se vuelve turbia', 'Aumenta mucho el caudal'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    value={opt}
                                    checked={formData.water_quality_rainy.includes(opt)}
                                    onChange={handleCheckboxChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Protegida */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿La fuente está protegida?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Sí', 'No', 'Parcialmente'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="is_protected"
                                    value={opt}
                                    checked={formData.is_protected === opt}
                                    onChange={handleTextChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Distancia */}
                <div style={{ marginBottom: '2rem' }}>
                    <Input
                        id="distance_to_community"
                        name="distance_to_community"
                        type="number"
                        label="Distancia aproximada entre la fuente y la comunidad (metros)"
                        value={formData.distance_to_community}
                        onChange={handleTextChange}
                        placeholder="Ej: 500"
                    />
                </div>

                {/* Valle del Cauca Specific: Groundwater */}
                {formData.source_type === 'Pozo' && (
                    <div style={{ padding: '1.5rem', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid #BAE6FD' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0369A1' }}>Detalles de Captación Subterránea</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                id="well_depth"
                                name="well_depth"
                                type="number"
                                label="Profundidad del Pozo (m)"
                                value={formData.well_depth}
                                onChange={handleTextChange}
                                placeholder="Ej: 60"
                            />
                            <Input
                                id="water_table_level"
                                name="water_table_level"
                                type="number"
                                label="Nivel Dinámico / Freático (m)"
                                value={formData.water_table_level}
                                onChange={handleTextChange}
                                placeholder="Ej: 15"
                            />
                        </div>
                    </div>
                )}

                {/* Risk Factor */}
                <div className="input-group" style={{ marginBottom: '2rem' }}>
                    <label className="label">Factor de Riesgo Estacional (Valle del Cauca)</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Bajo', 'Medio', 'Alto'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="seasonal_risk_factor"
                                    value={opt}
                                    checked={formData.seasonal_risk_factor === opt}
                                    onChange={handleTextChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-dark)', marginTop: '0.5rem' }}>
                        * Considere variaciones de caudal en ríos (época seca) o turbinidad extrema (época de lluvias).
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                        {loading ? 'Guardando...' : 'Guardar Información'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.push(`/dashboard/projects/${projectId}/quality`)}
                        disabled={!saved}
                    >
                        Siguiente: Calidad del Agua →
                    </Button>
                </div>
            </form>

            <ModuleNavigation projectId={projectId} currentModuleKey="source" />
        </div>
    );
}
