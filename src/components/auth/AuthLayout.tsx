"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-900 font-sans overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-40"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
                {/* Grid Overlay Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-8">
                        <span className="text-2xl font-bold tracking-tight text-white">HYDROstack</span>
                    </Link>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">{title}</h1>
                    <p className="text-slate-400">{subtitle}</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10">
                    {children}
                </div>
            </div>
        </div>
    );
}
