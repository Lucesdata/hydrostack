"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';

export default function DesarenadorForm({
    projectId,
    initialData,
    designFlowQMD
}: {
    projectId: string;
    initialData: any;
    designFlowQMD: number;
}) {
    const [formData, setFormData] = useState({
        sand_diameter: initialData?.sand_diameter ?? 0.2,
        water_temp: initialData?.water_temp ?? 20,
        depth: initialData?.depth ?? 1.5,
        width: initialData?.width ?? 1.0,
        number_of_chambers: initialData?.number_of_chambers ?? 1,
    });

    const [results, setResults] = useState({
        settlingVelocity: 0, // Vs (m/s)
        length: 0,
        horizVelocity: 0, // Vh (m/s)
        lbRatio: 0,
        surfaceLoadingRate: 0
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // Engineering Calculations
    useEffect(() => {
        const Q = (designFlowQMD / 1000) / formData.number_of_chambers; // Q per chamber in m3/s
        const D = formData.sand_diameter / 1000; // m
        const T = formData.water_temp;
        const H = formData.depth;
        const B = formData.width;

        // 1. Calculate Settling Velocity (Vs) using simplified Hazen formula or similar
        // For sand 0.2mm (~20C), Vs is approx 0.021 m/s
        // We'll use a common engineering approximation for Vs
        let Vs = 0;
        if (formData.sand_diameter === 0.1) Vs = 0.007;
        else if (formData.sand_diameter === 0.2) Vs = 0.021;
        else if (formData.sand_diameter === 0.3) Vs = 0.038;
        else Vs = 0.021; // Default fallback

        // 2. Surface loading rate (TAS) = Vs (m/s) * 86400 (s/day)
        const TAS = Vs * 3600; // m3/m2/h

        // 3. Required area As = Q / Vs
        const As = Q / Vs;

        // 4. Calculate Length L = As / B
        const L = As / B;

        // 5. Horizontal Velocity Vh = Q / (B * H)
        const Vh = Q / (B * H);

        setResults({
            settlingVelocity: Vs,
            length: parseFloat(L.toFixed(2)),
            horizVelocity: parseFloat(Vh.toFixed(4)),
            lbRatio: parseFloat((L / B).toFixed(1)),
            surfaceLoadingRate: parseFloat(TAS.toFixed(2))
        });
    }, [formData, designFlowQMD]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const desarenadorData = {
            project_id: projectId,
            design_flow: designFlowQMD,
            ...formData,
            length: results.length,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_desarenador')
                .upsert(desarenadorData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Dimensionamiento del desarenador guardado.');
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
                <ModuleWarning projectId={projectId} moduleKey="desarenador" />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Diseño Analítico: Desarenador
                </h2>

                {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>{message}</div>}
                {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label className="label">Caudal de Diseño (QMD) [L/s]</label>
                            <Input id="qmd" disabled value={designFlowQMD} />
                        </div>
                        <div className="input-group">
                            <label className="label">Diámetro de Arena a remover [mm]</label>
                            <select
                                name="sand_diameter"
                                value={formData.sand_diameter}
                                onChange={(e: any) => handleInputChange(e)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray-medium)' }}
                            >
                                <option value={0.1}>0.1 mm (Arena muy fina)</option>
                                <option value={0.2}>0.2 mm (Arena estándar)</option>
                                <option value={0.3}>0.3 mm (Arena gruesa)</option>
                            </select>
                        </div>
                        <Input id="water_temp" name="water_temp" type="number" label="Temp. Agua (°C)" value={formData.water_temp} onChange={handleInputChange} />
                        <Input id="number_of_chambers" name="number_of_chambers" type="number" label="Número de cámaras" value={formData.number_of_chambers} onChange={handleInputChange} />
                        <Input id="depth" name="depth" type="number" step="0.01" label="Profundidad Útil (H) [m]" value={formData.depth} onChange={handleInputChange} />
                        <Input id="width" name="width" type="number" step="0.01" label="Ancho de cámara (B) [m]" value={formData.width} onChange={handleInputChange} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Diseño'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/jar-test`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Continuar a Ensayo Jarras {"->"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-light)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Resultados del Cálculo</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>LONGITUD REQUERIDA (L)</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{results.length} m</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>VELOCIDAD HORIZONTAL (Vh)</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: results.horizVelocity > 0.3 ? 'var(--color-error)' : 'inherit' }}>
                                {results.horizVelocity} m/s
                            </p>
                            {results.horizVelocity > 0.3 && <p style={{ fontSize: '0.65rem', color: 'var(--color-error)' }}>⚠ Vh {">"} 0.3 m/s (Riesgo de resuspensión)</p>}
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>RELACIÓN L/B</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: (results.lbRatio < 3 || results.lbRatio > 5) ? 'var(--color-secondary)' : 'inherit' }}>
                                {results.lbRatio}
                            </p>
                            {(results.lbRatio < 3 || results.lbRatio > 5) && <p style={{ fontSize: '0.65rem', color: 'var(--color-secondary)' }}>i Recomendado entre 3 y 5</p>}
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>VELOCIDAD SEDIMENTACIÓN (Vs)</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700 }}>{results.settlingVelocity} m/s</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
