"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

export default function CaudalesForm({ projectId, initialData }: { projectId: string; initialData: any }) {
    const [formData, setFormData] = useState({
        net_dotation: initialData?.net_dotation ?? 100,
        losses_index: initialData?.losses_index ?? 25,
        k1_coef: initialData?.k1_coef ?? 1.3,
        k2_coef: initialData?.k2_coef ?? 1.6,
    });

    const [results, setResults] = useState({
        gross_dotation: 0,
        qmd: 0,
        qmd_max: 0,
        qmh_max: 0,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const pfutura = initialData?.calculated_flows?.final_population || 0;
    const [seasonalData, setSeasonalData] = useState<any>(null);

    useEffect(() => {
        async function fetchSeasonalData() {
            const { data } = await supabase
                .from('project_seasonal_data')
                .select('*')
                .eq('project_id', projectId)
                .maybeSingle();
            if (data) setSeasonalData(data);
        }
        fetchSeasonalData();
    }, [projectId, supabase]);

    useEffect(() => {
        const dneta = Number(formData.net_dotation);
        const ipp = Number(formData.losses_index);
        const k1 = Number(formData.k1_coef);
        const k2 = Number(formData.k2_coef);

        if (dneta && pfutura) {
            const dbruta = dneta / (1 - ipp / 100);
            const touristCount = seasonalData?.daily_tourist_count || 0;
            const seasonalPeak = seasonalData?.seasonal_peak_factor || 1.0;

            const qmdBase = (pfutura * dbruta) / 86400;
            const qmdTourists = (touristCount * dneta) / 86400;

            const qmdTotal = qmdBase + qmdTourists;
            const qmd_max = qmdTotal * k1;
            const qmh_max = qmd_max * k2 * seasonalPeak;

            setResults({
                gross_dotation: Number(dbruta.toFixed(2)),
                qmd: Number(qmdTotal.toFixed(3)),
                qmd_max: Number(qmd_max.toFixed(3)),
                qmh_max: Number(qmh_max.toFixed(3)),
            });
        }
    }, [formData, pfutura, seasonalData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const updateData = {
            net_dotation: Number(formData.net_dotation),
            losses_index: Number(formData.losses_index),
            k1_coef: Number(formData.k1_coef),
            k2_coef: Number(formData.k2_coef),
            calculated_flows: {
                ...initialData?.calculated_flows,
                ...results
            },
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_calculations')
                .update(updateData)
                .eq('project_id', projectId);

            if (upsertError) throw upsertError;

            setMessage('Cálculos de caudales guardados exitosamente.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los cálculos');
        } finally {
            setLoading(false);
        }
    };

    if (!pfutura) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FCA5A5' }}>
                <p style={{ color: '#B91C1C', fontWeight: 600 }}>Población no definida</p>
                <p style={{ color: '#7F1D1D', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Primero debes completar la sección de <strong>1. Censo y Comunidad</strong> para obtener la población futura proyectada.
                </p>
                <Button onClick={() => router.push(`/dashboard/projects/${projectId}/population`)} style={{ marginTop: '1rem' }}>
                    Ir a Censo
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <ModuleWarning projectId={projectId} moduleKey="caudales" />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Parámetros de Diseño
                </h2>

                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                        <Input id="net_dotation" name="net_dotation" type="number" label="Dotación Neta (L/hab/día)" value={formData.net_dotation} onChange={handleChange} />
                        <Input id="losses_index" name="losses_index" type="number" label="Índice de Pérdidas (%)" value={formData.losses_index} onChange={handleChange} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input id="k1_coef" name="k1_coef" type="number" step="0.1" label="Coeficiente K1" value={formData.k1_coef} onChange={handleChange} />
                            <Input id="k2_coef" name="k2_coef" type="number" step="0.1" label="Coeficiente K2" value={formData.k2_coef} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Cálculos'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/projects/${projectId}/fime-grueso-dinamico`)}
                            disabled={!(saved || initialData?.calculated_flows)}
                        >
                            Siguiente: Pretratamiento (FGDi) →
                        </Button>
                    </div>
                </form>
            </div>

            <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                    Resultados de Demanda
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Población Futura</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pfutura.toLocaleString()} hab.</p>
                    </div>
                    <div>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Dotación Bruta</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{results.gross_dotation} L/hab/d</p>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Caudal Medio Diario (Qmd)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{results.qmd} L/s</p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Caudal Máximo Diario (QMD)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{results.qmd_max} L/s</p>
                        </div>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Caudal Máximo Horario (QMH)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{results.qmh_max} L/s</p>
                        </div>
                    </div>
                </div>

                {message && <div style={{ marginTop: '1.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ marginTop: '1.5rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
                <ModuleNavigation projectId={projectId} currentModuleKey="caudales" />
            </div>
        </div>
    );
}
