import {
    Project,
    ProjectDomain,
    ProjectContext,
    ProjectLevel,
    TreatmentCategory,
    ModuleKey,
    SystemRecommendation,
    ModuleConfig,
    ProjectModuleStatus
} from '@/types/project';

/**
 * Motor de Recomendaciones Contextual de HydroStack
 * 
 * PRINCIPIO: Este motor ORIENTA, NO RESTRINGE
 * 
 * Función: Calcular recomendaciones de módulos según el contexto del proyecto
 * NO bloquea navegación ni oculta módulos
 * 
 * @example
 * const recommendation = RecommendationEngine.getModuleRecommendation(
 *     'filtro_lento', 
 *     'water_treatment', 
 *     'rural', 
 *     'complete_design', 
 *     'fime'
 * );
 * // => 'essential' (🔴 Esencial para FIME)
 */
export class RecommendationEngine {

    /**
     * Obtener recomendación de un módulo según contexto del proyecto
     * 
     * @param moduleKey - Clave del módulo
     * @param domain - Dominio del proyecto
     * @param context - Contexto del proyecto
     * @param level - Nivel del proyecto
     * @param category - Categoría de tratamiento (puede ser null)
     * @returns Recomendación del sistema
     */
    static getModuleRecommendation(
        moduleKey: ModuleKey,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): SystemRecommendation {

        // 🟢 BLOQUE A — Contexto (UNIVERSAL)
        if (['general'].includes(moduleKey)) return 'essential';

        // 🟢 BLOQUE B — Demanda y población (UNIVERSAL)
        if (['population', 'consumption'].includes(moduleKey)) return 'essential';
        if (moduleKey === 'floating_population') {
            // Recomendado en contextos turísticos/residenciales, opcional en otros
            return (context === 'residential' || context === 'rural') ? 'recommended' : 'optional';
        }

        // 🟢 BLOQUE C — Fuente y calidad (CONDICIONAL POR DOMINIO)
        if (moduleKey === 'source') {
            // En residuales no hay "captación" convencional, se mide afluente
            return domain === 'water_treatment' ? 'essential' : 'not_applicable';
        }
        if (moduleKey === 'quality') return 'essential'; // Siempre necesario saber qué entra

        // 🟢 BLOQUE D — Hidráulica y caudales (UNIVERSAL)
        if (moduleKey === 'caudales') return 'essential';
        if (['tank', 'conduccion'].includes(moduleKey)) return 'recommended';

        // 🟡 BLOQUE E — Tratamiento (STRICT CONDITIONAL BY TECHNOLOGY)

        // E1 — FIME
        if (['filtro_lento'].includes(moduleKey)) {
            if (category === 'fime') return 'essential';
            if (category === 'specific_plant') return 'recommended';
            return 'not_applicable'; // Hide for Compact or Desalination
        }

        // E2 — Planta Compacta
        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') return 'essential';
            if (category === 'fime') return 'not_applicable'; // FIME no usa coagulación
            return 'recommended';
        }

        if (moduleKey === 'compact_design') {
            if (category === 'compact_plant') return 'essential';
            return 'not_applicable'; // Hide for FIME or others unless explicit
        }

        // E4 — Desalinización
        if (context === 'desalination' && domain === 'water_treatment') {
            // Por ahora no hay módulos E4 específicos implementados, 
            // pero se marcan otros como N/A si es desalinización pura
            if (['desarenador'].includes(moduleKey)) return 'not_applicable';
        }

        // Desarenador es común pero depende de la fuente
        if (moduleKey === 'desarenador') {
            if (category === 'desalination_high_purity') return 'not_applicable';
            if (category === 'fime' || category === 'compact_plant') return 'recommended';
            return 'optional';
        }

        // 🟢 BLOQUE F — Evaluación y cierre (UNIVERSAL)
        if (['costs', 'viability', 'tech_selection'].includes(moduleKey)) return 'essential';

        // Fallback
        return 'recommended';
    }

    /**
     * Pesos técnicos para el cálculo de integridad del proyecto
     */
    static getModuleWeight(recommendation: SystemRecommendation): number {
        switch (recommendation) {
            case 'essential': return 3;
            case 'recommended': return 2;
            case 'optional': return 1;
            default: return 0;
        }
    }

    /**
     * Obtener configuración adaptativa de un módulo
     * (Observaciones técnicas, regulaciones de referencia y sugerencias profesionales)
     */
    static getModuleConfig(
        moduleKey: ModuleKey,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): Pick<ModuleConfig, 'adaptations' | 'reason'> {

        const adaptations: ModuleConfig['adaptations'] = {};
        let reason: string | undefined;

        // Adaptaciones con lenguaje descriptivo y profesional
        if (moduleKey === 'desarenador') {
            if (category === 'desalination_high_purity') {
                reason = 'Nota normativa: En procesos de desalinización de alta pureza, la sedimentación de partículas pesadas suele integrarse en la microfiltración previa.';
                adaptations.warning = 'Observación técnica: Este componente no suele ser determinante en configuraciones de ósmosis inversa, salvo si el ingreso de sólidos gruesos es incontrolado.';
            }
            if (context === 'residential') {
                adaptations.help_text = 'Sugerencia profesional: En demandas residenciales estables, la unidad de desarenación puede simplificarse si la turbiedad histórica es < 50 UNT.';
            }
        }

        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') {
                adaptations.help_text = 'Nota técnica: La determinación de la dosis óptima mediante este ensayo es el pilar para la estabilidad química de la planta compacta.';
            }
            if (category === 'fime') {
                reason = 'Nota normativa: El sistema FIME opera bajo principios biológicos y físicos naturales para minimizar la dependencia de insumos químicos.';
                adaptations.warning = 'Sugerencia profesional: Dado que el modelo FIME busca la autonomía operativa, la coagulación química se considera un recurso de contingencia, no una etapa base.';
            }
        }

        if (moduleKey === 'filtro_lento') {
            if (category === 'fime') {
                adaptations.help_text = 'Nota técnica: Este módulo actúa como la barrera microbiológica principal, fundamentada en el desarrollo del bio-lecho (esqumutzdecke).';
            }
            if (category === 'compact_plant') {
                reason = 'Observación técnica: Las plantas de alta tasa operan bajo regímenes de filtración rápida, que son conceptualmente distintos a la filtración lenta biológica.';
                adaptations.warning = 'Sugerencia profesional: Se recomienda mantener la coherencia del tren de tratamiento hacia procesos de filtración rápida para evitar cuellos de botella hidráulicos.';
            }
        }

        if (moduleKey === 'compact_design') {
            if (category === 'fime') {
                reason = 'Observación técnica: La ingeniería compacta se basa en tiempos de residencia bajos y alta carga superficial, opuesta a la baja carga de los sistemas FLA.';
                adaptations.warning = 'Sugerencia profesional: La integración de estas tecnologías debe ser evaluada bajo la premisa de la capacidad técnica del operador local.';
            }
        }

        if (moduleKey === 'source') {
            if (domain === 'wastewater_treatment') {
                reason = 'Nota técnica: En el dominio de saneamiento, este componente se reorienta hacia la caracterización del afluente bruto o punto de vertido.';
                adaptations.warning = 'Observación técnica: Se sugiere priorizar el aforo y muestreo del vertimiento para definir la carga orgánica real.';
            }
        }

        if (moduleKey === 'tech_selection') {
            if (level === 'preliminary_assessment') {
                adaptations.help_text = 'Nota técnica: Objetivo de definir la viabilidad tecnológica inicial comparando CAPEX y OPEX estimado de forma referencial.';
            }
            if (level === 'complete_design') {
                adaptations.help_text = 'Nota normativa: Análisis multicriterio exhaustivo conforme a los lineamientos del RAS 0330 o norma local equivalente.';
            }
        }

        return { adaptations, reason };
    }

    /**
     * Inicializar estados de módulos con el nuevo sistema de integridad
     */
    static initializeModuleStatuses(
        projectId: string,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): Omit<ProjectModuleStatus, 'id' | 'created_at' | 'status_updated_at' | 'marked_by'>[] {

        const moduleKeys: ModuleKey[] = [
            'general', 'population', 'floating_population', 'source', 'consumption',
            'quality', 'caudales', 'tank', 'conduccion', 'desarenador',
            'jar_test', 'filtro_lento', 'compact_design', 'costs', 'viability', 'tech_selection'
        ];

        return moduleKeys.map(moduleKey => {
            const recommendation = this.getModuleRecommendation(
                moduleKey, domain, context, level, category
            );
            return {
                project_id: projectId,
                module_key: moduleKey,
                status: recommendation,
                reason: null,
                system_recommendation: recommendation,
                is_user_override: false,
                notes: null
            };
        });
    }

    /**
     * Obtener badge visual con lenguaje no prescriptivo
     */
    static getRecommendationBadge(recommendation: SystemRecommendation): {
        label: string;
        color: string;
        icon: string;
    } {
        switch (recommendation) {
            case 'essential':
                return {
                    label: 'Crítico de Diseño',
                    color: '#C2410C', // Naranja oscuro profesional
                    icon: '🔬'
                };
            case 'recommended':
                return {
                    label: 'Técnico Sugerido',
                    color: '#1D4ED8', // Azul profesional
                    icon: '📘'
                };
            case 'optional':
                return {
                    label: 'Complementario',
                    color: '#15803D', // Verde bosque
                    icon: '🖇️'
                };
            case 'not_applicable':
                return {
                    label: 'Fuera de Alcance',
                    color: '#4B5563', // Gris medio
                    icon: '🔘'
                };
        }
    }

    /**
     * 🅱️ FASE B — AUDITORÍA TÉCNICA ASISTIDA (PASIVA)
     * Realiza cruces lógicos entre datos sin imponer cambios.
     */
    static performTechnicalAudit(project: Project, data: any): string[] {
        const observations: string[] = [];

        // 1. Dotación vs Tipo de Fuente
        if (data.consumption?.avg_daily_consumption > 150 && project.project_context === 'rural') {
            observations.push('Observación técnica: La dotación proyectada supera los promedios rurales estándar. Se sugiere verificar concordancia con la capacidad de la fuente.');
        }

        // 2. Caudales vs Almacenamiento
        if (data.caudales?.qmh_max > 0 && (!data.tank?.capacity || data.tank.capacity === 0)) {
            observations.push('Nota técnica: El volumen de almacenamiento aún no refleja compensación para el caudal máximo horario definido.');
        }

        // 3. Calidad vs Tecnología
        if (data.quality?.turbidity > 200 && project.treatment_category === 'fime') {
            observations.push('Sugerencia profesional: La turbiedad reportada en fuente presenta picos elevados para el régimen de filtración lenta. Se recomienda evaluar etapas de pre-sedimentación robustas.');
        }

        // 4. Población vs Tipo de Sistema
        if (data.calculations?.final_population > 5000 && project.project_context === 'rural') {
            observations.push('Observación técnica: La magnitud de la población proyectada sugiere una transición hacia esquemas operativos de tipo urbano o regional.');
        }

        return observations;
    }

    /**
     * Obtener texto explicativo según categoría de tratamiento
     */
    static getTreatmentCategoryDescription(category: TreatmentCategory): string {
        switch (category) {
            case 'fime':
                return 'Filtración en Múltiples Etapas: Sistema basado en barreras físicas y biológicas sucesivas para remoción de carga coloidal y patógenos.';
            case 'compact_plant':
                return 'Planta Compacta: Integración de clarificación química y filtración rápida en unidades de alta tasa. Óptimo para espacios reducidos.';
            case 'specific_plant':
                return 'Ingeniería Específica: Configuración a medida del tren de tratamiento basada en la caracterización físico-química de la fuente.';
            case 'desalination_high_purity':
                return 'Desalinización / Alta Pureza: Procesos de separación por membranas diseñados para la reducción de sólidos disueltos totales.';
        }
    }

    /**
     * Validar aplicabilidad de contexto
     */
    static isContextApplicable(context: ProjectContext, domain: ProjectDomain): boolean {
        if (context === 'desalination') return domain === 'water_treatment';
        return true;
    }
}
