"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const TREATMENT_TECH = [
    { id: 'desarenador', name: 'Desarenador', description: 'Remoción de partículas gruesas (arena, gravilla).' },
    { id: 'mezcla_rapida', name: 'Mezcla Rápida', description: 'Adición de coagulantes para desestabilizar partículas.' },
    { id: 'floculador', name: 'Floculador', description: 'Formación de flóculos (partículas más grandes).' },
    { id: 'sedimentador', name: 'Sedimentador', description: 'Remoción de flóculos por gravedad.' },
    { id: 'fime', name: 'FIME (Filtración en Múltiples Etapas)', description: 'Proceso biológico y físico de alta eficiencia.' },
    { id: 'lecho_filtrante', name: 'Filtración Lenta en Arena', description: 'Pulido final y remoción bacteriológica.' },
    { id: 'cloracion', name: 'Desinfección (Cloro)', description: 'Eliminación de microorganismos patógenos.' }
];

export default function TreatmentForm({
    projectId,
    initialData,
    qualityData,
    qmd_lps
}: {
    projectId: string;
    initialData: any;
    qualityData: any;
    qmd_lps: number;
}) {
    const [selectedTech, setSelectedTech] = useState<string[]>(initialData?.treatment_train || []);
    const [chlorinationType, setChlorinationType] = useState(initialData?.chlorination_type || 'Tabletas (Goteo)');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [recommendations, setRecommendations] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Simple recommendation logic
        const recs = [];
        if (qualityData?.perceived_problems?.includes('Turbiedad') || qualityData?.perceived_problems?.includes('Color')) {
            recs.push('desarenador', 'fime', 'lecho_filtrante', 'cloracion');
        } else if (qualityData?.has_pollution_sources === 'Sí') {
            recs.push('lecho_filtrante', 'cloracion');
        } else {
            recs.push('cloracion');
        }
        setRecommendations(recs);

        // Auto-select if empty
        if (selectedTech.length === 0 && recs.length > 0) {
            setSelectedTech(recs);
        }
    }, [qualityData, selectedTech.length]);

    const toggleTech = (techId: string) => {
        if (selectedTech.includes(techId)) {
            setSelectedTech(selectedTech.filter(id => id !== techId));
        } else {
            setSelectedTech([...selectedTech, techId]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: upsertError } = await supabase
                .from('project_treatment')
                .upsert({
                    project_id: projectId,
                    treatment_train: selectedTech,
                    chlorination_type: chlorinationType,
                    design_flow: qmd_lps,
                    notes: notes,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage('Configuración de tratamiento guardada con éxito.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el tratamiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Selección de Tecnologías
                </h2>

                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {TREATMENT_TECH.map((tech) => (
                            <div
                                key={tech.id}
                                onClick={() => toggleTech(tech.id)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${selectedTech.includes(tech.id) ? 'var(--color-primary)' : 'var(--color-gray-medium)'}`,
                                    backgroundColor: selectedTech.includes(tech.id) ? 'var(--color-bg-secondary)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontWeight: 600, color: selectedTech.includes(tech.id) ? 'var(--color-primary)' : 'inherit' }}>{tech.name}</h4>
                                    {recommendations.includes(tech.id) && (
                                        <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>RECOMENDADO</span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)', marginTop: '0.25rem' }}>{tech.description}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label className="label">Tipo de Desinfección</label>
                        <select
                            className="input"
                            value={chlorinationType}
                            onChange={(e) => setChlorinationType(e.target.value)}
                        >
                            <option>Tabletas (Goteo)</option>
                            <option>Gas Cloro</option>
                            <option>Hipoclorito Líquido</option>
                            <option>Generación in-situ</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="label">Notas Adicionales</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Mencione detalles sobre el terreno o requisitos especiales..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Tratamiento'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/report`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Finalizar Proyecto →
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-light)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '0.5rem' }}>
                    Resumen del Tren
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedTech.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedTech.map((techId, index) => (
                                <div key={techId} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 800
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1, backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gray-medium)' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{TREATMENT_TECH.find(t => t.id === techId)?.name}</p>
                                    </div>
                                    {index < selectedTech.length - 1 && (
                                        <div style={{ textAlign: 'center', color: 'var(--color-gray-dark)' }}>↓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-gray-dark)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                            Seleccione al menos una tecnología para visualizar el tren de tratamiento.
                        </p>
                    )}

                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary-light)' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-dark)', marginBottom: '0.5rem' }}>DIAGNÓSTICO RÁPIDO</p>
                        <p style={{ fontSize: '0.85rem' }}>
                            {qualityData?.has_analysis === 'No' ? '⚠ No cuenta con análisis físico-químico formal. Se recomienda PTAP completa por seguridad.' : '✓ Análisis disponible para refinamiento de diseño.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
