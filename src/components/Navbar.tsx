"use client";

import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    LogOut,
    User,
    Home,
    Box,
    Activity,
    Compass,
    ArrowRight
} from 'lucide-react';

export default function Navbar() {
    const { user, signOut: logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isAuth = pathname === '/login' || pathname === '/register';
    const isDashboard = pathname?.startsWith('/dashboard');
    const isProjectDashboard = pathname?.includes('/dashboard/projects/');
    const isDashboardSelector = pathname === '/dashboard/new/selector';

    // Industrial dark theme is forced on landing, auth, and all dashboard pages
    const isDarkTheme = isHome || isAuth || isDashboard;

    if (isDashboardSelector) return null;

    return (
        <nav className={`
            sticky top-0 left-0 w-full z-50 transition-all duration-300 border-b
            ${isDarkTheme
                ? 'bg-slate-950/40 backdrop-blur-xl border-white/5'
                : 'bg-white/80 backdrop-blur-md border-slate-200'}
        `}>
            <div className="container px-6 mx-auto h-16 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-2.5">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                        ${isDarkTheme
                            ? 'bg-emerald-500/20 border border-emerald-500/30 group-hover:bg-emerald-500/30'
                            : 'bg-emerald-600 text-white'}
                    `}>
                        <Box className={`w-4 h-4 ${isDarkTheme ? 'text-emerald-400' : 'text-white'}`} />
                    </div>
                    <span className={`
                        text-lg font-bold tracking-tight transition-colors
                        ${isDarkTheme ? 'text-white group-hover:text-emerald-400' : 'text-slate-900'}
                    `}>
                        HYDROSTACK
                    </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="hidden md:flex items-center gap-1 mr-4">
                        {isHome ? (
                            <>
                                <NavLink href="#" label="Inicio" icon={Home} isDark={isDarkTheme} active />
                                <NavLink href="#digital-twins" label="Gemelos" icon={Activity} isDark={isDarkTheme} />
                                <NavLink href="#modules" label="Módulos" icon={Box} isDark={isDarkTheme} />
                            </>
                        ) : (
                            <NavLink href="/" label="Regresar al Inicio" icon={Home} isDark={isDarkTheme} />
                        )}
                        {user && !pathname?.startsWith('/dashboard') && (
                            <NavLink href="/dashboard" label="Panel" icon={LayoutDashboard} isDark={isDarkTheme} />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/dashboard/new"
                                    className={`
                                        hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                        ${isDarkTheme
                                            ? 'text-slate-300 hover:text-white hover:bg-white/5'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                                    `}
                                >
                                    <User className="w-4 h-4 text-emerald-500" />
                                    <span>{user.user_metadata?.name || 'Usuario'}</span>
                                </Link>

                                <button
                                    onClick={() => logout()}
                                    className={`
                                        px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                        ${isDarkTheme
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-lg shadow-black/20'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}
                                    `}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden xs:inline">Cerrar sesión</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className={`
                                        text-sm font-semibold px-4 py-2 rounded-xl transition-all
                                        ${isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
                                    `}
                                >
                                    Log in
                                </Link>
                                <Link href="/register">
                                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0">
                                        Empieza Gratis
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, icon: Icon, isDark, active }: { href: string, label: string, icon: any, isDark: boolean, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                ${active
                    ? (isDark ? 'text-emerald-400 bg-emerald-500/5' : 'text-emerald-600 bg-emerald-50')
                    : (isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')}
            `}
        >
            <Icon className={`w-4 h-4 transition-colors ${active ? 'text-emerald-500' : 'text-slate-500 group-hover:text-emerald-500'}`} />
            <span>{label}</span>
        </Link>
    );
}
