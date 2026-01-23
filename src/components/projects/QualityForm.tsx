"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';
import QualityAnalysisForm from './QualityAnalysisForm';

type QUALITY_DATA = {
    project_id: string;
    has_analysis: string | null;
    perceived_problems: string[] | null;
    pollution_sources: string | null;
    home_treatment: string[] | null;
};

export default function QualityForm({ projectId, initialData }: { projectId: string; initialData: QUALITY_DATA | null }) {
    const [formData, setFormData] = useState({
        has_analysis: initialData?.has_analysis ?? '',
        perceived_problems: initialData?.perceived_problems ?? [] as string[],
        pollution_sources: initialData?.pollution_sources ?? '',
        home_treatment: initialData?.home_treatment ?? [] as string[],
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

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'perceived_problems' | 'home_treatment') => {
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

        const qualityData = {
            project_id: projectId,
            has_analysis: formData.has_analysis,
            perceived_problems: formData.perceived_problems,
            pollution_sources: formData.pollution_sources,
            home_treatment: formData.home_treatment,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_water_quality')
                .upsert(qualityData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Datos de calidad guardados exitosamente.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos de calidad');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        router.push(`/dashboard/projects/${projectId}/caudales`);
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <ModuleWarning projectId={projectId} moduleKey="quality" />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                Calidad del Agua
            </h2>

            {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>

                {/* Análisis formal */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿Se han realizado análisis físico-químicos o microbiológicos?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Sí', 'No'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="has_analysis"
                                    value={opt}
                                    checked={formData.has_analysis === opt}
                                    onChange={handleRadioChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Percepción de problemas */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Problemas percibidos en el agua</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Turbidez', 'Olor', 'Sabor', 'Color', 'Ninguno'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    value={opt}
                                    checked={formData.perceived_problems.includes(opt)}
                                    onChange={(e) => handleCheckboxChange(e, 'perceived_problems')}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Fuentes de contaminación */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿Existen fuentes de contaminación cercanas a la captación?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Sí', 'No'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="pollution_sources"
                                    value={opt}
                                    checked={formData.pollution_sources === opt}
                                    onChange={handleRadioChange}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Tratamiento en el hogar */}
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">¿Las familias realizan algún tratamiento en casa?</label>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Hervido', 'Cloro', 'Filtro', 'Ninguno'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    value={opt}
                                    checked={formData.home_treatment.includes(opt)}
                                    onChange={(e) => handleCheckboxChange(e, 'home_treatment')}
                                    style={{ accentColor: 'var(--color-primary)', width: '1.2em', height: '1.2em' }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                    <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                        {loading ? 'Guardando...' : 'Guardar Diagnóstico Cualitativo'}
                    </Button>
                </div>
            </form>

            {formData.has_analysis === 'Sí' && (
                <div style={{ marginTop: '3rem', borderTop: '2px dashed var(--color-gray-medium)', paddingTop: '3rem' }}>
                    <QualityAnalysisForm projectId={projectId} initialData={initialData} />
                </div>
            )}

            {!saved && formData.has_analysis === 'No' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button type="button" onClick={handleNext} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                        Continuar a Caudales →
                    </Button>
                </div>
            )}
        </div>
    );
}
