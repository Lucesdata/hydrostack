import {
    Project,
    ProjectModuleStatus,
    ModuleKey,
    ProjectDomain,
    ProjectContext,
    ProjectLevel,
    TreatmentCategory,
    DOMAIN_LABELS,
    CONTEXT_LABELS,
    LEVEL_LABELS,
    CATEGORY_LABELS
} from '@/types/project';

/**
 * Motor de Narrativa Técnica de HydroStack
 * 
 * Genera informes narrativos profesionales basados en:
 * 1. Metadata del proyecto
 * 2. Estados de módulos (Decisiones del Ingeniero)
 * 3. Resultados técnicos calculados
 */
export class NarrativeEngine {

    /**
     * Genera la introducción narrativa del informe
     */
    static generateIntroduction(project: Project): string {
        const domain = DOMAIN_LABELS[project.project_domain];
        const context = CONTEXT_LABELS[project.project_context];
        const level = LEVEL_LABELS[project.project_level];
        const category = project.treatment_category ? CATEGORY_LABELS[project.treatment_category] : 'No definida';

        return `El presente documento técnico detalla el diseño y auditoría para el proyecto "${project.name}", enmarcado en el dominio de ${domain}. 
        El sistema se ha configurado bajo un contexto de tipo ${context}, estableciendo un alcance de ${level}. 
        La estrategia tecnológica principal seleccionada es "${category}", buscando optimizar la eficiencia operativa y el cumplimiento de la resolución 0330 de 2017 (RAS).`;
    }

    /**
     * Genera análisis de las decisiones de ingeniería (Module States)
     */
    static generateEngineeringDecisions(moduleStatuses: ProjectModuleStatus[]): string {
        const overrides = moduleStatuses.filter(m => m.is_user_override);
        const essentials = moduleStatuses.filter(m => m.status === 'essential' && !m.is_user_override);

        let narrative = "La arquitectura técnica del proyecto se ha definido siguiendo un equilibrio entre las recomendaciones del sistema y el criterio profesional del ingeniero proyectista. ";

        if (overrides.length > 0) {
            narrative += `Se han realizado ${overrides.length} ajustes manuales sobre la configuración base, destacando priorizaciones específicas en módulos clave como ${overrides.map(m => m.module_key).join(', ')}. `;
        }

        if (essentials.length > 0) {
            narrative += `El sistema ha identificado como componentes críticos irrenunciables para la seguridad hídrica los módulos de: ${essentials.map(m => m.module_key).join(', ')}. `;
        }

        return narrative;
    }

    /**
     * Genera narrativa sobre la demanda y caudales
     */
    static generateDemandNarrative(calculations: any): string {
        const pop = calculations?.calculated_flows?.final_population;
        const qmd = calculations?.calculated_flows?.qmd;
        const qmdMax = calculations?.calculated_flows?.qmd_max;

        if (!pop || !qmd) return "Los datos de demanda se encuentran en fase de recolección.";

        return `Considerando una población proyectada de ${pop.toLocaleString()} habitantes al horizonte de diseño, se ha determinado un Caudal Medio Diario (Qmd) de ${qmd} L/s. 
        Aplicando los coeficientes de consumo normativos, el sistema se dimensiona para un pico máximo diario (QMD) de ${qmdMax} L/s, garantizando la continuidad del servicio incluso en condiciones de máxima demanda diaria.`;
    }

    /**
     * Genera descripción técnica del tratamiento
     */
    static generateTreatmentNarrative(calculations: any): string {
        const isCompact = !!calculations?.project_compact_ptap;
        const isFiltro = !!calculations?.project_filtros_lentos;

        if (isCompact) {
            const area = calculations.project_compact_ptap.lamellar_area;
            return `Para la potabilización se ha optado por un sistema de clarificación de alta tasa (Plantas Compactas), utilizando sedimentación lamelar con un área efectiva de ${area} m². Esta configuración permite reducir significativamente el área de implantación manteniendo los estándares de remoción de carga coloidal.`;
        }

        if (isFiltro) {
            const units = calculations.project_filtros_lentos.number_of_units;
            return `El proceso de tratamiento se basa en la tecnología de Filtración Lenta en Arena (FLA), estructurado en ${units} unidades operativas. Este enfoque prioriza la simplicidad operativa y la remoción biológica, ideal para el contexto seleccionado.`;
        }

        return "La configuración detallada del sistema de tratamiento está pendiente de dimensionamiento final.";
    }

    /**
     * Genera la justificación de viabilidad
     */
    static generateViabilityJustification(viability: any): string {
        if (!viability) return "Evaluación de viabilidad en proceso.";

        const gravity = viability.gravity_arrival ? "favorable por gravedad" : "condicionada a bombeo";
        return `La viabilidad técnica del sitio se considera ${gravity}. El análisis de estabilidad del lote y las vías de acceso permiten una logística adecuada para el suministro de insumos químicos y la evacuación segura de lodos residuales conforme al plan de mantenimiento sugerido.`;
    }
}
