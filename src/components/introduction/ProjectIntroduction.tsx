'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Waves,
    Droplets,
    CloudRain,
    Ship,
    Users,
    LayoutDashboard,
    Box,
    Hotel,
    Factory,
    CheckCircle,
    FileText,
    LogOut,
    ArrowRight,
    MapPin,
    Map as MapIcon,
    Eye,
    X,
    Navigation,
    Sparkles,
    Search
} from 'lucide-react';
import type { OrigenAgua, UsuarioProyecto } from '@/lib/selector-engine';

interface ProjectIntroductionProps {
    onCreateProject?: (payload: {
        name: string;
        location: string;
        project_context: string;
        treatment_category: string;
        decision_metadata: Record<string, any>;
    }) => void;
    createLoading?: boolean;
}

const CONTEXT_OPTIONS = [
    { value: 'rural', label: 'Comunidad', icon: <Users className="w-5 h-5" /> },
    { value: 'urban', label: 'Ciudad', icon: <LayoutDashboard className="w-5 h-5" /> },
    { value: 'industrial', label: 'Centro Industrial', icon: <Factory className="w-5 h-5" /> },
    { value: 'residential', label: 'Hotel / Residencial', icon: <Hotel className="w-5 h-5" /> },
];

const SOURCE_OPTIONS = [
    { value: 'rio', label: 'Río / Quebrada', icon: <Waves className="w-5 h-5" /> },
    { value: 'pozo', label: 'Pozo / Subterránea', icon: <Droplets className="w-5 h-5" /> },
    { value: 'lluvia', label: 'Aguas Lluvia', icon: <CloudRain className="w-5 h-5" /> },
    { value: 'mar', label: 'Agua de Mar', icon: <Ship className="w-5 h-5" /> },
];

export default function ProjectIntroduction({
    onCreateProject,
    createLoading = false,
}: ProjectIntroductionProps) {
    const { user, signOut: logout } = useAuth();
    const [context, setContext] = useState<UsuarioProyecto>('rural');
    const [source, setSource] = useState<OrigenAgua>('rio');
    const [sourceName, setSourceName] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const contextLabel = useMemo(() => {
        const labels: Record<string, string> = {
            rural: 'comunidad',
            urban: 'ciudad',
            industrial: 'centro industrial',
            residential: 'hotel / conjunto residencial',
        };
        return labels[context] || context;
    }, [context]);

    const sourceLabel = useMemo(() => {
        const labels: Record<string, string> = {
            rio: 'fuentes superficiales (Río/Quebrada)',
            pozo: 'fuentes subterráneas (Pozo/Nacimiento)',
            mar: 'fuente marina (Desalinización)',
            lluvia: 'fuentes pluviales (Aguas Lluvia)'
        };
        return labels[source] || source;
    }, [source]);

    const handleCreate = () => {
        if (!name.trim() || !location.trim() || !onCreateProject) return;
        onCreateProject({
            name: name.trim(),
            location: location.trim(),
            project_context: context,
            treatment_category: 'fime',
            decision_metadata: {
                selector_origin: source,
                source_name: sourceName.trim() || null,
                selector_usuario: context,
                latitude: latitude || null,
                longitude: longitude || null,
            },
        });
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#0a0c10] text-slate-300 font-sans overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0c10]/80 backdrop-blur-md shrink-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Box className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-white">HYDROSTACK</h1>
                    </div>
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">FASE 0: Fundamentos del Proyecto</p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                    >
                        <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Previsualizar Informe</span>
                    </button>

                    <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-black text-white leading-none mb-1">{user?.user_metadata?.name || 'Ingeniero'}</p>
                            <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">Proyecto Nuevo</p>
                        </div>
                    </div>
                    <button onClick={() => logout()} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-white/5">
                    <div className="max-w-4xl mx-auto space-y-12">

                        <div className="space-y-4 text-center max-w-2xl mx-auto">
                            <h2 className="text-4xl font-black text-white tracking-tight italic">Etapa Fundamental</h2>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">Define la introducción y los objetivos técnicos que darán vida a tu memoria descriptiva.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Left Column: Context & Metadata */}
                            <div className="space-y-8">
                                {/* Step 1: Context */}
                                <div className="space-y-4 p-6 bg-slate-900/40 border border-white/5 rounded-[32px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">1</div>
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Tipo de Asentamiento</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CONTEXT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setContext(opt.value as UsuarioProyecto)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${context === opt.value
                                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${context === opt.value ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                                                    {opt.icon}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 3: Source */}
                                <div className="space-y-4 p-6 bg-slate-900/40 border border-white/5 rounded-[32px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">2</div>
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Fuente de Abastecimiento</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {SOURCE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSource(opt.value as OrigenAgua)}
                                                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${source === opt.value
                                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${source === opt.value ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                                                    {opt.icon}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Name & Location */}
                            <div className="space-y-8">
                                <div className="space-y-6 p-8 bg-slate-900/40 border border-white/5 rounded-[32px]">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">3</div>
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Nombre de la Fuente (Opcional)</label>
                                        </div>
                                        <div className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 group cursor-help transition-all hover:bg-white/10">
                                            <Sparkles className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IA en desarrollo</span>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Ej: Río Bogotá / Quebrada La Vieja"
                                            value={sourceName}
                                            onChange={(e) => setSourceName(e.target.value)}
                                            className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all font-medium"
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-600 leading-relaxed px-2">
                                        Si no conoces el nombre, puedes continuar. Próximamente HydroStack identificará automáticamente las fuentes cercanas según tu ubicación.
                                    </p>
                                </div>

                                <div className="space-y-6 p-8 bg-slate-900/40 border border-white/5 rounded-[32px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">4</div>
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Identificación y Geografía</label>
                                    </div>

                                    {/* Project Name */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre del Proyecto</label>
                                        <div className="relative group">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Ej: PTAP La Esperanza"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Localización (Municipio / Dpto)</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Ej: Guasca, Cundinamarca"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Coordinates (Optional) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Latitud (Opcional)</label>
                                            <div className="relative group">
                                                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="0.0000"
                                                    value={latitude}
                                                    onChange={(e) => setLatitude(e.target.value)}
                                                    className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Longitud (Opcional)</label>
                                            <div className="relative group">
                                                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="0.0000"
                                                    value={longitude}
                                                    onChange={(e) => setLongitude(e.target.value)}
                                                    className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/40 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleCreate}
                                        disabled={!name.trim() || !location.trim() || createLoading}
                                        className="w-full group bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                                    >
                                        {createLoading ? 'PREPARANDO INFORME...' : 'GUARDAR FUNDAMENTOS E INICIAR'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Narrative Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <div
                        className="absolute inset-0 bg-[#06080b]/90 backdrop-blur-xl"
                        onClick={() => setShowPreview(false)}
                    />
                    <div className="relative w-full max-w-4xl bg-[#0f1115] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-white/5 px-8 h-16 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <MapIcon className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memoria Descriptiva: Introducción</span>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-12 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-white/10">
                            <div className="max-w-2xl mx-auto space-y-8 text-slate-400 leading-[1.8] text-justify font-light">
                                <p>
                                    El agua es una de las sustancias químicas más importantes y uno de los principales constituyentes de la materia viva y del medio en que se vive, y su abastecimiento con excelente calidad y en cantidad suficiente es reconocido actualmente como una condición esencial para posibilitar el bienestar y el desarrollo de los asentamientos humanos.
                                </p>

                                <p>
                                    En la naturaleza el agua no se encuentra en estado puro pues en su contacto con la atmósfera y los suelos arrastra diversas sustancias en forma de gases disueltos, sólidos en suspensión y disueltos... Ese tratamiento se selecciona conociendo la calidad de la fuente de abasto y el uso a que se le destine después de tratada.
                                </p>

                                <div className="bg-emerald-500/5 p-8 rounded-[32px] border border-emerald-500/10 italic text-slate-300 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Navigation className="w-24 h-24 rotate-12" />
                                    </div>
                                    <p className="relative z-10">
                                        La decisión de realizar una construcción del sistema de potabilización <span className="text-emerald-400 font-bold underline decoration-emerald-500/30 underline-offset-4">
                                            en la {contextLabel} de {name || 'XXXX'}, ubicada en {location || 'XXXX'}
                                            {latitude && longitude ? `, con coordenadas geográficas de referencia ${latitude} de latitud y ${longitude} de longitud` : ''}
                                        </span> busca cumplir con el objetivo de tener agua de excelente calidad en sus hogares. Ante esta iniciativa se realiza entonces este informe, cuyo objetivo primordial es presentar el diseño de la planta de potabilización de agua para dicho sector... Las fuentes de agua identificadas para el abastecimiento del sistema corresponden a <span className="text-emerald-400 font-bold">{sourceName || sourceLabel}</span>, las cuales han sido previamente caracterizadas para el presente estudio.
                                    </p>
                                </div>

                                <p>
                                    Se presenta además el cálculo del sistema de desinfección para el acueducto <span className="text-emerald-400 font-bold">{name || 'XXXX'}</span>, el cual consta de dosificador de cabeza constante y tanque de almacenamiento.
                                </p>

                                <div className="pt-8 border-t border-white/5 flex justify-center">
                                    <div className="flex items-center gap-2 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Información Geolocalizada Activa</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <footer className="h-14 border-t border-white/5 bg-[#0a0c10] px-8 flex items-center justify-between text-slate-600 shrink-0">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500/50" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">
                        Resolución 0330/2017: Los parámetros geográficos definen el nivel de complejidad del sistema hidráulico.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>{contextLabel}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{sourceLabel}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{location || 'Sin ubicación'}</span>
                </div>
            </footer>
        </div>
    );
}
