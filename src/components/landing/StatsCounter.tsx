"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Users, Droplets, Clock, MapPin } from 'lucide-react';

interface Stat {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    color: string;
}

const stats: Stat[] = [
    {
        icon: MapPin,
        value: 15,
        suffix: '+',
        label: 'Proyectos Diseñados',
        color: 'text-emerald-400'
    },
    {
        icon: Users,
        value: 8500,
        suffix: '+',
        label: 'Habitantes Beneficiados',
        color: 'text-sky-400'
    },
    {
        icon: Droplets,
        value: 120000,
        suffix: '',
        label: 'Litros/día Tratados',
        color: 'text-blue-400'
    },
    {
        icon: Clock,
        value: 85,
        suffix: '%',
        label: 'Reducción en Tiempo de Diseño',
        color: 'text-amber-400'
    }
];

export default function StatsCounter() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="bg-slate-950 py-20 border-y border-white/5 relative overflow-hidden"
        >
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                        Impacto Medible en Ingeniería de Agua
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Datos reales de proyectos implementados con HYDROSTACK en comunidades rurales de Colombia.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            stat={stat}
                            isVisible={isVisible}
                            delay={index * 150}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function StatCard({ stat, isVisible, delay }: { stat: Stat; isVisible: boolean; delay: number }) {
    const [count, setCount] = useState(0);
    const Icon = stat.icon;

    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = stat.value / steps;
        const stepDuration = duration / steps;

        let current = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                current += increment;
                if (current >= stat.value) {
                    setCount(stat.value);
                    clearInterval(interval);
                } else {
                    setCount(Math.floor(current));
                }
            }, stepDuration);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [isVisible, stat.value, delay]);

    const formatNumber = (num: number) => {
        return num.toLocaleString('es-CO');
    };

    return (
        <div
            className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500"></div>

            <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>

                {/* Number */}
                <div className="mb-3">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        {formatNumber(count)}
                    </span>
                    <span className={`text-3xl font-black ${stat.color} ml-1`}>
                        {stat.suffix}
                    </span>
                </div>

                {/* Label */}
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    {stat.label}
                </p>
            </div>

            {/* Corner Accent */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
}
