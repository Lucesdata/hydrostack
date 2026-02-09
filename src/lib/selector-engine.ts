/**
 * Motor del Selector de Proyecto y Tecnología — HydroStack Pro
 * Calcula puntajes por tecnología según origen, usuario y caudal.
 */

import type { ProjectContext, TreatmentCategory } from '@/types/project';

export type OrigenAgua = 'rio' | 'pozo' | 'lluvia' | 'mar';
export type UsuarioProyecto = 'rural' | 'municipal' | 'residencial' | 'industria';

export type TechKey = 'convencional' | 'fimes' | 'compacta' | 'uf' | 'ro';

export interface Criterio {
  id: string;
  label: string;
  desc: string;
}

export interface TechBaseScores {
  calidad: number;
  costo: number;
  simplicidad: number;
  robustez: number;
  energia: number;
}

export interface TecnologiaData {
  nombre: string;
  color: string;
  borderColor: string;
  bgColor: string;
  visible: boolean;
  base: TechBaseScores;
  desc: string;
  costo_txt: string;
  factorArea: number;
  // New Industrial Metrics
  reliability: string;
  deliveryTime: string;
  carbonFootprint: 'Positiva' | 'Negativa' | 'Neutra';
  waterRecovery: number;
  membraneLife: string;
  automationLevel: string;
  resilience: 'Alta' | 'Media' | 'Baja';
  opex: number;
  energyConsumptionKwh: number;
  viralRemoval: string;
}

export const CRITERIOS: Criterio[] = [
  { id: 'calidad', label: 'Calidad Agua', desc: 'Pureza' },
  { id: 'costo', label: 'Eficiencia Costos', desc: 'CAPEX/OPEX' },
  { id: 'simplicidad', label: 'Simplicidad', desc: 'Operación' },
  { id: 'robustez', label: 'Robustez', desc: 'Durabilidad' },
  { id: 'energia', label: 'Eficiencia Energ.', desc: 'Consumo' },
];

export const TECNOLOGIAS_DATA: Record<TechKey, TecnologiaData> = {
  convencional: {
    nombre: 'Convencional Plus',
    color: 'bg-gray-500',
    borderColor: 'rgba(107, 114, 128, 1)',
    bgColor: 'rgba(107, 114, 128, 0.2)',
    visible: true,
    base: { calidad: 60, costo: 80, simplicidad: 70, robustez: 80, energia: 90 },
    desc: "Planta de tratamiento físico-químico a gran escala. Optimizada para altos caudales con mínima huella energética operativa.",
    costo_txt: 'CAPEX Alto / OPEX Bajo.',
    factorArea: 4.0,
    reliability: 'A',
    deliveryTime: '12-16 Sem',
    carbonFootprint: 'Neutra',
    waterRecovery: 95,
    membraneLife: 'N/A',
    automationLevel: 'L3 (Semi)',
    resilience: 'Alta',
    opex: 0.025,
    energyConsumptionKwh: 0.08,
    viralRemoval: '3-Log',
  },
  fimes: {
    nombre: 'FIMES Stack Ultra',
    color: 'bg-green-600',
    borderColor: 'rgba(22, 163, 74, 1)',
    bgColor: 'rgba(22, 163, 74, 0.2)',
    visible: true,
    base: { calidad: 85, costo: 70, simplicidad: 95, robustez: 90, energia: 100 },
    desc: "Módulo de ultrafiltración inteligente diseñado para condiciones críticas. Polímero avanzado con retrolavado automático.",
    costo_txt: 'CAPEX Medio / OPEX Bajo.',
    factorArea: 25.0,
    reliability: 'A+',
    deliveryTime: '3-4 Sem',
    carbonFootprint: 'Negativa',
    waterRecovery: 98,
    membraneLife: '8-10 Años',
    automationLevel: 'L4 (Full)',
    resilience: 'Alta',
    opex: 0.042,
    energyConsumptionKwh: 0.12,
    viralRemoval: '4-Log',
  },
  compacta: {
    nombre: 'Compact Pro X',
    color: 'bg-orange-500',
    borderColor: 'rgba(249, 115, 22, 1)',
    bgColor: 'rgba(249, 115, 22, 0.2)',
    visible: true,
    base: { calidad: 80, costo: 50, simplicidad: 40, robustez: 70, energia: 60 },
    desc: "Sistema contenerizado Plug & Play. Ideal para despliegue rápido en zonas con espacio limitado.",
    costo_txt: 'CAPEX Medio / OPEX Medio.',
    factorArea: 1.2,
    reliability: 'B+',
    deliveryTime: '2-4 Sem',
    carbonFootprint: 'Positiva',
    waterRecovery: 90,
    membraneLife: '3-5 Años',
    automationLevel: 'L3 (Semi)',
    resilience: 'Media',
    opex: 0.085,
    energyConsumptionKwh: 0.45,
    viralRemoval: '3-Log',
  },
  uf: {
    nombre: 'UF Membrane Elite',
    color: 'bg-blue-500',
    borderColor: 'rgba(59, 130, 246, 1)',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    visible: true,
    base: { calidad: 90, costo: 60, simplicidad: 50, robustez: 60, energia: 70 },
    desc: "Ultrafiltración por fibra hueca con barrera física absoluta. Máxima pureza microbiológica.",
    costo_txt: 'CAPEX Alto / OPEX Medio.',
    factorArea: 1.0,
    reliability: 'A',
    deliveryTime: '6-8 Sem',
    carbonFootprint: 'Neutra',
    waterRecovery: 92,
    membraneLife: '5-7 Años',
    automationLevel: 'L4 (Full)',
    resilience: 'Alta',
    opex: 0.120,
    energyConsumptionKwh: 0.35,
    viralRemoval: '5-Log',
  },
  ro: {
    nombre: 'RO Marine Master',
    color: 'bg-purple-600',
    borderColor: 'rgba(147, 51, 234, 1)',
    bgColor: 'rgba(147, 51, 234, 0.2)',
    visible: true,
    base: { calidad: 100, costo: 30, simplicidad: 20, robustez: 40, energia: 20 },
    desc: "Ósmosis inversa para desalinización y rechazo total de solutos. El estándar de oro en pureza.",
    costo_txt: 'CAPEX Muy Alto / OPEX Alto.',
    factorArea: 1.5,
    reliability: 'A+',
    deliveryTime: '8-12 Sem',
    carbonFootprint: 'Positiva',
    waterRecovery: 65,
    membraneLife: '3-4 Años',
    automationLevel: 'L4 (Full)',
    resilience: 'Media',
    opex: 0.450,
    energyConsumptionKwh: 3.5,
    viralRemoval: '7-Log',
  },
};

export interface SelectorState {
  origen: OrigenAgua;
  usuario: UsuarioProyecto;
}

export interface CalcularResultado {
  datos: Record<TechKey, TecnologiaData>;
  texto: string;
  tip: string;
}

function clamp(val: number, min: number, max: number): number {
  if (val > max) return max;
  if (val < min) return min;
  return val;
}

export function calcularPuntajes(
  estado: SelectorState,
  caudalLps: number,
  tecnologias: Record<TechKey, TecnologiaData>
): CalcularResultado {
  const resultados = JSON.parse(JSON.stringify(tecnologias)) as Record<TechKey, TecnologiaData>;
  let explicacion = '';
  let tipTecnico = '';

  // 1. MODIFICADORES POR ORIGEN
  if (estado.origen === 'rio') {
    resultados.uf.base.robustez -= 30;
    resultados.ro.base.robustez -= 30;
    resultados.convencional.base.calidad += 10;
    resultados.compacta.base.robustez -= 10;
    tipTecnico =
      'En fuentes superficiales (Ríos), la carga de sedimentos varía con la lluvia. La tecnología seleccionada debe tener capacidad de amortiguamiento o un buen pretratamiento.';
  } else if (estado.origen === 'pozo') {
    resultados.fimes.base.costo -= 30;
    resultados.fimes.base.energia -= 40;
    resultados.compacta.base.calidad += 10;
    resultados.compacta.base.costo += 20;
    tipTecnico =
      '⚠️ ALERTA DE COSTOS: Usar FIMES con agua de pozo es un error común. Elevar el agua para que luego baje por gravedad genera un doble gasto energético. Es mejor usar filtros a presión (Compactas).';
  } else if (estado.origen === 'lluvia') {
    resultados.ro.base.costo -= 20;
    resultados.fimes.base.costo += 5;
    tipTecnico =
      'El agua de lluvia es ácida y baja en minerales. Requiere corrección de pH y remineralización, pero no filtración compleja.';
  } else if (estado.origen === 'mar') {
    resultados.ro.base.calidad = 100;
    resultados.ro.base.robustez += 20;
    (['convencional', 'fimes', 'compacta', 'uf'] as const).forEach((t) => {
      resultados[t].base.calidad = 10;
      resultados[t].base.robustez = 10;
    });
    explicacion = 'Para agua de mar (costas/islas), la Ósmosis Inversa es obligatoria para la desalinización.';
    tipTecnico =
      'La desalinización por RO produce agua muy pura pero corrosiva. Es obligatorio un post-tratamiento con filtros de calcita.';
    normalizar(resultados);
    return { datos: resultados, texto: explicacion, tip: tipTecnico };
  }

  // 2. MODIFICADORES POR USUARIO
  if (estado.usuario === 'rural') {
    resultados.fimes.base.costo += 20;
    resultados.fimes.base.simplicidad += 10;
    resultados.compacta.base.simplicidad -= 40;
    resultados.compacta.base.costo -= 20;
    resultados.ro.base.simplicidad -= 40;
    explicacion =
      'Para comunidades rurales de montaña, la FIMES es una opción tradicional, aunque sistemas modulares ganan terreno en mantenibilidad.';
    if (estado.origen === 'rio')
      tipTecnico +=
        ' ⚠️ IMPORTANTE: Para FIMES en ríos, es obligatorio instalar Filtros Gruesos Dinámicos (FGDi) antes.';
  } else if (estado.usuario === 'municipal') {
    resultados.fimes.base.costo -= 40;
    resultados.fimes.base.simplicidad -= 20;
    resultados.compacta.base.costo -= 20;
    resultados.convencional.base.costo += 20;
    resultados.convencional.base.simplicidad += 10;
    resultados.convencional.base.robustez += 15;
    explicacion =
      "Para abastecimiento municipal, la tecnología Convencional es la única que ofrece 'Economía de Escala'.";
    tipTecnico =
      '🏭 REALIDAD OPERATIVA: Las plantas municipales modernas integran sistemas SCADA. El mayor reto es gestionar los lodos químicos.';
  } else if (estado.usuario === 'residencial') {
    resultados.compacta.base.simplicidad += 20;
    resultados.compacta.base.costo += 20;
    resultados.fimes.base.costo -= 30;
    resultados.uf.base.simplicidad += 10;
    explicacion =
      'Las Plantas Compactas son la solución predilecta para el sector residencial y hotelero: estéticas y modulares.';
    tipTecnico =
      'En zonas residenciales, el ruido de las bombas y la estética de la planta son factores de diseño clave.';
  } else if (estado.usuario === 'industria') {
    resultados.ro.base.calidad += 20;
    resultados.ro.base.costo += 30;
    resultados.compacta.base.robustez += 10;
    resultados.uf.base.calidad += 10;
    explicacion =
      'Para la industria, las Plantas Compactas son vitales por su movilidad y rápida puesta en marcha.';
    tipTecnico = 'La industria requiere consistencia 24/7. Se suelen implementar sistemas redundantes (N+1).';
  }

  // 3. MODIFICADORES POR CAUDAL
  if (caudalLps > 0) {
    if (caudalLps < 5) {
      resultados.convencional.base.costo -= 30;
      resultados.compacta.base.costo += 10;
      resultados.fimes.base.costo += 10;
      if (!explicacion.includes('caudales'))
        explicacion += ' Para caudales bajos (<5 L/s), las soluciones modulares o FIMES son opciones a considerar.';
    } else if (caudalLps > 30) {
      resultados.fimes.base.costo -= 40;
      resultados.fimes.base.simplicidad -= 20;
      resultados.compacta.base.costo -= 20;
      resultados.convencional.base.costo += 25;
      if (!explicacion.includes('caudales'))
        explicacion += ' Con caudales altos (>30 L/s), la planta Convencional maximiza su eficiencia económica.';
    }
  }

  normalizar(resultados);
  return { datos: resultados, texto: explicacion, tip: tipTecnico };
}

function normalizar(resultados: Record<TechKey, TecnologiaData>): void {
  (Object.keys(resultados) as TechKey[]).forEach((key) => {
    (Object.keys(resultados[key].base) as (keyof TechBaseScores)[]).forEach((crit) => {
      const val = resultados[key].base[crit];
      resultados[key].base[crit] = clamp(val, 5, 100);
    });
  });
}

/** Mapea usuario del selector → ProjectContext */
export function usuarioToProjectContext(usuario: UsuarioProyecto): ProjectContext {
  const map: Record<UsuarioProyecto, ProjectContext> = {
    rural: 'rural',
    municipal: 'urban',
    residencial: 'residential',
    industria: 'industrial',
  };
  return map[usuario];
}

/** Mapea origen + tech key → project_context si es mar → desalination */
export function getProjectContext(
  origen: OrigenAgua,
  usuario: UsuarioProyecto
): ProjectContext {
  if (origen === 'mar') return 'desalination';
  return usuarioToProjectContext(usuario);
}

/** Mapea TechKey del selector → TreatmentCategory de HydroStack */
export function techKeyToTreatmentCategory(
  key: TechKey,
  origen: OrigenAgua
): TreatmentCategory {
  if (origen === 'mar') return 'desalination_high_purity';
  const map: Record<TechKey, TreatmentCategory> = {
    convencional: 'conventional_rapid',
    fimes: 'fime',
    compacta: 'compact_plant',
    uf: 'specific_plant',
    ro: 'reverse_osmosis',
  };
  return map[key];
}

/** Obtiene la tecnología recomendada (mayor puntaje global) */
export function getRecommendedTech(
  datos: Record<TechKey, TecnologiaData>
): { key: TechKey; nombre: string; score: number } | null {
  const visibleKeys = (Object.keys(datos) as TechKey[]).filter((k) => datos[k].visible);
  if (visibleKeys.length === 0) return null;
  // USER Objective: FIMES should not be recommended by default even with high score
  const filteredKeys = visibleKeys.filter(k => k !== 'fimes');
  const targetKeys = filteredKeys.length > 0 ? filteredKeys : visibleKeys;

  let maxScore = -1;
  let bestKey: TechKey = targetKeys[0];
  targetKeys.forEach((key) => {
    const scores = Object.values(datos[key].base);
    const promedio = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (promedio > maxScore) {
      maxScore = promedio;
      bestKey = key;
    }
  });
  return { key: bestKey, nombre: datos[bestKey].nombre, score: Math.round(maxScore) };
}
