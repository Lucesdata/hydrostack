'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CRITERIOS,
  TECNOLOGIAS_DATA,
  calcularPuntajes,
  getRecommendedTech,
  getProjectContext,
  techKeyToTreatmentCategory,
  type OrigenAgua,
  type UsuarioProyecto,
  type TechKey,
  type SelectorState,
  type TecnologiaData,
  type TechBaseScores,
} from '@/lib/selector-engine';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Minus,
  Waves,
  Droplets,
  CloudRain,
  Ship,
  Settings,
  Zap,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Activity,
  Leaf,
  Maximize,
  FileText,
  ChevronDown,
  Brain,
  Sparkles,
  Info,
  LogOut
} from 'lucide-react';

const ORIGEN_OPTIONS: { value: OrigenAgua; label: string; icon: React.ReactNode }[] = [
  { value: 'rio', label: 'Río / Superficial', icon: <Waves className="w-5 h-5" /> },
  { value: 'pozo', label: 'Pozo Profundo', icon: <Droplets className="w-5 h-5" /> },
  { value: 'mar', label: 'Agua de Mar', icon: <Ship className="w-5 h-5" /> },
  { value: 'lluvia', label: 'Agua de Lluvia', icon: <CloudRain className="w-5 h-5" /> },
];

interface ProjectTechSelectorProps {
  onCreateProject?: (payload: {
    name: string;
    project_context: string;
    treatment_category: string;
    decision_metadata: Record<string, unknown>;
    recommendedTech: { key: TechKey; nombre: string; score: number };
  }) => void;
  createLoading?: boolean;
}

export default function ProjectTechSelector({
  onCreateProject,
  createLoading = false,
}: ProjectTechSelectorProps) {
  const { user, signOut: logout } = useAuth();
  const [estado, setEstado] = useState<SelectorState>({ origen: 'rio', usuario: 'rural' });
  const [caudal, setCaudal] = useState(12.5);
  const [turbiedad, setTurbiedad] = useState(45.0);
  const [tecnologias, setTecnologias] = useState<Record<TechKey, TecnologiaData>>(() =>
    JSON.parse(JSON.stringify(TECNOLOGIAS_DATA))
  );
  const [projectName, setProjectName] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { datos, texto, tip } = useMemo(
    () => calcularPuntajes(estado, caudal, tecnologias),
    [estado, caudal, tecnologias]
  );

  const recommended = useMemo(() => getRecommendedTech(datos), [datos]);
  const activeTech = useMemo(() => recommended ? datos[recommended.key] : null, [recommended, datos]);

  const setScenario = useCallback((tipo: 'origen' | 'usuario', valor: OrigenAgua | UsuarioProyecto) => {
    setEstado((prev) => ({ ...prev, [tipo]: valor }));
  }, []);

  const handleCreateProject = useCallback(() => {
    const name = projectName.trim();
    if (!name || !recommended || !onCreateProject) return;
    const project_context = getProjectContext(estado.origen, estado.usuario);
    const treatment_category = techKeyToTreatmentCategory(recommended.key, estado.origen);
    onCreateProject({
      name,
      project_context,
      treatment_category,
      decision_metadata: {
        selector_origin: estado.origen,
        selector_usuario: estado.usuario,
        caudal_lps: caudal,
        turbiedad_ntu: turbiedad,
        global_score: recommended.score,
        recommended_tech_key: recommended.key,
      },
      recommendedTech: recommended,
    });
    setCreateModalOpen(false);
    setProjectName('');
  }, [estado, caudal, turbiedad, recommended, projectName, onCreateProject]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0c10] text-slate-300 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0c10] shrink-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black tracking-tighter text-emerald-400">
            HYDROSTACK
          </h1>
          <nav className="flex items-center gap-1">
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-emerald-500 text-white">Diseño</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">Simulación</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">Inventario</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-bold text-amber-500 shadow-lg shadow-amber-950/20">
            <Sparkles className="w-3.5 h-3.5" />
            Modo Optimización
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white leading-none mb-1">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
              </p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Ingeniero Pro</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-400 shadow-lg shadow-emerald-500/5">
              {(user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Input Configuration */}
        <aside className="w-80 border-r border-white/5 bg-[#0a0c10]/50 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-slate-800">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Configuración de Entrada</h2>

            <div className="space-y-6">
              {/* Fuente de Agua */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3">FUENTE DE AGUA</label>
                <div className="grid grid-cols-2 gap-2">
                  {ORIGEN_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setScenario('origen', o.value)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${estado.origen === o.value
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                      {o.icon}
                      <span className="text-[10px] font-bold text-center leading-tight">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Perfil de Usuario */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3">PERFIL DE USUARIO</label>
                <div className="relative group">
                  <select
                    value={estado.usuario}
                    onChange={(e) => setScenario('usuario', e.target.value as UsuarioProyecto)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="rural">Rural Concentrado</option>
                    <option value="municipal">Abastecimiento Municipal</option>
                    <option value="residencial">Sector Residencial</option>
                    <option value="industria">Complejo Industrial</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
                </div>
              </div>

              {/* Caudal de Diseño */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3">CAUDAL DE DISEÑO (L/S)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={caudal}
                      onChange={(e) => setCaudal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">L/s</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setCaudal(prev => prev + 0.5)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                    <button onClick={() => setCaudal(prev => Math.max(0.1, prev - 0.5))} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"><Minus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Restricciones Técnicas */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="block text-xs font-bold text-slate-400 mb-1">RESTRICCIONES TÉCNICAS</label>
                <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Turbiedad (NTU)</span>
                  <span className="text-sm font-bold text-blue-400">{turbiedad.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Consumo Energ.</span>
                  <span className="text-xs font-bold text-emerald-400">Bajo</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto bg-[#0a0c10] scrollbar-thin scrollbar-thumb-slate-800">

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Center Main Card - Optimized Selection */}
            <div className="xl:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-950 border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="w-32 h-32 text-emerald-500" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">Selección Optimizada</span>
                </div>

                <h2 className="text-4xl font-black text-white tracking-tight mb-4">
                  {activeTech?.nombre ?? 'Calculando...'}
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed max-w-xl mb-4">
                  {activeTech?.desc}
                </p>

                <div className="flex items-center gap-12">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Score General</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-emerald-400">{recommended?.score ?? 0}</span>
                      <span className="text-xs text-slate-600 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confiabilidad</span>
                    <span className="text-3xl font-black text-blue-400">{activeTech?.reliability}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tiempo Entrega</span>
                    <span className="text-xl font-bold text-white uppercase">{activeTech?.deliveryTime}</span>
                  </div>
                </div>

                <div className="absolute top-8 right-8 flex flex-col gap-2">
                  <div className="bg-slate-900/80 border border-white/10 rounded-full px-3 py-1 text-[9px] font-black text-slate-400 uppercase">MODULAR</div>
                  <div className="bg-slate-900/80 border border-white/10 rounded-full px-3 py-1 text-[9px] font-black text-slate-400 uppercase">PLUG & PLAY</div>
                </div>
              </div>

              {/* Glowing Border Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
            </div>

            {/* Right Panel - Risk Analysis */}
            <div className="bg-[#1a1408] border border-amber-900/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Análisis de Riesgo</h3>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-2">Eventos de Turbiedad Alta</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {estado.origen === 'rio'
                    ? `El modelo predictivo detecta una probabilidad del 85% de picos >100 NTU durante la temporada invernal para fuentes superficiales.`
                    : `Estabilidad de turbidez detectada en fuente ${estado.origen}. Se recomienda monitoreo estacional.`
                  }
                </p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 mt-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Settings className="w-8 h-8 text-amber-500" />
                </div>
                <h5 className="text-[10px] font-black text-amber-500 uppercase mb-2">Recomendación</h5>
                <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                  {estado.origen === 'rio'
                    ? 'Añadir módulo de pre-sedimentación activa o coagulación in-line para proteger la vida útil de la membrana.'
                    : tip
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Lower Main Panel - Technical Breakdown */}
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Desglose Técnico y Eficiencia</h3>
                <p className="text-xs text-slate-500 mt-1">Simulación basada en el caudal de {caudal} L/s y perfil {estado.usuario}.</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-[10px] font-bold text-slate-300 transition-all">
                <Maximize className="w-3.5 h-3.5" />
                Ver Análisis Detallado
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-12">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Eficiencia de Remoción</span>
                  <span className="text-emerald-400">99.9%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: '99.9%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">OpEx Estimado (USD/m³)</span>
                  <span className="text-sky-400">${activeTech?.opex.toFixed(3)}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all duration-1000" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Nivel de Automatización</span>
                  <span className="text-white">{activeTech?.automationLevel}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 transition-all duration-1000" style={{ width: activeTech?.automationLevel.includes('L4') ? '100%' : '75%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Remoción Virus/Bacterias</span>
                  <span className="text-emerald-400">{activeTech?.viralRemoval}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Consumo Energético</span>
                  <span className="text-sky-400">{activeTech?.energyConsumptionKwh} kWh/m³</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all duration-1000" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Resiliencia Operativa</span>
                  <span className="text-white">{activeTech?.resilience}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 transition-all duration-1000" style={{ width: activeTech?.resilience === 'Alta' ? '100%' : '60%' }}></div>
                </div>
              </div>
            </div>

            {/* Bottom Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Huella de Carbono</span>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span className="text-lg font-black text-emerald-400">{activeTech?.carbonFootprint}</span>
                </div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Recuperación Agua</span>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span className="text-lg font-black text-white">{activeTech?.waterRecovery}%</span>
                </div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Área Requerida</span>
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-black text-white">{(caudal * (activeTech?.factorArea ?? 0)).toFixed(0)} m²</span>
                </div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Vida Útil Membrana</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-black text-white">{activeTech?.membraneLife}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer Bar */}
      <footer className="h-14 bg-[#080a0d] border-t border-white/5 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-slate-500">
          <Info className="w-4 h-4" />
          <p className="text-[10px] leading-relaxed">
            Los cálculos están basados en la normativa vigente de agua potable (Res. 0330). Diseño validado para caudales de hasta 50 L/s.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
            Descargar Especificaciones PDF
          </button>
          <button
            disabled={createLoading}
            onClick={() => setCreateModalOpen(true)}
            className="group px-10 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black rounded-lg transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/10 active:scale-95"
          >
            {createLoading ? 'PROCESANDO...' : 'CREAR PROYECTO'}
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </footer>

      {/* Simplified Create Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Nuevo Proyecto</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Configuración: {activeTech?.nombre}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Nombre del Proyecto</label>
                  <input
                    autoFocus
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Eje: Planta de Tratamiento El Mirador"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                  <ul className="text-[10px] space-y-2 text-slate-400 font-bold uppercase tracking-wider">
                    <li className="flex justify-between"><span>Fuente:</span> <span className="text-white">{estado.origen}</span></li>
                    <li className="flex justify-between"><span>Caudal:</span> <span className="text-white">{caudal} L/s</span></li>
                    <li className="flex justify-between"><span>Normativa:</span> <span className="text-emerald-400">RES-0330</span></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 px-4 py-4 rounded-xl text-xs font-black text-slate-500 hover:text-slate-300 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || createLoading}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 px-4 py-4 rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/10"
                >
                  {createLoading ? 'INICIALIZANDO...' : 'CONFIRMAR Y CREAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
