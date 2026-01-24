"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

export default function ConduccionForm({
    projectId,
    initialData,
    qmd_lps
}: {
    projectId: string;
    initialData: any;
    qmd_lps: number;
}) {
    const [formData, setFormData] = useState({
        length: initialData?.length || 500,
        elevation_source: initialData?.elevation_source || 1100,
        elevation_tank: initialData?.elevation_tank || 1050,
        material: initialData?.material || 'PVC',
        diameter_inch: initialData?.diameter_inch || 2,
        h_william_c: initialData?.h_william_c || 150,
    });

    const [results, setResults] = useState({
        hf: 0,
        residual_pressure: 0,
        velocity: 0,
        static_pressure: 0
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (qmd_lps > 0 && formData.length > 0 && formData.diameter_inch > 0) {
            const Q_m3s = qmd_lps / 1000;
            const D_m = Number(formData.diameter_inch) * 0.0254; // inch to meters
            const L = Number(formData.length);
            const C = Number(formData.h_william_c);

            // Hazen-Williams hf = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)
            const hf = (10.67 * L * Math.pow(Q_m3s, 1.852)) / (Math.pow(C, 1.852) * Math.pow(D_m, 4.87));

            // Elevations
            const delta_z = Number(formData.elevation_source) - Number(formData.elevation_tank);
            const residual_p = delta_z - hf;

            // Velocity V = Q / A
            const area = Math.PI * Math.pow(D_m / 2, 2);
            const velocity = Q_m3s / area;

            setResults({
                hf: Number(hf.toFixed(2)),
                residual_pressure: Number(residual_p.toFixed(2)),
                velocity: Number(velocity.toFixed(2)),
                static_pressure: Number(delta_z.toFixed(2))
            });
        }
    }, [formData, qmd_lps]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: upsertError } = await supabase
                .from('project_conduccion')
                .upsert({
                    project_id: projectId,
                    length: Number(formData.length),
                    elevation_source: Number(formData.elevation_source),
                    elevation_tank: Number(formData.elevation_tank),
                    material: formData.material,
                    diameter_inch: Number(formData.diameter_inch),
                    h_william_c: Number(formData.h_william_c),
                    calculated_loss: results.hf,
                    residual_pressure: results.residual_pressure,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage('Línea de conducción guardada exitosamente.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el diseño hidráulico');
        } finally {
            setLoading(false);
        }
    };

    if (qmd_lps === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-lg)', border: '1px solid #FCA5A5' }}>
                <p style={{ color: '#B91C1C', fontWeight: 600 }}>Caudal de diseño faltante</p>
                <p style={{ color: '#7F1D1D', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Necesitas calcular los <strong>Caudales de Diseño</strong> antes de dimensionar la línea de conducción.
                </p>
                <Button onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)} style={{ marginTop: '1rem' }}>
                    Ir a Caudales
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <ModuleWarning projectId={projectId} moduleKey="conduccion" />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Parámetros Hidráulicos
                </h2>

                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <Input
                            id="length"
                            name="length"
                            label="Longitud total (m)"
                            type="number"
                            value={formData.length}
                            onChange={handleChange}
                        />
                        <Input
                            id="diameter_inch"
                            name="diameter_inch"
                            label="Diámetro comercial (pulg)"
                            type="number"
                            step="0.1"
                            value={formData.diameter_inch}
                            onChange={handleChange}
                        />
                        <Input
                            id="elevation_source"
                            name="elevation_source"
                            label="Cota de Captación (m.s.n.m)"
                            type="number"
                            value={formData.elevation_source}
                            onChange={handleChange}
                        />
                        <Input
                            id="elevation_tank"
                            name="elevation_tank"
                            label="Cota de Tanque (m.s.n.m)"
                            type="number"
                            value={formData.elevation_tank}
                            onChange={handleChange}
                        />
                        <Input
                            id="h_william_c"
                            name="h_william_c"
                            label="Coeficiente C (Hazen-Williams)"
                            type="number"
                            value={formData.h_william_c}
                            onChange={handleChange}
                        />
                        <div className="input-group">
                            <label className="label">Material</label>
                            <select
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="PVC">PVC</option>
                                <option value="HDPE">HDPE</option>
                                <option value="HG">HG (Hierro Galvanizado)</option>
                                <option value="Asbesto">Asbesto-Cemento</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Diseño'}
                        </Button>
                    </div>
                </form>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-light)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '0.5rem' }}>
                    Resultados Hidráulicos
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>PRESIÓN RESIDUAL</p>
                        <p style={{
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            color: results.residual_pressure > 0 ? 'var(--color-primary)' : 'var(--color-error)'
                        }}>
                            {results.residual_pressure} <span style={{ fontSize: '1rem' }}>m.c.a</span>
                        </p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: results.residual_pressure > 5 ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {results.residual_pressure > 5 ? '✓ Presión suficiente' : '⚠ Presión insuficiente (< 5 m.c.a)'}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>Pérdidas (hf)</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.hf} m</p>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>Velocidad</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.velocity} m/s</p>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>Presión Estática</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.static_pressure} m</p>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>Caudal (QMD)</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{qmd_lps} L/s</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: results.velocity > 0.5 && results.velocity < 2.5 ? '#f0fdf4' : '#fff7ed', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <p><strong>Verificación de Velocidad:</strong></p>
                        <p>{results.velocity < 0.5 ? '⚠ Velocidad muy baja (riesgo de sedimentación)' :
                            results.velocity > 2.5 ? '⚠ Velocidad muy alta (riesgo de erosión/golpe ariete)' :
                                '✓ Velocidad dentro de rangos recomendados (0.5 - 2.5 m/s)'}</p>
                    </div>
                </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
                <ModuleNavigation projectId={projectId} currentModuleKey="conduccion" />
            </div>
        </div>
    );
}
