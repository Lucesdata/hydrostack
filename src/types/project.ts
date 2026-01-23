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
export type TreatmentCategory =
    | 'fime'                    // FIME (Filtración en Múltiples Etapas)
    | 'compact_plant'           // Planta compacta
    | 'specific_plant'          // Planta específica (rápida vs lenta)
    | 'desalination_high_purity'; // Desalinización / Alta pureza

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
    | 'tech_selection';

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
    specific_plant: 'Planta Específica',
    desalination_high_purity: 'Desalinización / Alta Pureza'
};

/**
 * Descripciones detalladas de categorías de tratamiento
 */
export const CATEGORY_DESCRIPTIONS: Record<TreatmentCategory, string> = {
    fime: 'Filtración en Múltiples Etapas: Filtros gruesos, dinámicos y lentos de arena. Apropiado para comunidades pequeñas con agua superficial.',
    compact_plant: 'Planta Compacta: Tratamiento químico (coagulación-floculación) + sedimentación + filtración rápida. Para caudales medianos a altos.',
    specific_plant: 'Planta Específica: Diseño customizado según condiciones particulares. Puede usar filtración rápida o lenta según caso.',
    desalination_high_purity: 'Desalinización / Alta Pureza: Ósmosis inversa, electrodiálisis u otros procesos de separación avanzada. Para agua salobre o marina.'
};
