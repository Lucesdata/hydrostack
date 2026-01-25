"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ModuleWarning from '@/components/projects/ModuleWarning';
import ModuleNavigation from '@/components/projects/ModuleNavigation';
import {
    Project,
    ViabilityMatrixInputs,
    TechnologyViabilityResult,
    TreatmentCategory,
    CATEGORY_LABELS
} from '@/types/project';
import { ViabilityEngine } from '@/lib/viability-engine';

export default function ViabilityMatrixForm({ project }: { project: Project }) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [results, setResults] = useState<TechnologyViabilityResult[]>([]);
    const [selection, setSelection] = useState<TreatmentCategory | null>(project.treatment_category);

    const [formData, setFormData] = useState<ViabilityMatrixInputs>({
        settlement_type: 'rural_concentrado',
        population_range: 'medium',
        community_organization: 'medium',
        operator_availability: 'medium',
        energy_access: 'partial',
        chemical_access: 'medium',
        maintenance_capacity: 'medium',
        capex_tolerance: 'medium',
        opex_tolerance: 'medium',
        project_horizon: 20,
        source_quality: 'fair',
        climate_variability: 'medium',
        environmental_sensitivity: 'medium'
    });

    // Cargar datos existentes si hay
    useEffect(() => {
        const fetchMatrixData = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('project_viability_matrix')
                .select('*')
                .eq('project_id', project.id)
                .single();

            if (data) {
                const { id, project_id, results, created_at, updated_at, selected_technology, selection_reason, ...inputs } = data;
                setFormData(inputs as ViabilityMatrixInputs);
                if (selected_technology) setSelection(selected_technology as TreatmentCategory);
            }
            setLoading(false);
        };
        fetchMatrixData();
    }, [project.id, supabase]);

    // Recalcular resultados cuando cambia el form
    useEffect(() => {
        const scores = ViabilityEngine.calculateViability(project.project_domain, formData);
        setResults(scores.sort((a, b) => b.scores.global - a.scores.global));
    }, [formData, project.project_domain]);

    const handleChange = (name: keyof ViabilityMatrixInputs, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAndSelect = async (tech: TechnologyViabilityResult) => {
        setSaving(true);
        try {
            // 1. Persistir en la matriz
            const { error: matrixError } = await supabase
                .from('project_viability_matrix')
                .upsert({
                    project_id: project.id,
                    ...formData,
                    results,
                    selected_technology: tech.category,
                    updated_at: new Date().toISOString()
                });

            if (matrixError) throw matrixError;

            // 2. Actualizar el proyecto principal
            const { error: projectError } = await supabase
                .from('projects')
                .update({
                    treatment_category: tech.category,
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id);

            if (projectError) throw projectError;

            // 3. Reinicializar estados de módulos (para activar el nuevo flujo)
            // Nota: En un entorno real esto sería un trigger o una función de base de datos.
            // Aquí lo forzamos para que el sidebar se actualice.
            const { RecommendationEngine } = await import('@/lib/recommendation-engine');
            const newStatuses = RecommendationEngine.initializeModuleStatuses(
                project.id,
                project.project_domain,
                project.project_context,
                project.project_level,
                tech.category
            );

            // Eliminar estados viejos (para evitar conflictos de unique constraint si existieran)
            // O mejor usar upsert si la tabla lo permite. 
            // Para simplicidad en este paso, asumimos que RecommendationEngine.initializeModuleStatuses
            // se puede insertar. En producción usaríamos un RPC de Supabase.
            await supabase.from('project_module_status').delete().eq('project_id', project.id);
            await supabase.from('project_module_status').insert(newStatuses);

            setSelection(tech.category);
            router.refresh();
        } catch (err) {
            console.error('Error al guardar selección:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>⚙️ Analizando contexto...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-medium)' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                        Matriz de Viabilidad Tecnológica
                    </h2>
                    <p style={{ color: 'var(--color-gray-dark)', maxWidth: '800px', lineHeight: 1.6 }}>
                        Evalúe las condiciones de entorno para identificar la tecnología de tratamiento con mayor probabilidad de éxito y sostenibilidad.
                        Este análisis no sustituye el rigor del diseño hidráulico, sino que orienta la decisión estratégica inicial.
                    </p>
                </div>

                <ModuleWarning projectId={project.id} moduleKey="viability_matrix" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                    {/* COLUMNA 1: INPUTS DE CONTEXTO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        <Section title="🏘️ Contexto Social y Territorial">
                            <SelectField label="Tipo de Asentamiento" value={formData.settlement_type} onChange={v => handleChange('settlement_type', v)} options={[
                                { value: 'rural_disperso', label: 'Rural Disperso' },
                                { value: 'rural_concentrado', label: 'Rural Concentrado / Centro Poblado' },
                                { value: 'urbano', label: 'Urbano / Cabecera Municipal' },
                                { value: 'industrial', label: 'Industrial / Privatizado' }
                            ]} />
                            <SelectField label="Rango Poblacional" value={formData.population_range} onChange={v => handleChange('population_range', v)} options={[
                                { value: 'low', label: 'Bajo (< 500 hab)' },
                                { value: 'medium', label: 'Medio (500 - 5000 hab)' },
                                { value: 'high', label: 'Alto (> 5000 hab)' }
                            ]} />
                        </Section>

                        <Section title="🛠️ Contexto Técnico-Operativo">
                            <SelectField label="Acceso a Energía Eléctrica" value={formData.energy_access} onChange={v => handleChange('energy_access', v)} options={[
                                { value: 'none', label: 'Nulo (Solo gravedad)' },
                                { value: 'partial', label: 'Inestable / Parcial' },
                                { value: 'reliable', label: 'Confiable 24/7' }
                            ]} />
                            <SelectField label="Suministro de Insumos/Químicos" value={formData.chemical_access} onChange={v => handleChange('chemical_access', v)} options={[
                                { value: 'low', label: 'Difícil Acceso / Intermitente' },
                                { value: 'medium', label: 'Regular' },
                                { value: 'high', label: 'Garantizado' }
                            ]} />
                        </Section>

                        <Section title="💰 Contexto Económico">
                            <SelectField label="Tolerancia a Costos OpEx" value={formData.opex_tolerance} onChange={v => handleChange('opex_tolerance', v)} options={[
                                { value: 'low', label: 'Mínima (Subsidios limitados)' },
                                { value: 'medium', label: 'Moderada' },
                                { value: 'high', label: 'Alta (Suficiencia financiera)' }
                            ]} />
                        </Section>

                        <Section title="🌿 Contexto Ambiental">
                            <SelectField label="Calidad General de la Fuente" value={formData.source_quality} onChange={v => handleChange('source_quality', v)} options={[
                                { value: 'good', label: 'Buena (Baja carga orgánica/sólidos)' },
                                { value: 'fair', label: 'Regular' },
                                { value: 'poor', label: 'Mala (Alta variabilidad/contaminación)' }
                            ]} />
                        </Section>
                    </div>

                    {/* COLUMNA 2: RESULTADOS Y COMPARATIVA */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-gray-dark)', borderBottom: '2px solid var(--color-gray-light)', paddingBottom: '0.5rem' }}>
                            Estimación de Viabilidad por Tecnología
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.map(tech => (
                                <TechResultCard
                                    key={tech.category}
                                    tech={tech}
                                    isSelected={selection === tech.category}
                                    onSelect={() => handleSaveAndSelect(tech)}
                                    disabled={saving}
                                />
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--color-gray-dark)', border: '1px solid var(--color-gray-medium)' }}>
                            <p>💡 <strong>Nota sobre la decisión:</strong> Al seleccionar una tecnología, HydroStack activará los módulos técnicos correspondientes en su barra de navegación. Usted podrá cambiar esta decisión en cualquier momento si los cálculos de ingeniería demuestran otra viabilidad.</p>
                        </div>
                    </div>

                </div>
            </div>

            <ModuleNavigation projectId={project.id} currentModuleKey="viability_matrix" />
        </div>
    );
}

// --- COMPONENTES INTERNOS ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{children}</div>
        </div>
    );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: any[] }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray-medium)',
                    fontSize: '0.9rem',
                    backgroundColor: 'white'
                }}
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
}

function TechResultCard({ tech, isSelected, onSelect, disabled }: { tech: TechnologyViabilityResult; isSelected: boolean; onSelect: () => void; disabled: boolean }) {
    return (
        <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-gray-light)'}`,
            backgroundColor: isSelected ? 'rgba(34, 84, 131, 0.03)' : 'white',
            transition: 'all 0.2s',
            opacity: disabled ? 0.7 : 1
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h5 style={{ fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--color-foreground)', fontSize: '1rem' }}>{tech.name}</h5>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', textTransform: 'uppercase', fontWeight: 700 }}>Viabilidad Integral: {tech.scores.global}%</span>
                </div>
                <Button
                    onClick={onSelect}
                    variant={isSelected ? "primary" : "outline"}
                    disabled={disabled}
                >
                    {isSelected ? "Seleccionada ✓" : "Seleccionar"}
                </Button>
            </div>

            {/* Barras de puntaje */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', marginBottom: '1rem' }}>
                <ScoreBar label="Técnica" score={tech.scores.technical} />
                <ScoreBar label="Operativa" score={tech.scores.operational} />
                <ScoreBar label="Económica" score={tech.scores.economic} />
                <ScoreBar label="Ambiental" score={tech.scores.environmental} />
            </div>

            {/* Metadata (solo si está seleccionada o con alto score) */}
            {(isSelected || tech.scores.global > 60) && (
                <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                    <MetadataList title="Fortalezas" items={tech.metadata.strengths} color="#15803D" />
                    <MetadataList title="Limitaciones" items={tech.metadata.limitations} color="#B91C1C" />
                </div>
            )}
        </div>
    );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    const color = score > 80 ? '#15803D' : score > 50 ? '#1D4ED8' : '#B45309';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-gray-dark)' }}>
                <span>{label}</span>
                <span>{score}%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--color-gray-light)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score}%`, backgroundColor: color, transition: 'width 0.5s ease' }} />
            </div>
        </div>
    );
}

function MetadataList({ title, items, color }: { title: string; items: string[]; color: string }) {
    return (
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{title}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.slice(0, 2).map((item, i) => (
                    <li key={i} style={{ fontSize: '0.75rem', color: 'var(--color-gray-dark)', display: 'flex', gap: '0.3rem' }}>
                        <span>•</span> {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
