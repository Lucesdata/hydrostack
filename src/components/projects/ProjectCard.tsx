import { Project, ProjectModuleStatus, DOMAIN_LABELS, CONTEXT_LABELS, CATEGORY_LABELS } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ProjectCardProps {
    project: Project;
    moduleStatuses: ProjectModuleStatus[];
    onDelete: (id: string) => void;
}

export default function ProjectCard({ project, moduleStatuses, onDelete }: ProjectCardProps) {
    // 1. Calculate Progress
    // Relevant modules: status !== 'not_applicable'
    // Completed modules: This is tricky. Let's assume for now a module is 'completed' 
    // if it's 'essential' and the system has some data, or let's use a simpler heuristic for now:
    // status is essential/recommended AND it has been updated or specifically marked.
    // Given the instruction "No cambios en la arquitectura", I will treat as "completed" 
    // any module that is NOT 'not_applicable' and has is_user_override = true OR 
    // simply has a status that implies it's part of the design and we'll assume visit = progress 
    // for this specific baseline UI update.

    // BETTER: Let's define "completed" as modules that are essential/recommended/optional 
    // AND have been "audited" (for now we'll use is_user_override as a proxy for 'Engineer validated/completed')
    // 1. Calculate Weighted Progress (Integridad Técnica)
    const applicableModules = moduleStatuses.filter(m => m.status !== 'not_applicable');

    const totalWeight = applicableModules.reduce((acc, m) =>
        acc + RecommendationEngine.getModuleWeight(m.system_recommendation), 0);

    const completedWeight = applicableModules
        .filter(m => m.is_user_override)
        .reduce((acc, m) => acc + RecommendationEngine.getModuleWeight(m.system_recommendation), 0);

    const progress = totalWeight > 0
        ? Math.round((completedWeight / totalWeight) * 100)
        : 0;

    const MODULE_LABELS: Record<string, string> = {
        general: 'Info General',
        population: 'Censo y Población',
        floating_population: 'Población Flotante',
        source: 'Fuente de Agua',
        consumption: 'Consumo y Hábitos',
        quality: 'Calidad de Agua',
        caudales: 'Caudales de Diseño',
        tank: 'Almacenamiento',
        conduccion: 'Conducción',
        desarenador: 'Desarenador',
        jar_test: 'Ensayo de Jarras',
        filtro_lento: 'Filtración Lenta',
        compact_design: 'Ingeniería Compacta',
        costs: 'Costos OpEx',
        viability: 'Viabilidad y O&M',
        tech_selection: 'Selección de Tecnología'
    };

    // 2. Technical Description
    const domain = DOMAIN_LABELS[project.project_domain] || project.project_domain;
    const context = CONTEXT_LABELS[project.project_context] || project.project_context;
    const tech = project.treatment_category ? CATEGORY_LABELS[project.treatment_category] : 'Sin definir';

    const techDescription = `${domain} | ${context} | ${tech}`;

    // 3. Technical Observation
    const missingEssential = applicableModules
        .filter((m: ProjectModuleStatus) => m.status === 'essential' && !m.is_user_override)
        .map((m: ProjectModuleStatus) => MODULE_LABELS[m.module_key] || m.module_key);

    return (
        <div style={{
            backgroundColor: '#12151c',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'all 0.3s ease',
        }} className="group hover:border-emerald-500/30">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    color: progress === 100 ? '#10b981' : '#3b82f6',
                    backgroundColor: progress === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '2rem',
                    border: `1px solid ${progress === 100 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
                    letterSpacing: '0.05em'
                }}>
                    {progress}% INTEGRIDAD TÉCNICA
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    {new Date(project.created_at).toLocaleDateString()}
                </span>
            </div>

            <div style={{ flex: 1 }}>
                <Link href={`/dashboard/projects/${project.id}/general`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: 'white',
                        lineHeight: 1.2
                    }} className="group-hover:text-emerald-400 transition-colors">
                        {project.name}
                    </h3>
                </Link>
                <p style={{
                    color: '#10b981',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '1rem'
                }}>
                    {techDescription}
                </p>

                {/* Progress Bar */}
                <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
                        width: `${progress}%`,
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: progress === 100 ? '0 0 10px rgba(16,185,129,0.5)' : 'none'
                    }} />
                </div>

                {/* Technical Observation */}
                <div style={{
                    backgroundColor: 'rgba(30,41,59,0.3)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(51,65,85,0.5)',
                    fontSize: '0.8rem'
                }}>
                    <p style={{ fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Estado de Modelado:
                    </p>
                    {missingEssential.length > 0 ? (
                        <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.75rem' }}>
                            {project.project_context === 'rural' && project.project_domain === 'water_treatment' ? (
                                <span>
                                    <strong style={{ color: '#cbd5e1' }}>Observación técnica:</strong> El proyecto aún no valida componentes esenciales para un sistema rural de agua potable, como el esquema completo de tratamiento.
                                </span>
                            ) : (
                                <><span style={{ color: '#cbd5e1' }}>Pendiente:</span> <span style={{ color: '#3b82f6', fontWeight: 600 }}>{missingEssential.slice(0, 3).join(', ')}{missingEssential.length > 3 ? '...' : ''}</span></>
                            )}
                        </p>
                    ) : (
                        <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1rem' }}>✓</span> Ingeniería de base consolidada
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(51,65,85,0.5)' }}>
                <Link href={`/dashboard/projects/${project.id}/general`} style={{ textDecoration: 'none' }}>
                    <button style={{
                        fontSize: '0.75rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }} className="hover:bg-slate-800 hover:border-slate-600">
                        Abrir Ingeniería
                    </button>
                </Link>
                <button
                    onClick={() => onDelete(project.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(239,68,68,0.6)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                    }}
                    className="hover:text-red-500 transition-colors"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}
