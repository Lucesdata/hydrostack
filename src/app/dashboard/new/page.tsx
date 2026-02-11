"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    PlusCircle,
    Box,
    Users,
    ArrowRight,
    Compass,
    Sparkles,
    LayoutDashboard,
    AlertCircle,
    ChevronRight,
    Search,
    Brain,
    Activity,
    Shield,
    Workflow
} from 'lucide-react';
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

                // 4. Initialize Project Calculations (CRITICAL for sizing fix)
                const { error: calcError } = await supabase
                    .from('project_calculations')
                    .insert({
                        project_id: project.id,
                        calculated_flows: {},
                        updated_at: new Date().toISOString()
                    });

                if (calcError) console.error('Error al inicializar cálculos:', calcError);

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
            <div className="min-h-screen bg-slate-950 pt-24 pb-12 relative overflow-hidden font-sans">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-emerald-500" />
                            Panel de Configuración
                        </h1>
                        <p className="text-slate-400">Selecciona el tipo de trabajo que deseas realizar hoy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {/* Card 1: Nuevo Proyecto */}
                        <IntentCard
                            title="Nuevo Proyecto"
                            description="Inicia tu diseño técnico desde cero con asistencia paso a paso y validación normativa."
                            buttonText="Iniciar proyecto"
                            onClick={() => router.push('/dashboard/new/selector')}
                            primary
                            icon={PlusCircle}
                        />

                        {/* Card 4: Mis Proyectos */}
                        <IntentCard
                            title="Mis Proyectos"
                            description="Accede a tu portafolio completo de proyectos, revisa diseños previos y continúa trabajando."
                            buttonText="Ir al Dashboard"
                            onClick={() => router.push('/dashboard')}
                            icon={LayoutDashboard}
                        />

                        {/* Card 2: Gemelo Digital */}
                        <IntentCard
                            title="Gemelo Digital"
                            description="Simulación y monitoreo en tiempo real de sistemas operativos. Herramientas avanzadas de gestión."
                            badge="Próximamente"
                            disabled
                            icon={Activity}
                        />

                        {/* Card 3: Asistencia Social y Admin */}
                        <IntentCard
                            title="Asistencia Social y Admin."
                            description="Soporte en aspectos sociales, normativos y administrativos para la gestión del recurso hídrico."
                            badge="Próximamente"
                            disabled
                            icon={Users}
                        />
                    </div>
                </div>
            </div>
        );
    }


    // Wizard Stage
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                                <PlusCircle className="w-8 h-8 text-emerald-500" />
                                Diseño Técnico: Agua Potable
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Paso {step} de 6 — Configuración de Ingeniería
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                            <Brain className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-emerald-400 uppercase tracking-tighter">Asistente Activo</span>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full mb-10 overflow-hidden border border-slate-700/30">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out"
                            style={{ width: `${(step / 6) * 100}%` }}
                        />
                    </div>

                    {error && (
                        <div
                            onClick={() => {
                                if (error.includes('nombre')) setStep(1);
                                if (error.includes('tecnología')) setStep(5);
                            }}
                            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-4 cursor-pointer group hover:bg-red-500/15 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <span className="text-sm text-red-200">{error}</span>
                            </div>
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20 group-hover:bg-red-500/20">
                                Reparar ahora →
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleFinalSubmit} className="space-y-8">
                        <div className="min-h-[300px] animate-fadeIn">
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
                        </div>

                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <button
                                type="button"
                                onClick={step === 1 ? () => setFlowStage(1) : handleBack}
                                className="w-full sm:w-auto px-6 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                {step === 1 ? 'Atrás' : 'Anterior'}
                            </button>

                            <div className="w-full sm:w-auto flex gap-4">
                                {step < 6 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        Continuar
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Procesando...' : 'Confirmar e Iniciar Ingeniería'}
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function IntentCard({ title, description, buttonText, onClick, disabled, badge, primary, icon: Icon }: any) {
    return (
        <div className={`
            relative p-8 rounded-2xl transition-all duration-300 group
            ${disabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:-translate-y-2'}
            ${primary
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-slate-900/40 backdrop-blur-xl border border-white/5'}
        `}>
            {badge && (
                <div className="absolute top-4 right-4">
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-mono font-bold px-2 py-1 rounded-full border border-slate-700 uppercase tracking-tighter">
                        {badge}
                    </span>
                </div>
            )}

            <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 
                    ${primary
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}>
                    {Icon ? <Icon className="w-6 h-6" /> : <Box className="w-6 h-6" />}
                </div>

                <h3 className={`text-xl font-semibold mb-3 tracking-tight
                    ${primary ? 'text-white' : 'text-slate-200'}`}>
                    {title}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    {description}
                </p>
            </div>

            {buttonText && (
                <button
                    onClick={onClick}
                    disabled={disabled}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                        ${primary
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'}`}
                >
                    {buttonText}
                    {!disabled && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
            )}

            {primary && !disabled && (
                <div className="absolute inset-0 -z-10 bg-emerald-500/5 blur-2xl rounded-2xl"></div>
            )}
        </div>
    );
}

function StepDomain({ value, onChange }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Box className="w-4 h-4" />
                1. Identificación del Dominio
            </h2>
            <div className="grid gap-4">
                <RadioCard
                    name="domain"
                    value="water_treatment"
                    checked={value === 'water_treatment'}
                    onChange={() => onChange('water_treatment')}
                    title="💧 Agua Potable"
                    description="Sistemas de abastecimiento y tratamiento para consumo humano."
                    icon={Shield}
                />
            </div>
        </div>
    );
}

function StepContextAndLevel({ context, level, onChange }: any) {
    const contexts = [
        { value: 'rural', title: '🏡 Rural', description: 'Acueductos rurales, comunidades pequeñas.', icon: Users },
        { value: 'urban', title: '🏙️ Urbano', description: 'Sistemas municipales, ciudades.', icon: LayoutDashboard },
        { value: 'residential', title: '🏘️ Residencial', description: 'Viviendas, condominios, fincas.', icon: Box },
        { value: 'industrial', title: '🏭 Industrial', description: 'Empresas, plantas industriales.', icon: Activity },
        { value: 'desalination', title: '🌊 Desalinización', description: 'Tratamiento de agua salobre o marina.', icon: Workflow }
    ];
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    2a. Contexto del Proyecto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contexts.map(c => (
                        <RadioCard key={c.value} name="context" value={c.value} checked={context === c.value} onChange={() => onChange(c.value, level)} title={c.title} description={c.description} icon={c.icon} />
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    2b. Nivel de Alcance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RadioCard
                        name="level"
                        value="preliminary_assessment"
                        checked={level === 'preliminary_assessment'}
                        onChange={() => onChange(context, 'preliminary_assessment')}
                        title="📋 Evaluación Preliminar"
                        description="Diagnóstico inicial rápido y estimación de viabilidad."
                        icon={Compass}
                    />
                    <RadioCard
                        name="level"
                        value="complete_design"
                        checked={level === 'complete_design'}
                        onChange={() => onChange(context, 'complete_design')}
                        title="📐 Diseño Completo"
                        description="Dimensionamiento detallado y memoria técnica."
                        icon={Workflow}
                    />
                </div>
            </div>
        </div>
    );
}

function StepSocialTechnical({ formData, onChange }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                3. Entorno Social y Técnico
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="space-y-6">
            <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                4. Viabilidad Económica y Ambiental
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest block">
                        Horizonte de Diseño (años)
                    </label>
                    <input
                        type="number"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                        value={formData.project_horizon}
                        onChange={(e) => onChange('project_horizon', parseInt(e.target.value))}
                    />
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
        <div className="space-y-6">
            <div>
                <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    5. Selección Tecnológica Sugerida
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed px-1">
                    HydroStack ha calculado la viabilidad técnica para este entorno. Seleccione la tecnología que desea desarrollar.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {results.slice(0, 4).map(tech => (
                    <label key={tech.category} className={`
                        p-5 rounded-2xl cursor-pointer transition-all duration-300 border flex items-center justify-between group
                        ${value === tech.category
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                            : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50'}
                    `}>
                        <div className="flex gap-4 items-center">
                            <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                ${value === tech.category ? 'border-emerald-500' : 'border-slate-700'}
                            `}>
                                {value === tech.category && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                                <input
                                    type="radio"
                                    className="sr-only"
                                    checked={value === tech.category}
                                    onChange={() => onChange(tech.category)}
                                />
                            </div>
                            <div>
                                <div className={`font-bold ${value === tech.category ? 'text-white' : 'text-slate-200'}`}>
                                    {tech.name}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span className="text-emerald-500/70">Score: {tech.scores.global}%</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                    <span>Recomendado por IA</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {tech.scores.global > 80 && (
                                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20" title="Alta compatibilidad">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                </div>
                            )}
                            {tech.scores.global < 40 && (
                                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20" title="Riesgo de sostenibilidad">
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                </div>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

function StepGeneralInfo({ formData, onChange }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                1. Identificación del Proyecto
            </h2>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block">
                        Nombre del Proyecto *
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        required
                        placeholder="Ej: Acueducto Vereda El Salitre"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block">
                        Localización
                    </label>
                    <input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={onChange}
                        placeholder="Municipio, Departamento"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block">
                        Descripción del Alcance
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Describa brevemente el propósito del sistema..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none resize-none"
                        value={formData.description}
                        onChange={onChange}
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
}

function StepReview({ formData }: any) {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-mono font-medium text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                6. Resumen de Ingeniería
            </h2>
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.2em] mb-2">Proyecto Técnico</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{formData.name || 'Sin nombre'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Dominio</span>
                        <span className="text-slate-200 text-sm font-medium">{DOMAIN_LABELS[formData.project_domain as ProjectDomain]}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Contexto</span>
                        <span className="text-slate-200 text-sm font-medium">{CONTEXT_LABELS[formData.project_context as ProjectContext]}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Nivel de Alcance</span>
                        <span className="text-slate-200 text-sm font-medium">{LEVEL_LABELS[formData.project_level as ProjectLevel]}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tecnología Seleccionada</span>
                        <span className="text-emerald-400 text-sm font-bold">
                            {formData.treatment_category ? CATEGORY_LABELS[formData.treatment_category as TreatmentCategory] : 'Sin definir'}
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0"></div>
            </div>

            <p className="text-xs text-slate-500 italic text-center px-6 leading-relaxed">
                Al confirmar, se inicializarán los módulos de diseño técnico y se establecerán los parámetros base bajo normativa RAS-2000.
            </p>
        </div>
    );
}

function RadioCard({ name, value, checked, onChange, title, description, icon: Icon }: any) {
    return (
        <label className={`
            flex gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-300
            ${checked
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50'}
        `}>
            <div className="relative flex items-start mt-1">
                <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className={`w-4 h-4 ${checked ? 'text-emerald-400' : 'text-slate-400'}`} />}
                    <div className={`font-semibold text-sm ${checked ? 'text-white' : 'text-slate-200'}`}>
                        {title}
                    </div>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                    {description}
                </div>
            </div>
        </label>
    );
}

function SelectField({ label, name, value, onChange, options }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest block">
                {label}
            </label>
            <div className="relative">
                <select
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none appearance-none cursor-pointer"
                    value={value}
                    onChange={(e) => onChange(name, e.target.value)}
                >
                    {options.map((o: any) => (
                        <option key={o.value} value={o.value} className="bg-slate-900">
                            {o.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
            </div>
        </div>
    );
}
