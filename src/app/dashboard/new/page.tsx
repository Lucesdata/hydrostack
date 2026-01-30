"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    ProjectDomain,
    ProjectContext,
    ProjectLevel,
    TreatmentCategory,
    DOMAIN_LABELS,
    CONTEXT_LABELS,
    LEVEL_LABELS,
    CATEGORY_LABELS,
    ViabilityMatrixInputs,
    TechnologyViabilityResult
} from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import { ViabilityEngine } from '@/lib/viability-engine';

export default function NewProjectPage() {
    const [flowStage, setFlowStage] = useState(0); // 0: Intent, 1: Domain, 2: Wizard
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        project_domain: 'water_treatment' as ProjectDomain,
        project_context: 'rural' as ProjectContext,
        project_level: 'complete_design' as ProjectLevel,
        treatment_category: null as TreatmentCategory | null,
        name: '',
        description: '',
        location: '',
        // Matrix Inputs
        settlement_type: 'rural_concentrado' as ViabilityMatrixInputs['settlement_type'],
        population_range: 'medium' as ViabilityMatrixInputs['population_range'],
        community_organization: 'medium' as ViabilityMatrixInputs['community_organization'],
        operator_availability: 'medium' as ViabilityMatrixInputs['operator_availability'],
        energy_access: 'partial' as ViabilityMatrixInputs['energy_access'],
        chemical_access: 'medium' as ViabilityMatrixInputs['chemical_access'],
        maintenance_capacity: 'medium' as ViabilityMatrixInputs['maintenance_capacity'],
        capex_tolerance: 'medium' as ViabilityMatrixInputs['capex_tolerance'],
        opex_tolerance: 'medium' as ViabilityMatrixInputs['opex_tolerance'],
        project_horizon: 20,
        source_quality: 'fair' as ViabilityMatrixInputs['source_quality'],
        climate_variability: 'medium' as ViabilityMatrixInputs['climate_variability'],
        environmental_sensitivity: 'medium' as ViabilityMatrixInputs['environmental_sensitivity']
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
        if (step === 1) {
            if (!formData.name) {
                setError('El nombre del proyecto es obligatorio para continuar');
                return;
            }
            setError('');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            if (!formData.treatment_category) {
                setError('Seleccione una tecnología para continuar');
                return;
            }
            setError('');
            setStep(6);
        }
    };

    const handleBack = () => {
        setError('');
        if (step > 1) setStep(step - 1);
        else setFlowStage(1);
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
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
            // 1. Create Project
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
                            wizard_completed_at: new Date().toISOString()
                        },
                        status: 'Borrador'
                    }
                ])
                .select()
                .single();

            if (insertError) throw insertError;

            if (project) {
                // 2. Create Viability Matrix Persistence
                const {
                    project_domain, project_context, project_level, treatment_category,
                    name, description, location, ...matrixInputs
                } = formData;

                const results = ViabilityEngine.calculateViability(formData.project_domain, matrixInputs as ViabilityMatrixInputs);

                await supabase.from('project_viability_matrix').insert({
                    project_id: project.id,
                    ...matrixInputs,
                    results,
                    selected_technology: formData.treatment_category
                });

                // 3. Initialize Module Statuses
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
                router.push(`/dashboard/projects/${project.id}/general`);
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERS ---

    if (flowStage === 0) {
        return (
            <div className="container" style={{ maxWidth: '1000px', padding: '4rem 1rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    {/* Card 1: Nuevo Proyecto */}
                    <IntentCard
                        title="Nuevo Proyecto"
                        description="Inicia tu diseño técnico desde cero con asistencia paso a paso."
                        buttonText="Iniciar proyecto"
                        onClick={() => setFlowStage(1)}
                        primary
                    />

                    {/* Card 2: Gemelo Digital */}
                    <IntentCard
                        title="Gemelo Digital"
                        description="Simulación y monitoreo en tiempo real de sistemas operativos."
                        badge="Próximamente"
                        disabled
                    />

                    {/* Card 3: Asistencia Social y Admin */}
                    <IntentCard
                        title="Asistencia Social y Admin."
                        description="Soporte en aspectos sociales, normativos y administrativos."
                        badge="Próximamente"
                        disabled
                    />

                    {/* Card 4: Mis Proyectos */}
                    <IntentCard
                        title="Mis Proyectos"
                        description="Accede a tu portafolio de proyectos existentes y continúa trabajando."
                        buttonText="Ir al Dashboard"
                        onClick={() => router.push('/dashboard')}
                        primary
                    />
                </div>
            </div>
        );
    }

    if (flowStage === 1) {
        return (
            <div className="container" style={{ maxWidth: '1000px', padding: '4rem 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Dominio del Proyecto</h1>
                    <p style={{ color: 'var(--color-gray-dark)', fontSize: '1.1rem' }}>Selecciona el campo de aplicación de tu nuevo diseño técnico.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <IntentCard
                        title="Agua potable"
                        description="Diseño y evaluación de sistemas de abastecimiento y tratamiento de agua para consumo humano. Incluye proyectos rurales, urbanos, institucionales, plantas compactas, sistemas FIME y desalinización, bajo normativas técnicas vigentes."
                        buttonText="Continuar"
                        onClick={() => {
                            setFormData({ ...formData, project_domain: 'water_treatment' });
                            setFlowStage(2);
                        }}
                        primary
                    />
                    <IntentCard
                        title="Agua residual doméstica"
                        description="Diseño conceptual y técnico de sistemas de tratamiento para aguas residuales de origen doméstico. Aplicable a comunidades, conjuntos residenciales y sistemas descentralizados."
                        buttonText="Continuar"
                        badge="En preparación"
                        disabled
                    />
                    <IntentCard
                        title="Agua residual industrial"
                        description="Evaluación y tratamiento de efluentes industriales con características físico-químicas especiales. Incluye procesos avanzados, cumplimiento normativo y análisis de viabilidad técnica."
                        buttonText="Continuar"
                        badge="En preparación"
                        disabled
                    />
                </div>
                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <Button variant="outline" onClick={() => setFlowStage(0)}>← Atrás</Button>
                </div>
            </div>
        );
    }

    // Wizard Stage
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1rem', color: 'var(--color-text-on-white)' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        Diseño Técnico: Agua Potable
                    </h1>
                    <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>
                        Paso {step} de 6 — Configuración de Ingeniería
                    </p>
                </div>

                <div style={{ height: '4px', backgroundColor: 'var(--color-gray-light)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: `${(step / 6) * 100}%`, transition: 'width 0.3s ease' }} />
                </div>

                {error && (
                    <div
                        onClick={() => {
                            if (error.includes('nombre')) setStep(1);
                            if (error.includes('tecnología')) setStep(5);
                        }}
                        style={{
                            backgroundColor: '#FEE2E2',
                            color: 'var(--color-error)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            cursor: (error.includes('nombre') || error.includes('tecnología')) ? 'pointer' : 'default',
                            border: '1px solid var(--color-error)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                        {(error.includes('nombre') || error.includes('tecnología')) && (
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                textDecoration: 'underline'
                            }}>
                                Reparar ahora →
                            </span>
                        )}
                    </div>
                )}

                <form onSubmit={handleFinalSubmit}>
                    {step === 1 && <StepGeneralInfo formData={formData} onChange={handleChange} />}
                    {step === 2 && <StepContextAndLevel
                        context={formData.project_context}
                        level={formData.project_level}
                        onChange={(context: ProjectContext, level: ProjectLevel) => setFormData({ ...formData, project_context: context, project_level: level })}
                    />}
                    {step === 3 && <StepSocialTechnical formData={formData} onChange={(name: string, value: any) => setFormData({ ...formData, [name]: value })} />}
                    {step === 4 && <StepEconomicEnvironmental formData={formData} onChange={(name: string, value: any) => setFormData({ ...formData, [name]: value })} />}
                    {step === 5 && <StepTechnologySelection
                        domain={formData.project_domain}
                        formData={formData}
                        value={formData.treatment_category}
                        onChange={(v: TreatmentCategory | null) => setFormData({ ...formData, treatment_category: v })}
                    />}
                    {step === 6 && <StepReview formData={formData} />}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <Button type="button" variant="secondary" onClick={step === 1 ? () => setFlowStage(1) : handleBack}>
                            {step === 1 ? '← Atrás' : '← Anterior'}
                        </Button>
                        {step < 6 ? (
                            <Button type="button" onClick={handleNext}>Continuar →</Button>
                        ) : (
                            <Button type="submit" disabled={loading}>{loading ? 'Iniciando...' : 'Confirmar e Iniciar Ingeniería'}</Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function IntentCard({ title, description, buttonText, onClick, disabled, badge, primary }: any) {
    return (
        <div style={{
            padding: '2.5rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: primary ? '2px solid var(--color-primary)' : '1px solid var(--color-gray-medium)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            opacity: disabled ? 0.7 : 1,
            position: 'relative',
            transition: 'transform 0.2s ease-in-out'
        }}>
            {badge && (
                <span style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    border: '1px solid #e5e7eb'
                }}>
                    {badge}
                </span>
            )}
            <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: primary ? 'var(--color-primary)' : 'var(--color-text-on-white)' }}>{title}</h3>
                <p style={{ color: 'var(--color-gray-dark)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{description}</p>
            </div>
            {buttonText && (
                <Button
                    onClick={onClick}
                    disabled={disabled}
                    variant={primary ? 'primary' : 'outline'}
                    style={{ width: '100%' }}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
}

function StepDomain({ value, onChange }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Confirmar Dominio</h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>Has seleccionado el dominio de Agua Potable.</p>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <RadioCard name="domain" value="water_treatment" checked={value === 'water_treatment'} onChange={() => onChange('water_treatment')} title="💧 Agua Potable" description="Sistemas de abastecimiento y tratamiento para consumo humano." />
            </div>
        </div>
    );
}

function StepContextAndLevel({ context, level, onChange }: any) {
    const contexts = [
        { value: 'rural', title: '🏡 Rural', description: 'Acueductos rurales, comunidades pequeñas.' },
        { value: 'urban', title: '🏙️ Urbano', description: 'Sistemas municipales, ciudades.' },
        { value: 'residential', title: '🏘️ Residencial', description: 'Viviendas, condominios, fincas.' },
        { value: 'industrial', title: '🏭 Industrial', description: 'Empresas, plantas industriales.' },
        { value: 'desalination', title: '🌊 Desalinización', description: 'Tratamiento de agua salobre o marina.' }
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>2a. Contexto del Proyecto</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {contexts.map(c => (
                        <RadioCard key={c.value} name="context" value={c.value} checked={context === c.value} onChange={() => onChange(c.value, level)} title={c.title} description={c.description} />
                    ))}
                </div>
            </div>
            <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>2b. Nivel de Alcance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <RadioCard name="level" value="preliminary_assessment" checked={level === 'preliminary_assessment'} onChange={() => onChange(context, 'preliminary_assessment')} title="📋 Evaluación Preliminar" description="Diagnóstico inicial rápido." />
                    <RadioCard name="level" value="complete_design" checked={level === 'complete_design'} onChange={() => onChange(context, 'complete_design')} title="📐 Diseño Completo" description="Dimensionamiento detallado." />
                </div>
            </div>
        </div>
    );
}

function StepSocialTechnical({ formData, onChange }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>3. Entorno Social y Técnico</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <SelectField label="Tipo de Asentamiento" name="settlement_type" value={formData.settlement_type} onChange={onChange} options={[
                    { value: 'rural_disperso', label: 'Rural Disperso' },
                    { value: 'rural_concentrado', label: 'Rural Concentrado' },
                    { value: 'urbano', label: 'Urbano' },
                    { value: 'industrial', label: 'Industrial' }
                ]} />
                <SelectField label="Acceso a Energía" name="energy_access" value={formData.energy_access} onChange={onChange} options={[
                    { value: 'none', label: 'Nulo (Gravedad)' },
                    { value: 'partial', label: 'Inestable' },
                    { value: 'reliable', label: 'Confiable' }
                ]} />
                <SelectField label="Acceso a Químicos" name="chemical_access" value={formData.chemical_access} onChange={onChange} options={[
                    { value: 'low', label: 'Difícil Acceso' },
                    { value: 'medium', label: 'Regular' },
                    { value: 'high', label: 'Garantizado' }
                ]} />
                <SelectField label="Organización Comunitaria" name="community_organization" value={formData.community_organization} onChange={onChange} options={[
                    { value: 'low', label: 'Baja' },
                    { value: 'medium', label: 'Media' },
                    { value: 'high', label: 'Alta' }
                ]} />
            </div>
        </div>
    );
}

function StepEconomicEnvironmental({ formData, onChange }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>4. Viabilidad Económica y Ambiental</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <SelectField label="Tolerancia Costos Operación (OpEx)" name="opex_tolerance" value={formData.opex_tolerance} onChange={onChange} options={[
                    { value: 'low', label: 'Baja' },
                    { value: 'medium', label: 'Media' },
                    { value: 'high', label: 'Alta' }
                ]} />
                <SelectField label="Calidad de la Fuente" name="source_quality" value={formData.source_quality} onChange={onChange} options={[
                    { value: 'good', label: 'Buena' },
                    { value: 'fair', label: 'Regular' },
                    { value: 'poor', label: 'Mala' }
                ]} />
                <SelectField label="Variabilidad Climática" name="climate_variability" value={formData.climate_variability} onChange={onChange} options={[
                    { value: 'low', label: 'Baja' },
                    { value: 'medium', label: 'Moderada' },
                    { value: 'high', label: 'Alta' }
                ]} />
                <div className="input-group">
                    <label className="label">Horizonte de Diseño (años)</label>
                    <input type="number" className="input" value={formData.project_horizon} onChange={(e) => onChange('project_horizon', parseInt(e.target.value))} />
                </div>
            </div>
        </div>
    );
}

function StepTechnologySelection({ domain, formData, value, onChange }: any) {
    const results = useMemo(() => {
        const { project_domain, project_context, project_level, treatment_category, name, description, location, ...inputs } = formData;
        const scores = ViabilityEngine.calculateViability(domain, inputs);
        return scores.sort((a, b) => b.scores.global - a.scores.global);
    }, [formData, domain]);

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>5. Selección Tecnológica Sugerida</h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                HydroStack ha calculado la viabilidad técnica para este entorno. Seleccione la tecnología que desea desarrollar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.slice(0, 4).map(tech => (
                    <label key={tech.category} style={{
                        padding: '1rem',
                        border: `2px solid ${value === tech.category ? 'var(--color-primary)' : '#e5e7eb'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        backgroundColor: value === tech.category ? '#f0f7ff' : 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="radio" checked={value === tech.category} onChange={() => onChange(tech.category)} />
                            <div>
                                <div style={{ fontWeight: 700 }}>{tech.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-dark)' }}>Viabilidad Global: {tech.scores.global}%</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {tech.scores.global > 80 && <span title="Alta compatibilidad" style={{ fontSize: '1.1rem' }}>🛡️</span>}
                            {tech.scores.global < 40 && <span title="Riesgo de sostenibilidad" style={{ fontSize: '1.1rem' }}>⚠️</span>}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

function SelectField({ label, name, value, onChange, options }: any) {
    return (
        <div className="input-group">
            <label className="label">{label}</label>
            <select className="input" value={value} onChange={(e) => onChange(name, e.target.value)} style={{ backgroundColor: 'white' }}>
                {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

function StepGeneralInfo({ formData, onChange }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>1. Identificación del Proyecto</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Input id="name" name="name" label="Nombre del Proyecto *" value={formData.name} onChange={onChange} required placeholder="Ej: Acueducto Vereda El Salitre" />
                <Input id="location" name="location" label="Localización" value={formData.location} onChange={onChange} placeholder="Municipio, Departamento" />
                <div className="input-group">
                    <label className="label">Descripción del Alcance</label>
                    <textarea id="description" name="description" placeholder="Describa brevemente el propósito del sistema..." className="input" value={formData.description} onChange={onChange} rows={3} style={{ fontFamily: 'inherit' }} />
                </div>
            </div>
        </div>
    );
}

function StepReview({ formData }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>6. Resumen de Ingeniería</h2>
            <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>Proyecto</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formData.name}</p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem' }}>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Dominio:</strong> {DOMAIN_LABELS[formData.project_domain as ProjectDomain]}</li>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Contexto:</strong> {CONTEXT_LABELS[formData.project_context as ProjectContext]}</li>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Nivel:</strong> {LEVEL_LABELS[formData.project_level as ProjectLevel]}</li>
                    <li style={{ marginBottom: '0.8rem' }}><strong>Tecnología:</strong> {formData.treatment_category ? CATEGORY_LABELS[formData.treatment_category as TreatmentCategory] : 'Sin definir'}</li>
                </ul>
            </div>
        </div>
    );
}

function RadioCard({ name, value, checked, onChange, title, description }: any) {
    return (
        <label style={{ display: 'flex', gap: '1rem', padding: '1.5rem', border: `2px solid ${checked ? 'var(--color-primary)' : '#e5e7eb'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: checked ? '#f0f7ff' : 'white', transition: 'all 0.2s' }}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ marginTop: '0.25rem' }} />
            <div>
                <div style={{ fontWeight: 700, color: checked ? 'var(--color-primary)' : 'var(--color-text-on-white)' }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>{description}</div>
            </div>
        </label>
    );
}
