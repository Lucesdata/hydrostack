"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Users, Droplets, Clock, MapPin } from 'lucide-react';

interface Stat {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    sublabel: string;
    accentColor: string;
}

const stats: Stat[] = [
    {
        icon: MapPin,
        value: 15,
        suffix: '+',
        label: 'Proyectos Diseñados',
        sublabel: 'Colombia & Latinoamérica',
        accentColor: 'var(--teal-500)',
    },
    {
        icon: Users,
        value: 8500,
        suffix: '+',
        label: 'Habitantes Beneficiados',
        sublabel: 'Comunidades rurales',
        accentColor: 'var(--sky-400)',
    },
    {
        icon: Droplets,
        value: 120000,
        suffix: '',
        label: 'Litros/día Tratados',
        sublabel: 'Capacidad instalada',
        accentColor: '#60a5fa',
    },
    {
        icon: Clock,
        value: 85,
        suffix: '%',
        label: 'Reducción en Tiempo',
        sublabel: 'De diseño técnico',
        accentColor: 'var(--amber-500)',
    }
];

export default function StatsCounter() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.3 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative py-20 overflow-hidden"
            style={{ background: 'var(--ocean-900)' }}
        >
            {/* Background grid */}
            <div className="absolute inset-0 bg-grid-ocean pointer-events-none" />

            {/* Horizontal accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.35), transparent)' }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.2), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section label */}
                <div className="flex items-center gap-3 mb-14">
                    <span
                        className="text-xs font-mono tracking-widest uppercase"
                        style={{ color: 'var(--teal-400)' }}
                    >
                        Impacto medible
                    </span>
                    <div
                        className="flex-1 h-px max-w-[4rem]"
                        style={{ background: 'rgba(0,200,168,0.3)' }}
                    />
                    <span
                        className="text-xs font-mono tracking-widest uppercase"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Datos reales de proyectos
                    </span>
                </div>

                {/* Stats — horizontal with dividers on large screens */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            stat={stat}
                            isVisible={isVisible}
                            delay={index * 120}
                            isLast={index === stats.length - 1}
                        />
                    ))}
                </div>

                {/* Footer note */}
                <p
                    className="text-xs font-mono tracking-wider mt-10 text-center"
                    style={{ color: 'var(--text-muted)' }}
                >
                    // Acueductos rurales · Colombia · datos verificados en campo
                </p>
            </div>
        </section>
    );
}

function StatCard({
    stat,
    isVisible,
    delay,
    isLast
}: {
    stat: Stat;
    isVisible: boolean;
    delay: number;
    isLast: boolean;
}) {
    const [count, setCount] = useState(0);
    const Icon = stat.icon;

    useEffect(() => {
        if (!isVisible) return;
        const duration = 1800;
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

    return (
        <div
            className="relative px-8 py-10 group"
            style={{
                borderRight: isLast ? 'none' : '1px solid rgba(0,200,168,0.08)',
            }}
        >
            {/* Hover glow background */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at center, rgba(0,200,168,0.04) 0%, transparent 70%)` }}
            />

            {/* Icon */}
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-5"
                style={{
                    background: 'rgba(0,200,168,0.08)',
                    border: '1px solid rgba(0,200,168,0.15)',
                }}
            >
                <Icon className="w-4 h-4" style={{ color: stat.accentColor }} />
            </div>

            {/* Number */}
            <div className="mb-2 flex items-baseline gap-1">
                <span
                    className="font-display font-bold leading-none"
                    style={{
                        fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {count.toLocaleString('es-CO')}
                </span>
                <span
                    className="font-display font-bold text-2xl"
                    style={{ color: stat.accentColor }}
                >
                    {stat.suffix}
                </span>
            </div>

            {/* Label */}
            <p
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
            >
                {stat.label}
            </p>
            <p
                className="text-xs font-mono"
                style={{ color: 'var(--text-muted)' }}
            >
                {stat.sublabel}
            </p>

            {/* Bottom accent */}
            <div
                className="absolute bottom-0 left-8 h-0.5 w-0 group-hover:w-12 transition-all duration-500 rounded-full"
                style={{ background: stat.accentColor }}
            />
        </div>
    );
}
