"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

export default function FloatingPopulationForm({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        floating_population: 0,
        seasonal_peak_factor: 1.5,
        daily_tourist_count: 0,
        ppe_heavy_gloves: true,
        ppe_safety_boots: true,
        ppe_goggles: true,
        ppe_mask: true,
        ppe_helmet: false
    });

    useEffect(() => {
        async function loadData() {
            const { data } = await supabase
                .from('project_seasonal_data')
                .select('*')
                .eq('project_id', projectId)
                .maybeSingle();

            if (data) {
                setFormData({
                    floating_population: data.floating_population || 0,
                    seasonal_peak_factor: data.seasonal_peak_factor || 1.5,
                    daily_tourist_count: data.daily_tourist_count || 0,
                    ppe_heavy_gloves: data.ppe_heavy_gloves ?? true,
                    ppe_safety_boots: data.ppe_safety_boots ?? true,
                    ppe_goggles: data.ppe_goggles ?? true,
                    ppe_mask: data.ppe_mask ?? true,
                    ppe_helmet: data.ppe_helmet ?? false
                });
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    const handleSave = async () => {
        setSaving(true);
        await supabase
            .from('project_seasonal_data')
            .upsert({
                project_id: projectId,
                ...formData,
                updated_at: new Date().toISOString()
            });

        setSaving(false);
        router.refresh();
    };

    if (loading) return <div>Cargando módulo de población...</div>;

    return (
        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <ModuleWarning projectId={projectId} moduleKey="floating_population" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>Población Flotante y Pico Estacional</h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '2rem' }}>
                Ajuste la demanda para contextos con alta población flotante o variaciones estacionales significativas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Dinámica de Visitantes</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Visitantes Diarios (Pico)</label>
                        <input
                            type="number"
                            value={formData.daily_tourist_count}
                            onChange={(e) => setFormData({ ...formData, daily_tourist_count: parseInt(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-gray-medium)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Factor de Pico Estacional (FPE)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.seasonal_peak_factor}
                            onChange={(e) => setFormData({ ...formData, seasonal_peak_factor: parseFloat(e.target.value) || 1.0 })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-gray-medium)' }}
                        />
                        <small style={{ color: 'var(--color-gray-medium)' }}>Rango recomendado: 1.2 - 2.0 (Fines de semana o festivos)</small>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', border: '1px solid var(--color-gray-light)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Lista EPP para Operario</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            { id: 'ppe_heavy_gloves', label: 'Guantes de Nitrilo (Químicos)' },
                            { id: 'ppe_safety_boots', label: 'Botas de Seguridad' },
                            { id: 'ppe_goggles', label: 'Mono-gafas de Protección' },
                            { id: 'ppe_mask', label: 'Mascarilla para Vapores' },
                            { id: 'ppe_helmet', label: 'Casco de Seguridad' }
                        ].map(item => (
                            <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData[item.id as keyof typeof formData] as boolean}
                                    onChange={() => setFormData({ ...formData, [item.id]: !formData[item.id as keyof typeof formData] })}
                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                />
                                <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button onClick={handleSave} variant="primary" loading={saving}>
                    {saving ? 'Guardando...' : 'Guardar Información'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/projects/${projectId}/consumption`)}
                    disabled={saving}
                >
                    Siguiente: Consumo de Agua →
                </Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="floating_population" />
        </div>
    );
}
