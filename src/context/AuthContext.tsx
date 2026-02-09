"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend user with additional profile info if needed, but for now Supabase Object
type User = SupabaseUser;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    loginOffline: () => void;
    isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setUser(session?.user ?? null);
            } catch (error: any) {
                console.error("Auth session check failed:", error);
                if (error.message?.includes('Refresh Token') || error.code === 'invalid_grant') {
                    // Token is invalid, clear storage and state
                    await supabase.auth.signOut();
                    setUser(null);
                } else if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                    // Network error
                    setConnectionError(true);
                }
            } finally {
                setLoading(false);
            }
        };

        // Safety timeout in case Supabase hangs
        const safetyTimeout = setTimeout(() => {
            console.warn("Auth check timed out, forcing load.");
            setLoading(false);
        }, 10000);

        checkSession().then(() => clearTimeout(safetyTimeout));

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log(`Auth state change: ${_event}`, session?.user?.id);
            setUser(session?.user ?? null);
            setLoading(false);

            if (_event === 'SIGNED_IN') {
                // Remove auto-redirect to dashboard
                // router.push('/dashboard/new');
            }
            if (_event === 'SIGNED_OUT') {
                router.push('/');
                router.refresh();
            }
        });

        return () => {
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    if (connectionError) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#0f172a',
                color: '#ef4444',
                flexDirection: 'column',
                gap: '1.5rem',
                textAlign: 'center',
                padding: '1rem'
            }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Servicio No Disponible</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px' }}>
                    No se puede conectar con el servidor de HydroStack (Supabase).
                    <br /><br />
                    Por favor verifica tu conexión a internet o intenta nuevamente más tarde.
                </p>
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', backgroundColor: '#1e293b', padding: '0.5rem', borderRadius: '4px' }}>
                    Error: Connection Refused / Timeout
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '1rem'
                    }}
                >
                    Reintentar Conexión
                </button>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signOut,
            loginOffline: () => { },
            isOffline: false
        }}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0f172a',
                    color: '#10b981',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Cargando HydroStack...</span>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
