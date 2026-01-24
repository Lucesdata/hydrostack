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
            narrative += "La selección de la tecnología de tratamiento se realizó considerando la calidad de la fuente, el nivel de riesgo sanitario y el contexto rural del sistema. Se priorizó un esquema de tratamiento basado en barreras múltiples y operación simplificada, buscando sostenibilidad técnica y operativa en el tiempo. ";
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
}
