import {
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

        // BLOQUE A — Contexto (siempre esencial)
        if (moduleKey === 'general') return 'essential';

        // BLOQUE B — Demanda
        if (moduleKey === 'population') {
            return 'essential';
        }

        if (moduleKey === 'floating_population') {
            if (context === 'residential' || context === 'desalination') return 'recommended';
            if (level === 'preliminary_assessment') return 'optional';
            return 'recommended';
        }

        if (moduleKey === 'consumption') return 'essential';

        // BLOQUE C — Fuente
        if (moduleKey === 'source') {
            return domain === 'water_treatment' ? 'essential' : 'typically_not_applicable';
        }

        if (moduleKey === 'quality') return 'essential';

        // BLOQUE D — Hidráulica
        if (moduleKey === 'caudales') return 'essential';
        if (moduleKey === 'tank') return 'recommended';
        if (moduleKey === 'conduccion') return 'recommended';

        // BLOQUE E — Tratamiento (depende de categoría)
        if (moduleKey === 'desarenador') {
            if (category === 'fime') return 'recommended';
            if (category === 'compact_plant') return 'recommended';
            if (category === 'desalination_high_purity') return 'typically_not_applicable';
            return 'optional';
        }

        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') return 'essential';
            if (category === 'specific_plant') return 'recommended';
            if (category === 'fime') return 'optional';
            if (category === 'desalination_high_purity') return 'typically_not_applicable';
            return 'recommended';
        }

        if (moduleKey === 'filtro_lento') {
            if (category === 'fime') return 'essential';
            if (category === 'compact_plant') return 'typically_not_applicable';
            if (category === 'specific_plant') return 'recommended';
            return 'recommended';
        }

        if (moduleKey === 'compact_design') {
            if (category === 'compact_plant') return 'essential';
            if (category === 'fime') return 'typically_not_applicable';
            return 'recommended';
        }

        // BLOQUE F — Evaluación (siempre importante)
        if (moduleKey === 'costs') return 'essential';
        if (moduleKey === 'viability') return 'essential';
        if (moduleKey === 'tech_selection') {
            return level === 'complete_design' ? 'essential' : 'recommended';
        }

        // Fallback
        return 'recommended';
    }

    /**
     * Obtener configuración adaptativa de un módulo
     * (Advertencias, ayudas contextuales, placeholders)
     * 
     * @param moduleKey - Clave del módulo
     * @param domain - Dominio del proyecto
     * @param context - Contexto del proyecto
     * @param level - Nivel del proyecto
     * @param category - Categoría de tratamiento
     * @returns Configuración adaptativa
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

        // Adaptaciones por módulo
        if (moduleKey === 'desarenador') {
            if (category === 'desalination_high_purity') {
                reason = 'En desalinización normalmente se usa prefiltración específica';
                adaptations.warning = '⚠️ Este módulo es poco común en desalinización. Verifica si aplica a tu caso.';
            }
            if (context === 'residential') {
                adaptations.help_text = 'En proyectos residenciales, el desarenador puede omitirse si la fuente tiene baja turbiedad';
            }
        }

        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') {
                adaptations.help_text = '✅ Esencial para definir dosis de coagulante en planta compacta';
            }
            if (category === 'desalination_high_purity') {
                reason = 'Desalinización no usa coagulación convencional';
                adaptations.warning = '⚠️ Este módulo típicamente NO aplica a desalinización';
            }
        }

        if (moduleKey === 'filtro_lento') {
            if (category === 'fime') {
                adaptations.help_text = '✅ Componente clave de FIME junto con filtros gruesos y dinámicos';
            }
            if (category === 'compact_plant') {
                reason = 'Plantas compactas usan filtración rápida, no filtros lentos';
                adaptations.warning = '⚠️ Plantas compactas normalmente NO usan filtros lentos';
            }
        }

        if (moduleKey === 'compact_design') {
            if (category === 'fime') {
                reason = 'FIME no es una planta compacta convencional';
                adaptations.warning = '⚠️ FIME y planta compacta son tecnologías diferentes';
            }
        }

        if (moduleKey === 'source') {
            if (domain === 'wastewater_treatment') {
                reason = 'Aguas residuales no tienen "fuente" en el sentido de agua cruda';
                adaptations.warning = '⚠️ En aguas residuales, esta sección puede no aplicar';
            }
        }

        if (moduleKey === 'floating_population') {
            if (context === 'residential') {
                adaptations.help_text = 'Importante en condominios o fincas con estacionalidad turística';
            }
            if (context === 'industrial') {
                reason = 'Plantas industriales normalmente tienen demanda constante';
                adaptations.warning = 'ℹ️ Verifica si hay variación estacional en tu planta';
            }
        }

        if (moduleKey === 'tech_selection') {
            if (level === 'preliminary_assessment') {
                adaptations.help_text = 'En evaluación preliminar, puede ser una matriz simplificada';
            }
            if (level === 'complete_design') {
                adaptations.help_text = 'En diseño completo, se espera análisis multicriterio riguroso';
            }
        }

        return { adaptations, reason };
    }

    /**
     * Inicializar estados de módulos para un proyecto nuevo
     * 
     * @param projectId - UUID del proyecto
     * @param domain - Dominio del proyecto
     * @param context - Contexto del proyecto
     * @param level - Nivel del proyecto
     * @param category - Categoría de tratamiento
     * @returns Array de objetos para insertar en project_module_status
     */
    static initializeModuleStatuses(
        projectId: string,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): Omit<ProjectModuleStatus, 'id' | 'created_at' | 'status_updated_at' | 'marked_by'>[] {

        const moduleKeys: ModuleKey[] = [
            'general',
            'population',
            'floating_population',
            'source',
            'consumption',
            'quality',
            'caudales',
            'tank',
            'conduccion',
            'desarenador',
            'jar_test',
            'filtro_lento',
            'compact_design',
            'costs',
            'viability',
            'tech_selection'
        ];

        return moduleKeys.map(moduleKey => ({
            project_id: projectId,
            module_key: moduleKey,
            status: 'pending' as const,
            reason: null,
            system_recommendation: this.getModuleRecommendation(
                moduleKey, domain, context, level, category
            ),
            notes: null
        }));
    }

    /**
     * Obtener badge visual según recomendación
     * 
     * @param recommendation - Recomendación del sistema
     * @returns Objeto con label, color e ícono
     */
    static getRecommendationBadge(recommendation: SystemRecommendation): {
        label: string;
        color: string;
        icon: string;
    } {
        switch (recommendation) {
            case 'essential':
                return {
                    label: 'Esencial',
                    color: '#DC2626', // rojo
                    icon: '🔴'
                };
            case 'recommended':
                return {
                    label: 'Recomendado',
                    color: '#2563EB', // azul
                    icon: '🔵'
                };
            case 'optional':
                return {
                    label: 'Opcional',
                    color: '#65A30D', // verde oliva
                    icon: '🟢'
                };
            case 'typically_not_applicable':
                return {
                    label: 'Típicamente no aplica',
                    color: '#6B7280', // gris
                    icon: '⚪'
                };
        }
    }

    /**
     * Obtener texto explicativo según categoría de tratamiento
     * 
     * @param category - Categoría de tratamiento
     * @returns Descripción técnica de la categoría
     */
    static getTreatmentCategoryDescription(category: TreatmentCategory): string {
        switch (category) {
            case 'fime':
                return 'Filtración en Múltiples Etapas: Filtros gruesos, dinámicos y lentos de arena. Apropiado para comunidades pequeñas con agua superficial.';
            case 'compact_plant':
                return 'Planta Compacta: Tratamiento químico (coagulación-floculación) + sedimentación + filtración rápida. Para caudales medianos a altos.';
            case 'specific_plant':
                return 'Planta Específica: Diseño customizado según condiciones particulares. Puede usar filtración rápida o lenta según caso.';
            case 'desalination_high_purity':
                return 'Desalinización / Alta Pureza: Ósmosis inversa, electrodiálisis u otros procesos de separación avanzada. Para agua salobre o marina.';
        }
    }

    /**
     * Validar si un contexto es aplicable a un dominio
     * 
     * @param context - Contexto a validar
     * @param domain - Dominio del proyecto
     * @returns true si el contexto es válido para ese dominio
     */
    static isContextApplicable(context: ProjectContext, domain: ProjectDomain): boolean {
        // Desalinización solo aplica a agua potable
        if (context === 'desalination') {
            return domain === 'water_treatment';
        }

        // Los demás contextos aplican a ambos dominios
        return true;
    }
}
