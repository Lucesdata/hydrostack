"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { WaterQualityEngine } from '@/lib/water-quality-engine';
import { WaterQualityState } from '@/types/project';

export default function QualityAnalysisForm({
    projectId,
    initialData
}: {
    projectId: string;
    initialData: any
}) {
    const [formData, setFormData] = useState({
        ph: initialData?.ph ?? '',
        turbidity: initialData?.turbidity ?? '',
        color: initialData?.color ?? '',
        alkalinity: initialData?.alkalinity ?? '',
        hardness: initialData?.hardness ?? '',
        iron: initialData?.iron ?? '',
        manganese: initialData?.manganese ?? '',
        chlorides: initialData?.chlorides ?? '',
        sulfates: initialData?.sulfates ?? '',
        nitrates: initialData?.nitrates ?? '',
        fecal_coliforms: initialData?.fecal_coliforms ?? '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [ircaResult, setIrcaResult] = useState({ score: 0, classification: { level: '', color: '', action: '' } });
    const [complexity, setComplexity] = useState<'baja' | 'media' | 'alta'>('baja');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Prepare numeric params for IRCA calculation
        const params: any = {};
        Object.keys(formData).forEach(key => {
            const val = parseFloat(formData[key as keyof typeof formData] as string);
            if (!isNaN(val)) params[key] = val;
        });

        // Use new Engine
        const result = WaterQualityEngine.calculateIRCA(params as WaterQualityState);
        setIrcaResult({
            score: result.score,
            classification: {
                level: result.risk_level,
                color: result.color,
                action: result.label
            }
        });

        const comp = WaterQualityEngine.classifyComplexity(params as WaterQualityState);
        setComplexity(comp);

    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isExceeding = (name: string, value: any) => {
        const val = parseFloat(value);
        if (isNaN(val)) return false;

        if (name === 'ph') {
            return val < 6.5 || val > 9.0;
        }

        // Límites hardcoded por ahora para UX rápida (idealmente traer del Engine, pero requiere refactor de acceso)
        const limits: any = { turbidity: 2, color: 15, total_coliforms: 0, fecal_coliforms: 0, iron: 0.3 };
        const limit = limits[name];
        return limit !== undefined && val > limit;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const numericData: any = {
            project_id: projectId,
            irca_score: ircaResult.score,
            complexity_level: complexity,
            updated_at: new Date().toISOString()
        };

        Object.keys(formData).forEach(key => {
            const val = parseFloat(formData[key as keyof typeof formData] as string);
            numericData[key] = isNaN(val) ? null : val;
        });

        try {
            const { error: upsertError } = await supabase
                .from('project_water_quality')
                .upsert(numericData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Análisis químico guardado con éxito.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el análisis');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Análisis Físico-Químico Lab
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {Object.keys(formData).map((key) => (
                            <div key={key} className="input-group">
                                <label className="label" style={{ textTransform: 'capitalize' }}>
                                    {key.replace('_', ' ')}
                                    {isExceeding(key, (formData as any)[key]) && (
                                        <span style={{ color: 'var(--color-error)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>⚠ EXCEDE</span>
                                    )}
                                </label>
                                <Input
                                    id={key}
                                    name={key}
                                    type="number"
                                    step="0.01"
                                    value={(formData as any)[key]}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Resultados'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Continuar a Caudales →
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
                <div style={{
                    backgroundColor: ircaResult.classification.color,
                    color: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>ÍNDICE IRCA CALCULADO</p>
                    <h3 style={{ fontSize: '3rem', fontWeight: 900, margin: '0.5rem 0' }}>{ircaResult.score.toFixed(1)}%</h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{ircaResult.classification.level}</p>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${ircaResult.classification.color}`
                }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Diagnóstico:</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>{ircaResult.classification.action}</p>

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.85rem' }}>Complejidad de Tratamiento:</h4>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            backgroundColor: complexity === 'alta' ? '#FEE2E2' : complexity === 'media' ? '#FEF3C7' : '#D1FAE5',
                            color: complexity === 'alta' ? '#991B1B' : complexity === 'media' ? '#92400E' : '#065F46'
                        }}>
                            {complexity}
                        </span>
                    </div>

                    <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--color-gray-dark)', borderTop: '1px solid var(--color-gray-medium)', paddingTop: '1rem' }}>
                        <p><strong>Nota:</strong> Este cálculo se basa en la Res. 2115 de 2007 para Colombia.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
