"use client";

import React, { useState, useEffect } from 'react';
import { ModuleKey, WaterQualityState, QualityEvolutionStep } from '@/types/project';
import { WaterQualityEngine } from '@/lib/water-quality-engine';
import { createClient } from '@/utils/supabase/client';

export default function QualityEvolutionWidget({
    projectId,
    moduleKey,
    onEffectCalculated
}: {
    projectId: string;
    moduleKey: ModuleKey;
    onEffectCalculated?: (step: QualityEvolutionStep) => void;
}) {
    const [step, setStep] = useState<QualityEvolutionStep | null>(null);
    const [loading, setLoading] = useState(true);
    const [rawQuality, setRawQuality] = useState<WaterQualityState | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchQualityContext = async () => {
            setLoading(true);
            try {
                // 1. Obtener calidad cruda
                const { data: qualityData } = await supabase
                    .from('project_water_quality')
                    .select('*')
                    .eq('project_id', projectId)
                    .single();

                if (qualityData) {
                    // Mapeo simple de DB a tipos de TS
                    const raw: WaterQualityState = {
                        ph: qualityData.ph || 7,
                        turbidity: qualityData.turbidity || 0,
                        color: qualityData.color || 0,
                        total_coliforms: qualityData.total_coliforms || 0,
                        fecal_coliforms: qualityData.fecal_coliforms || 0,
                        iron: qualityData.iron || 0,
                        alkalinity: qualityData.alkalinity || 0,
                        hardness: qualityData.hardness || 0
                    };
                    setRawQuality(raw);

                    // 2. Simular evolución hasta este módulo
                    // Nota: En producción esto debería leer los módulos activos reales desde la DB
                    // Para este widget aislado, simulamos el cálculo solo para este módulo asumiendo entrada "cruda" 
                    // OJO: Esto es una simplificación. Lo ideal es leer TODOS los módulos activos y calcular la cadena.

                    // Solución rápida v1: Calcular solo el delta de ESTE módulo sobre el agua cruda (demo mode)
                    // Solución robusta v2 (Implementación real):
                    const evolution = WaterQualityEngine.calculateEvolution(raw, [moduleKey]);
                    if (evolution.length > 0) {
                        setStep(evolution[0]);
                        if (onEffectCalculated) onEffectCalculated(evolution[0]);
                    }
                }
            } catch (err) {
                console.error('Error calculating quality evolution:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQualityContext();
    }, [projectId, moduleKey, supabase]);

    if (loading) return <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)' }}>Calculando impacto sanitario...</div>;
    if (!step) return null;

    const riskColor = step.irca_after.color;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-dark)' }}>
                    🛡️ Blindaje Sanitario (Estimación)
                </span>
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'white',
                    backgroundColor: riskColor,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px'
                }}>
                    IRCA SALIDA: {step.irca_after.score.toFixed(1)}%
                </span>
            </div>

            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                <QualityNode label="Entrada" data={step.input_quality} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>➔</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', textAlign: 'center' }}>
                        <div>Eficiencia Típica:</div>
                        {step.removal_percentages.turbidity && <div>Turbidez: -{step.removal_percentages.turbidity}%</div>}
                        {step.removal_percentages.fecal_coliforms && <div>Coliformes: -{step.removal_percentages.fecal_coliforms}%</div>}
                    </div>
                </div>

                <QualityNode label="Salida" data={step.output_quality} isOutput />
            </div>
        </div>
    );
}

function QualityNode({ label, data, isOutput }: { label: string, data: WaterQualityState, isOutput?: boolean }) {
    return (
        <div style={{ textAlign: 'center', opacity: isOutput ? 1 : 0.7 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                <Metric label="Turbidez" value={data.turbidity} unit="UNT" />
                <Metric label="E. Coli" value={data.fecal_coliforms} unit="UFC" />
                <Metric label="Color" value={data.color} unit="UPC" />
            </div>
        </div>
    );
}

function Metric({ label, value, unit }: { label: string, value: number, unit: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            <span style={{ color: 'var(--color-gray-dark)' }}>{label}:</span>
            <span style={{ fontWeight: 600 }}>{value.toFixed(1)} <span style={{ fontSize: '0.7em' }}>{unit}</span></span>
        </div>
    );
}
