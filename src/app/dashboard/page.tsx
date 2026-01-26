"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import ProjectCard from '@/components/projects/ProjectCard';
import { Project, ProjectModuleStatus } from '@/types/project';


export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [moduleStatuses, setModuleStatuses] = useState<ProjectModuleStatus[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const supabase = createClient();

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
                    .select('*')
                    .order('created_at', { ascending: false });

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
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Mis Proyectos Existentes</h1>
                    <p style={{ color: 'var(--color-gray-dark)' }}>
                        Administra y consulta tus diseños guardados.
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <Button variant="secondary">← Volver al inicio</Button>
                </Link>
            </div>

            {loading ? (
                <p>Cargando proyectos...</p>
            ) : projects.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    padding: '4rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    border: '1px dashed var(--color-gray-dark)'
                }}>
                    <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gray-dark)' }}>
                        Aún no tienes proyectos creados.
                    </p>
                    <Link href="/dashboard/new">
                        <Button>Crear mi primer proyecto</Button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            moduleStatuses={moduleStatuses.filter(s => s.project_id === project.id)}
                            onDelete={async (id) => {
                                if (confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
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
    );
}
