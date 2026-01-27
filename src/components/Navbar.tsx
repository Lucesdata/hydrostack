"use client";

import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, signOut: logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <nav className={`sticky top-0 z-50 transition-colors duration-300 ${isHome
                ? 'bg-background/80 backdrop-blur-md border-b border-surface'
                : 'bg-white/90 backdrop-blur-md border-b border-gray-200'
            }`}>
            <div className="container px-4 mx-auto navbar-container h-16 flex items-center justify-between">
                <Link href={isHome ? "/" : "/dashboard/new"} className={`text-xl font-bold transition-colors ${isHome ? 'text-white' : 'text-primary'
                    }`}>
                    HYDROSTACK
                </Link>
                <div className="flex items-center gap-4 navbar-links">
                    {!isHome && (
                        <Link href="/" className="text-sm text-gray-500 hover:text-primary hidden md:block">
                            Inicio
                        </Link>
                    )}
                    {user ? (
                        <>
                            <Link href="/dashboard/new" className={`text-sm font-medium ${isHome ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} mr-2 hidden sm:inline-block`}>
                                Hola, {user.user_metadata?.name || 'Usuario'}
                            </Link>
                            <Button variant={isHome ? 'outline' : 'secondary'} onClick={() => logout()} className={isHome ? 'border-surface text-gray-300 hover:text-white hover:bg-surface' : ''}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="secondary" className={isHome ? 'bg-transparent text-gray-300 hover:text-white border-transparent hover:bg-surface' : ''}>
                                    Iniciar sesión
                                </Button>
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
