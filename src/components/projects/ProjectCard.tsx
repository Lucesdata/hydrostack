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
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid var(--color-gray-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.2s ease',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    color: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                    backgroundColor: progress === 100 ? '#ecfdf5' : '#f0f7ff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '1rem',
                    border: `1px solid ${progress === 100 ? '#10b98140' : '#22548340'}`
                }}>
                    {progress}% GRADO DE DEFINICIÓN TÉCNICA
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-dark)' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                </span>
            </div>

            <div style={{ flex: 1 }}>
                <Link href={`/dashboard/projects/${project.id}/general`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        marginBottom: '0.4rem',
                        color: 'var(--color-foreground)',
                        lineHeight: 1.2
                    }}>
                        {project.name}
                    </h3>
                </Link>
                <p style={{
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    marginBottom: '0.8rem'
                }}>
                    {techDescription}
                </p>

                {/* Progress Bar */}
                <div style={{ height: '6px', backgroundColor: 'var(--color-gray-light)', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                        width: `${progress}%`,
                        transition: 'width 0.5s ease'
                    }} />
                </div>

                {/* Technical Observation */}
                <div style={{
                    backgroundColor: '#fafafa',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #eee',
                    fontSize: '0.8rem'
                }}>
                    <p style={{ fontWeight: 700, color: 'var(--color-gray-dark)', marginBottom: '0.25rem', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        Estado de Modelado Técnico:
                    </p>
                    {missingEssential.length > 0 ? (
                        <p style={{ color: '#444', lineHeight: 1.4 }}>
                            {project.project_context === 'rural' && project.project_domain === 'water_treatment' ? (
                                <span>
                                    <strong>Observación técnica:</strong> El proyecto aún no valida componentes esenciales para un sistema rural de agua potable, como el esquema completo de tratamiento o la caracterización de la fuente.
                                </span>
                            ) : (
                                <>Componentes en consolidación técnica: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{missingEssential.slice(0, 3).join(', ')}{missingEssential.length > 3 ? '...' : ''}</span></>
                            )}
                        </p>
                    ) : (
                        <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                            ✓ El proyecto cuenta con una definición técnica base consolidada.
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <Link href={`/dashboard/projects/${project.id}/general`} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        Abrir Ingeniería
                    </Button>
                </Link>
                <button
                    onClick={() => onDelete(project.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef444490',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}
                >
                    Eliminar Proyecto
                </button>
            </div>
        </div>
    );
}
