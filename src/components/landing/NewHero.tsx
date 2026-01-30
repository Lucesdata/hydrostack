"use client";

import React from 'react';
import { Layers, ArrowRight, Activity, ChevronDown, Zap, Cpu } from 'lucide-react';
import Image from 'next/image';

export default function NewHero() {
    return (
        <header className="relative min-h-[900px] flex items-center pt-20 overflow-hidden bg-slate-900 font-sans">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Wastewater Treatment Plant"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-900/30"></div>
                {/* Grid Overlay Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
            </div>

            {/* Robot Vision HUD Elements */}
            <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">

                {/* HUD Element 1: Clarifier Analysis */}
                <div className="absolute top-[25%] left-[55%]">
                    <div className="hud-dot"></div>
                    <div className="hud-line h-px w-16 left-2 top-[3px]"></div>
                    <div className="hud-line w-px h-12 left-[70px] top-[3px]"></div>
                    <div className="hud-card absolute top-14 left-[70px] p-3 rounded-md w-48 border-l-2 border-l-emerald-500">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Clarifier 04</span>
                            <span className="text-[10px] text-emerald-500 font-mono">ACTIVE</span>
                        </div>
                        <div className="space-y-1 font-mono text-[10px] text-slate-300">
                            <div className="flex justify-between"><span>Diameter:</span> <span className="text-white">45.5m</span></div>
                            <div className="flex justify-between"><span>Flow Rate:</span> <span className="text-white">1,240m³/h</span></div>
                            <div className="flex justify-between"><span>TSS Removal:</span> <span className="text-emerald-400">98.2%</span></div>
                        </div>
                    </div>
                </div>

                {/* HUD Element 2: Biological Tank */}
                <div className="absolute top-[50%] left-[45%]">
                    <div className="hud-dot"></div>
                    <div className="hud-line h-px w-12 right-2 top-[3px] bg-sky-500/60"></div>
                    <div className="hud-card absolute bottom-4 right-16 p-3 rounded-md w-52 border border-sky-500/30 bg-slate-900/90">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">Aeration Zone</span>
                            <Activity className="w-3 h-3 text-sky-500" />
                        </div>
                        <div className="space-y-1 font-mono text-[10px] text-slate-300">
                            <div className="flex justify-between"><span>DO Level:</span> <span className="text-white">2.4 mg/L</span></div>
                            <div className="flex justify-between"><span>MLSS:</span> <span className="text-white">3,500 mg/L</span></div>
                            <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-sky-500 h-full w-[85%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HUD Element 3: Efficiency Metric */}
                <div className="absolute top-[15%] right-[10%]">
                    <div className="hud-card p-4 rounded-lg border border-white/10">
                        <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">System Efficiency</div>
                        <div className="text-3xl font-mono text-white font-medium">94.8<span className="text-emerald-500 text-lg">%</span></div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">

                {/* Hero Left Content */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        AI-Driven Plant Dimensioning
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1]">
                        Optimize Water Infrastructure with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500">Precision Data</span>.
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                        Hydrostack empowers civil engineers to dimension, simulate, and optimize wastewater treatment plants instantly. Reduce design time from weeks to minutes.
                    </p>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-[-8px]">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-white font-medium">JP</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white font-medium -ml-3">AS</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600 flex items-center justify-center text-xs text-white font-medium -ml-3">mk</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-xs text-white font-medium -ml-3">+2k</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-sm text-slate-300">
                            Trusted by <span className="text-white font-semibold">2,000+ Engineers</span> worldwide
                        </div>
                    </div>
                </div>

                {/* Hero Form / Sizing Calculator Preview */}
                <div className="glass-panel p-8 rounded-2xl text-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-semibold tracking-tight">Start Sizing Project</h3>
                            <p className="text-slate-400 text-xs mt-1">Free algorithmic assessment for registered users</p>
                        </div>
                        <Cpu className="w-6 h-6 text-emerald-400" />
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider">Project Name</label>
                            <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g. Municipal Plant North-01" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Inflow (m³/day)</label>
                                <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-all" placeholder="2500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Pop. Equivalent</label>
                                <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-all" placeholder="12500" />
                            </div>
                        </div>

                        <div className="space-y-1.5 relative">
                            <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Technology Type</label>
                            <div className="relative">
                                <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:border-emerald-500 outline-none transition-all">
                                    <option>Activated Sludge (CAS)</option>
                                    <option>MBBR (Moving Bed Biofilm)</option>
                                    <option>SBR (Sequencing Batch)</option>
                                    <option>Anaerobic Digestion</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="button" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 group cursor-not-allowed opacity-80">
                                Generate Design
                                <Zap className="w-4 h-4 group-hover:fill-current" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Scrolling Banner */}
            <div className="absolute bottom-0 left-0 w-full bg-slate-950 py-4 border-y border-white/5 overflow-hidden whitespace-nowrap z-20">
                <div className="flex items-center gap-16 text-slate-400 font-mono text-sm tracking-widest uppercase animate-marquee">
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Hydraulic Profiling</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Biological Load Calc</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Aeration Systems</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Sludge Management</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Energy Modeling</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> CAPEX Estimation</span>
                    {/* Duplicates for seamless loop */}
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Hydraulic Profiling</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Biological Load Calc</span>
                </div>
            </div>
        </header>
    );
}
