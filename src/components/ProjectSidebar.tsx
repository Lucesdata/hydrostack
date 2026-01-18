"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProjectSidebar({ projectId }: { projectId: string }) {
    const pathname = usePathname();

    const links = [
        { name: 'General', href: `/dashboard/projects/${projectId}/general` },
        { name: 'Población y Demanda', href: `/dashboard/projects/${projectId}/population` },
        { name: 'Fuente de Abastecimiento', href: `/dashboard/projects/${projectId}/source` },
        // Future modules
        // { name: 'Tratamiento', href: `/dashboard/projects/${projectId}/treatment` },
    ];

    return (
        <aside style={{
            width: '250px',
            backgroundColor: 'white',
            borderRight: '1px solid var(--color-gray-medium)',
            height: 'calc(100vh - 80px)', // Adjust based on navbar height
            padding: '2rem 1rem',
            position: 'sticky',
            top: '0'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    color: 'var(--color-gray-dark)',
                    letterSpacing: '0.05em',
                    marginBottom: '1rem'
                }}>
                    Módulos de Diseño
                </h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    color: isActive ? 'var(--color-primary)' : 'var(--color-foreground)',
                                    backgroundColor: isActive ? 'var(--color-gray-light)' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div>
                <Link href="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-gray-dark)',
                    fontSize: '0.9rem',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-gray-medium)'
                }}>
                    ← Volver al Dashboard
                </Link>
            </div>
        </aside>
    );
}
