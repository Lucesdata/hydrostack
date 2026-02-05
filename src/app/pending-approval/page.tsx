"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function PendingApprovalPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F4F6',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕒</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                    Cuenta Pendiente de Aprobación
                </h1>
                <p style={{ color: '#4B5563', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Tu cuenta ha sido creada exitosamente, pero requiere aprobación de un administrador para acceder al sistema.
                    <br /><br />
                    Por favor, contacta al administrador o espera a recibir la confirmación por correo.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                        Verificar nuevamente
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} disabled={loading}>
                        {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
