"use client";

import React from 'react';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
    name: string;
    role: string;
    company: string;
    avatar?: string;
    quote: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        name: "Ing. Carlos Mendoza",
        role: "Ingeniero Civil",
        company: "Acueducto Rural La Vorágine",
        avatar: "/avatars/avatar1.jpg",
        quote: "HYDROSTACK redujo el tiempo de diseño de 3 semanas a 2 días. La validación normativa automática nos dio confianza total en los cálculos.",
        rating: 5
    },
    {
        name: "Ing. María Rodríguez",
        role: "Consultora Ambiental",
        company: "Fundación Agua Clara",
        quote: "Los gemelos digitales nos permitieron optimizar plantas existentes sin necesidad de pruebas costosas. El ROI fue inmediato.",
        rating: 5
    },
    {
        name: "Ing. Javier Torres",
        role: "Director Técnico",
        company: "Alcaldía Municipal",
        quote: "La plataforma simplificó la presentación de proyectos ante el ministerio. Los reportes cumplen todo lo requerido por la normativa.",
        rating: 5
    }
];

export default function TestimonialsSection() {
    return (
        <section className="bg-white py-24 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        TESTIMONIOS
                    </span>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
                        Confiado por ingenieros de agua potable
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Profesionales de acueductos rurales, ONGs y entidades públicas confían en HYDROSTACK para sus diseños.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group relative"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote className="w-16 h-16 text-emerald-500" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote Text */}
                            <p className="text-slate-700 leading-relaxed mb-6 relative z-10">
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                    {/* Fallback to initials if no avatar */}
                                    <span>{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <div>
                                    <p className="text-slate-900 font-semibold text-sm">{testimonial.name}</p>
                                    <p className="text-slate-500 text-xs">{testimonial.role}</p>
                                    <p className="text-emerald-600 text-xs font-medium">{testimonial.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-sm text-slate-500">
                        ¿Quieres compartir tu experiencia? <a href="mailto:contacto@hydrostack.co" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Contáctanos</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
