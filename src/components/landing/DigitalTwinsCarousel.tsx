"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Shield, Layers, ArrowRight, Eye } from 'lucide-react';
import Image from 'next/image';

interface PlantCase {
    id: string;
    name: string;
    subtitle: string;
    sourceType: string;
    technology: string;
    features: string[];
    image: string;
    stats: { population: string; flow: string; efficiency: string; };
}

const plantCases: PlantCase[] = [
    {
        id: 'la-voragine',
        name: 'La Vorágine',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: ['Modelado hidráulico integral', 'FGDi + FLA', 'Validación normativa RAS-2000'],
        image: '/plants/voragine.png',
        stats: { population: '1,200', flow: '2.8 L/s', efficiency: '98.5%' }
    },
    {
        id: 'km-18',
        name: 'Km 18',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: ['Tren de tratamiento completo', 'Prefiltración + FLA', 'Lineamientos CINARA'],
        image: '/plants/km18.jpg',
        stats: { population: '850', flow: '1.9 L/s', efficiency: '97.2%' }
    },
    {
        id: 'campoalegre',
        name: 'Campoalegre',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: ['Diseño modular escalable', 'FGDi + FGAC + FLA', 'Optimización operativa'],
        image: '/plants/campo.png',
        stats: { population: '2,100', flow: '4.5 L/s', efficiency: '99.1%' }
    },
    {
        id: 'montebello',
        name: 'Montebello',
        subtitle: 'Acueducto Rural',
        sourceType: 'Superficial',
        technology: 'FIME',
        features: ['Perfil hidráulico completo', 'Desinfección integrada', 'Validación RAS-2000'],
        image: '/plants/monte.png',
        stats: { population: '1,450', flow: '3.2 L/s', efficiency: '98.8%' }
    },
    {
        id: 'soledad',
        name: 'Soledad',
        subtitle: 'Acueducto Rural',
        sourceType: 'Subterránea',
        technology: 'FIME',
        features: ['Balance de masas', 'Criterios CINARA', 'Gemelo digital operativo'],
        image: '/plants/soledad.png',
        stats: { population: '680', flow: '1.5 L/s', efficiency: '96.9%' }
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
        setCurrentIndex(prev => (prev + 1) % plantCases.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => (prev - 1 + plantCases.length) % plantCases.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.2 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };

    const visibleIndices = [0, 1, 2].map(i => (currentIndex + i) % plantCases.length);

    return (
        <section
            ref={sectionRef}
            id="digital-twins"
            className="relative py-28 overflow-hidden"
            style={{ background: 'var(--ocean-800)' }}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-wave-lines animate-wave-flow pointer-events-none" style={{ opacity: 0.5 }} />
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.2), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-6"
                        style={{
                            border: '1px solid rgba(0,200,168,0.2)',
                            background: 'rgba(0,200,168,0.06)',
                            color: 'var(--teal-400)',
                        }}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        5 Plantas Reales Digitalizadas
                    </div>
                    <div className="grid lg:grid-cols-[1fr_auto] items-end gap-6">
                        <h2
                            className="font-display font-bold leading-tight"
                            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                        >
                            Gemelos digitales<br />
                            <em style={{ color: 'var(--teal-400)', fontStyle: 'italic' }}>creados.</em>
                        </h2>
                        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                            Plantas reales transformadas en modelos digitales{' '}
                            <span style={{ color: 'var(--teal-400)', fontWeight: 600 }}>simulables y optimizables</span>{' '}
                            con criterios normativos.
                        </p>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Nav arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{
                            background: 'var(--ocean-900)',
                            border: '1px solid rgba(0,200,168,0.2)',
                            color: 'var(--teal-400)',
                        }}
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{
                            background: 'var(--ocean-900)',
                            border: '1px solid rgba(0,200,168,0.2)',
                            color: 'var(--teal-400)',
                        }}
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {visibleIndices.map((plantIdx, i) => {
                            const plant = plantCases[plantIdx];
                            const isHovered = hoveredCard === i;
                            const isCenter = i === 1;
                            return (
                                <div
                                    key={`${plant.id}-${i}`}
                                    onMouseEnter={() => setHoveredCard(i)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onMouseMove={handleMouseMove}
                                    className="group relative rounded-2xl overflow-hidden transition-all duration-500"
                                    style={{
                                        background: 'var(--ocean-900)',
                                        border: isHovered ? '1px solid rgba(0,200,168,0.35)' : '1px solid rgba(0,200,168,0.1)',
                                        boxShadow: isHovered ? '0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(0,200,168,0.08)' : '0 8px 30px rgba(0,0,0,0.25)',
                                        transform: isTransitioning
                                            ? 'scale(0.96) opacity(0.5)'
                                            : isHovered
                                                ? `perspective(900px) rotateX(${(mousePosition.y - 0.5) * 4}deg) rotateY(${(mousePosition.x - 0.5) * -4}deg) translateY(-6px)`
                                                : isCenter ? 'scale(1.03)' : 'scale(1)',
                                        transitionDelay: `${i * 80}ms`,
                                    }}
                                >
                                    {/* Image */}
                                    <div className="relative h-52 overflow-hidden">
                                        <Image
                                            src={plant.image}
                                            alt={plant.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            onError={e => { (e.target as HTMLImageElement).src = '/hero-bg.jpg'; }}
                                        />
                                        {/* Dark overlay */}
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--ocean-950) 0%, rgba(2,12,27,0.5) 40%, transparent 100%)' }} />

                                        {/* Teal overlay on hover */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                                            style={{ background: 'rgba(0,200,168,0.06)' }}
                                        />

                                        {/* Badge */}
                                        <div
                                            className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                                            style={{
                                                background: 'rgba(0,200,168,0.15)',
                                                border: '1px solid rgba(0,200,168,0.3)',
                                                color: 'var(--teal-400)',
                                                backdropFilter: 'blur(8px)',
                                            }}
                                        >
                                            <Layers className="w-3 h-3" />
                                            Gemelo Digital
                                        </div>

                                        {/* Stats on hover */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 px-4 pb-4 transition-all duration-300 grid grid-cols-3 gap-2 text-center"
                                            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateY(0)' : 'translateY(12px)' }}
                                        >
                                            {[
                                                { val: plant.stats.population, label: 'hab', color: 'var(--teal-400)' },
                                                { val: plant.stats.flow, label: 'caudal', color: 'var(--sky-400)' },
                                                { val: plant.stats.efficiency, label: 'efic.', color: 'var(--amber-400)' },
                                            ].map((s, j) => (
                                                <div key={j}>
                                                    <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>{s.val}</p>
                                                    <p className="text-xs font-mono" style={{ color: s.color }}>{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3
                                            className="font-display font-bold text-xl mb-1 transition-colors duration-200"
                                            style={{ color: isHovered ? 'var(--teal-400)' : 'var(--text-primary)' }}
                                        >
                                            {plant.name}
                                        </h3>
                                        <p className="text-xs font-mono mb-5" style={{ color: 'var(--text-muted)' }}>{plant.subtitle}</p>

                                        <ul className="space-y-2 mb-5">
                                            {plant.features.map((f, j) => (
                                                <li
                                                    key={j}
                                                    className="flex items-center gap-2.5 text-sm transition-transform duration-200"
                                                    style={{ color: 'var(--text-secondary)', transitionDelay: `${j * 40}ms`, transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--teal-500)' }} />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Meta */}
                                        <div
                                            className="flex items-center gap-4 pt-4 mb-5"
                                            style={{ borderTop: '1px solid rgba(0,200,168,0.08)' }}
                                        >
                                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}
                                                >
                                                    <Droplets className="w-3.5 h-3.5" style={{ color: 'var(--sky-400)' }} />
                                                </div>
                                                {plant.sourceType}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{ background: 'rgba(0,200,168,0.06)', border: '1px solid rgba(0,200,168,0.15)' }}
                                                >
                                                    <Shield className="w-3.5 h-3.5" style={{ color: 'var(--teal-400)' }} />
                                                </div>
                                                {plant.technology}
                                            </div>
                                        </div>

                                        <button
                                            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 group/btn"
                                            style={{
                                                background: isHovered ? 'var(--teal-500)' : 'rgba(0,200,168,0.06)',
                                                border: '1px solid rgba(0,200,168,0.2)',
                                                color: isHovered ? 'var(--ocean-950)' : 'var(--teal-400)',
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Caso de Estudio
                                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2.5 mt-10">
                        {plantCases.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsTransitioning(true);
                                    setTimeout(() => setIsTransitioning(false), 500);
                                }}
                                className="transition-all duration-300 rounded-full"
                                style={{
                                    width: index === currentIndex ? '2.5rem' : '0.6rem',
                                    height: '0.6rem',
                                    background: index === currentIndex ? 'var(--teal-500)' : 'rgba(0,200,168,0.2)',
                                }}
                                aria-label={`Ir al caso ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div
                    className={`mt-14 rounded-2xl p-8 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{
                        background: 'linear-gradient(135deg, var(--ocean-950) 0%, var(--ocean-700) 50%, var(--ocean-950) 100%)',
                        border: '1px solid rgba(0,200,168,0.15)',
                    }}
                >
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
                        ¿Quieres digitalizar tu planta de tratamiento?
                    </p>
                    <p className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--teal-400)', fontStyle: 'italic' }}>
                        Crea tu gemelo digital en minutos.
                    </p>
                    <button
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 group"
                        style={{
                            background: 'var(--teal-500)',
                            color: 'var(--ocean-950)',
                            boxShadow: '0 4px 20px rgba(0,200,168,0.25)',
                        }}
                    >
                        Empezar Ahora
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
