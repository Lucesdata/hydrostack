"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function TankForm({ projectId, initialData }: { projectId: string; initialData: any }) {
    const [formData, setFormData] = useState({
        tank_comp_perc: initialData?.tank_comp_perc ?? 25,
        tank_emerg_perc: initialData?.tank_emerg_perc ?? 20,
        tank_fire_reserve: initialData?.tank_fire_reserve ?? false,
    });

    const [results, setResults] = useState({
        v_comp: 0,
        v_emerg: 0,
        v_fire: 0,
        v_total: 0,
        suggested_h: 2.0,
        suggested_l: 0,
        suggested_w: 0
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const qmd_max = initialData?.calculated_flows?.qmd_max || 0;

    useEffect(() => {
        if (qmd_max > 0) {
            const v_comp = (qmd_max * 86.4) * (Number(formData.tank_comp_perc) / 100);
            const v_emerg = (qmd_max * 86.4) * (Number(formData.tank_emerg_perc) / 100);
            const v_fire = formData.tank_fire_reserve ? 5 : 0; // Simple reserve of 5m3
            const v_total = v_comp + v_emerg + v_fire;

            // Suggested dimensions for H=2.0m
            const area = v_total / 2.0;
            const side = Math.sqrt(area);

            setResults({
                v_comp: Number(v_comp.toFixed(2)),
                v_emerg: Number(v_emerg.toFixed(2)),
                v_fire: v_fire,
                v_total: Number(v_total.toFixed(2)),
                suggested_h: 2.0,
                suggested_l: Number(side.toFixed(2)),
                suggested_w: Number(side.toFixed(2)),
            });
        }
    }, [formData, qmd_max]);

    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const updateData = {
            tank_comp_perc: Number(formData.tank_comp_perc),
            tank_emerg_perc: Number(formData.tank_emerg_perc),
            tank_fire_reserve: formData.tank_fire_reserve,
            calculated_flows: {
                ...initialData?.calculated_flows,
                tank_capacity: results.v_total,
                tank_v_comp: results.v_comp,
                tank_v_emerg: results.v_emerg,
                tank_v_fire: results.v_fire
            },
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_calculations')
                .update(updateData)
                .eq('project_id', projectId);

            if (upsertError) throw upsertError;

            setMessage('Dimensionamiento del tanque guardado con éxito.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos del tanque');
        } finally {
            setLoading(false);
        }
    };

    if (!qmd_max) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FCA5A5' }}>
                <p style={{ color: '#B91C1C', fontWeight: 600 }}>Caudal de diseño no calculado</p>
                <p style={{ color: '#7F1D1D', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Primero debes calcular los <strong>5. Caudales de Diseño</strong> para obtener el volumen requerido del tanque.
                </p>
                <Button onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)} style={{ marginTop: '1rem' }}>
                    Ir a Caudales
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Parámetros del Tanque
                </h2>

                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                        <Input
                            id="tank_comp_perc"
                            name="tank_comp_perc"
                            type="number"
                            label="% Volumen de Compensación"
                            value={formData.tank_comp_perc}
                            onChange={handleInputChange}
                        />
                        <Input
                            id="tank_emerg_perc"
                            name="tank_emerg_perc"
                            type="number"
                            label="% Volumen de Emergencia"
                            value={formData.tank_emerg_perc}
                            onChange={handleInputChange}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="tank_fire_reserve"
                                name="tank_fire_reserve"
                                checked={formData.tank_fire_reserve}
                                onChange={handleCheckChange}
                                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
                            />
                            <label htmlFor="tank_fire_reserve" style={{ fontSize: '0.95rem', cursor: 'pointer' }}>
                                Incluir reserva contra incendios ($5 m^3$)
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Diseño'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/conduccion`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Siguiente: Línea de Conducción →
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-light)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '0.5rem' }}>
                    Dimensionamiento Sugerido
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>VOLUMEN TOTAL REQUERIDO</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{results.v_total} <span style={{ fontSize: '1rem' }}>m³</span></p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ opacity: 0.8 }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Compensación</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.v_comp} m³</p>
                        </div>
                        <div style={{ opacity: 0.8 }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Emergencia</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.v_emerg} m³</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-gray-medium)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-dark)', marginBottom: '0.75rem', fontWeight: 600 }}>Dimensiones sugeridas (Tanque cuadrado):</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{results.suggested_l} m</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>Largo</p>
                            </div>
                            <span style={{ fontSize: '1rem', color: 'var(--color-gray-medium)' }}>×</span>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{results.suggested_w} m</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>Ancho</p>
                            </div>
                            <span style={{ fontSize: '1rem', color: 'var(--color-gray-medium)' }}>×</span>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{results.suggested_h} m</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>Alto útil</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
