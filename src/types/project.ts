/**
 * Tipos del Diagrama de Decisión Funcional — HydroStack
 * 
 * PRINCIPIO RECTOR:
 * El contexto ORIENTA, el flujo NO se fragmenta, la ingeniería MANDA
 */

/**
 * Dominio del sistema de agua
 */
export type ProjectDomain = 'water_treatment' | 'wastewater_treatment';

/**
 * Contexto del proyecto
 */
export type ProjectContext =
    | 'rural'
    | 'urban'
    | 'residential'
    | 'industrial'
    | 'desalination';

/**
 * Nivel del proyecto
 */
export type ProjectLevel =
    | 'preliminary_assessment'  // Evaluación preliminar
    | 'complete_design';        // Diseño técnico completo

/**
 * Categoría de tratamiento (principalmente para agua potable)
 */


/**
 * Recomendación del sistema para un módulo
 */
export type SystemRecommendation =
    | 'essential'                   // Crítico para este tipo de proyecto
    | 'recommended'                 // Sugerido
    | 'optional'                    // Puede aplicar según caso
    | 'not_applicable';             // No relevante para este proyecto

/**
 * Estado de un módulo
 */
export type ModuleStatus =
    | 'essential'
    | 'recommended'
    | 'optional'
    | 'not_applicable';

/**
 * Clave de módulo técnico
 */
export type ModuleKey =
    | 'general'
    | 'population'
    | 'floating_population'
    | 'source'
    | 'consumption'
    | 'quality'
    | 'caudales'
    | 'tank'
    | 'conduccion'
    | 'desarenador'
    | 'jar_test'
    | 'filtro_lento'
    | 'compact_design'
    | 'costs'
    | 'viability'
    | 'tech_selection'
    | 'fime_pretratamiento'
    | 'fime_tech_selection'
    | 'fime_grueso_dinamico'
    | 'fime_grueso_ascendente'     // FGAC - Added
    | 'fime_grueso_asdesc'
    | 'fime_lento_arena'
    | 'fime_weir_control'           // Weir Control - Added
    | 'fime_hidraulica'
    | 'fime_implantacion'
    | 'fime_balance_masas'
    | 'risk_analysis'               // Risk Analysis - Added
    | 'viability_matrix'
    | 'compact_mixing'
    | 'compact_flocculation'
    | 'compact_sedimentation'
    | 'compact_filtration'
    | 'compact_disinfection';

/**
 * Categoría de tratamiento (principalmente para agua potable)
 */
export type TreatmentCategory =
    | 'fime'                    // FIME (Filtración en Múltiples Etapas)
    | 'compact_plant'           // Planta compacta
    | 'conventional_rapid'      // Filtración rápida convencional
    | 'reverse_osmosis'         // Ósmosis inversa
    | 'simplified_treatment'    // Tratamiento simplificado + desinfección
    | 'specific_plant'          // Planta específica (base custom)
    | 'desalination_high_purity' // Desalinización / Alta pureza
    // Aguas Residuales
    | 'facultative_lagoons'
    | 'activated_sludge'
    | 'uasb'
    | 'constructed_wetlands'
    | 'biodisks';

/**
 * Inputs de la Matriz de Viabilidad
 */
export interface ViabilityMatrixInputs {
    settlement_type: 'rural_disperso' | 'rural_concentrado' | 'urbano' | 'industrial';
    population_range: 'low' | 'medium' | 'high';
    community_organization: 'low' | 'medium' | 'high';
    operator_availability: 'low' | 'medium' | 'high';
    energy_access: 'none' | 'partial' | 'reliable';
    chemical_access: 'low' | 'medium' | 'high';
    maintenance_capacity: 'low' | 'medium' | 'high';
    capex_tolerance: 'low' | 'medium' | 'high';
    opex_tolerance: 'low' | 'medium' | 'high';
    project_horizon: number;
    source_quality: 'good' | 'fair' | 'poor';
    climate_variability: 'low' | 'medium' | 'high';
    environmental_sensitivity: 'low' | 'medium' | 'high';
}

/**
 * Resultado por tecnología en la Matriz
 */
export interface TechnologyViabilityResult {
    category: TreatmentCategory;
    name: string;
    scores: {
        technical: number;
        operational: number;
        economic: number;
        environmental: number;
        global: number;
    };
    metadata: {
        requirements: string[];
        strengths: string[];
        limitations: string[];
    };
}

/**
 * Estado dinámico de la calidad del agua
 */
export interface WaterQualityState {
    ph: number;
    turbidity: number;
    color: number;
    total_coliforms: number;
    fecal_coliforms: number;
    iron: number;
    alkalinity: number;
    hardness: number;
}

/**
 * Resultado de cálculo IRCA
 */
export interface IRCAResult {
    score: number;
    risk_level: 'SIN RIESGO' | 'RIESGO BAJO' | 'RIESGO MEDIO' | 'RIESGO ALTO' | 'INVIABLE';
    color: string;
    label: string;
    sanitary_status: 'Apto' | 'Condicionado' | 'No Apto';
}

/**
 * Paso en la trayectoria de calidad (Evolución)
 */
export interface QualityEvolutionStep {
    module_key: ModuleKey;
    label: string;
    input_quality: WaterQualityState;
    output_quality: WaterQualityState;
    removal_percentages: Partial<Record<keyof WaterQualityState, number>>;
    irca_after: IRCAResult;
    timestamp: string;
}

/**
 * Proyecto con campos del diagrama de decisión
 */
export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    location: string | null;

    // Diagrama de decisión
    project_domain: ProjectDomain;
    project_context: ProjectContext;
    project_level: ProjectLevel;
    treatment_category: TreatmentCategory | null;
    decision_metadata: Record<string, any>;

    // Campo legacy (mantener por compatibilidad temporal)
    project_type?: string | null;

    // Estado y auditoría
    status: 'Borrador' | 'En diseño' | 'Completado' | 'Archivado';
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
}

/**
 * Estado de módulo en el contexto del proyecto
 */
export interface ProjectModuleStatus {
    id: string;
    project_id: string;
    module_key: ModuleKey;
    status: ModuleStatus;
    reason: string | null;
    system_recommendation: SystemRecommendation;
    is_user_override: boolean;
    notes: string | null;
    marked_by: string | null;
    status_updated_at: string;
    created_at: string;
}

/**
 * Configuración de módulo según contexto
 */
export interface ModuleConfig {
    module_key: ModuleKey;
    label: string;
    route: string;
    block: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    recommendation: SystemRecommendation;
    reason?: string;
    adaptations?: {
        placeholder?: string;
        help_text?: string;
        warning?: string;
    };
}

/**
 * Labels para dominios
 */
export const DOMAIN_LABELS: Record<ProjectDomain, string> = {
    water_treatment: 'Agua Potable',
    wastewater_treatment: 'Aguas Residuales'
};

/**
 * Labels para contextos
 */
export const CONTEXT_LABELS: Record<ProjectContext, string> = {
    rural: 'Rural',
    urban: 'Urbano',
    residential: 'Residencial / Privado',
    industrial: 'Industrial',
    desalination: 'Desalinización'
};

/**
 * Labels para niveles
 */
export const LEVEL_LABELS: Record<ProjectLevel, string> = {
    preliminary_assessment: 'Evaluación Preliminar',
    complete_design: 'Diseño Técnico Completo'
};

/**
 * Labels para categorías de tratamiento
 */
export const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
    fime: 'FIME (Filtración en Múltiples Etapas)',
    compact_plant: 'Planta Compacta',
    conventional_rapid: 'Filtración Rápida Convencional',
    reverse_osmosis: 'Ósmosis Inversa',
    simplified_treatment: 'Tratamiento Simplificado + Desinfección',
    specific_plant: 'Planta Específica',
    desalination_high_purity: 'Desalinización / Alta Pureza',
    facultative_lagoons: 'Lagunas Facultativas',
    activated_sludge: 'Lodos Activados',
    uasb: 'UASB (Reactor Anaerobio)',
    constructed_wetlands: 'Humedales Construidos',
    biodisks: 'Biodiscos (RBC)'
};

/**
 * Descripciones detalladas de categorías de tratamiento
 */
export const CATEGORY_DESCRIPTIONS: Record<TreatmentCategory, string> = {
    fime: 'Filtración en Múltiples Etapas: Filtros gruesos, dinámicos y lentos de arena. Apropiado para comunidades pequeñas con agua superficial.',
    compact_plant: 'Planta Compacta: Tratamiento químico (coagulación-floculación) + sedimentación + filtración rápida. Para caudales medianos a altos.',
    conventional_rapid: 'Filtración Rápida Convencional: Tren completo (Mezcla, Floculación, Sedimentación, Filtración) diseñado in-situ.',
    reverse_osmosis: 'Ósmosis Inversa: Membranas de alta presión para remoción de sales y solutos complejos.',
    simplified_treatment: 'Tratamiento Simplificado: Desinfección directa o filtración simple para aguas de muy alta calidad inicial.',
    specific_plant: 'Planta Específica: Diseño customizado según condiciones particulares del proyecto.',
    desalination_high_purity: 'Desalinización / Alta Pureza: Ósmosis inversa u otros procesos para agua salobre o marina.',
    facultative_lagoons: 'Lagunas Facultativas: Tratamiento biológico natural mediante estanques de gran superficie.',
    activated_sludge: 'Lodos Activados: Proceso biológico aerobio de alta tasa con recirculación de biomasa.',
    uasb: 'UASB: Reactor anaerobio de flujo ascendente, eficiente para alta carga orgánica.',
    constructed_wetlands: 'Humedales Construidos: Sistemas fitopedagógicos que imitan procesos naturales de depuración.',
    biodisks: 'Biodiscos (RBC): Contactores biológicos rotatorios para tratamiento secundario.'
};
