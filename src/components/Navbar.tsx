"use client";

import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, signOut: logout } = useAuth();
    const router = useRouter();

    return (
        <nav style={{
            borderBottom: '1px solid var(--color-gray-medium)',
            padding: '1rem 0',
            backgroundColor: 'rgba(255,255,255,0.9)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/dashboard/new" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    HYDROSTACK
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link href="/dashboard/new" style={{ fontWeight: 500, marginRight: '1rem' }}>
                                Hola, {user.user_metadata?.name || 'Usuario'}
                            </Link>
                            <Button variant="secondary" onClick={() => logout()}>Cerrar sesión</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="secondary">Iniciar sesión</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary">Crear cuenta</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
