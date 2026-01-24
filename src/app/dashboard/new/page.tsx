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
    TreatmentCategory,
    DOMAIN_LABELS,
    CONTEXT_LABELS,
    LEVEL_LABELS,
    CATEGORY_LABELS
} from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

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
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            if (!formData.name) {
                setError('El nombre del proyecto es obligatorio para continuar');
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
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Selecciona tu Intención</h1>
                    <p style={{ color: 'var(--color-gray-dark)', fontSize: '1.1rem' }}>Identifica el propósito de tu sesión de trabajo de hoy.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <IntentCard
                        title="Empezar nuevo proyecto"
                        description="Inicia el diseño técnico de un sistema de agua desde cero. HydroStack te guiará paso a paso como asistente de ingeniería, sin imponer decisiones, permitiéndote definir, evaluar y documentar el proyecto con rigor técnico."
                        buttonText="Iniciar proyecto"
                        onClick={() => setFlowStage(1)}
                        primary
                    />
                    <IntentCard
                        title="Asistencia técnica"
                        description="Recibe apoyo técnico especializado para revisar, validar o diagnosticar un proyecto existente. Ideal para análisis puntuales, verificación de diseños o soporte en decisiones específicas."
                        buttonText="Solicitar asistencia"
                        badge="Próximamente disponible"
                        disabled
                    />
                    <IntentCard
                        title="Asistencia social y administrativa"
                        description="Soporte en componentes sociales, normativos y administrativos asociados a proyectos de agua. Incluye acompañamiento en procesos comunitarios, documentación y requisitos institucionales."
                        buttonText="Explorar opciones"
                        badge="Próximamente disponible"
                        disabled
                    />
                </div>
                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
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
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1rem' }}>
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

                {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleFinalSubmit}>
                    {step === 1 && <StepDomain value={formData.project_domain} onChange={(v: ProjectDomain) => setFormData({ ...formData, project_domain: v })} />}
                    {step === 2 && <StepContext domain={formData.project_domain} value={formData.project_context} onChange={(v: ProjectContext) => setFormData({ ...formData, project_context: v })} />}
                    {step === 3 && <StepLevel value={formData.project_level} onChange={(v: ProjectLevel) => setFormData({ ...formData, project_level: v })} />}
                    {step === 4 && <StepTreatmentCategory domain={formData.project_domain} value={formData.treatment_category} onChange={(v: TreatmentCategory | null) => setFormData({ ...formData, treatment_category: v })} />}
                    {step === 5 && <StepGeneralInfo formData={formData} onChange={handleChange} />}
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
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: primary ? 'var(--color-primary)' : 'var(--color-foreground)' }}>{title}</h3>
                <p style={{ color: 'var(--color-gray-dark)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{description}</p>
            </div>
            <Button
                onClick={onClick}
                disabled={disabled}
                variant={primary ? 'primary' : 'outline'}
                style={{ width: '100%' }}
            >
                {buttonText}
            </Button>
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

function StepContext({ domain, value, onChange }: any) {
    const contexts = [
        { value: 'rural', title: '🏡 Rural', description: 'Acueductos rurales, comunidades pequeñas.' },
        { value: 'urban', title: '🏙️ Urbano', description: 'Sistemas municipales, ciudades.' },
        { value: 'residential', title: '🏘️ Residencial', description: 'Viviendas, condominios, fincas.' },
        { value: 'industrial', title: '🏭 Industrial', description: 'Empresas, plantas industriales.' },
        { value: 'desalination', title: '🌊 Desalinización', description: 'Tratamiento de agua salobre o marina.' }
    ];
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Contexto del Proyecto</h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>¿En qué entorno se desarrollará el diseño?</p>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {contexts.map(c => <RadioCard key={c.value} name="context" value={c.value} checked={value === c.value} onChange={() => onChange(c.value)} title={c.title} description={c.description} />)}
            </div>
        </div>
    );
}

function StepLevel({ value, onChange }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Nivel de Detalle</h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>¿Qué profundidad técnica requieres hoy?</p>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <RadioCard name="level" value="preliminary_assessment" checked={value === 'preliminary_assessment'} onChange={() => onChange('preliminary_assessment')} title="📋 Evaluación Preliminar" description="Factibilidad y diagnóstico inicial rápido." />
                <RadioCard name="level" value="complete_design" checked={value === 'complete_design'} onChange={() => onChange('complete_design')} title="📐 Diseño Técnico Completo" description="Dimensionamiento detallado bajo RAS 0330." />
            </div>
        </div>
    );
}

function StepTreatmentCategory({ domain, value, onChange }: any) {
    const categories = [
        { value: 'fime', title: '🔄 FIME', description: 'Filtración en Múltiples Etapas.' },
        { value: 'compact_plant', title: '⚗️ Planta Compacta', description: 'Coagulación + Filtración rápida PRFV.' },
        { value: 'specific_plant', title: '🛠️ Diseño Custom', description: 'Dimensionamiento específico.' },
    ];
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>4. Estrategia de Tratamiento</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {categories.map(c => <RadioCard key={c.value} name="category" value={c.value} checked={value === c.value} onChange={() => onChange(c.value)} title={c.title} description={c.description} />)}
                <button type="button" onClick={() => onChange(null)} style={{ padding: '1.5rem', border: `2px solid ${value === null ? 'var(--color-primary)' : '#e5e7eb'}`, borderRadius: 'var(--radius-md)', background: value === null ? '#f0f7ff' : 'white', cursor: 'pointer', textAlign: 'left', width: '100%', fontWeight: 700 }}>⏭️ Definir más adelante</button>
            </div>
        </div>
    );
}

function StepGeneralInfo({ formData, onChange }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>5. Datos de Identificación</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Input id="name" name="name" label="Nombre del Proyecto *" value={formData.name} onChange={onChange} required />
                <Input id="location" name="location" label="Localización" value={formData.location} onChange={onChange} />
                <textarea id="description" name="description" placeholder="Descripción breve del alcance..." className="input" value={formData.description} onChange={onChange} rows={4} style={{ fontFamily: 'inherit' }} />
            </div>
        </div>
    );
}

function StepReview({ formData }: any) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>6. Validación de Configuración</h2>
            <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>SISTEMA DE ASISTENCIA ACTIVADO</p>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Dominio:</strong> {DOMAIN_LABELS[formData.project_domain as ProjectDomain]}</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Contexto:</strong> {CONTEXT_LABELS[formData.project_context as ProjectContext]}</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Alcance:</strong> {LEVEL_LABELS[formData.project_level as ProjectLevel]}</li>
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
                <div style={{ fontWeight: 700, color: checked ? 'var(--color-primary)' : 'inherit' }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>{description}</div>
            </div>
        </label>
    );
}
