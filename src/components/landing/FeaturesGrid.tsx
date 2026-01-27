"use client";

import React from 'react';
import {
    Factory,
    Droplets,
    FileText,
    LayoutDashboard,
    Activity,
    Settings2
} from 'lucide-react';

export default function FeaturesGrid() {
    const features = [
        {
            icon: Factory,
            title: "Proyectos Rurales y Urbanos",
            desc: "Flujos adaptados para plantas compactas, FIME rurales o sistemas convencionales."
        },
        {
            icon: Settings2,
            title: "Modelado por Bloques",
            desc: "Gestión modular de Desarenadores, Coagulación, Sedimentación y Filtración."
        },
        {
            icon: CheckCircle2Icon, // Placeholder, defined below
            title: "Auditoría Técnica",
            desc: "Verificación automática de cumplimiento RAS 0330 en cada etapa del diseño."
        },
        {
            icon: Droplets,
            title: "Calidad del Agua",
            desc: "Cálculo de IRCA e índices de riesgo para priorizar tratamientos."
        },
        {
            icon: FileText,
            title: "Memorias Técnicas",
            desc: "Generación automática de textos justificativos y tablas de resumen."
        },
        {
            icon: LayoutDashboard,
            title: "Gestión Centralizada",
            desc: "Dashboard para administrar múltiples proyectos y estados de avance."
        }
    ];

    return (
        <section className="py-24 bg-background">
            <div className="container px-4 mx-auto">
                <div className="max-w-3xl mx-auto mb-20 text-center">
                    <span className="text-accent font-bold tracking-wider text-sm uppercase mb-2 block">Capacidades</span>
                    <h2 className="mb-4 text-3xl font-bold text-white font-sans">
                        Ingeniería de precisión
                    </h2>
                    <p className="text-lg text-muted">
                        Herramientas construidas por ingenieros, para ingenieros.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <div key={i} className="flex p-6 rounded-xl bg-surface border border-surface transition-colors hover:border-primary/30">
                            <div className="flex-shrink-0 mr-4">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface border border-surface text-primary">
                                    <f.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Helper for the icon that was missing import in the array clean-up
const CheckCircle2Icon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
