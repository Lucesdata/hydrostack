/**
 * Motor del Selector de Tecnología — HydroStack
 * Selecciona la tecnología óptima de tratamiento de agua potable
 * según fuente, perfil operativo, caudal y turbiedad.
 *
 * Datos basados en:
 * - Resolución 0330 de 2017 (Colombia)
 * - Guías CINARA/UniValle para FiME
 * - Literatura técnica de referencia (OMS, AWWA)
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
  nombreCorto: string;
  color: string;
  borderColor: string;
  bgColor: string;
  visible: boolean;
  applicable: boolean; // ← si la tecnología es aplicable al escenario
  base: TechBaseScores;
  desc: string;
  costo_txt: string;
  factorArea: number; // m² por L/s — valores reales de referencia
  // Métricas técnicas reales
  complejidadOperativa: 'Baja' | 'Media' | 'Alta';
  tiempoConstruccion: string;
  carbonFootprint: 'Positiva' | 'Negativa' | 'Neutra';
  waterRecovery: number; // %
  membraneLife: string;
  automationLevel: string;
  resilience: 'Alta' | 'Media' | 'Baja';
  opex: number; // USD/m³
  energyConsumptionKwh: number; // kWh/m³
  viralRemoval: string; // log removal
  removalEfficiency: number; // % remoción turbiedad
  requiereQuimicos: boolean;
  requiereElectricidad: boolean;
  caudalMin: number; // L/s
  caudalMax: number; // L/s
  tags: string[];
  // Datos semilla del proyecto (cadena de procesos)
  trenConfig: string; // Configuración del tren de tratamiento
  capexPerLps: [number, number]; // Rango [min, max] USD por L/s instalado
}

export const CRITERIOS: Criterio[] = [
  { id: 'calidad', label: 'Calidad Agua', desc: 'Capacidad de remoción de contaminantes' },
  { id: 'costo', label: 'Eficiencia Costos', desc: 'CAPEX + OPEX relativo' },
  { id: 'simplicidad', label: 'Simplicidad', desc: 'Complejidad de operación y mantenimiento' },
  { id: 'robustez', label: 'Robustez', desc: 'Resistencia a variaciones de calidad de agua cruda' },
  { id: 'energia', label: 'Eficiencia Energ.', desc: 'Consumo eléctrico por m³ tratado' },
];

export const TECNOLOGIAS_DATA: Record<TechKey, TecnologiaData> = {
  fimes: {
    nombre: 'FiME — Filtración en Múltiples Etapas',
    nombreCorto: 'FiME',
    color: 'bg-green-600',
    borderColor: 'rgba(22, 163, 74, 1)',
    bgColor: 'rgba(22, 163, 74, 0.2)',
    visible: true,
    applicable: true,
    base: { calidad: 80, costo: 90, simplicidad: 95, robustez: 85, energia: 100 },
    desc: 'Filtración en Múltiples Etapas por gravedad: FGDi → FGAC → FLA. Sin químicos, sin electricidad. Ideal para comunidades rurales con fuentes superficiales de turbiedad ≤70 NTU.',
    costo_txt: 'CAPEX Medio / OPEX Muy Bajo (sin químicos ni energía)',
    factorArea: 25.0,
    complejidadOperativa: 'Baja',
    tiempoConstruccion: '4–8 meses',
    carbonFootprint: 'Negativa',
    waterRecovery: 95,
    membraneLife: 'N/A',
    automationLevel: 'Manual',
    resilience: 'Alta',
    opex: 0.03,
    energyConsumptionKwh: 0.0,
    viralRemoval: '2–3 Log',
    removalEfficiency: 95,
    requiereQuimicos: false,
    requiereElectricidad: false,
    caudalMin: 0.5,
    caudalMax: 50,
    tags: ['Gravedad', 'Sin Químicos'],
    trenConfig: 'FGDi → FGAC → FLA',
    capexPerLps: [2000, 3500],
  },
  convencional: {
    nombre: 'Planta Convencional de Potabilización',
    nombreCorto: 'Convencional',
    color: 'bg-gray-500',
    borderColor: 'rgba(107, 114, 128, 1)',
    bgColor: 'rgba(107, 114, 128, 0.2)',
    visible: true,
    applicable: true,
    base: { calidad: 90, costo: 60, simplicidad: 50, robustez: 90, energia: 50 },
    desc: 'Coagulación → Floculación → Sedimentación → Filtración Rápida → Desinfección. Requiere operador capacitado y suministro de químicos (sulfato de aluminio, cloro).',
    costo_txt: 'CAPEX Alto / OPEX Medio (químicos + energía)',
    factorArea: 60.0,
    complejidadOperativa: 'Alta',
    tiempoConstruccion: '12–18 meses',
    carbonFootprint: 'Positiva',
    waterRecovery: 95,
    membraneLife: 'N/A',
    automationLevel: 'L2–L3 (Semi)',
    resilience: 'Alta',
    opex: 0.18,
    energyConsumptionKwh: 0.35,
    viralRemoval: '3–4 Log',
    removalEfficiency: 97,
    requiereQuimicos: true,
    requiereElectricidad: true,
    caudalMin: 5,
    caudalMax: 500,
    tags: ['Economía de Escala', 'Químicos'],
    trenConfig: 'Coag → Floc → Sed → FR → Desinf',
    capexPerLps: [6000, 12000],
  },
  compacta: {
    nombre: 'Planta Compacta Modular',
    nombreCorto: 'Compacta',
    color: 'bg-orange-500',
    borderColor: 'rgba(249, 115, 22, 1)',
    bgColor: 'rgba(249, 115, 22, 0.2)',
    visible: true,
    applicable: true,
    base: { calidad: 85, costo: 65, simplicidad: 70, robustez: 70, energia: 60 },
    desc: 'Sistema contenerizado con los mismos procesos convencionales en menor espacio. Instalación rápida, ideal para espacio limitado o demanda temporal.',
    costo_txt: 'CAPEX Medio / OPEX Medio',
    factorArea: 3.0,
    complejidadOperativa: 'Media',
    tiempoConstruccion: '2–4 meses',
    carbonFootprint: 'Positiva',
    waterRecovery: 90,
    membraneLife: 'N/A',
    automationLevel: 'L3 (Semi)',
    resilience: 'Media',
    opex: 0.12,
    energyConsumptionKwh: 0.30,
    viralRemoval: '3 Log',
    removalEfficiency: 95,
    requiereQuimicos: true,
    requiereElectricidad: true,
    caudalMin: 0.5,
    caudalMax: 25,
    tags: ['Modular', 'Plug & Play'],
    trenConfig: 'Coag → Floc → Sed → FR (modular)',
    capexPerLps: [4000, 7000],
  },
  uf: {
    nombre: 'Ultrafiltración por Membrana',
    nombreCorto: 'UF Membrana',
    color: 'bg-blue-500',
    borderColor: 'rgba(59, 130, 246, 1)',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    visible: true,
    applicable: true,
    base: { calidad: 95, costo: 50, simplicidad: 45, robustez: 60, energia: 60 },
    desc: 'Barrera física absoluta por fibra hueca (0.01–0.1 µm). Máxima remoción microbiológica. Requiere electricidad y mantenimiento de membranas.',
    costo_txt: 'CAPEX Alto / OPEX Medio–Alto (reposición membranas)',
    factorArea: 1.5,
    complejidadOperativa: 'Alta',
    tiempoConstruccion: '3–6 meses',
    carbonFootprint: 'Neutra',
    waterRecovery: 92,
    membraneLife: '5–7 Años',
    automationLevel: 'L4 (Full)',
    resilience: 'Media',
    opex: 0.18,
    energyConsumptionKwh: 0.25,
    viralRemoval: '4–5 Log',
    removalEfficiency: 99.9,
    requiereQuimicos: false,
    requiereElectricidad: true,
    caudalMin: 0.5,
    caudalMax: 30,
    tags: ['Membrana', 'Barrera Física'],
    trenConfig: 'Pre-filtro → UF (fibra hueca) → Desinf',
    capexPerLps: [8000, 15000],
  },
  ro: {
    nombre: 'Ósmosis Inversa (Desalinización)',
    nombreCorto: 'Ósmosis Inversa',
    color: 'bg-purple-600',
    borderColor: 'rgba(147, 51, 234, 1)',
    bgColor: 'rgba(147, 51, 234, 0.2)',
    visible: true,
    applicable: true,
    base: { calidad: 100, costo: 20, simplicidad: 20, robustez: 40, energia: 10 },
    desc: 'Rechazo total de solutos a través de membrana semipermeable. Obligatoria para desalinización. Produce agua ultra-pura pero requiere alto consumo energético.',
    costo_txt: 'CAPEX Muy Alto / OPEX Alto (energía + membranas)',
    factorArea: 2.0,
    complejidadOperativa: 'Alta',
    tiempoConstruccion: '6–12 meses',
    carbonFootprint: 'Positiva',
    waterRecovery: 45,
    membraneLife: '3–5 Años',
    automationLevel: 'L4 (Full)',
    resilience: 'Baja',
    opex: 0.55,
    energyConsumptionKwh: 3.5,
    viralRemoval: '7 Log',
    removalEfficiency: 99.99,
    requiereQuimicos: true,
    requiereElectricidad: true,
    caudalMin: 0.1,
    caudalMax: 100,
    tags: ['Desalinización', 'Alta Pureza'],
    trenConfig: 'Captación → Pre-trat → HP Pump → RO → Post-trat',
    capexPerLps: [15000, 30000],
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
  riskTitle: string;
  riskDescription: string;
  riskRecommendation: string;
}

function clamp(val: number, min: number, max: number): number {
  if (val > max) return max;
  if (val < min) return min;
  return val;
}

/**
 * Calcula la aptitud de cada tecnología según las condiciones del proyecto.
 * En vez de solo sumar/restar puntos arbitrarios, ahora:
 * 1. Evalúa APLICABILIDAD (puede o no puede tratar esta agua)
 * 2. Ajusta scores por viabilidad operativa
 * 3. Genera warnings y recomendaciones contextuales
 */
export function calcularPuntajes(
  estado: SelectorState,
  caudalLps: number,
  turbiedad: number,
  tecnologias: Record<TechKey, TecnologiaData>
): CalcularResultado {
  const resultados = JSON.parse(JSON.stringify(tecnologias)) as Record<TechKey, TecnologiaData>;
  let explicacion = '';
  let tipTecnico = '';
  let riskTitle = '';
  let riskDescription = '';
  let riskRecommendation = '';

  // Reset applicability
  (Object.keys(resultados) as TechKey[]).forEach((k) => {
    resultados[k].applicable = true;
  });

  // ═══════════════════════════════════════════════
  // 1. APLICABILIDAD POR FUENTE DE AGUA
  // ═══════════════════════════════════════════════
  if (estado.origen === 'rio') {
    // Fuente superficial: FiME, Convencional, Compacta, UF → aplicables
    // RO → innecesaria (sobredimensionada para agua dulce)
    resultados.ro.applicable = false;
    resultados.ro.base.costo = 5;
    resultados.ro.base.simplicidad = 5;

    // FiME es fuerte en superficial
    resultados.fimes.base.robustez += 10;
    // Convencional maneja bien la variabilidad
    resultados.convencional.base.robustez += 5;

    explicacion =
      'Para fuentes superficiales (ríos, quebradas), las opciones principales son FiME (gravedad) o Convencional (con químicos). La turbiedad del agua cruda determinará la configuración específica.';
    tipTecnico =
      'En ríos, la turbiedad varía con las lluvias. La tecnología seleccionada debe tolerar picos o incluir pretratamiento adecuado.';

    // Risk panel
    riskTitle = 'Variabilidad de Turbiedad';
    if (turbiedad > 50) {
      riskDescription = `Con turbiedad de ${turbiedad} NTU, el agua cruda presenta carga alta de sedimentos. Esto limita las opciones de tratamiento sin pretratamiento robusto.`;
      riskRecommendation = 'Considerar pre-sedimentación o desarenador antes del tren principal. Para FiME, verificar que la configuración FGAC sea la adecuada.';
    } else if (turbiedad > 20) {
      riskDescription = `Con turbiedad de ${turbiedad} NTU, el agua requiere tratamiento completo. Los picos estacionales pueden superar este valor.`;
      riskRecommendation = 'Se recomienda incluir FGDi o pre-sedimentación para amortiguar picos de turbiedad durante temporada de lluvias.';
    } else {
      riskDescription = `Turbiedad de ${turbiedad} NTU indica agua de buena calidad relativa. Favorable para sistemas de filtración directa.`;
      riskRecommendation = 'Monitorear turbiedad estacionalmente para dimensionar el tren de tratamiento con factor de seguridad.';
    }

  } else if (estado.origen === 'pozo') {
    // Pozo profundo: Convencional, Compacta, UF → aplicables
    // FiME → no diseñada para agua subterránea (ya filtrada naturalmente)
    // RO → solo si es salobre
    resultados.fimes.applicable = false;
    resultados.fimes.base.costo = 10;
    resultados.fimes.base.simplicidad = 10;
    resultados.ro.applicable = false;
    resultados.ro.base.costo = 5;

    // Compacta y UF son buenas opciones para pozos
    resultados.compacta.base.costo += 15;
    resultados.compacta.base.simplicidad += 10;
    resultados.uf.base.calidad += 5;

    explicacion =
      'Para agua subterránea, FiME no es adecuada (diseñada para superficiales). Los problemas típicos son hierro, manganeso y dureza, que requieren aireación o filtración a presión.';
    tipTecnico =
      'El agua de pozo generalmente tiene baja turbiedad pero puede contener hierro (>0.3 mg/L) o manganeso (>0.1 mg/L) que requieren aireación.';

    riskTitle = 'Calidad del Agua Subterránea';
    riskDescription = 'Las fuentes subterráneas pueden contener hierro, manganeso, arsénico o exceso de dureza que no son visibles a simple vista.';
    riskRecommendation = 'Es obligatorio un análisis fisicoquímico completo del pozo antes de seleccionar la tecnología. Incluir prueba de bombeo.';

  } else if (estado.origen === 'lluvia') {
    // Agua de lluvia: FiME simplificada, Compacta → aplicables
    // Convencional → sobredimensionada
    // RO → innecesaria
    resultados.convencional.applicable = false;
    resultados.convencional.base.costo = 10;
    resultados.ro.applicable = false;
    resultados.ro.base.costo = 5;

    resultados.fimes.base.costo += 10;
    resultados.compacta.base.simplicidad += 15;
    resultados.uf.base.calidad += 5;

    explicacion =
      'El agua de lluvia tiene baja turbiedad pero es ácida (pH ~5.5) y carece de minerales. Requiere corrección de pH y remineralización, no filtración compleja.';
    tipTecnico =
      'El agua de lluvia puede contener contaminación atmosférica. Siempre descartar los primeros minutos de lluvia (first flush).';

    riskTitle = 'Acidez y Falta de Minerales';
    riskDescription = 'El agua de lluvia tiene pH bajo (~5.5) y ausencia de minerales esenciales (calcio, magnesio). El agua resultante puede ser agresiva para tuberías.';
    riskRecommendation = 'Incluir etapa de corrección de pH (filtro de calcita) y remineralización en el post-tratamiento.';

  } else if (estado.origen === 'mar') {
    // Agua de mar: SOLO RO es viable
    resultados.ro.applicable = true;
    resultados.ro.base.calidad = 100;
    resultados.ro.base.robustez += 10;
    (['convencional', 'fimes', 'compacta', 'uf'] as const).forEach((t) => {
      resultados[t].applicable = false;
      resultados[t].base.calidad = 5;
      resultados[t].base.robustez = 5;
      resultados[t].base.costo = 5;
    });

    explicacion = 'Para agua de mar (salinidad ~35,000 mg/L TDS), la Ósmosis Inversa es la única tecnología capaz de desalinizar a niveles potables.';
    tipTecnico = 'La desalinización por RO produce agua muy pura pero corrosiva (pH bajo, sin minerales). Es obligatorio un post-tratamiento con filtros de calcita.';

    riskTitle = 'Consumo Energético Elevado';
    riskDescription = 'La desalinización por ósmosis inversa requiere 3–5 kWh/m³, lo que implica un suministro eléctrico robusto y continuo.';
    riskRecommendation = 'Dimensionar la fuente de energía (generador o red) para el consumo de la planta. Considerar sistemas de recuperación de energía (ERD).';

    normalizar(resultados);
    return { datos: resultados, texto: explicacion, tip: tipTecnico, riskTitle, riskDescription, riskRecommendation };
  }

  // ═══════════════════════════════════════════════
  // 2. VIABILIDAD POR PERFIL OPERATIVO
  // ═══════════════════════════════════════════════
  if (estado.usuario === 'rural') {
    // Rural: sin electricidad confiable, sin químicos, operador básico
    // → Favorecer tecnologías simples
    resultados.fimes.base.costo += 15;
    resultados.fimes.base.simplicidad += 5;

    // Penalizar tecnologías que requieren infraestructura
    if (resultados.convencional.applicable) {
      resultados.convencional.base.simplicidad -= 25;
      resultados.convencional.base.costo -= 20;
    }
    if (resultados.uf.applicable) {
      resultados.uf.base.simplicidad -= 20;
    }
    if (resultados.ro.applicable) {
      resultados.ro.base.simplicidad -= 30;
    }

    if (!explicacion.includes('rural'))
      explicacion +=
        ' Para comunidades rurales, se priorizan tecnologías sin dependencia de químicos ni electricidad.';

  } else if (estado.usuario === 'municipal') {
    // Municipal: operador capacitado, economía de escala
    if (resultados.convencional.applicable) {
      resultados.convencional.base.costo += 25;
      resultados.convencional.base.robustez += 10;
    }
    // FiME es costosa a gran escala municipal (mucha área)
    if (resultados.fimes.applicable) {
      resultados.fimes.base.costo -= 20;
    }
    if (!explicacion.includes('municipal'))
      explicacion +=
        ' Para abastecimiento municipal, la planta convencional ofrece economía de escala con operador capacitado.';

  } else if (estado.usuario === 'residencial') {
    if (resultados.compacta.applicable) {
      resultados.compacta.base.simplicidad += 15;
      resultados.compacta.base.costo += 15;
    }
    if (resultados.uf.applicable) {
      resultados.uf.base.simplicidad += 10;
    }
    if (!explicacion.includes('residencial'))
      explicacion +=
        ' Para el sector residencial, las plantas compactas ofrecen bajo impacto visual y operación simplificada.';

  } else if (estado.usuario === 'industria') {
    if (resultados.uf.applicable) {
      resultados.uf.base.calidad += 10;
      resultados.uf.base.costo += 10;
    }
    if (resultados.ro.applicable) {
      resultados.ro.base.calidad += 10;
      resultados.ro.base.costo += 15;
    }
    if (resultados.compacta.applicable) {
      resultados.compacta.base.robustez += 10;
    }
    if (!explicacion.includes('industria'))
      explicacion +=
        ' La industria requiere calidad consistente 24/7. Se recomiendan sistemas con alta automatización y redundancia.';
  }

  // ═══════════════════════════════════════════════
  // 3. AJUSTE POR CAUDAL (escala)
  // ═══════════════════════════════════════════════
  (Object.keys(resultados) as TechKey[]).forEach((key) => {
    const tech = resultados[key];
    if (!tech.applicable) return;
    if (caudalLps < tech.caudalMin) {
      tech.base.costo -= 30;
      tech.base.simplicidad -= 20;
    } else if (caudalLps > tech.caudalMax) {
      tech.base.costo -= 40;
      tech.base.robustez -= 20;
    }
  });

  if (caudalLps > 50 && resultados.convencional.applicable) {
    resultados.convencional.base.costo += 20;
  }

  // ═══════════════════════════════════════════════
  // 4. RESTRICCIÓN POR TURBIEDAD (matriz CINARA para FiME)
  // ═══════════════════════════════════════════════
  if (resultados.fimes.applicable) {
    if (turbiedad > 70) {
      // BLOQUEO CINARA: FiME no aplicable
      resultados.fimes.applicable = false;
      resultados.fimes.base.calidad = 5;
      resultados.fimes.base.robustez = 5;
      if (!riskTitle) {
        riskTitle = 'Turbiedad Fuera de Rango FiME';
        riskDescription = `Con ${turbiedad} NTU, la turbiedad excede el límite de 70 NTU para FiME (CINARA). Se requiere estudio piloto o tecnología alternativa.`;
        riskRecommendation = 'Considerar planta convencional o UF con pretratamiento. Si se desea FiME, realizar estudio piloto.';
      }
    } else if (turbiedad > 50) {
      // FiME máxima: 3×FGAC
      resultados.fimes.base.costo -= 15;
      resultados.fimes.base.simplicidad -= 10;
    }
  }

  // UF con alta turbiedad necesita pretratamiento
  if (resultados.uf.applicable && turbiedad > 30) {
    resultados.uf.base.costo -= 10;
    resultados.uf.base.robustez -= 15;
  }

  // Default risk if not set
  if (!riskTitle) {
    riskTitle = 'Monitoreo de Calidad';
    riskDescription = 'Se recomienda un análisis fisicoquímico y microbiológico completo del agua cruda antes de iniciar el diseño definitivo.';
    riskRecommendation = 'Incluir al menos: turbiedad, color, pH, alcalinidad, hierro, coliformes totales y E. coli.';
  }

  normalizar(resultados);
  return { datos: resultados, texto: explicacion, tip: tipTecnico, riskTitle, riskDescription, riskRecommendation };
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

/** Obtiene la tecnología recomendada (mayor puntaje global entre las APLICABLES) */
export function getRecommendedTech(
  datos: Record<TechKey, TecnologiaData>
): { key: TechKey; nombre: string; score: number } | null {
  const applicableKeys = (Object.keys(datos) as TechKey[]).filter(
    (k) => datos[k].visible && datos[k].applicable
  );
  if (applicableKeys.length === 0) return null;

  let maxScore = -1;
  let bestKey: TechKey = applicableKeys[0];
  applicableKeys.forEach((key) => {
    const scores = Object.values(datos[key].base);
    const promedio = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (promedio > maxScore) {
      maxScore = promedio;
      bestKey = key;
    }
  });
  return { key: bestKey, nombre: datos[bestKey].nombre, score: Math.round(maxScore) };
}

// ═══════════════════════════════════════════════
// DATOS SEMILLA DEL PROYECTO
// ═══════════════════════════════════════════════

/** Dotación neta (L/hab/d) por perfil de usuario — Res. 0330/2017 */
export const DOTACION_POR_PERFIL: Record<UsuarioProyecto, number> = {
  rural: 100,      // Nivel bajo de complejidad
  residencial: 130, // Nivel medio
  municipal: 150,   // Nivel medio-alto
  industria: 200,   // Estimado (variable por sector)
};

/**
 * Estima la población servida a partir del caudal de diseño.
 * Q_diseño (L/s) = Población × dotación_bruta / 86400
 * dotación_bruta = dotación_neta × 1.25 (pérdidas del 20%)
 * → Población = Q_diseño × 86400 / (dotación_neta × 1.25)
 */
export function estimarPoblacion(caudalLps: number, usuario: UsuarioProyecto): number {
  const dotacionNeta = DOTACION_POR_PERFIL[usuario];
  const dotacionBruta = dotacionNeta * 1.25; // 20% pérdidas
  const poblacion = (caudalLps * 86400) / dotacionBruta;
  return Math.round(poblacion);
}

/** Calcula rango de CAPEX estimado para la tecnología y caudal */
export function estimarCapex(
  tech: TecnologiaData,
  caudalLps: number
): [number, number] {
  return [
    Math.round(tech.capexPerLps[0] * caudalLps),
    Math.round(tech.capexPerLps[1] * caudalLps),
  ];
}
