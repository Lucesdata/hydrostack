"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ModuleWarning from '@/components/projects/ModuleWarning';
import ModuleNavigation from '@/components/projects/ModuleNavigation';
import { ModuleKey } from '@/types/project';
import { FimeEngine } from '@/lib/fime-engine';

interface FimeModuleFormProps {
    projectId: string;
    moduleKey: ModuleKey;
    title: string;
    description: string;
    fields: { key: string; label: string; type: 'number' | 'text' | 'select'; unit?: string; options?: string[] }[];
    initialData?: any;
    designFlowQMD: number;
    quality?: any; // New prop for quality dependent calcs
}

export default function FimeModuleForm({
    projectId,
    moduleKey,
    title,
    description,
    fields,
    initialData,
    designFlowQMD,
    quality
}: FimeModuleFormProps) {
    const [formData, setFormData] = useState(initialData || {});
    const [isSaving, setIsSaving] = useState(false);
    const [suggestion, setSuggestion] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    // Generate suggestion on mount or inputs change
    useEffect(() => {
        if (designFlowQMD) {
            const rule = FimeEngine.getSizingRules(moduleKey, designFlowQMD, quality || {});
            setSuggestion(rule);
        }
    }, [moduleKey, designFlowQMD, quality]);

    const handleApplySuggestion = () => {
        if (suggestion) {
            setFormData({ ...formData, ...suggestion });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: currentCalc } = await supabase
                .from('project_calculations')
                .select('metadata')
                .eq('project_id', projectId)
                .single();

            const updatedMetadata = {
                ...(currentCalc?.metadata || {}),
                [moduleKey]: formData
            };

            const { error } = await supabase
                .from('project_calculations')
                .update({ metadata: updatedMetadata })
                .eq('project_id', projectId);

            if (error) throw error;
            router.refresh();
        } catch (err) {
            console.error('Error saving FIME data:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Special view for Balance de Masas (E7)
    const isBalance = moduleKey === 'fime_balance_masas';
    const potability = isBalance && suggestion ? suggestion : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{title}</h2>
                        <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>{description}</p>
                    </div>
                    {suggestion && !isBalance && (
                        <Button onClick={handleApplySuggestion} variant="secondary" style={{ fontSize: '0.8rem' }}>
                            🪄 Precargar sugerencia técnica
                        </Button>
                    )}
                </div>

                <ModuleWarning projectId={projectId} moduleKey={moduleKey} />

                {isBalance ? (
                    // Specialized View for E7 Balance
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                        <div style={{ flex: 1, padding: '2rem', backgroundColor: potability?.cumple_normatividad ? '#ecfdf5' : '#fff1f2', borderRadius: 'var(--radius-md)', border: potability?.cumple_normatividad ? '1px solid #10b981' : '1px solid #f43f5e', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{potability?.cumple_normatividad ? '🛡️' : '⚠️'}</div>
                            <h3 style={{ fontWeight: 800, color: potability?.cumple_normatividad ? '#065f46' : '#991b1b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                {potability?.cumple_normatividad ? 'Blindaje Sanitario Confirmado' : 'Riesgo Sanitario Detectado'}
                            </h3>
                            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{potability?.observacion}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.7rem', color: '#666' }}>TURBIEDAD FINAL</p>
                                    <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{potability?.turbiedad_final} UNT</p>
                                </div>
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.7rem', color: '#666' }}>REMOCIÓN PATÓGENOS</p>
                                    <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{potability?.logs_patogenos} Logs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Standard Form View
                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Parámetros Base de Diseño</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <p><strong>Caudal QMD:</strong> {designFlowQMD} L/s</p>
                                {quality && (
                                    <>
                                        <p><strong>Turbiedad Fuente:</strong> {quality.turbidity || 'N/A'} UNT</p>
                                        <p><strong>Riesgo (Coli):</strong> {quality.coli_fecal || 'N/A'} UFC</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {fields.map(field => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                                        {field.label} {field.unit && `(${field.unit})`}
                                    </label>
                                    {field.type === 'select' ? (
                                        <select
                                            value={formData[field.key] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray-medium)' }}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray-medium)' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleSave} variant="primary" loading={isSaving}>
                        {isBalance ? 'Validar y Guardar Balance' : 'Guardar Dimensionamiento'}
                    </Button>
                </div>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey={moduleKey} />
        </div>
    );
}
