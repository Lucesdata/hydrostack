import {
    Project,
    ProjectModuleStatus,
    ModuleKey,
    DOMAIN_LABELS,
    CONTEXT_LABELS,
    LEVEL_LABELS,
    CATEGORY_LABELS
} from '@/types/project';

/**
 * 🧠 MOTOR DE NARRATIVA TÉCNICA (HYDROSTACK V1.5)
 * 
 * EJE 3: Generación de Memorias Descriptivas Profesionales.
 * Transforma metadata y estados en una narrativa técnica defendible.
 */
export class NarrativeEngine {

    private static MODULE_NAMES: Record<string, string> = {
        general: 'Información General',
        population: 'Censo y Población',
        floating_population: 'Población Flotante',
        source: 'Fuente de Agua',
        consumption: 'Consumo y Hábitos',
        quality: 'Calidad de Agua',
        caudales: 'Caudales de Diseño',
        tank: 'Almacenamiento',
        conduccion: 'Conducción',
        desarenador: 'Desarenador',
        jar_test: 'Ensayo de Jarras',
        filtro_lento: 'Filtración Lenta',
        compact_design: 'Ingeniería Compacta',
        fime_pretratamiento: 'E1. Pretratamiento FIME',
        fime_grueso_dinamico: 'E2. Filtro Grueso Dinámico',
        fime_grueso_asdesc: 'E3. Filtro Grueso Asc/Des',
        fime_lento_arena: 'E4. Filtro Lento de Arena',
        fime_hidraulica: 'E5. Hidráulica Integrada',
        fime_implantacion: 'E6. Layout e Implantación',
        fime_balance_masas: 'E7. Balance de Masas',
        compact_mixing: 'E1. Mezcla Rápida (PC)',
        compact_flocculation: 'E2. Floculación (PC)',
        compact_sedimentation: 'E3. Sedimentación (PC)',
        compact_filtration: 'E4. Filtración Rápida (PC)',
        compact_disinfection: 'E5. Desinfección CT (PC)',
        costs: 'Costos OpEx',
        viability: 'Viabilidad y O&M',
        tech_selection: 'Selección de Tecnología'
    };

    /**
     * BLOQUE A: Introducción y Contextualización
     */
    static generateIntroduction(project: Project): string {
        const domain = DOMAIN_LABELS[project.project_domain];
        const context = CONTEXT_LABELS[project.project_context];
        const level = LEVEL_LABELS[project.project_level];
        const category = project.treatment_category ? CATEGORY_LABELS[project.treatment_category] : 'No definida';
        const isRural = project.project_context === 'rural';

        let introduction = `El presente documento constituye la memoria descriptiva técnica del proyecto "${project.name}", integrado en el dominio de ${domain}. 
        Bajo un contexto de implementación ${context}, el sistema se ha dimensionado para un alcance de ${level}. `;

        if (isRural) {
            introduction += `La ingeniería propuesta adopta una filosofía de diseño centrada en la sostenibilidad en el tiempo y la resiliencia operativa. Se prioriza un esquema de barreras múltiples de fácil operación, reconociendo las limitaciones de personal calificado y logística de insumos propias del entorno rural. `;
        }

        introduction += `La selección tecnológica se ha centrado en el modelo de "${category}", buscando un equilibrio entre eficiencia hidráulica, simplicidad de mantenimiento y cumplimiento riguroso de la normativa técnica vigente.`;

        return introduction;
    }

    /**
     * EJE 2 & 3: Justificación de Decisiones de Ingeniería y Exclusiones
     */
    static generateEngineeringDecisions(moduleStatuses: ProjectModuleStatus[] = []): string {
        if (!moduleStatuses || moduleStatuses.length === 0) return "";

        const overrides = moduleStatuses.filter(m => m.is_user_override);
        const notApplicable = moduleStatuses.filter(m => m.status === 'not_applicable');

        let narrative = "La integridad técnica de este diseño se fundamenta en la soberanía del ingeniero proyectista sobre las recomendaciones del sistema, validando la selección tecnológica considerando la realidad operativa local. ";

        if (overrides.length > 0) {
            const overrideNames = overrides.map(m => this.MODULE_NAMES[m.module_key] || m.module_key);
            narrative += `Por criterio profesional del responsable, se han realizado ajustes discrecionales sobre la configuración asistida en los componentes de: ${overrideNames.join(', ')}. Estas decisiones responden a condiciones locales específicas y se asumen como parte integral del blindaje técnico del proyecto. `;
        }

        if (notApplicable.length > 0) {
            const naNames = notApplicable.map(m => this.MODULE_NAMES[m.module_key] || m.module_key);
            narrative += `Se han excluido del alcance los módulos de ${naNames.join(', ')}, dado que no son determinantes para la viabilidad de la tecnología seleccionada bajo el criterio de barreras múltiples definido. `;
        }

        return narrative;
    }

    /**
     * BLOQUE B & D: Análisis de Demanda y Régimen Hidráulico
     */
    static generateDemandNarrative(calculations: any): string {
        const pop = calculations?.calculated_flows?.final_population;
        const qmdMax = calculations?.calculated_flows?.qmd_max || 0;
        const qmhMax = calculations?.calculated_flows?.qmh_max || 0;

        if (!pop) return "El análisis de demanda se encuentra en fase de validación primaria.";

        return `Con una población proyectada de ${pop.toLocaleString()} habitantes, el sistema se ha dimensionado para un Caudal Máximo Diario (QMD) de ${qmdMax} L/s. 
        Este caudal actúa como la base de diseño para las unidades de tratamiento. Adicionalmente, el sistema considera un Caudal Máximo Horario (QMH) de ${qmhMax} L/s para el dimensionamiento de las redes de distribución y almacenamiento, garantizando la presión residual requerida en los nodos críticos durante periodos de máxima simultaneidad.`;
    }

    /**
     * BLOQUE E: Ingeniería de Tratamiento Seleccionada
     */
    static generateTreatmentNarrative(calculations: any, project?: Project): string {
        const compact = calculations?.project_compact_ptap;
        const filter = calculations?.project_filtros_lentos;
        const isRural = project?.project_context === 'rural' && project?.project_domain === 'water_treatment';

        let narrative = "";

        if (isRural) {
            narrative += "La selección de la tecnología de tratamiento se realizó considerando la calidad de la fuente, el nivel de riesgo sanitario y el contexto rural del sistema. ";
            if (project?.treatment_category === 'fime') {
                narrative += "El sistema de tratamiento fue diseñado bajo el esquema de Filtración en Múltiples Etapas (FIME), adecuado para contextos rurales por su operación simple y alta resiliencia. El diseño evita el uso de productos químicos, apoyándose en procesos físicos y biológicos para la remoción de contaminantes. ";
            } else {
                narrative += "Se priorizó un esquema de tratamiento basado en barreras múltiples y operación simplificada, buscando sostenibilidad técnica y operativa en el tiempo. ";
            }
        }

        if (compact) {
            narrative += `La solución de ingeniería implementada corresponde a una Planta Compacta en PRFV de alta tasa. Se destaca el uso de clarificación lamelar con un área proyectada de ${compact.lamellar_area} m² y un sistema de filtración rápida multicapa. Esta configuración es óptima por su baja huella de implantación y alta eficiencia en la remoción de turbiedad mediante procesos físico-químicos acelerados. `;
        } else if (filter) {
            narrative += `El tratamiento se fundamenta en la tecnología de Filtración Lenta en Arena (FLA), configurada con ${filter.number_of_units} unidades independientes. Este sistema prioriza la remoción microbiológica natural y la simplicidad de mantenimiento, siendo una solución robusta y coherente con las capacidades operativas locales identificadas. `;
        } else {
            narrative += "La descripción detallada del proceso de tratamiento se integrará una vez se consolide la validación técnica de las unidades principales. ";
        }

        if (isRural) {
            narrative += "El ingeniero responsable validó y ajustó las recomendaciones del asistente según las condiciones locales del proyecto.";
        }

        return narrative;
    }

    /**
     * BLOQUE F: Viabilidad Operativa y Cierre
     */
    static generateViabilityJustification(viability: any): string {
        if (!viability) return "La evaluación de viabilidad operativa y mantenimiento se encuentra en etapa de diagnóstico.";

        const gravity = viability.gravity_arrival ? "conducción por gravedad" : "requerimiento de bombeo";
        return `En términos de viabilidad de sitio, el proyecto aprovecha una ${gravity}, lo que impacta positivamente en el O&M. Se han validado factores críticos como la estabilidad geológica del lote y la capacidad de evacuación de lodos. El plan de mantenimiento se ha establecido bajo una frecuencia cíclica que minimiza los periodos de fuera de servicio del sistema.`;
    }

    /**
     * BLOQUE C: Pedagogía Técnica y Consecuencias de Decisión
     * Explica por qué se recomienda una tecnología y qué implica la soberanía del ingeniero.
     */
    static getModuleRecommendationRationale(moduleKey: ModuleKey, project: Project): { rationale: string; implication: string } {
        const isRural = project.project_context === 'rural';
        const category = project.treatment_category;

        // Base cases for FIME
        if (category === 'fime') {
            if (moduleKey === 'fime_lento_arena') {
                return {
                    rationale: 'El FLA es el corazón sanitario del sistema FIME. Su diseño de baja tasa asegura la formación biológica necesaria para remover patógenos sin cloro constante.',
                    implication: 'Seguir la sugerencia de baja velocidad (< 0.2 m/h) garantiza la seguridad del agua. Aumentar la velocidad por encima de esto compromete la barrera microbiológica y la salud pública.'
                };
            }
            if (moduleKey === 'fime_pretratamiento') {
                return {
                    rationale: 'En sistemas rurales, el pretratamiento protege la inversión. Remueve picos de turbiedad que de otro modo colmatarían los filtros biológicos.',
                    implication: 'Omitir las unidades de protección obliga a limpiezas manuales frecuentes y reduce la vida útil de los materiales filtrantes caros.'
                };
            }
        }

        // Base cases for Compact Plant
        if (category === 'compact_plant') {
            if (moduleKey === 'compact_mixing') {
                return {
                    rationale: 'La mezcla rápida es crítica para la eficiencia del coagulante. En plantas de alta tasa, los segundos de contacto definen el éxito del tren completo.',
                    implication: 'Un diseño deficiente en esta etapa aumentará drásticamente el consumo de químicos y el costo operativo mensual (OpEx) del sistema.'
                };
            }
        }

        // Generic context-based rationale
        if (isRural && moduleKey === 'quality') {
            return {
                rationale: 'La variabilidad estacional en cuencas rurales exige un conocimiento profundo del afluente bajo escenarios de lluvia.',
                implication: 'Un diseño basado solo en datos promedio puede fallar catastróficamente durante el primer invierno del proyecto.'
            };
        }

        return {
            rationale: 'Sugerencia técnica basada en los lineamientos del RAS 0330 y las mejores prácticas de ingeniería rural.',
            implication: 'La soberanía del ingeniero permite ajustar estos parámetros según la topografía y logística local, bajo su responsabilidad profesional.'
        };
    }
}
