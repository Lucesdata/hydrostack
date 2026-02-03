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

const ORIGEN_OPTIONS: { value: OrigenAgua; label: string; icon: string }[] = [
  { value: 'rio', label: 'Río', icon: '🌊' },
  { value: 'pozo', label: 'Pozo', icon: '🕳️' },
  { value: 'lluvia', label: 'Lluvia', icon: '🌧️' },
  { value: 'mar', label: 'Mar', icon: '🏝️' },
];

const USUARIO_OPTIONS: { value: UsuarioProyecto; label: string; icon: string }[] = [
  { value: 'rural', label: 'Rural', icon: '🏡' },
  { value: 'municipal', label: 'Municipal', icon: '🏘️' },
  { value: 'residencial', label: 'Residencial', icon: '🏢' },
  { value: 'industria', label: 'Industria', icon: '🏭' },
];

function getBarColor(valor: number): string {
  if (valor >= 80) return 'bg-emerald-500';
  if (valor >= 50) return 'bg-amber-400';
  return 'bg-rose-500';
}

function animateNumber(
  element: HTMLElement | null,
  start: number,
  end: number,
  duration: number
): void {
  if (!element || start === end) return;
  const startTime = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(start + (end - start) * ease);
    element.innerText = String(val);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

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
  const [estado, setEstado] = useState<SelectorState>({ origen: 'rio', usuario: 'rural' });
  const [caudal, setCaudal] = useState(10);
  const [tecnologias, setTecnologias] = useState<Record<TechKey, TecnologiaData>>(() =>
    JSON.parse(JSON.stringify(TECNOLOGIAS_DATA))
  );
  const [modalTech, setModalTech] = useState<TechKey | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [compTech1, setCompTech1] = useState<TechKey>('convencional');
  const [compTech2, setCompTech2] = useState<TechKey>('fimes');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const globalScoreRef = useRef<HTMLSpanElement>(null);
  const prevScoreRef = useRef(0);

  const { datos, texto, tip } = useMemo(
    () => calcularPuntajes(estado, caudal, tecnologias),
    [estado, caudal, tecnologias]
  );

  const recommended = useMemo(() => getRecommendedTech(datos), [datos]);
  const visibleKeys = useMemo(
    () => (Object.keys(datos) as TechKey[]).filter((k) => datos[k].visible),
    [datos]
  );

  useEffect(() => {
    if (recommended && globalScoreRef.current)
      animateNumber(globalScoreRef.current, prevScoreRef.current, recommended.score, 800);
    if (recommended) prevScoreRef.current = recommended.score;
  }, [recommended?.score]);

  const setScenario = useCallback((tipo: 'origen' | 'usuario', valor: OrigenAgua | UsuarioProyecto) => {
    setEstado((prev) => ({ ...prev, [tipo]: valor }));
  }, []);

  const toggleTech = useCallback((key: TechKey) => {
    setTecnologias((prev) => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible },
    }));
  }, []);

  const resetDashboard = useCallback(() => {
    setEstado({ origen: 'rio', usuario: 'rural' });
    setCaudal(10);
    setTecnologias(JSON.parse(JSON.stringify(TECNOLOGIAS_DATA)));
    setModalTech(null);
    setComparisonOpen(false);
    prevScoreRef.current = 0;
  }, []);

  const exportarDashboard = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('selector-dashboard-container');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2 });
      const link = document.createElement('a');
      link.download = 'HydroStack-Analisis.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Fallback: descargar resumen JSON
      const summary = {
        origen: estado.origen,
        usuario: estado.usuario,
        caudal_lps: caudal,
        recomendacion: recommended,
        fecha: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'HydroStack-Analisis.json';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [estado, caudal, recommended]);

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
        global_score: recommended.score,
        recommended_tech_key: recommended.key,
      },
      recommendedTech: recommended,
    });
    setCreateModalOpen(false);
    setProjectName('');
  }, [estado, caudal, recommended, projectName, onCreateProject]);

  return (
    <div
      id="selector-dashboard-container"
      className="flex flex-col h-full min-h-screen w-full bg-slate-50"
    >
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center shadow-md shrink-0 z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight">
            HydroStack <span className="text-blue-300 font-light">Pro</span>
          </h1>
          <div className="h-6 w-px bg-blue-700" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetDashboard}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-2 text-blue-100 hover:text-white"
            >
              🔄 Reiniciar
            </button>
            <button
              type="button"
              onClick={exportarDashboard}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-2"
            >
              📸 Exportar
            </button>
            <button
              type="button"
              onClick={() => setComparisonOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-2 shadow-sm border border-blue-500"
            >
              ⚔️ Comparar
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-blue-800/50 px-4 py-1 rounded-lg border border-blue-700">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-200">
            Score Global
          </span>
          <span ref={globalScoreRef} id="global-score" className="text-lg font-bold text-white">
            {recommended?.score ?? 0}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10 shrink-0">
          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Origen del Agua
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ORIGEN_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setScenario('origen', o.value)}
                    className={`p-2 rounded-lg border text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow ${estado.origen === o.value
                      ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                      : 'bg-slate-50 border-slate-100'
                      }`}
                  >
                    <div className="text-xl mb-1">{o.icon}</div>
                    <div className="text-[10px] font-bold text-slate-600 leading-tight">{o.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Usuario / Proyecto
              </label>
              <div className="grid grid-cols-2 gap-2">
                {USUARIO_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setScenario('usuario', o.value)}
                    className={`p-2 rounded-lg border text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow ${estado.usuario === o.value
                      ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                      : 'bg-slate-50 border-slate-100'
                      }`}
                  >
                    <div className="text-xl mb-1">{o.icon}</div>
                    <div className="text-[10px] font-bold text-slate-600 leading-tight">{o.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                3. Caudal (L/s)
              </label>
              <input
                type="number"
                value={caudal}
                min={0.1}
                step={0.1}
                onChange={(e) => setCaudal(parseFloat(e.target.value) || 0)}
                className="w-full p-3 text-xl font-black text-blue-600 border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              />
              <div className="text-[9px] text-center text-slate-400 mt-1">Litros por Segundo</div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Filtros Activos
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(tecnologias) as TechKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTech(key)}
                    className={`tech-toggle px-2 py-1 rounded text-[10px] font-bold text-slate-600 border border-slate-200 shadow-sm flex items-center gap-1 transition-all ${tecnologias[key].visible
                      ? 'opacity-100 ring-1 ring-blue-400 bg-blue-50'
                      : 'opacity-60 grayscale'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${tecnologias[key].color}`} />
                    {tecnologias[key].nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-auto space-y-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                disabled={!onCreateProject || createLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {createLoading ? 'Creando...' : '✓ Crear proyecto con esta configuración'}
              </button>
              <Link
                href="/dashboard"
                className="block w-full py-2 text-center text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                ← Mis proyectos
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
            <div
              className={`col-span-1 p-4 rounded-xl border shadow-sm flex flex-col justify-center relative overflow-hidden ${(recommended?.score ?? 0) > 85
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-slate-200'
                }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`p-3 rounded-full text-2xl ${(recommended?.score ?? 0) > 85 ? 'bg-green-100' : 'bg-blue-50'
                    }`}
                >
                  {(recommended?.score ?? 0) > 85 ? '🏆' : '💡'}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">
                    Recomendación
                  </p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">
                    {recommended?.nombre ?? '---'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">
                    {texto || 'Configura las opciones para iniciar el análisis.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm flex gap-3 items-start overflow-y-auto">
              <span className="text-xl mt-0.5">🎓</span>
              <div>
                <span className="font-bold text-amber-800 text-[10px] uppercase block mb-1">
                  Análisis Técnico
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{tip || 'Cargando...'}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                Matriz de Decisión
              </h3>
            </div>
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr className="text-xs text-slate-500 border-b border-slate-100">
                    <th className="p-3 font-bold bg-slate-50 w-1/4">Criterio</th>
                    {visibleKeys.map((key) => (
                      <th key={key} className="p-2 text-center text-slate-600 font-bold bg-slate-50 align-bottom">
                        <button
                          type="button"
                          onClick={() => setModalTech(key)}
                          className="hover:text-blue-600 transition-colors flex flex-col items-center justify-center gap-1 w-full"
                        >
                          <span className="text-[10px] uppercase tracking-wider">
                            {datos[key].nombre}
                          </span>
                          <span className="text-[10px] opacity-50">ℹ️</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {CRITERIOS.map((crit) => (
                    <tr key={crit.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-3 border-b border-slate-50">
                        <div className="font-bold text-slate-700 text-xs">{crit.label}</div>
                      </td>
                      {visibleKeys.map((key) => {
                        const techBase = datos[key].base;
                        const valor = techBase[crit.id as keyof TechBaseScores];
                        const color = getBarColor(valor);
                        return (
                          <td key={key} className="p-3 border-b border-slate-50 align-middle">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                                  style={{ width: `${valor}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold w-6 text-right text-slate-500">
                                {valor}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Ficha Tecnología */}
      {modalTech && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModalTech(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 text-white ${datos[modalTech].color}`}>
              <h3 className="text-2xl font-bold">{datos[modalTech].nombre}</h3>
              <p className="text-blue-100 text-sm mt-1">Ficha Técnica Resumida</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 leading-relaxed">{datos[modalTech].desc}</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-sm text-slate-700 mb-2">💰 Estimación de Costos</h4>
                <p className="text-sm text-slate-600">{datos[modalTech].costo_txt}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-sm text-slate-700 mb-2">🏗️ Área Estimada Requerida</h4>
                <p className="text-sm text-slate-600">
                  <span className="text-2xl font-black text-slate-800">
                    {(caudal * datos[modalTech].factorArea).toFixed(1)} m²
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    (Estimado para {caudal} L/s)
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalTech(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comparación */}
      {comparisonOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setComparisonOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col m-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-slate-800 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold">Comparación Directa</h3>
              <button
                type="button"
                onClick={() => setComparisonOpen(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <select
                  value={compTech1}
                  onChange={(e) => setCompTech1(e.target.value as TechKey)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {(Object.keys(datos) as TechKey[]).map((key) => (
                    <option key={key} value={key}>
                      {datos[key].nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={compTech2}
                  onChange={(e) => setCompTech2(e.target.value as TechKey)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {(Object.keys(datos) as TechKey[]).map((key) => (
                    <option key={key} value={key}>
                      {datos[key].nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-2">
                    {datos[compTech1].nombre}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">{datos[compTech1].desc}</p>
                  <div className="text-xs text-slate-400 uppercase font-bold mb-2">Área req.</div>
                  <div className="text-xl font-black text-slate-700 mb-4">
                    {(caudal * datos[compTech1].factorArea).toFixed(1)} m²
                  </div>
                  <div className="space-y-2">
                    {CRITERIOS.map((c) => {
                      const techBase = datos[compTech1].base;
                      const val = techBase[c.id as keyof TechBaseScores];
                      return (
                        <div key={c.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">{c.label}</span>
                            <span className="font-bold">{val}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getBarColor(val)}`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-2">
                    {datos[compTech2].nombre}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">{datos[compTech2].desc}</p>
                  <div className="text-xs text-slate-400 uppercase font-bold mb-2">Área req.</div>
                  <div className="text-xl font-black text-slate-700 mb-4">
                    {(caudal * datos[compTech2].factorArea).toFixed(1)} m²
                  </div>
                  <div className="space-y-2">
                    {CRITERIOS.map((c) => {
                      const techBase = datos[compTech2].base;
                      const val = techBase[c.id as keyof TechBaseScores];
                      return (
                        <div key={c.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">{c.label}</span>
                            <span className="font-bold">{val}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getBarColor(val)}`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Proyecto */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !createLoading && setCreateModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Crear proyecto</h3>
            <p className="text-sm text-slate-600 mb-4">
              Se creará un proyecto con: <strong>{recommended?.nombre}</strong>, contexto{' '}
              {estado.usuario}, origen {estado.origen}, caudal {caudal} L/s.
            </p>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nombre del proyecto *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ej: Acueducto Vereda El Salitre"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-4 text-slate-900"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                disabled={createLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={createLoading || !projectName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
