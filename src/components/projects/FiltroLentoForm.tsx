"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from '@/components/projects/ModuleWarning';

export default function FiltroLentoForm({
    projectId,
    initialData,
    designFlowQMD
}: {
    projectId: string;
    initialData: any;
    designFlowQMD: number;
}) {
    const [formData, setFormData] = useState({
        filtration_rate: initialData?.filtration_rate ?? 0.15,
        number_of_units: initialData?.number_of_units ?? 2,
        unit_width: initialData?.unit_width ?? 3.0,
        unit_length: initialData?.unit_length ?? 4.0,
        sand_depth: initialData?.sand_depth ?? 0.9,
        gravel_depth: initialData?.gravel_depth ?? 0.3,
    });

    const [results, setResults] = useState({
        totalRequiredArea: 0,
        areaPerUnit: 0,
        calculatedArea: 0,
        checkArea: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // Engineering Calculations
    useEffect(() => {
        const Q_m3h = (designFlowQMD * 3.6); // Convert L/s to m3/h
        const Vf = formData.filtration_rate; // m/h
        const N = formData.number_of_units;
        const B = formData.unit_width;
        const L = formData.unit_length;

        // 1. Total Required Area (As = Q / Vf)
        const totalAs = Q_m3h / Vf;

        // 2. Area per unit
        const As_u = totalAs / N;

        // 3. Calculated current area
        const currentAsu = B * L;

        setResults({
            totalRequiredArea: parseFloat(totalAs.toFixed(2)),
            areaPerUnit: parseFloat(As_u.toFixed(2)),
            calculatedArea: parseFloat(currentAsu.toFixed(2)),
            checkArea: currentAsu >= As_u
        });
    }, [formData, designFlowQMD]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const filterData = {
            project_id: projectId,
            design_flow: designFlowQMD,
            ...formData,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_filtros_lentos')
                .upsert(filterData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Dimensionamiento de filtros lentos guardado.');
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
                <ModuleWarning projectId={projectId} moduleKey="filtro_lento" />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Diseño Analítico: Filtros Lentos (FLA)
                </h2>

                {message && <div style={{ backgroundColor: '#D1FAE5', color: 'var(--color-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>{message}</div>}
                {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label className="label">Caudal de Diseño (QMD) [L/s]</label>
                            <Input id="qmd" disabled value={designFlowQMD} />
                        </div>
                        <Input
                            id="filtration_rate"
                            name="filtration_rate"
                            type="number"
                            step="0.01"
                            label="Tasa de filtración (Vf) [m/h]"
                            value={formData.filtration_rate}
                            onChange={handleInputChange}
                            placeholder="Ej: 0.15"
                        />
                        <Input id="number_of_units" name="number_of_units" type="number" label="Número de unidades (N)" value={formData.number_of_units} onChange={handleInputChange} />

                        <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--color-gray-medium)', margin: '0.5rem 0' }}></div>

                        <Input id="unit_width" name="unit_width" type="number" step="0.01" label="Ancho unidad (B) [m]" value={formData.unit_width} onChange={handleInputChange} />
                        <Input id="unit_length" name="unit_length" type="number" step="0.01" label="Largo unidad (L) [m]" value={formData.unit_length} onChange={handleInputChange} />
                        <Input id="sand_depth" name="sand_depth" type="number" step="0.01" label="Espesor Arena [m]" value={formData.sand_depth} onChange={handleInputChange} />
                        <Input id="gravel_depth" name="gravel_depth" type="number" step="0.01" label="Espesor Grava [m]" value={formData.gravel_depth} onChange={handleInputChange} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Diseño'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/compact-design`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Continuar a PTAP Compacta {"->"}
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
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>ÁREA TOTAL REQUERIDA</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{results.totalRequiredArea} m²</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>ÁREA POR UNIDAD REQUERIDA</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.areaPerUnit} m²</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>ÁREA DISEÑADA POR UNIDAD</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: !results.checkArea ? 'var(--color-error)' : 'var(--color-success)' }}>
                                {results.calculatedArea} m²
                            </p>
                            {!results.checkArea && <p style={{ fontSize: '0.65rem', color: 'var(--color-error)' }}>⚠ El área diseñada es menor a la requerida.</p>}
                            {results.checkArea && <p style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>✓ El área cumple con el requerimiento.</p>}
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>OBSERVACIÓN RAS</p>
                            <p style={{ fontSize: '0.8rem', color: formData.number_of_units < 2 ? 'var(--color-error)' : 'var(--color-gray-dark)' }}>
                                {formData.number_of_units < 2 ? '⚠ Se recomiendan mínimo 2 unidades.' : '✓ Cumple mínimo de unidades.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
