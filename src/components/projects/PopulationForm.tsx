"use client";

/**
 * MÓDULO: Población y Censo
 * BLOQUE: B — Caracterización de Demanda
 * 
 * Función técnica:
 * - Proyección demográfica mediante método geométrico o exponencial (según RAS).
 * - Cálculo de población inicial basado en censo de viviendas.
 * - Determinación de la población de diseño para el horizonte del proyecto.
 * 
 * Tabla de base de datos: project_calculations
 * 
 * Aplicabilidad:
 * - ✅ Agua potable: Siempre (base para dimensionar caudales).
 * - ✅ Aguas residuales: Siempre (base para caudales de vertimiento).
 */

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type CENSUS_DATA = {
    project_id: string;
    community_name: string | null;
    municipality: string | null;
    dwellings_number: number | null;
    people_per_dwelling: number | null;
    // Calculated
    initial_population: number | null;
    growth_rate: number | null;
    projection_years: number | null;
};

export default function PopulationForm({ projectId, initialData }: { projectId: string; initialData: CENSUS_DATA | null }) {
    const [formData, setFormData] = useState({
        community_name: initialData?.community_name ?? '',
        municipality: initialData?.municipality ?? '',
        dwellings_number: initialData?.dwellings_number ?? '',
        people_per_dwelling: initialData?.people_per_dwelling ?? '',
        growth_rate: initialData?.growth_rate ?? 1.5,
        projection_years: initialData?.projection_years ?? 25,
        projection_method: 'Geometrico'
    });

    // Calculate estimated population on the fly for display
    const estimatedPop = (Number(formData.dwellings_number) || 0) * (Number(formData.people_per_dwelling) || 0);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const dwellings = Number(formData.dwellings_number);
        const ppd = Number(formData.people_per_dwelling);
        const rate = Number(formData.growth_rate);
        const years = Number(formData.projection_years);

        if (!formData.community_name || !formData.municipality || !dwellings || !ppd) {
            setError('Por favor complete los campos obligatorios (Comunidad, Municipio, Viviendas, Personas por vivienda).');
            setLoading(false);
            return;
        }

        const initial_population = Math.round(dwellings * ppd);

        let final_population = 0;
        const r = rate / 100;
        const t = years;

        if (formData.projection_method === 'Exponencial') {
            // Exponential: Pf = P0 * e^(r*t)
            final_population = Math.round(initial_population * Math.exp(r * t));
        } else {
            // Geometric: Pf = P0 * (1 + r)^t
            final_population = Math.round(initial_population * Math.pow((1 + r), t));
        }

        const calculationData = {
            project_id: projectId,
            community_name: formData.community_name,
            municipality: formData.municipality,
            dwellings_number: dwellings,
            people_per_dwelling: ppd,
            initial_population: initial_population,
            growth_rate: rate,
            projection_years: years,
            calculated_flows: {
                final_population,
                method: formData.projection_method
            },
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_calculations')
                .upsert(calculationData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage(`Datos guardados. Población estimada: ${initial_population}, Proyectada: ${final_population.toLocaleString()}.`);
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        router.push(`/dashboard/projects/${projectId}/source`);
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                Censo y Comunidad
            </h2>

            {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={calculateAndSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <Input
                        id="community_name"
                        name="community_name"
                        label="Nombre de la comunidad *"
                        value={formData.community_name}
                        onChange={handleChange}
                        placeholder="Ej: Vereda El Silencio"
                    />
                    <Input
                        id="municipality"
                        name="municipality"
                        label="Municipio / vereda *"
                        value={formData.municipality}
                        onChange={handleChange}
                        placeholder="Ej: San Roque"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <Input
                        id="dwellings_number"
                        name="dwellings_number"
                        type="number"
                        label="Número de viviendas *"
                        value={formData.dwellings_number}
                        onChange={handleChange}
                        placeholder="0"
                    />
                    <Input
                        id="people_per_dwelling"
                        name="people_per_dwelling"
                        type="number"
                        step="0.1"
                        label="Promedio personas por vivienda *"
                        value={formData.people_per_dwelling}
                        onChange={handleChange}
                        placeholder="Ej: 3.5"
                    />
                </div>

                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--color-gray-light)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>
                        Población Estimada Actual: <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>{estimatedPop}</span> habitantes
                    </p>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-foreground)' }}>Proyección</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <Input
                        id="growth_rate"
                        name="growth_rate"
                        type="number"
                        step="0.01"
                        label="Tasa de Crecimiento anual (%)"
                        value={formData.growth_rate}
                        onChange={handleChange}
                    />
                    <Input
                        id="projection_years"
                        name="projection_years"
                        type="number"
                        label="Período de Diseño (Años)"
                        value={formData.projection_years}
                        onChange={handleChange}
                    />

                    <div className="input-group">
                        <label className="label" style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Método de Proyección</label>
                        <select
                            name="projection_method"
                            value={formData.projection_method}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.625rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-gray-medium)',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="Geometrico">Método Geométrico (RAS)</option>
                            <option value="Exponencial">Método Exponencial (RAS)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                        {loading ? 'Guardando...' : 'Guardar y Calcular'}
                    </Button>

                    {saved && (
                        <Button type="button" onClick={handleNext} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                            Siguiente: Fuente de Agua →
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
