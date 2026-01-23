"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    ProjectDomain,
    ProjectContext,
    ProjectLevel,
    TreatmentCategory
} from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

export default function NewProjectPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Diagrama de decisión
        project_domain: 'water_treatment' as ProjectDomain,
        project_context: 'rural' as ProjectContext,
        project_level: 'complete_design' as ProjectLevel,
        treatment_category: null as TreatmentCategory | null,

        // Información general
        name: '',
        description: '',
        location: '',

        // Metadata
        estimated_population: '',
        estimated_flow: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();
    const { user } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        // Validaciones por paso
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            setStep(5);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            setError('El nombre del proyecto es obligatorio');
            return;
        }
        if (!user) {
            setError('Debe iniciar sesión para crear un proyecto');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Crear proyecto
            const { data: project, error: insertError } = await supabase
                .from('projects')
                .insert([
                    {
                        user_id: user.id,
                        name: formData.name,
                        description: formData.description,
                        location: formData.location,
                        project_domain: formData.project_domain,
                        project_context: formData.project_context,
                        project_level: formData.project_level,
                        treatment_category: formData.treatment_category,
                        decision_metadata: {
                            estimated_population: formData.estimated_population || null,
                            estimated_flow: formData.estimated_flow || null,
                            wizard_completed_at: new Date().toISOString()
                        },
                        status: 'Borrador'
                    }
                ])
                .select()
                .single();

            if (insertError) throw insertError;

            // 2. Inicializar estados de módulos
            if (project) {
                const moduleStatuses = RecommendationEngine.initializeModuleStatuses(
                    project.id,
                    formData.project_domain,
                    formData.project_context,
                    formData.project_level,
                    formData.treatment_category
                );

                const { error: statusError } = await supabase
                    .from('project_module_status')
                    .insert(moduleStatuses);

                if (statusError) console.error('Error al inicializar módulos:', statusError);

                // 3. Redirigir al proyecto
                router.push(`/dashboard/projects/${project.id}/general`);
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        Nuevo Proyecto
                    </h1>
                    <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>
                        Paso {step} de 5 — Diagrama de Decisión
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{
                    height: '4px',
                    backgroundColor: 'var(--color-gray-light)',
                    borderRadius: '2px',
                    marginBottom: '2rem',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        width: `${(step / 5) * 100}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#FEE2E2',
                        color: 'var(--color-error)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* PASO 1: DOMINIO DEL SISTEMA */}
                    {step === 1 && (
                        <StepDomain
                            value={formData.project_domain}
                            onChange={(value) => setFormData({ ...formData, project_domain: value })}
                        />
                    )}

                    {/* PASO 2: CONTEXTO DEL PROYECTO */}
                    {step === 2 && (
                        <StepContext
                            domain={formData.project_domain}
                            value={formData.project_context}
                            onChange={(value) => setFormData({ ...formData, project_context: value })}
                        />
                    )}

                    {/* PASO 3: NIVEL DEL PROYECTO */}
                    {step === 3 && (
                        <StepLevel
                            value={formData.project_level}
                            onChange={(value) => setFormData({ ...formData, project_level: value })}
                        />
                    )}

                    {/* PASO 4: CATEGORÍA DE TRATAMIENTO */}
                    {step === 4 && (
                        <StepTreatmentCategory
                            domain={formData.project_domain}
                            value={formData.treatment_category}
                            onChange={(value) => setFormData({ ...formData, treatment_category: value })}
                        />
                    )}

                    {/* PASO 5: INFORMACIÓN GENERAL */}
                    {step === 5 && (
                        <StepGeneralInfo
                            formData={formData}
                            onChange={handleChange}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={step === 1 ? () => router.push('/dashboard') : handleBack}
                        >
                            {step === 1 ? 'Cancelar' : '← Anterior'}
                        </Button>

                        {step < 5 ? (
                            <Button type="button" onClick={handleNext}>
                                Continuar →
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Proyecto'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTES DE CADA PASO
// ============================================

function StepDomain({ value, onChange }: {
    value: ProjectDomain;
    onChange: (value: ProjectDomain) => void
}) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                1. Dominio del Sistema
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿Qué tipo de sistema de agua vas a diseñar?
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <RadioCard
                    name="domain"
                    value="water_treatment"
                    checked={value === 'water_treatment'}
                    onChange={() => onChange('water_treatment')}
                    title="💧 Agua Potable"
                    description="Tratamiento de agua cruda para consumo humano. Incluye captación, potabilización y distribución."
                />
                <RadioCard
                    name="domain"
                    value="wastewater_treatment"
                    checked={value === 'wastewater_treatment'}
                    onChange={() => onChange('wastewater_treatment')}
                    title="♻️ Aguas Residuales"
                    description="Tratamiento de aguas servidas domésticas, industriales o mixtas antes de disposición final."
                />
            </div>
        </div>
    );
}

function StepContext({ domain, value, onChange }: {
    domain: ProjectDomain;
    value: ProjectContext;
    onChange: (value: ProjectContext) => void
}) {
    const contexts = [
        {
            value: 'rural',
            title: '🏡 Rural',
            description: 'Acueductos rurales, comunidades pequeñas. Énfasis en simplicidad operativa.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'urban',
            title: '🏙️ Urbano',
            description: 'Sistemas municipales, ciudades. Énfasis en continuidad y redundancia.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'residential',
            title: '🏘️ Residencial / Privado',
            description: 'Viviendas, condominios, fincas privadas.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'industrial',
            title: '🏭 Industrial',
            description: 'Empresas, plantas industriales.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'desalination',
            title: '🌊 Desalinización',
            description: 'Tratamiento de agua salobre o marina mediante ósmosis inversa.',
            applicableTo: ['water_treatment']
        }
    ];

    const applicableContexts = contexts.filter(c => c.applicableTo.includes(domain));

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                2. Contexto del Proyecto
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿En qué contexto se desarrollará el proyecto?
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {applicableContexts.map(context => (
                    <RadioCard
                        key={context.value}
                        name="context"
                        value={context.value}
                        checked={value === context.value as ProjectContext}
                        onChange={() => onChange(context.value as ProjectContext)}
                        title={context.title}
                        description={context.description}
                    />
                ))}
            </div>
        </div>
    );
}

function StepLevel({ value, onChange }: {
    value: ProjectLevel;
    onChange: (value: ProjectLevel) => void
}) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                3. Nivel del Proyecto
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿Qué nivel de detalle requiere tu proyecto?
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <RadioCard
                    name="level"
                    value="preliminary_assessment"
                    checked={value === 'preliminary_assessment'}
                    onChange={() => onChange('preliminary_assessment')}
                    title="📋 Evaluación Preliminar"
                    description="Estudio de factibilidad. Módulos técnicos simplificados."
                />
                <RadioCard
                    name="level"
                    value="complete_design"
                    checked={value === 'complete_design'}
                    onChange={() => onChange('complete_design')}
                    title="📐 Diseño Técnico Completo"
                    description="Diseño detallado para construcción."
                />
            </div>
        </div>
    );
}

function StepTreatmentCategory({ domain, value, onChange }: {
    domain: ProjectDomain;
    value: TreatmentCategory | null;
    onChange: (value: TreatmentCategory | null) => void
}) {
    if (domain !== 'water_treatment') {
        return (
            <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                    4. Categoría de Tratamiento
                </h2>
                <div style={{ padding: '2rem', backgroundColor: 'var(--color-gray-light)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-gray-dark)' }}>ℹ️ Para este sistema, la tecnología se define en módulos posteriores.</p>
                </div>
            </div>
        );
    }

    const categories = [
        { value: 'fime', title: '🔄 FIME', description: 'Filtración en Múltiples Etapas.' },
        { value: 'compact_plant', title: '⚗️ Planta Compacta', description: 'Coagulación + Filtración rápida.' },
        { value: 'specific_plant', title: '🛠️ Planta Específica', description: 'Diseño customizado.' },
        { value: 'desalination_high_purity', title: '💎 Alta Pureza', description: 'Ósmosis inversa o procesos avanzados.' }
    ];

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                4. Categoría de Tratamiento
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {categories.map(category => (
                    <RadioCard
                        key={category.value}
                        name="category"
                        value={category.value}
                        checked={value === category.value as TreatmentCategory}
                        onChange={() => onChange(category.value as TreatmentCategory)}
                        title={category.title}
                        description={category.description}
                    />
                ))}
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    style={{ padding: '1rem', border: `2px solid ${value === null ? 'var(--color-primary)' : 'var(--color-gray-medium)'}`, borderRadius: 'var(--radius-sm)', background: value === null ? 'rgba(34, 84, 131, 0.05)' : 'white', cursor: 'pointer', textAlign: 'left' }}
                >
                    <div style={{ fontWeight: 600 }}>⏭️ Aún no lo sé</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>Podrás definirlo después.</div>
                </button>
            </div>
        </div>
    );
}

function StepGeneralInfo({ formData, onChange }: { formData: any; onChange: any }) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                5. Información General
            </h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Input id="name" name="name" label="Nombre del Proyecto *" value={formData.name} onChange={onChange} required />
                <div className="input-group">
                    <label className="label">Descripción</label>
                    <textarea id="description" name="description" className="input" value={formData.description} onChange={onChange} rows={3} style={{ fontFamily: 'inherit' }} />
                </div>
                <Input id="location" name="location" label="Ubicación" value={formData.location} onChange={onChange} />

                <Input id="estimated_population" name="estimated_population" label="Población Estimada (opcional)" type="number" value={formData.estimated_population} onChange={onChange} />
                <Input id="estimated_flow" name="estimated_flow" label="Caudal Estimado (L/s) (opcional)" type="number" step="0.01" value={formData.estimated_flow} onChange={onChange} />
            </div>
        </div>
    );
}

function RadioCard({ name, value, checked, onChange, title, description }: any) {
    return (
        <label style={{ display: 'block', padding: '1.25rem', border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-gray-medium)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: checked ? 'rgba(34, 84, 131, 0.05)' : 'white' }}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ marginRight: '1rem' }} />
            <div style={{ display: 'inline-block', verticalAlign: 'top', maxWidth: 'calc(100% - 3rem)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>{title}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>{description}</div>
            </div>
        </label>
    );
}
