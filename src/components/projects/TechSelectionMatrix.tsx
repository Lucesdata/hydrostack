"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';

type Criteria = {
    conventional: number;
    compact: number;
};

interface TechMatrixData {
    criteria_efficiency: Criteria;
    criteria_maintenance: Criteria;
    criteria_construction: Criteria;
    criteria_total_cost: Criteria;
    criteria_unit_cost: Criteria;
    selected_tech: string;
    justification: string;
}

export default function TechSelectionMatrix({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<TechMatrixData>({
        criteria_efficiency: { conventional: 4, compact: 5 },
        criteria_maintenance: { conventional: 5, compact: 2 },
        criteria_construction: { conventional: 3, compact: 5 },
        criteria_total_cost: { conventional: 3, compact: 4 },
        criteria_unit_cost: { conventional: 4, compact: 3 },
        selected_tech: 'compact',
        justification: ''
    });

    useEffect(() => {
        async function loadData() {
            const { data } = await supabase
                .from('project_tech_matrix')
                .select('*')
                .eq('project_id', projectId)
                .maybeSingle();

            if (data) {
                setFormData({
                    criteria_efficiency: (data.criteria_efficiency as Criteria) || { conventional: 4, compact: 5 },
                    criteria_maintenance: (data.criteria_maintenance as Criteria) || { conventional: 5, compact: 2 },
                    criteria_construction: (data.criteria_construction as Criteria) || { conventional: 3, compact: 5 },
                    criteria_total_cost: (data.criteria_total_cost as Criteria) || { conventional: 3, compact: 4 },
                    criteria_unit_cost: (data.criteria_unit_cost as Criteria) || { conventional: 4, compact: 3 },
                    selected_tech: data.selected_tech,
                    justification: data.justification || ''
                });
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    const handleRatingChange = (criteria: keyof TechMatrixData, tech: 'conventional' | 'compact', value: number) => {
        const currentCriteria = formData[criteria] as Criteria;
        setFormData(prev => ({
            ...prev,
            [criteria]: { ...currentCriteria, [tech]: value }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('project_tech_matrix')
            .upsert({
                project_id: projectId,
                ...formData,
                updated_at: new Date().toISOString()
            });

        setSaving(false);
        if (!error) {
            router.push(`/dashboard/projects/${projectId}/report`);
        }
    };

    const calculateScore = (tech: 'conventional' | 'compact') => {
        return (
            formData.criteria_efficiency[tech] +
            formData.criteria_maintenance[tech] +
            formData.criteria_construction[tech] +
            formData.criteria_total_cost[tech] +
            formData.criteria_unit_cost[tech]
        );
    };

    if (loading) return <div>Cargando matriz...</div>;

    const criteriaList: Array<{ key: keyof TechMatrixData; label: string; desc: string }> = [
        { key: 'criteria_efficiency', label: 'Eficiencia de Remoción', desc: '1: Básica, 5: Muy Alta' },
        { key: 'criteria_maintenance', label: 'Operación y Mantenimiento', desc: '1: Completo/Diario, 5: Muy Fácil' },
        { key: 'criteria_construction', label: 'Facilidad de Construcción', desc: '1: Obra Civil Pesada, 5: Modular/Rápido' },
        { key: 'criteria_total_cost', label: 'Costo Total (CAPEX)', desc: '1: Muy Costoso, 5: Económico' },
        { key: 'criteria_unit_cost', label: 'Costo/m³ (OpEx)', desc: '1: Alto Consumo Químico, 5: Bajo Costo Producción' }
    ];

    return (
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Matriz de Selección de Tecnología</h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '2rem' }}>Compare opciones para el sistema de tratamiento según criterios de ingeniería RAS 0330.</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-gray-medium)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Criterio</th>
                            <th style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)' }}>Convencional (Filtro Lento)</th>
                            <th style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--color-primary-light)' }}>Compacta (PRFV / High Rate)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {criteriaList.map((c) => {
                            const criteriaData = formData[c.key] as Criteria;
                            return (
                                <tr key={c.key} style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <strong>{c.label}</strong>
                                        <br /><small style={{ color: 'var(--color-gray-medium)' }}>{c.desc}</small>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)' }}>
                                        <input
                                            type="range" min="1" max="5"
                                            value={criteriaData.conventional}
                                            onChange={(e) => handleRatingChange(c.key, 'conventional', parseInt(e.target.value))}
                                            style={{ width: '100px' }}
                                        />
                                        <span style={{ marginLeft: '1rem', fontWeight: 600 }}>{criteriaData.conventional}</span>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--color-primary-light)' }}>
                                        <input
                                            type="range" min="1" max="5"
                                            value={criteriaData.compact}
                                            onChange={(e) => handleRatingChange(c.key, 'compact', parseInt(e.target.value))}
                                            style={{ width: '100px' }}
                                        />
                                        <span style={{ marginLeft: '1rem', fontWeight: 600 }}>{criteriaData.compact}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        <tr style={{ backgroundColor: 'var(--color-gray-light)', fontWeight: 800 }}>
                            <td style={{ padding: '1rem' }}>PUNTAJE TOTAL</td>
                            <td style={{ textAlign: 'center', padding: '1rem' }}>{calculateScore('conventional')} / 20</td>
                            <td style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-primary)' }}>{calculateScore('compact')} / 20</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Selección Definitiva</label>
                <select
                    value={formData.selected_tech}
                    onChange={(e) => setFormData({ ...formData, selected_tech: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-gray-medium)' }}
                >
                    <option value="conventional">Tratamiento Convencional (Sedimentación + Filtros Lentos)</option>
                    <option value="compact">Planta Compacta Integrada (Mezcla + Floculación + Lamelas + Filtro Mixto)</option>
                    <option value="other">Otra Tecnología Especializada</option>
                </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Justificación Técnica</label>
                <textarea
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Explique por qué se selecciona esta tecnología para este contexto rural específico..."
                    style={{ width: '100%', minHeight: '120px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-gray-medium)' }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button onClick={() => router.back()} variant="outline">Volver</Button>
                <Button onClick={handleSave} variant="primary" loading={saving}>
                    Finalizar Auditoría y Generar Informe
                </Button>
            </div>
        </div>
    );
}
