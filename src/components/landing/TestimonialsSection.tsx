"use client";

import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    rating: number;
    initials: string;
    accentColor: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Ing. Carlos Mendoza",
        role: "Ingeniero Civil",
        company: "Acueducto Rural La Vorágine",
        quote: "HYDROSTACK redujo el tiempo de diseño de 3 semanas a 2 días. La validación normativa automática nos dio confianza total en los cálculos.",
        rating: 5,
        initials: "CM",
        accentColor: 'var(--teal-500)',
    },
    {
        name: "Ing. María Rodríguez",
        role: "Consultora Ambiental",
        company: "Fundación Agua Clara",
        quote: "Los gemelos digitales nos permitieron optimizar plantas existentes sin necesidad de pruebas costosas. El ROI fue inmediato.",
        rating: 5,
        initials: "MR",
        accentColor: 'var(--sky-400)',
    },
    {
        name: "Ing. Javier Torres",
        role: "Director Técnico",
        company: "Alcaldía Municipal",
        quote: "La plataforma simplificó la presentación de proyectos ante el ministerio. Los reportes cumplen todo lo requerido por la normativa.",
        rating: 5,
        initials: "JT",
        accentColor: 'var(--amber-500)',
    }
];

export default function TestimonialsSection() {
    return (
        <section
            className="relative py-28 overflow-hidden"
            style={{ background: 'var(--ocean-950)' }}
        >
            {/* Background wave */}
            <div className="absolute inset-0 bg-wave-lines animate-wave-flow pointer-events-none" style={{ opacity: 0.5 }} />

            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.2), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="grid lg:grid-cols-[1fr_auto] items-end mb-16 gap-6">
                    <div>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-6"
                            style={{
                                border: '1px solid rgba(0,200,168,0.2)',
                                background: 'rgba(0,200,168,0.06)',
                                color: 'var(--teal-400)',
                            }}
                        >
                            Testimonios
                        </div>
                        <h2
                            className="font-display font-bold leading-tight"
                            style={{
                                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Confiado por ingenieros<br />
                            de{' '}
                            <em style={{ color: 'var(--teal-400)', fontStyle: 'italic' }}>agua potable.</em>
                        </h2>
                    </div>
                    <p
                        className="text-sm leading-relaxed max-w-xs"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Profesionales de acueductos rurales, ONGs y entidades públicas confían en HYDROSTACK.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="group relative p-8 rounded-2xl transition-all duration-300"
                            style={{
                                background: 'var(--ocean-900)',
                                border: '1px solid rgba(0,200,168,0.1)',
                            }}
                        >
                            {/* Hover border */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{ border: `1px solid ${t.accentColor}35`, boxShadow: `0 0 30px ${t.accentColor}08` }}
                            />

                            {/* Large decorative quote character */}
                            <div
                                className="font-display absolute top-4 right-6 text-8xl leading-none pointer-events-none select-none"
                                style={{ color: t.accentColor, opacity: 0.07, fontStyle: 'italic' }}
                            >
                                "
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-5">
                                {Array.from({ length: t.rating }).map((_, j) => (
                                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--amber-500)' }} />
                                ))}
                            </div>

                            {/* Quote */}
                            <p
                                className="font-display text-lg leading-snug mb-8 relative z-10"
                                style={{
                                    color: 'var(--text-primary)',
                                    fontStyle: 'italic',
                                    fontWeight: 300,
                                }}
                            >
                                "{t.quote}"
                            </p>

                            {/* Author */}
                            <div
                                className="flex items-center gap-4 pt-5"
                                style={{ borderTop: '1px solid rgba(0,200,168,0.08)' }}
                            >
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                        background: `${t.accentColor}18`,
                                        border: `1px solid ${t.accentColor}30`,
                                        color: t.accentColor,
                                        fontFamily: 'var(--font-mono)',
                                    }}
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <p
                                        className="font-semibold text-sm"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {t.name}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {t.role}
                                    </p>
                                    <p
                                        className="text-xs font-mono"
                                        style={{ color: t.accentColor }}
                                    >
                                        {t.company}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="text-center mt-12">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        ¿Quieres compartir tu experiencia?{' '}
                        <a
                            href="mailto:contacto@hydrostack.co"
                            className="transition-colors duration-200"
                            style={{ color: 'var(--teal-500)' }}
                        >
                            Contáctanos
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
