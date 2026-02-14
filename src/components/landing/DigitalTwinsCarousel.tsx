"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Shield, Layers, Zap, Eye, Play } from 'lucide-react';
import Image from 'next/image';

interface PlantCase {
    id: string;
    name: string;
    subtitle: string;
    sourceType: string;
    technology: string;
    features: string[];
    image: string;
    stats: {
        population: string;
        flow: string;
        efficiency: string;
    };
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
        image: '/plants/voragine.png',
        stats: {
            population: '1,200',
            flow: '2.8 L/s',
            efficiency: '98.5%'
        }
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
        image: '/plants/km18.jpg',
        stats: {
            population: '850',
            flow: '1.9 L/s',
            efficiency: '97.2%'
        }
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
        image: '/plants/campo.png',
        stats: {
            population: '2,100',
            flow: '4.5 L/s',
            efficiency: '99.1%'
        }
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
        image: '/plants/monte.png',
        stats: {
            population: '1,450',
            flow: '3.2 L/s',
            efficiency: '98.8%'
        }
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
        image: '/plants/soledad.png',
        stats: {
            population: '680',
            flow: '1.5 L/s',
            efficiency: '96.9%'
        }
    }
];

export default function DigitalTwinsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % plantCases.length);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + plantCases.length) % plantCases.length);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    // Intersection Observer for entrance animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Auto-advance carousel
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    // Mouse parallax effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
    };

    // Visible cards
    const getVisibleIndices = () => {
        const indices = [];
        for (let i = 0; i < 3; i++) {
            indices.push((currentIndex + i) % plantCases.length);
        }
        return indices;
    };

    const visibleIndices = getVisibleIndices();

    return (
        <section 
            ref={sectionRef}
            id="digital-twins" 
            className="bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-24 font-sans relative overflow-hidden"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header with Animation */}
                <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6 animate-bounce">
                        <Zap className="w-4 h-4" />
                        5 Plantas Reales Digitalizadas
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-emerald-700 to-slate-900">
                        Gemelos Digitales Creados
                    </h2>
                    <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
                        Plantas de tratamiento reales transformadas en modelos digitales interactivos, 
                        <span className="font-semibold text-emerald-600"> simulables y optimizables</span> con criterios normativos.
                    </p>
                </div>

                {/* Carousel Container */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Navigation Arrows - Enhanced */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-2 border-emerald-200 shadow-2xl shadow-emerald-500/20 flex items-center justify-center text-slate-700 hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all duration-300 group"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:scale-125 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-2 border-emerald-200 shadow-2xl shadow-emerald-500/20 flex items-center justify-center text-slate-700 hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all duration-300 group"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-6 h-6 group-hover:scale-125 transition-transform" />
                    </button>

                    {/* Cards Container */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {visibleIndices.map((index, i) => {
                            const plant = plantCases[index];
                            const isHovered = hoveredCard === i;
                            const isCenterCard = i === 1;
                            
                            return (
                                <div
                                    key={`${plant.id}-${i}`}
                                    onMouseEnter={() => setHoveredCard(i)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onMouseMove={(e) => handleMouseMove(e, i)}
                                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
                                        isTransitioning ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
                                    } ${
                                        isHovered ? 'scale-105 -translate-y-2' : ''
                                    } ${
                                        isCenterCard ? 'md:scale-105' : ''
                                    }`}
                                    style={{
                                        transitionDelay: `${i * 100}ms`,
                                        transform: isHovered 
                                            ? `perspective(1000px) rotateX(${(mousePosition.y - 0.5) * 5}deg) rotateY(${(mousePosition.x - 0.5) * -5}deg)`
                                            : undefined
                                    }}
                                >
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

                                    {/* Image Container with Overlay */}
                                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                                        <Image
                                            src={plant.image}
                                            alt={plant.name}
                                            fill
                                            className={`object-cover transition-all duration-700 ${
                                                isHovered ? 'scale-110' : 'scale-100'
                                            }`}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/hero-bg.jpg';
                                            }}
                                        />
                                        
                                        {/* Gradient Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60"></div>
                                        <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-sky-500/30 opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>

                                        {/* Badge */}
                                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                                            <Layers className="w-3.5 h-3.5" />
                                            Gemelo Digital
                                        </div>

                                        {/* Interactive Play Button */}
                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                            isHovered ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
                                                <Play className="w-7 h-7 text-emerald-600 ml-1" fill="currentColor" />
                                            </div>
                                        </div>

                                        {/* Stats Overlay on Hover */}
                                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-4 transition-all duration-300 ${
                                            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                                        }`}>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-white text-lg font-black">{plant.stats.population}</p>
                                                    <p className="text-emerald-300 text-xs font-medium">Habitantes</p>
                                                </div>
                                                <div>
                                                    <p className="text-white text-lg font-black">{plant.stats.flow}</p>
                                                    <p className="text-sky-300 text-xs font-medium">Caudal</p>
                                                </div>
                                                <div>
                                                    <p className="text-white text-lg font-black">{plant.stats.efficiency}</p>
                                                    <p className="text-amber-300 text-xs font-medium">Eficiencia</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 relative">
                                        {/* Title */}
                                        <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                                            {plant.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium mb-5">{plant.subtitle}</p>

                                        {/* Features */}
                                        <ul className="space-y-2.5 mb-5">
                                            {plant.features.map((feature, j) => (
                                                <li 
                                                    key={j} 
                                                    className="flex items-start gap-2.5 text-sm text-slate-700 group-hover:translate-x-1 transition-transform"
                                                    style={{ transitionDelay: `${j * 50}ms` }}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform"></div>
                                                    <span className="leading-relaxed">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                                    <Droplets className="w-4 h-4 text-sky-600" />
                                                </div>
                                                {plant.sourceType}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <Shield className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                {plant.technology}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <button className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transform group-hover:scale-105">
                                            <Eye className="w-4 h-4" />
                                            Ver Caso de Estudio
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Enhanced Dots Indicator */}
                    <div className="flex justify-center gap-3 mt-12">
                        {plantCases.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsTransitioning(true);
                                    setTimeout(() => setIsTransitioning(false), 600);
                                }}
                                className={`transition-all duration-300 ${
                                    index === currentIndex
                                        ? 'w-12 h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/40'
                                        : 'w-3 h-3 bg-slate-300 hover:bg-slate-400 rounded-full hover:scale-125'
                                }`}
                                aria-label={`Ir al caso ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className={`mt-16 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 rounded-2xl p-8 text-center shadow-2xl transition-all duration-1000 delay-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                    <p className="text-white text-lg font-medium mb-4">
                        ¿Quieres digitalizar tu planta de tratamiento? 
                        <span className="block text-emerald-300 font-bold mt-1">Crea tu gemelo digital en minutos</span>
                    </p>
                    <button className="bg-white hover:bg-emerald-50 text-slate-900 font-black px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg">
                        Empezar Ahora →
                    </button>
                </div>
            </div>
        </section>
    );
}
