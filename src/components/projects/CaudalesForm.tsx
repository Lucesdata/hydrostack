"use client";

/**
 * MÓDULO: Caudales de Diseño
 * BLOQUE: D — Caracterización Hidráulica
 * 
 * Función técnica:
 * - Cálculo de dotación bruta integrando índice de pérdidas.
 * - Determinación de caudales característicos (Qmd, QMD, QMH).
 * - Integración de población estacional / flotante en el pico horario.
 * - Aplicación de coeficientes de consumo (K1, K2).
 * 
 * Tabla de base de datos: project_calculations
 * 
 * Aplicabilidad:
 * - ✅ Agua potable: Siempre (base para dimensionar toda la infraestructura).
 * - ✅ Aguas residuales: Siempre (base para dimensionar colectores y PTAR).
 */

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type FLOW_DATA = {
    net_dotation: number;
    losses_index: number;
    k1_coef: number;
    k2_coef: number;
    calculated_flows: {
        final_population: number;
        qmd?: number;
        qmd_max?: number;
        qmh_max?: number;
        gross_dotation?: number;
    };
};

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

    // Fetch Seasonal / Additional Population Data
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

    // Real-time calculation effect
    useEffect(() => {
        const dneta = Number(formData.net_dotation);
        const ipp = Number(formData.losses_index);
        const k1 = Number(formData.k1_coef);
        const k2 = Number(formData.k2_coef);

        if (dneta && pfutura) {
            const dbruta = dneta / (1 - ipp / 100);

            // Seasonal Population Integration
            const touristCount = seasonalData?.daily_tourist_count || 0;
            const seasonalPeak = seasonalData?.seasonal_peak_factor || 1.0;

            // Caudal base (habitantes permanentes)
            const qmdBase = (pfutura * dbruta) / 86400;

            // Caudal turistas (dotación neta para visitantes suele ser menor, 
            // pero bajo RAS 100% de la neta es conservador y profesional)
            const qmdTourists = (touristCount * dneta) / 86400;

            const qmdTotal = qmdBase + qmdTourists;
            const qmd_max = qmdTotal * k1;

            // QMH con Factor de Pico Estacional (FPE) aplicado a la carga total
            // El FPE (fines de semana) actúa como un multiplicador adicional sobre el pico horario
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
            {/* Form Column */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Parámetros de Diseño
                </h2>

                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                        <Input
                            id="net_dotation"
                            name="net_dotation"
                            type="number"
                            label="Dotación Neta (L/hab/día)"
                            value={formData.net_dotation}
                            onChange={handleChange}
                            placeholder="Ej: 100"
                        />
                        <Input
                            id="losses_index"
                            name="losses_index"
                            type="number"
                            label="Índice de Pérdidas (%)"
                            value={formData.losses_index}
                            onChange={handleChange}
                            placeholder="Ej: 25"
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                id="k1_coef"
                                name="k1_coef"
                                type="number"
                                step="0.1"
                                label="Coeficiente K1"
                                value={formData.k1_coef}
                                onChange={handleChange}
                                placeholder="Ej: 1.2"
                            />
                            <Input
                                id="k2_coef"
                                name="k2_coef"
                                type="number"
                                step="0.1"
                                label="Coeficiente K2"
                                value={formData.k2_coef}
                                onChange={handleChange}
                                placeholder="Ej: 1.5"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Cálculos'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/tank`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Siguiente: Tanque de Almacenamiento →
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Results Column */}
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

                {message && (
                    <div style={{ marginTop: '1.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {message}
                    </div>
                )}
                {error && (
                    <div style={{ marginTop: '1.5rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
