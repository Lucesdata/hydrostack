"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import ProjectCard from '@/components/projects/ProjectCard';
import { Project, ProjectModuleStatus } from '@/types/project';
import { seedDemoProject } from '@/app/actions/demo';
import { Sparkles, RefreshCw } from 'lucide-react';



export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [moduleStatuses, setModuleStatuses] = useState<ProjectModuleStatus[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const supabase = useSupabase();

    const handleSeedDemo = async () => {
        setSeeding(true);
        try {
            const result = await seedDemoProject();
            if (result.success) {
                // Refresh list not needed if using router.refresh() inside action or here
                window.location.reload(); // Force reload to fetch new data
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al generar demo');
        } finally {
            setSeeding(false);
        }
    };


    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            const fetchProjects = async () => {
                const { data: projectsData, error: projectsError } = await supabase
                    .from('projects')
                    .select('id, name, description, location, project_domain, project_context, project_level, treatment_category, status, created_at, updated_at')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (!projectsError && projectsData) {
                    setProjects(projectsData as Project[]);

                    // Fetch module statuses for all projects
                    const projectIds = projectsData.map(p => p.id);
                    if (projectIds.length > 0) {
                        const { data: statusesData, error: statusesError } = await supabase
                            .from('project_module_status')
                            .select('*')
                            .in('project_id', projectIds);

                        if (!statusesError && statusesData) {
                            setModuleStatuses(statusesData as ProjectModuleStatus[]);
                        }
                    }
                }
                setLoadingProjects(false);
            };
            fetchProjects();
        }
    }, [user, supabase]);

    if (loading) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Cargando...</div>;
    }

    if (!user) {
        return null; // Return null while redirecting
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] font-sans" style={{ padding: '4rem 1rem' }}>
            <div className="max-w-7xl mx-auto">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#10b981', marginBottom: '0.75rem' }}>
                            Mis Proyectos Existentes
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Administra y consulta tus diseños de ingeniería.
                        </p>
                    </div>
                    <Link href="/dashboard/new">
                        <button className="flex items-center gap-2 bg-[#12151c] hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all">
                            ← Volver al inicio
                        </button>
                    </Link>
                    <button
                        onClick={handleSeedDemo}
                        disabled={seeding}
                        className="ml-4 flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                        {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Restaurar Demo
                    </button>

                </div>

                {loadingProjects ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div style={{
                        backgroundColor: '#12151c',
                        padding: '6rem 2rem',
                        borderRadius: '1rem',
                        textAlign: 'center',
                        border: '1px dashed #334155'
                    }}>
                        <p style={{ marginBottom: '2rem', fontSize: '1.25rem', color: '#94a3b8' }}>
                            Aún no tienes proyectos técnicos creados.
                        </p>
                        <Link href="/dashboard/new">
                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                                Crear mi primer proyecto
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                moduleStatuses={moduleStatuses.filter(s => s.project_id === project.id)}
                                onDelete={async (id) => {
                                    if (confirm('¿Estás seguro de que deseas eliminar este proyecto técnico? Esta acción borrará todos los cálculos permanentemente.')) {
                                        const { error } = await supabase.from('projects').delete().eq('id', id);
                                        if (!error) {
                                            setProjects(projects.filter(p => p.id !== id));
                                        } else {
                                            alert('Error al eliminar el proyecto');
                                        }
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
