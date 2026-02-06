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
    const isAuth = pathname === '/login' || pathname === '/register';
    const isDashboardSelector = pathname === '/dashboard/new/selector';
    const isDarkPage = isHome || isAuth;

    if (isDashboardSelector) return null;

    return (
        <nav className={`transition-colors duration-300 border-b z-50 ${isDarkPage
            ? 'absolute top-0 left-0 w-full border-white/5 bg-slate-950/20 backdrop-blur-md'
            : 'sticky top-0 bg-white/90 backdrop-blur-md border-gray-200'
            }`}>
            <div className="container px-4 mx-auto navbar-container h-16 flex items-center justify-between">
                <Link href="/" className={`text-xl font-bold tracking-tight transition-colors ${isDarkPage ? 'text-white' : 'text-primary'
                    }`}>
                    <span className="flex items-center gap-2">
                        {/* Optional Icon if needed */}
                        HYDROSTACK
                    </span>
                </Link>
                <div className="flex items-center gap-8 navbar-links">
                    {isHome && (
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="#" className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">Platform</Link>
                            <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Technology</Link>
                            <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Solutions</Link>
                        </div>
                    )}
                    {!isHome && (
                        <Link href="/" className={`text-sm hidden md:block ${isDarkPage ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-primary'}`}>
                            Inicio
                        </Link>
                    )}
                    {user ? (
                        <>
                            <Link href="/dashboard/new" className={`text-sm font-medium ${isDarkPage ? 'text-white hover:text-emerald-400' : 'text-gray-700 hover:text-black'} mr-2 hidden sm:inline-block`}>
                                Hola, {user.user_metadata?.name || 'Usuario'}
                            </Link>
                            <Button variant={isDarkPage ? 'outline' : 'secondary'} onClick={() => logout()} className={isDarkPage ? 'border-white/20 text-white hover:bg-white/10' : ''}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={`text-sm font-medium ${isDarkPage ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-primary'} mr-4 transition-colors`}>
                                Log in
                            </Link>

                            {isHome ? (
                                <Link href="/register">
                                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                        Get Started
                                        {/* Lucide ArrowRight can be added here if imported */}
                                        →
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/register">
                                    <Button variant="primary">Crear cuenta</Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
