"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative w-full overflow-hidden bg-background pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

            <div className="container relative z-10 px-4 mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium rounded-full bg-surface text-primary border border-surface/50">
                    <span className="relative flex w-2 h-2 mr-1">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary"></span>
                        <span className="relative inline-flex w-2 h-2 rounded-full bg-primary"></span>
                    </span>
                    Beta Pública v1.0
                </div>

                <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl font-sans">
                    HydroStack
                </h1>

                <p className="max-w-2xl mx-auto mb-10 text-lg text-muted md:text-xl font-light">
                    Asistente de ingeniería sanitaria para el diseño, auditoría y validación técnica de sistemas de tratamiento de agua bajo normativa RAS.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/dashboard/new" className="inline-flex items-center justify-center h-12 px-8 text-base font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                        Iniciar Proyecto
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <a href="#philosophy" className="inline-flex items-center justify-center h-12 px-8 text-base font-medium transition-colors border rounded-lg text-muted border-surface hover:bg-surface hover:text-white focus:outline-none focus:ring-2 focus:ring-surface focus:ring-offset-2">
                        Conocer Enfoque
                    </a>
                </div>

                <div className="mt-12 text-sm text-muted/60">
                    <p className="italic">"El sistema asiste. El ingeniero decide."</p>
                </div>
            </div>
        </section>
    );
}
