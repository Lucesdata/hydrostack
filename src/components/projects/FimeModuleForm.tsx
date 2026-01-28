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
    quality?: any;
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
    const [showSuggestion, setShowSuggestion] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Auto-calculate suggestions using CINARA methodology
    useEffect(() => {
        if (designFlowQMD) {
            const rule = FimeEngine.getSizingRules(moduleKey, designFlowQMD, quality || {});
            setSuggestion(rule);
        }
    }, [moduleKey, designFlowQMD, quality]);

    const handleApplySuggestion = () => {
        if (suggestion) {
            setFormData({ ...formData, ...suggestion });
            setShowSuggestion(false);
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

    const isBalance = moduleKey === 'fime_balance_masas';
    const potability = isBalance && suggestion ? suggestion : null;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid var(--color-gray-medium)',
                marginBottom: '1.5rem'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        {title}
                    </h2>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-gray-dark)',
                        lineHeight: 1.5
                    }}>
                        {description}
                    </p>
                </div>

                {/* Info Chips */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.8125rem',
                    color: 'var(--color-gray-dark)',
                    flexWrap: 'wrap'
                }}>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'var(--color-gray-light)',
                        borderRadius: '12px',
                        fontWeight: 500
                    }}>
                        QMD: {designFlowQMD} L/s
                    </span>
                    {quality?.turbidity && (
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'var(--color-gray-light)',
                            borderRadius: '12px',
                            fontWeight: 500
                        }}>
                            Turbiedad: {quality.turbidity} UNT
                        </span>
                    )}
                    {quality?.irca_score && (
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: quality.irca_score > 80 ? '#fecaca' : '#bbf7d0',
                            borderRadius: '12px',
                            fontWeight: 500,
                            color: quality.irca_score > 80 ? '#991b1b' : '#166534'
                        }}>
                            IRCA: {quality.irca_score.toFixed(0)}%
                        </span>
                    )}
                </div>

                <ModuleWarning projectId={projectId} moduleKey={moduleKey} />

                {/* Suggestion Link */}
                {suggestion && !isBalance && (
                    <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-gray-light)' }}>
                        <button
                            onClick={() => setShowSuggestion(!showSuggestion)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0
                            }}
                        >
                            {showSuggestion ? '▼' : '▶'} Ver sugerencia técnica (CINARA)
                        </button>
                        {showSuggestion && (
                            <div style={{
                                marginTop: '0.75rem',
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                border: '1px solid #bae6fd',
                                fontSize: '0.875rem'
                            }}>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <strong>Valores calculados según normativa:</strong>
                                </div>
                                {Object.entries(suggestion).map(([key, value]) => (
                                    <div key={key} style={{ marginBottom: '0.25rem' }}>
                                        {key}: <strong>{String(value)}</strong>
                                    </div>
                                ))}
                                <Button
                                    onClick={handleApplySuggestion}
                                    variant="primary"
                                    style={{ marginTop: '0.75rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                >
                                    Aplicar sugerencia
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Balance View (Special) */}
                {isBalance ? (
                    <div style={{ padding: '2rem', backgroundColor: potability?.cumple_normatividad ? '#ecfdf5' : '#fff1f2', borderRadius: '8px', border: potability?.cumple_normatividad ? '2px solid #10b981' : '2px solid #f43f5e', textAlign: 'center', marginTop: '1.5rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{potability?.cumple_normatividad ? '🛡️' : '⚠️'}</div>
                        <h3 style={{ fontWeight: 800, color: potability?.cumple_normatividad ? '#065f46' : '#991b1b', textTransform: 'uppercase', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                            {potability?.cumple_normatividad ? 'Sistema Conforme' : 'Requiere Ajuste'}
                        </h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#374151' }}>{potability?.observacion}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
                                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>TURBIEDAD FINAL</p>
                                <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{potability?.turbiedad_final} UNT</p>
                            </div>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
                                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>REMOCIÓN PATÓGENOS</p>
                                <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{potability?.logs_patogenos} Logs</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Form Fields */
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-light)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {fields.map(field => (
                                <div key={field.key}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        marginBottom: '0.5rem',
                                        color: 'var(--color-text-on-white)'
                                    }}>
                                        {field.label} {field.unit && <span style={{ color: 'var(--color-gray-dark)', fontWeight: 400 }}>({field.unit})</span>}
                                    </label>

                                    {field.type === 'select' ? (
                                        /* Mini-Cards Grid for Selects */
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: field.options && field.options.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
                                            gap: '0.75rem'
                                        }}>
                                            {field.options?.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, [field.key]: opt })}
                                                    style={{
                                                        padding: '0.875rem',
                                                        border: formData[field.key] === opt ? '2px solid var(--color-primary)' : '2px solid var(--color-gray-medium)',
                                                        borderRadius: '6px',
                                                        backgroundColor: formData[field.key] === opt ? '#f0f9ff' : 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        fontWeight: formData[field.key] === opt ? 600 : 400,
                                                        color: formData[field.key] === opt ? 'var(--color-primary)' : 'var(--color-text-on-white)',
                                                        transition: 'all 0.15s ease',
                                                        textAlign: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (formData[field.key] !== opt) {
                                                            e.currentTarget.style.borderColor = '#93c5fd';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (formData[field.key] !== opt) {
                                                            e.currentTarget.style.borderColor = 'var(--color-gray-medium)';
                                                        }
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Number/Text Inputs */
                                        <input
                                            type={field.type}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                [field.key]: field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--color-gray-medium)',
                                                fontSize: '1rem',
                                                color: 'var(--color-text-on-white)',
                                                backgroundColor: 'white',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.outline = 'none';
                                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--color-gray-medium)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-light)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleSave} variant="primary" loading={isSaving}>
                        {isBalance ? 'Validar Balance' : 'Guardar Dimensionamiento'}
                    </Button>
                </div>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey={moduleKey} />
        </div>
    );
}
