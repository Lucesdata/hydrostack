"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Basic protection - in a real app use middleware or server check
        if (!isAuthenticated && !localStorage.getItem('hydrostack_user')) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!user) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Cargando...</div>;
    }

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                textAlign: 'center'
            }}>
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '2rem' }}>Bienvenido a HYDROSTACK</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-gray-dark)', marginBottom: '2rem' }}>
                    Hola, <strong>{user.name}</strong> ({user.role})
                </p>
                <p style={{ marginBottom: '2rem', color: 'var(--color-foreground)' }}>
                    Próximamente podrás crear y gestionar proyectos de agua.
                </p>
                <Button variant="secondary" onClick={logout}>Cerrar sesión</Button>
            </div>
        </div>
    );
}
