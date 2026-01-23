"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

type Project = {
    id: string;
    name: string;
    project_type: string;
    status: string;
    created_at: string;
};

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true); // Renamed to avoid conflict with auth loading
    const supabase = createClient();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            const fetchProjects = async () => {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setProjects(data);
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
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Mis Proyectos</h1>
                    <p style={{ color: 'var(--color-gray-dark)' }}>
                        Hola, <strong>{user.user_metadata?.name}</strong>
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <Button>+ Nuevo Proyecto</Button>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {projects.map((project) => (
                        <div key={project.id} style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            border: '1px solid var(--color-gray-medium)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    color: 'var(--color-gray-dark)',
                                    backgroundColor: 'var(--color-gray-light)',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>
                                    {project.status}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <Link href={`/dashboard/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>{project.name}</h3>
                            </Link>
                            <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>{project.project_type}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--color-gray-light)', paddingTop: '1rem' }}>
                                <Link href={`/dashboard/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                                    <Button variant="outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                        Abrir / Editar
                                    </Button>
                                </Link>
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
                                            const { error } = await supabase.from('projects').delete().eq('id', project.id);
                                            if (!error) {
                                                setProjects(projects.filter(p => p.id !== project.id));
                                            } else {
                                                alert('Error al eliminar el proyecto');
                                            }
                                        }
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-error)',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        fontWeight: 600
                                    }}
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
