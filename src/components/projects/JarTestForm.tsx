"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';

export default function JarTestForm({
    projectId,
    initialData,
    designFlow
}: {
    projectId: string;
    initialData: any;
    designFlow: number;
}) {
    const [formData, setFormData] = useState({
        source_turbidity: initialData?.source_turbidity ?? '',
        source_color: initialData?.source_color ?? '',
        optimal_dose_alum: initialData?.optimal_dose_alum ?? '',
        optimal_ph: initialData?.optimal_ph ?? '',
        retention_time_mixing: initialData?.retention_time_mixing ?? 1,
        retention_time_floc: initialData?.retention_time_floc ?? 20,
    });

    const [results, setResults] = useState({
        alumFlowRate: 0, // g/h
        alumDailyTotal: 0, // kg/day
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // Calculations for chemical consumption
    useEffect(() => {
        if (designFlow && formData.optimal_dose_alum) {
            const Q_Ls = designFlow;
            const dose_mgL = Number(formData.optimal_dose_alum);

            // Flow in m3/day
            const Q_m3d = (Q_Ls * 86400) / 1000;

            // Daily dosage in kg
            const dailyKg = (Q_m3d * dose_mgL) / 1000;

            // Hourly dosage in grams
            const hourlyG = (dailyKg * 1000) / 24;

            setResults({
                alumFlowRate: parseFloat(hourlyG.toFixed(1)),
                alumDailyTotal: parseFloat(dailyKg.toFixed(2))
            });
        }
    }, [formData.optimal_dose_alum, designFlow]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: upsertError } = await supabase
                .from('project_jar_test')
                .upsert({
                    project_id: projectId,
                    ...formData,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage('Resultados de ensayo de jarras guardados.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <ModuleWarning projectId={projectId} moduleKey="jar_test" />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Ensayo de Jarras y Dosificación
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            id="source_turbidity"
                            name="source_turbidity"
                            type="number"
                            label="Turbiedad Inicial (UNT)"
                            value={formData.source_turbidity}
                            onChange={handleInputChange}
                        />
                        <Input
                            id="source_color"
                            name="source_color"
                            type="number"
                            label="Color Inicial (UPC)"
                            value={formData.source_color}
                            onChange={handleInputChange}
                        />
                        <Input
                            id="optimal_dose_alum"
                            name="optimal_dose_alum"
                            type="number"
                            label="Dosis Óptima Alumbre (mg/L)"
                            value={formData.optimal_dose_alum}
                            onChange={handleInputChange}
                        />
                        <Input
                            id="optimal_ph"
                            name="optimal_ph"
                            type="number"
                            step="0.01"
                            label="pH Óptimo"
                            value={formData.optimal_ph}
                            onChange={handleInputChange}
                        />

                        <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--color-gray-medium)', margin: '1rem 0' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)', marginBottom: '0.5rem' }}>Parámetros de Mezcla y Floculación</p>
                        </div>

                        <Input
                            id="retention_time_mixing"
                            name="retention_time_mixing"
                            type="number"
                            label="T. Retención Mezcla (s)"
                            value={formData.retention_time_mixing}
                            onChange={handleInputChange}
                        />
                        <Input
                            id="retention_time_floc"
                            name="retention_time_floc"
                            type="number"
                            label="T. Retención Floculación (min)"
                            value={formData.retention_time_floc}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Resultados'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/filtro-lento`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Continuar a Filtros {"->"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-light)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Demanda de Insumos</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>CONSUMO DIARIO ALUMBRE</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{results.alumDailyTotal} kg/día</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>FLUJO DE DOSIFICACIÓN</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.alumFlowRate} g/h</p>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray-medium)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>
                                ℹ️ Estos valores se utilizarán para el cálculo del costo operativo ($/m³) en la sección final de costos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
