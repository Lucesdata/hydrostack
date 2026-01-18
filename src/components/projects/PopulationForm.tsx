"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type POPULATION_DATA = {
    project_id: string;
    initial_population: number | null;
    growth_rate: number | null;
    projection_years: number | null;
};

export default function PopulationForm({ projectId, initialData }: { projectId: string; initialData: POPULATION_DATA | null }) {
    const [formData, setFormData] = useState({
        initial_population: initialData?.initial_population ?? '',
        growth_rate: initialData?.growth_rate ?? '',
        projection_years: initialData?.projection_years ?? 25
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const pop = Number(formData.initial_population);
        const rate = Number(formData.growth_rate);
        const years = Number(formData.projection_years);

        if (!pop || !rate || !years) {
            setError('Todos los campos son obligatorios para calcular.');
            setLoading(false);
            return;
        }

        // Simple Geometric Growth Calculation: Pf = P0 * (1 + r)^n
        const final_population = Math.round(pop * Math.pow((1 + rate / 100), years));

        // Validar si ya existe registro para upsert
        const calculationData = {
            project_id: projectId,
            initial_population: pop,
            growth_rate: rate,
            projection_years: years,
            calculated_flows: {
                final_population,
                method: 'Geometrico'
            },
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_calculations')
                .upsert(calculationData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage(`Datos guardados. Población futura estimada: ${final_population.toLocaleString()} habitantes.`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los cálculos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{message}</div>}
            {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={calculateAndSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <Input
                        id="initial_population"
                        name="initial_population"
                        type="number"
                        label="Población Actual (Habitantes)"
                        value={formData.initial_population}
                        onChange={handleChange}
                        placeholder="Ej: 1500"
                    />

                    <Input
                        id="growth_rate"
                        name="growth_rate"
                        type="number"
                        step="0.01"
                        label="Tasa de Crecimiento anual (%)"
                        value={formData.growth_rate}
                        onChange={handleChange}
                        placeholder="Ej: 1.5"
                    />

                    <Input
                        id="projection_years"
                        name="projection_years"
                        type="number"
                        label="Período de Diseño (Años)"
                        value={formData.projection_years}
                        onChange={handleChange}
                        placeholder="Ej: 25"
                    />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Calculando...' : 'Calcular y Guardar'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
