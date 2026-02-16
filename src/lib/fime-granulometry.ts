/**
 * ESPECIFICACIONES GRANULOMÉTRICAS NORMATIVAS — FiME
 * Base normativa: Guía CINARA + RAS 0330 (Resolución 0330 de 2017)
 * 
 * Define las propiedades granulométricas de cada capa filtrante
 * para los módulos PFD, FGAC y FLA del sistema FiME.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────

export interface GravelLayerSpec {
    /** Nombre descriptivo de la capa */
    name: string;
    /** Función que cumple en el proceso de filtración */
    function: string;
    /** Tamaño mínimo del grano (mm) */
    size_min_mm: number;
    /** Tamaño máximo del grano (mm) */
    size_max_mm: number;
    /** Espesor de la capa (m) */
    thickness_m: number;
    /** Diámetro efectivo D10 (mm) — percentil 10 de la curva granulométrica */
    d10_mm: number;
    /** Coeficiente de uniformidad Cu = D60/D10 */
    cu: number;
    /** Porosidad estimada del lecho (%) */
    porosity_pct: number;
}

export interface ModuleGranulometry {
    /** Clave del módulo */
    moduleKey: string;
    /** Nombre completo del módulo */
    moduleName: string;
    /** Capas del lecho filtrante (de fondo a tope) */
    layers: GravelLayerSpec[];
    /** Altura total del lecho filtrante (m), sin incluir agua sobrenadante ni borde libre */
    total_bed_height_m: number;
    /** Altura de agua sobrenadante recomendada (m) */
    supernatant_height_m: number;
    /** Borde libre recomendado (m) */
    freeboard_m: number;
    /** Procedencia recomendada del material */
    material_source: string;
    /** Método de preparación */
    preparation_method: string;
    /** Método de lavado antes de colocación */
    washing_method: string;
}

// ─── CONSTANTES NORMATIVAS PFD ────────────────────────────────────────

export const PFD_GRANULOMETRY: ModuleGranulometry = {
    moduleKey: 'fime_grueso_dinamico',
    moduleName: 'Prefiltración Dinámica en Grava (PFD)',
    layers: [
        {
            name: 'Soporte Inferior',
            function: 'Distribución uniforme del flujo de entrada',
            size_min_mm: 19,
            size_max_mm: 38,
            thickness_m: 0.20,
            d10_mm: 20,
            cu: 1.8,
            porosity_pct: 40,
        },
        {
            name: 'Capa de Filtración Gruesa',
            function: 'Retención de sólidos gruesos y sedimentables',
            size_min_mm: 13,
            size_max_mm: 25,
            thickness_m: 0.20,
            d10_mm: 14,
            cu: 1.6,
            porosity_pct: 38,
        },
        {
            name: 'Capa de Filtración Fina',
            function: 'Retención de partículas medianas y flocs',
            size_min_mm: 6,
            size_max_mm: 13,
            thickness_m: 0.20,
            d10_mm: 7,
            cu: 1.5,
            porosity_pct: 35,
        },
    ],
    total_bed_height_m: 0.60,
    supernatant_height_m: 0.10,
    freeboard_m: 0.20,
    material_source: 'Grava de río lavada, libre de materia orgánica y arcilla. Preferiblemente canto rodado silíceo.',
    preparation_method: 'Tamizado por tamaño, lavado con agua limpia hasta que el agua de lavado salga clara. Desinfección con solución de hipoclorito al 5% durante 24h.',
    washing_method: 'Lavado hidráulico por descarga rápida de fondo (shock). Apertura violenta de válvula de compuerta ≥ 4" para fluidificar el lecho.',
};

// ─── CONSTANTES NORMATIVAS FGAC ───────────────────────────────────────

export const FGAC_GRANULOMETRY: ModuleGranulometry = {
    moduleKey: 'fime_grueso_ascendente',
    moduleName: 'Filtro Grueso Ascendente en Capas (FGAC)',
    layers: [
        {
            name: 'Soporte Inferior',
            function: 'Distribución homogénea del flujo ascendente',
            size_min_mm: 19,
            size_max_mm: 38,
            thickness_m: 0.25,
            d10_mm: 21,
            cu: 1.8,
            porosity_pct: 42,
        },
        {
            name: 'Filtración Gruesa',
            function: 'Retención de sólidos grandes y sedimentos',
            size_min_mm: 13,
            size_max_mm: 19,
            thickness_m: 0.20,
            d10_mm: 14,
            cu: 1.5,
            porosity_pct: 38,
        },
        {
            name: 'Filtración Media',
            function: 'Retención intermedia y acondicionamiento',
            size_min_mm: 6,
            size_max_mm: 13,
            thickness_m: 0.15,
            d10_mm: 7,
            cu: 1.5,
            porosity_pct: 36,
        },
        {
            name: 'Filtración Fina I',
            function: 'Afino primario de partículas finas',
            size_min_mm: 3,
            size_max_mm: 6,
            thickness_m: 0.15,
            d10_mm: 3.2,
            cu: 1.4,
            porosity_pct: 34,
        },
        {
            name: 'Filtración Fina II (Pulimento)',
            function: 'Afino final — máxima remoción de turbiedad y color',
            size_min_mm: 1.6,
            size_max_mm: 3,
            thickness_m: 0.15,
            d10_mm: 1.8,
            cu: 1.3,
            porosity_pct: 32,
        },
    ],
    total_bed_height_m: 0.90,
    supernatant_height_m: 0.10,
    freeboard_m: 0.20,
    material_source: 'Grava de río clasificada, libre de materia orgánica, arcilla y cal. Procedencia: cantera certificada o lecho de río con análisis granulométrico.',
    preparation_method: 'Tamizado secuencial con mallas calibradas. Lavado intensivo capa por capa. Verificar Cu ≤ 2.0 y D10 dentro de rango antes de colocación.',
    washing_method: 'Lavado hidráulico por descarga rápida de fondo (shock). Frecuencia: cada 2-4 semanas según turbiedad de entrada. Apertura de válvula de compuerta ≥ 4".',
};

// ─── CONSTANTES NORMATIVAS FLA ────────────────────────────────────────

export const FLA_GRANULOMETRY: ModuleGranulometry = {
    moduleKey: 'fime_lento_arena',
    moduleName: 'Filtro Lento de Arena (FLA)',
    layers: [
        {
            name: 'Soporte: Grava Gruesa',
            function: 'Soporte estructural y drenaje del sistema',
            size_min_mm: 19,
            size_max_mm: 38,
            thickness_m: 0.15,
            d10_mm: 21,
            cu: 1.8,
            porosity_pct: 42,
        },
        {
            name: 'Soporte: Grava Media',
            function: 'Transición granulométrica — previene migración de arena',
            size_min_mm: 6,
            size_max_mm: 13,
            thickness_m: 0.10,
            d10_mm: 7,
            cu: 1.5,
            porosity_pct: 36,
        },
        {
            name: 'Soporte: Grava Fina',
            function: 'Transición final hacia el lecho de arena',
            size_min_mm: 1.6,
            size_max_mm: 3,
            thickness_m: 0.05,
            d10_mm: 1.8,
            cu: 1.3,
            porosity_pct: 32,
        },
        {
            name: 'Lecho Filtrante: Arena Sílice',
            function: 'Filtración biológica — formación de Schmutzdecke (capa biológica activa)',
            size_min_mm: 0.15,
            size_max_mm: 0.35,
            thickness_m: 0.80,
            d10_mm: 0.20,
            cu: 2.0,
            porosity_pct: 40,
        },
    ],
    total_bed_height_m: 1.10,
    supernatant_height_m: 1.10,
    freeboard_m: 0.30,
    material_source: 'Arena sílice de cantera certificada. La arena de río es aceptable si cumple D10 y Cu. Gravas de soporte: canto rodado lavado.',
    preparation_method: 'Tamizado por tamaños. Arena: lavado exhaustivo hasta agua clara. Secado al sol 48h. Verificar D10 = 0.15-0.35 mm y Cu ≤ 3.0 (ideal ≤ 2.0).',
    washing_method: 'Raspado manual superficial (1-2 cm de Schmutzdecke). Frecuencia: cada 30-90 días según pérdida de carga. NO usar lavado hidráulico a contracorriente — destruye la biopelícula.',
};

// ─── FUNCIONES AUXILIARES ─────────────────────────────────────────────

/**
 * Retorna las especificaciones granulométricas para un módulo del tren FiME.
 */
export function getGranulometry(moduleKey: string): ModuleGranulometry | null {
    switch (moduleKey) {
        case 'fime_grueso_dinamico':
        case 'pfd':
            return PFD_GRANULOMETRY;
        case 'fime_grueso_ascendente':
        case 'fime_grueso_asdesc':
        case 'fgac':
            return FGAC_GRANULOMETRY;
        case 'fime_lento_arena':
        case 'fla':
            return FLA_GRANULOMETRY;
        default:
            return null;
    }
}

/**
 * Genera una tabla resumen de todas las especificaciones granulométricas del tren FiME.
 * Útil para el informe técnico.
 */
export function getAllGranulometricSpecs(): ModuleGranulometry[] {
    return [PFD_GRANULOMETRY, FGAC_GRANULOMETRY, FLA_GRANULOMETRY];
}

/**
 * Calcula la altura total de estructura recomendada para un módulo (lecho + sobrenadante + borde libre).
 */
export function getTotalStructureHeight(moduleKey: string): number {
    const g = getGranulometry(moduleKey);
    if (!g) return 0;
    return g.total_bed_height_m + g.supernatant_height_m + g.freeboard_m;
}
