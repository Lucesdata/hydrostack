"use client";

import React from 'react';
import { Layers, Activity, ChevronDown, Zap, Cpu } from 'lucide-react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

export default function NewHero() {
    const router = useRouter();

    const handleStart = () => {
        router.push('/dashboard');
    };

    return (
        <header className="relative min-h-[900px] flex items-center pt-20 overflow-hidden bg-slate-900 font-sans">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Planta de Tratamiento de Agua Potable"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-900/30"></div>
                {/* Grid Overlay Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
            </div>

            {/* Robot Vision HUD Elements - Positioned to avoid text overlap */}
            <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block overflow-hidden">

                {/* HUD Element 1: FGDi Filter Analysis - Moved to top right corner away from form */}
                <div className="absolute top-[10%] right-[5%] opacity-40">
                    <div className="hud-dot"></div>
                    <div className="hud-line h-px w-16 right-2 top-[3px]"></div>
                    <div className="hud-line w-px h-12 right-[70px] top-[3px]"></div>
                    <div className="hud-card absolute top-14 right-[70px] p-3 rounded-md w-48 border-r-2 border-r-emerald-500 bg-slate-900/50 backdrop-blur-[1px]">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Filtro Grueso (FGDi)</span>
                            <span className="text-[10px] text-emerald-500 font-mono">OPERATIVO</span>
                        </div>
                        <div className="space-y-1 font-mono text-[10px] text-slate-400">
                            <div className="flex justify-between"><span>Turbiedad In:</span> <span className="text-slate-300">45 UNT</span></div>
                            <div className="flex justify-between"><span>Caudal:</span> <span className="text-slate-300">1.2 L/s</span></div>
                            <div className="flex justify-between"><span>Eficiencia:</span> <span className="text-emerald-500/80">90%</span></div>
                        </div>
                    </div>
                </div>

                {/* HUD Element 2: Slow Sand Filter (FLA) - Moved to bottom left corner below title */}
                <div className="absolute bottom-[15%] left-[5%] opacity-30">
                    <div className="hud-dot"></div>
                    <div className="hud-line h-px w-12 left-2 top-[3px] bg-sky-500/60"></div>
                    <div className="hud-card absolute bottom-4 left-16 p-3 rounded-md w-52 border border-sky-500/20 bg-slate-900/50 backdrop-blur-[1px]">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">Filtro Lento (FLA)</span>
                            <Activity className="w-3 h-3 text-sky-500" />
                        </div>
                        <div className="space-y-1 font-mono text-[10px] text-slate-400">
                            <div className="flex justify-between"><span>Color:</span> <span className="text-slate-300">5 UPC</span></div>
                            <div className="flex justify-between"><span>Coliformes:</span> <span className="text-emerald-500/80">0 UFC</span></div>
                            <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-sky-500/50 h-full w-[95%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HUD Element 3: IRCA Index - Moved deeper into background */}
                <div className="absolute top-[20%] left-[40%] opacity-20">
                    <div className="hud-card p-4 rounded-lg border border-white/5 bg-slate-900/30">
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Índice IRCA</div>
                        <div className="text-3xl font-mono text-slate-300 font-medium">0.5<span className="text-emerald-500/50 text-lg">RP</span></div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">

                {/* Hero Left Content */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Ingeniería de Acueductos Rurales
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1]">
                        Diseña Sistemas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500">Agua Potable</span> con Precisión.
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                        Hydrostack facilita el dimensionamiento de sistemas de tratamiento (FIME) para comunidades rurales. Integra cálculo de población flotante, caudales y selección de tecnología en minutos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handleStart}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Iniciar Proyecto Ahora
                        </button>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-[-8px]">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-white font-medium">JP</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white font-medium -ml-3">AS</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600 flex items-center justify-center text-xs text-white font-medium -ml-3">mk</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-xs text-white font-medium -ml-3">+100</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-sm text-slate-300">
                            Usado por <span className="text-white font-semibold">Acueductos Rurales</span> y ONGs.
                        </div>
                    </div>
                </div>

                {/* Hero Form / Sizing Calculator Preview */}
                <div className="glass-panel p-8 rounded-2xl text-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-semibold tracking-tight">Dimensionar Proyecto</h3>
                            <p className="text-slate-400 text-xs mt-1">Pre-diseño rápido basado en RAS-2000</p>
                        </div>
                        <Cpu className="w-6 h-6 text-emerald-400" />
                    </div>

                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleStart(); }}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider">Nombre del Acueducto</label>
                            <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="ej. Vereda La Esperanza" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Caudal (L/s)</label>
                                <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-all" placeholder="2.5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Población</label>
                                <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-all" placeholder="850" />
                            </div>
                        </div>

                        <div className="space-y-1.5 relative">
                            <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Tecnología Sugerida</label>
                            <div className="relative">
                                <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:border-emerald-500 outline-none transition-all">
                                    <option>FIME (Filtración Múltiples Etapas)</option>
                                    <option>Filtración Convencional</option>
                                    <option>Captación Agua Lluvia</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 group"
                            >
                                Calcular Diseño
                                <Zap className="w-4 h-4 group-hover:fill-current" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Scrolling Banner */}
            <div className="absolute bottom-0 left-0 w-full bg-slate-950 py-4 border-y border-white/5 overflow-hidden whitespace-nowrap z-20">
                <div className="flex items-center gap-16 text-slate-400 font-mono text-sm tracking-widest uppercase animate-marquee">
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Proyección Poblacional</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Selección FIME</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Diseño Desarenador</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Filtros Lentos (FLA)</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Filtración Gruesa (FGDi)</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Análisis de Riesgo</span>
                    {/* Duplicates for seamless loop */}
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Proyección Poblacional</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Selección FIME</span>
                </div>
            </div>
        </header>
    );
}
