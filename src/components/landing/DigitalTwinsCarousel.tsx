"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Shield, Layers } from 'lucide-react';
import Image from 'next/image';

interface PlantCase {
    id: string;
    name: string;
    subtitle: string;
    sourceType: string;
    technology: string;
    features: string[];
    image: string;
}

const plantCases: PlantCase[] = [
    {
        id: 'la-voragine',
        name: 'La Vorágine',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: [
            'Modelado hidráulico integral',
            'FGDi + FLA',
            'Validación normativa RAS-2000'
        ],
        image: '/plants/voragine.png'
    },
    {
        id: 'km-18',
        name: 'Km 18',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: [
            'Tren de tratamiento completo',
            'Prefiltración + FLA',
            'Lineamientos CINARA'
        ],
        image: '/plants/km18.jpg'
    },
    {
        id: 'campoalegre',
        name: 'Campoalegre',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: [
            'Diseño modular escalable',
            'FGDi + FGAC + FLA',
            'Optimización operativa'
        ],
        image: '/plants/campo.png'
    },
    {
        id: 'montebello',
        name: 'Montebello',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: [
            'Perfil hidráulico completo',
            'Desinfección integrada',
            'Validación RAS-2000'
        ],
        image: '/plants/monte.png'
    },
    {
        id: 'soledad',
        name: 'Soledad',
        subtitle: 'Acueducto Rural',
        sourceType: 'Subterránea',
        technology: 'FIME',
        features: [
            'Balance de masas',
            'Criterios CINARA',
            'Gemelo digital operativo'
        ],
        image: '/plants/soledad.png'
    }
];

export default function DigitalTwinsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % plantCases.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + plantCases.length) % plantCases.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    // Auto-advance carousel
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    // Visible cards (show 3 at a time on desktop)
    const getVisibleIndices = () => {
        const indices = [];
        for (let i = 0; i < 3; i++) {
            indices.push((currentIndex + i) % plantCases.length);
        }
        return indices;
    };

    const visibleIndices = getVisibleIndices();

    return (
        <section className="bg-white py-20 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
                        Gemelos digitales creados
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Plantas de tratamiento reales modeladas, simuladas y optimizadas con criterios normativos en HYDROSTACK.
                    </p>
                </div>

                {/* Carousel Container */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Cards Container */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                        {visibleIndices.map((index, i) => {
                            const plant = plantCases[index];
                            return (
                                <div
                                    key={`${plant.id}-${i}`}
                                    className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${isTransitioning ? 'opacity-80' : 'opacity-100'
                                        }`}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                                        <Image
                                            src={plant.image}
                                            alt={plant.name}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/hero-bg.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                        {/* Badge */}
                                        <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                            <Layers className="w-3 h-3" />
                                            Gemelo Digital
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{plant.name}</h3>
                                        <p className="text-sm text-slate-500 mb-4">{plant.subtitle}</p>

                                        {/* Features */}
                                        <ul className="space-y-2 mb-4">
                                            {plant.features.map((feature, j) => (
                                                <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                                                {plant.sourceType}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                                {plant.technology}
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <button className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
                                            Ver caso
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {plantCases.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-emerald-500 w-6'
                                    : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                                aria-label={`Ir al caso ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
