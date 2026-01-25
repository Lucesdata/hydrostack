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
        if (['general', 'viability_matrix'].includes(moduleKey)) return 'essential';

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

        // E1-E7 — FIME FLOW (CONSOLIDATED BASELINE)
        if (category === 'fime') {
            // Desactivate chemical logic
            if (['jar_test', 'compact_design', 'filtro_lento', 'compact_mixing', 'compact_flocculation', 'compact_sedimentation', 'compact_filtration', 'compact_disinfection'].includes(moduleKey)) return 'not_applicable';

            // Activate specific FIME modules
            if (['fime_pretratamiento', 'fime_grueso_dinamico', 'fime_grueso_asdesc', 'fime_lento_arena', 'fime_hidraulica', 'fime_implantacion', 'fime_balance_masas'].includes(moduleKey)) return 'essential';
        } else if (category === 'compact_plant' || category === 'conventional_rapid') {
            // E1-E7 — COMPACT / CONVENTIONAL PLANT FLOW (SKELETON)
            // Desactivate FIME modules
            if (['fime_pretratamiento', 'fime_grueso_dinamico', 'fime_grueso_asdesc', 'fime_lento_arena', 'fime_hidraulica', 'fime_implantacion', 'fime_balance_masas'].includes(moduleKey)) return 'not_applicable';

            // Activate specific Compact Plant modules (SKELETON)
            if (['compact_mixing', 'compact_flocculation', 'compact_sedimentation', 'compact_filtration', 'compact_disinfection', 'jar_test'].includes(moduleKey)) return 'essential';
        } else {
            // Desactivate specialized modules for other categories (RO, Simplified, Wastewater, etc.)
            if (['fime_pretratamiento', 'fime_grueso_dinamico', 'fime_grueso_asdesc', 'fime_lento_arena', 'fime_hidraulica', 'fime_implantacion', 'fime_balance_masas'].includes(moduleKey)) return 'not_applicable';
            if (['compact_mixing', 'compact_flocculation', 'compact_sedimentation', 'compact_filtration', 'compact_disinfection'].includes(moduleKey)) return 'not_applicable';
        }

        // Standard treatment modules (Generic / Specific)
        if (['filtro_lento'].includes(moduleKey)) {
            if (category === 'fime') return 'not_applicable'; // Use fime_lento_arena instead
            if (category === 'specific_plant') return 'recommended';
            return 'not_applicable'; // Hide for Compact or Desalination
        }

        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') return 'essential';
            if (category === 'fime') return 'not_applicable'; // Safety catch
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
            if (category === 'fime') return 'not_applicable'; // Handled in fime_pretratamiento
            if (category === 'compact_plant') return 'recommended';
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
        const isRural = context === 'rural';

        // 🟢 CONFIGURACIÓN ESPECIALIZADA FIME (BLOQUE E) — CONSOLIDACIÓN TÉCNICA
        if (category === 'fime') {
            reason = 'FIME es la tecnología base sugerida para este proyecto por su coherencia con el contexto rural y la soberanía operativa de la comunidad.';
            if (moduleKey === 'fime_pretratamiento') {
                adaptations.help_text = 'Nota técnica: El pretratamiento asegura la eliminación de material grueso y arenas, protegiendo las etapas biológicas posteriores. Es obligatorio según RAS para fuentes superficiales.';
            }
            if (moduleKey === 'fime_grueso_dinamico') {
                adaptations.help_text = 'Nota técnica (FGD): Unidad diseñada para remoción de turbiedad en picos de lluvia sin uso de productos químicos. Funciona como un fusible hidráulico.';
            }
            if (moduleKey === 'fime_grueso_asdesc') {
                adaptations.help_text = 'Nota técnica (FGA/D): Filtros de grava con flujo ascendente o descendente. Su función es reducir la carga de sólidos antes del FLA para prolongar su ciclo de carrera.';
            }
            if (moduleKey === 'fime_lento_arena') {
                adaptations.warning = '💡 BARRERA SANITARIA CRÍTICA: Los filtros lentos garantizan la remoción microbiológica (E.coli, Giardia, Cripto) mediante el desarrollo de la Schmutzdecke. No se debe omitir su tiempo de maduración.';
            }
            if (moduleKey === 'fime_hidraulica') {
                adaptations.help_text = 'Nota técnica: El balance hidráulico garantiza que el sistema opere por gravedad extrema a extrema, minimizando fallos mecánicos y costos de energía.';
            }
            if (moduleKey === 'fime_implantacion') {
                adaptations.help_text = 'Nota técnica: La implantación debe considerar el acceso para el lavado manual de arenas y el retiro de lodos de pretratamiento.';
            }
            if (moduleKey === 'fime_balance_masas') {
                adaptations.help_text = 'Nota normativa: Este módulo audita que la configuración propuesta cumpla con los límites de potabilidad nacionales antes de proceder al reporte.';
            }
        }

        // 🔵 CONFIGURACIÓN PLANTA COMPACTA (BLOQUE E) — ESQUELETO NARRATIVO
        if (category === 'compact_plant') {
            reason = 'La Planta Compacta se selecciona para proyectos que requieren alta tasa de tratamiento en espacios reducidos, supeditado a la disponibilidad de personal técnico permanente.';
            if (moduleKey === 'compact_mixing') {
                adaptations.help_text = 'Fase conceptual: Diseño del gradiente y tiempo de mezcla rápida para la desestabilización coloidal.';
            }
            if (moduleKey === 'compact_flocculation') {
                adaptations.help_text = 'Fase conceptual: Configuración de zonas de floculación hidráulica o mecánica para la formación de flóculos pesados.';
            }
            if (moduleKey === 'compact_sedimentation') {
                adaptations.help_text = 'Fase conceptual: Dimensionamiento del área de clarificación lamelar o convencional.';
            }
            if (moduleKey === 'compact_filtration') {
                adaptations.help_text = 'Fase conceptual: Diseño de filtros rápidos de arena y antracita con sistema de lavado a contracorriente.';
            }
            if (moduleKey === 'compact_disinfection') {
                adaptations.help_text = 'Fase normativa: Cálculo del tiempo de contacto (CT) para garantizar la inactivación viral y bacteriana residual.';
            }
        }

        // 2.2 Fuente de Abastecimiento — Bloque C
        if (moduleKey === 'source' && isRural && domain === 'water_treatment') {
            adaptations.help_text = '💡 Nota técnica: Las fuentes superficiales en contextos rurales suelen presentar alta variabilidad en calidad y mayor riesgo sanitario. Se recomienda evaluar el tratamiento como un sistema de barreras múltiples, no como una unidad aislada.';
        }

        // 2.3 Selección de Tratamiento — Bloque E (Legacy/Standard)
        if (isRural) {
            if (moduleKey === 'filtro_lento' || category === 'fime') {
                if (category === 'fime') {
                    // Specific FIME praise
                    adaptations.help_text = '✅ Tecnología alineada con el contexto: Esta configuración es coherente con proyectos rurales por su simplicidad operativa, tolerancia a fallos y facilidad de mantenimiento. HydroStack la considera una solución robusta para este tipo de sistema.';
                } else if (!adaptations.help_text) {
                    adaptations.help_text = '✅ Tecnología sugerida: Los filtros lentos son coherentes con proyectos rurales por su simplicidad operativa.';
                }
            }
            if (moduleKey === 'compact_design' || category === 'compact_plant') {
                adaptations.warning = '⚠️ Advertencia de sostenibilidad: Esta tecnología es técnicamente viable, pero puede presentar dificultades operativas en contextos rurales sin personal permanente, repuestos locales o control continuo. Se recomienda validar la capacidad real de operación y mantenimiento antes de adoptarla.';
            }
        }

        // 2.4 Caudales y Dimensionamiento — Bloque D
        if (moduleKey === 'caudales' && isRural) {
            adaptations.help_text = '💡 Criterio de diseño: En sistemas rurales, la estabilidad operativa es tan importante como la precisión hidráulica. Los márgenes de seguridad deben considerar variaciones de calidad y operación.';
        }

        // Adaptaciones adicionales con lenguaje descriptivo y profesional
        if (moduleKey === 'desarenador') {
            if (category === 'desalination_high_purity') {
                reason = 'Nota normativa: En procesos de desalinización de alta pureza, la sedimentación de partículas pesadas suele integrarse en la microfiltración previa.';
                adaptations.warning = 'Observación técnica: Este componente no suele ser determinante en configuraciones de ósmosis inversa, salvo si el ingreso de sólidos gruesos es incontrolado.';
            }
        }

        if (moduleKey === 'jar_test' && category === 'compact_plant') {
            adaptations.help_text = 'Nota técnica: La determinación de la dosis óptima mediante este ensayo es el pilar para la estabilidad química de la planta compacta.';
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
            'general', 'viability_matrix', 'population', 'floating_population', 'source', 'consumption',
            'quality', 'caudales', 'tank', 'conduccion', 'desarenador',
            'jar_test', 'filtro_lento', 'compact_design', 'costs', 'viability', 'tech_selection',
            'fime_pretratamiento', 'fime_grueso_dinamico', 'fime_grueso_asdesc', 'fime_lento_arena',
            'fime_hidraulica', 'fime_implantacion', 'fime_balance_masas',
            'compact_mixing', 'compact_flocculation', 'compact_sedimentation', 'compact_filtration', 'compact_disinfection'
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
     * Realiza cruces lógicos entre datos sin imponer cambios, incorporando filosofía rural.
     */
    static performTechnicalAudit(project: Project, data: any): string[] {
        const observations: string[] = [];
        const isRural = project.project_context === 'rural';

        // 1. Dotación vs Tipo de Fuente
        if (data.consumption?.avg_daily_consumption > 150 && isRural) {
            observations.push('Observación técnica: La dotación proyectada supera los promedios rurales estándar. Se sugiere verificar concordancia con la capacidad de la fuente.');
        }

        // 2. Caudales vs Almacenamiento
        if (data.caudales?.qmh_max > 0 && (!data.tank?.capacity || data.tank.capacity === 0)) {
            observations.push('Nota técnica: El volumen de almacenamiento aún no refleja compensación para el caudal máximo horario definido.');
        }

        // 3. Calidad vs Tecnología
        if (data.quality?.turbidity > 200 && project.treatment_category === 'fime') {
            observations.push('Sugerencia profesional: La turbiedad reportada presenta picos elevados para el régimen de filtración lenta. Se recomienda evaluar etapas de pre-sedimentación robustas.');
        }

        // 4. Población vs Tipo de Sistema
        if (data.calculations?.final_population > 5000 && isRural) {
            observations.push('Observación técnica: La magnitud de la población sugiere una transición hacia esquemas operativos de tipo urbano o regional.');
        }

        // 5. FILOSOFÍA RURAL: Sostenibilidad de la Tecnología
        if (isRural && project.treatment_category === 'compact_plant') {
            observations.push('Sugerencia profesional: Esta solución (Planta Compacta) es técnicamente viable, pero su sostenibilidad en contexto rural requiere asegurar operación permanente y suministro químico constante.');
        }

        if (isRural && (project.treatment_category === 'fime' || project.treatment_category === 'specific_plant')) {
            observations.push('Nota técnica: Se prioriza un esquema de barreras múltiples de baja carga superficial, coherente con la capacidad operativa local identificada.');
        }

        // 6. Evaluación de Riesgo Sanitario (Estructura Interna Silenciosa)
        const sourceRisk = data.source?.source_type === 'superficial' ? 'Alto' : 'Moderado';
        if (sourceRisk === 'Alto' && !project.treatment_category) {
            observations.push(`Observación técnica: Fuente superficial identificada (Riesgo ${sourceRisk}). Se sugiere definir un tren de tratamiento con al menos tres barreras de remoción.`);
        }

        return observations;
    }

    /**
     * Obtener texto explicativo según categoría de tratamiento (Refinado con filosofía rural)
     */
    static getTreatmentCategoryDescription(category: TreatmentCategory): string {
        switch (category) {
            case 'fime':
                return 'Filtración en Múltiples Etapas: Sistema biológico robusto diseñado para contextos rurales. Prioriza la barrera microbiológica sin dependencia crítica de químicos.';
            case 'compact_plant':
                return 'Planta Compacta: Sistema mecánico de alta tasa. Requiere personal calificado y logística de insumos constante para su sostenibilidad técnica.';
            case 'conventional_rapid':
                return 'Filtración Rápida Convencional: Tren de tratamiento completo (Mezcla, Floculación, Sedimentación, Filtración) diseñado in-situ para altos caudales urbanos.';
            case 'reverse_osmosis':
                return 'Ósmosis Inversa: Tecnología de membranas de alta presión para la remoción de sales, metales y contaminantes complejos.';
            case 'simplified_treatment':
                return 'Tratamiento Simplificado: Desinfección o filtración simple para fuentes con muy alta calidad inicial.';
            case 'specific_plant':
                return 'Ingeniería Específica: Configuración a medida. Se recomienda priorizar procesos de sedimentación y filtración lenta en entornos de difícil acceso.';
            case 'desalination_high_purity':
                return 'Desalinización / Alta Pureza: Procesos avanzados de membranas. Requiere esquemas de mantenimiento especializado y gestión de rechazos.';
            case 'facultative_lagoons':
                return 'Lagunas Facultativas: Tratamiento biológico natural mediante procesos de estabilización en grandes superficies.';
            case 'activated_sludge':
                return 'Lodos Activados: Proceso aerobio de alta tasa con bio-masa en suspensión para remoción intensiva de carga orgánica.';
            case 'uasb':
                return 'Reactor UASB: Sistema anaerobio de flujo ascendente para alta carga orgánica con baja producción de lodos.';
            case 'constructed_wetlands':
                return 'Humedales Construidos: Sistemas naturales fitopedagógicos de bajo costo operativo y alta integración paisajística.';
            case 'biodisks':
                return 'Biodiscos (RBC): Reactores biológicos rotativos para tratamiento secundario estable y compacto.';
            default:
                return 'Tecnología de tratamiento seleccionada para dimensionamiento detallado.';
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
