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
        const contextType = project.project_context || 'comunidad';
        const projectName = project.name || 'XXXX';
        const waterSource = project.decision_metadata?.selector_origin || 'rio';
        const sourceName = project.decision_metadata?.source_name;
        const location = project.location || 'XXXX';
        const latitude = project.decision_metadata?.latitude;
        const longitude = project.decision_metadata?.longitude;

        const sourceLabels: Record<string, string> = {
            rio: 'fuentes superficiales (Río/Quebrada)',
            pozo: 'fuentes subterráneas (Pozo/Nacimiento)',
            mar: 'fuente marina (Desalinización)',
            lluvia: 'fuentes pluviales (Aguas Lluvia)'
        };

        const contextLabels: Record<string, string> = {
            rural: 'comunidad',
            urban: 'ciudad',
            industrial: 'centro industrial',
            residential: 'hotel / conjunto residencial',
            desalination: 'zona costera'
        };

        const selectedContext = contextLabels[contextType] || contextType;
        const selectedSource = sourceName || sourceLabels[waterSource] || waterSource;

        let locationText = `en la ${selectedContext} de ${projectName}, ubicada en ${location}.`;
        if (latitude && longitude) {
            locationText = `en la ${selectedContext} de ${projectName}, ubicada en ${location}, con coordenadas geográficas de referencia ${latitude} de latitud y ${longitude} de longitud.`;
        }

        return `El agua es una de las sustancias químicas más importantes y uno de los principales constituyentes de la materia viva y del medio en que se vive, y su abastecimiento con excelente calidad y en cantidad suficiente es reconocido actualmente como una condición esencial para posibilitar el bienestar y el desarrollo de los asentamientos humanos.

En la naturaleza el agua no se encuentra en estado puro pues en su contacto con la atmósfera y los suelos arrastra diversas sustancias en forma de gases disueltos, sólidos en suspensión y disueltos, y microorganismos, algunos de los cuales se consideran impurezas para el uso del agua en el consumo humano. Precisamente, el agua con impurezas es convertida a agua potable a través de un tratamiento que provoca cambios físicos, químicos y biológicos en ella. Ese tratamiento se selecciona conociendo la calidad de la fuente de abasto y el uso a que se le destine después de tratada.
Los métodos de tratamiento de las aguas pueden ser sencillos como la sedimentación y la filtración o llevar consigo cambios físicos y químicos más complejos como la coagulación y la floculación.

La decisión de realizar una construcción del sistema de potabilización ${locationText} busca cumplir con el objetivo de tener agua de excelente calidad en sus hogares. Ante esta iniciativa se realiza entonces este informe, cuyo objetivo primordial es presentar el diseño de la planta de potabilización de agua para dicho sector. Este trabajo reviste una gran importancia porque permitirá realizar cambios positivos en la zona, no solo en el área de salud pública sino también en la parte social. Además generará una activación relevante de la economía, y en consecuencia, un mayor desarrollo para la población en estudio y el país en general. Las fuentes de agua identificadas para el abastecimiento del sistema corresponden a ${selectedSource}, las cuales han sido previamente caracterizadas para el presente estudio.

Se presenta además el cálculo del sistema de desinfección para el acueducto ${projectName}, el cual consta de dosificador de cabeza constante y tanque de almacenamiento.

Para este trabajo se utilizaron métodos tan importantes como la revisión bibliográfica, visitas técnicas al lugar, reuniones con la comunidad y modelaciones hidráulicas, entre otros.`;
    }

    /**
     * BLOQUE A.2: Objetivos del Proyecto
     */
    static generateObjectives(project: Project): { general: string; specifics: string[] } {
        const projectName = project.name || 'XXXX';
        const location = project.location || 'XXXX';
        const contextType = project.project_context || 'rural';

        const contextLabels: Record<string, string> = {
            rural: 'corregimiento',
            urban: 'municipio',
            industrial: 'sector industrial',
            residential: 'sector residencial',
            desalination: 'sector costero'
        };

        const selectedContext = contextLabels[contextType] || 'sector';

        return {
            general: `Realizar el diseño del sistema de potabilización de agua para el abastecimiento del ${selectedContext} de ${projectName}, municipio de ${location}.`,
            specifics: [
                `Mejorar las condiciones de salubridad en la comunidad de ${projectName}.`,
                `Diseñar un sistema que permita generar empleo y capacitación a los habitantes de la población, para un mayor desarrollo de la misma.`,
                `Contribuir con el incremento de información y experiencia en cuanto al desempeño de plantas FIME en nuestro país.`,
                `Permitir la ejecución de un sistema que sea viable para la comunidad tanto técnica como económica y ambientalmente.`
            ]
        };
    }

    /**
     * BLOQUE A.3: Consideraciones Generales
     */
    static generateGeneralConsiderations(project: Project): string {
        const sourceName = project.decision_metadata?.source_name || 'la fuente identificada';
        const waterSource = project.decision_metadata?.selector_origin || 'rio';

        const sourceLabels: Record<string, string> = {
            rio: 'fuentes superficiales (Río/Quebrada)',
            pozo: 'fuentes subterráneas (Pozo/Nacimiento)',
            mar: 'fuente marina (Desalinización)',
            lluvia: 'fuentes pluviales (Aguas Lluvia)'
        };

        const selectedSourceType = sourceLabels[waterSource] || 'la fuente hídrica';

        return `Las posibles fuentes hídricas para el abastecimiento de la población corresponden a ${selectedSourceType} identificadas como ${sourceName}, la cual presenta condiciones adecuadas para su potabilización. En el presente diseño se ha priorizado el uso de esta fuente para abastecer a la totalidad de la población beneficiaria, garantizando el suministro de agua apta para consumo humano bajo los parámetros de calidad del RAS 0330.`;
    }

    /**
     * BLOQUE A.4: Identificación del Riesgo a Tratar
     */
    static generateRiskIdentification(project: Project): string[] {
        const sourceName = project.decision_metadata?.source_name || 'la fuente';

        return [
            `Un buen servicio de abastecimiento de Agua es esencial para la vida y la productividad en los asentamientos humanos. La protección de las fuentes es siempre la primera manera de contribuir a la seguridad de este servicio. En efecto, el mayor impacto de las aguas residuales sobre la salud pública sucede a través de los sistemas de abastecimiento de Agua, cuyas cuencas están siendo degradadas con descargas que incluyen desechos domésticos, escorrentía superficial de aguas lluvias, excedentes de sistemas de riego y desechos del procesamiento de alimentos y en algunas circunstancias, hasta efluentes de procesos industriales.`,
            `La contaminación con excretas de humanos y animales contribuye con gran variedad de virus, bacterias, protozoarios y helmintos. Fallas en la protección de las fuentes o en el tratamiento del agua captada pone a la comunidad en riesgo de sufrir enfermedades transmisibles, particularmente los niños, ancianos o, en general, la población con deficiencias en su sistema inmunológico. Para ellos las dosis infectivas son significativamente más bajas que para el resto de la población. Los riesgos asociados a la contaminación microbiológica, son pues de tal importancia, que su control debe ser considerado con prioridad.`,
            `El principal riesgo a intervenir para la calidad de Agua de las fuentes de abastecimiento es entonces el microbiológico, pues a pesar de que los niveles de contaminación fecal son relativamente bajos, es importante tener en cuenta que las enfermedades asociadas con este tipo de contaminación son tan importantes que su control debe ser siempre una prioridad. En la siguiente tabla se muestra el resultado de la caracterización fisicoquímica y bacteriológica realizada al agua de la captación del acueducto ${sourceName}.`
        ];
    }

    /**
     * BLOQUE A.4.1: Caracterización de la Fuente (Valores Promedio)
     */
    static getAverageWaterQuality() {
        return [
            { parameter: 'TURBIEDAD (UNT)', min: '3.5', med: '4.1', max: '175', var: '7.8' },
            { parameter: 'COLOR (UPC)', min: '5.8', med: '10.0', max: '16.2', var: '10.9' },
            { parameter: 'Coliformes fecales (UFC/100mL)', min: '24', med: '56', max: '78', var: '61.5' },
            { parameter: 'Coliformes totales (UFC/100mL)', min: '35', med: '73', max: '99', var: '86.2' },
            { parameter: 'pH (Un)', min: '7.1', med: '7.37', max: '7.5', var: '7.4' },
            { parameter: 'ALC. (mg/l CaCO3)', min: '120.3', med: '150', max: '170.6', var: '151.1' },
            { parameter: 'Dureza total (mg/l CaCO3)', min: '43.1', med: '80.0', max: '87.6', var: '71.4' },
            { parameter: 'Mn (mg/L)', min: '-', med: 'ND', max: '-', var: '-' },
            { parameter: 'Fe (mg/L)', min: '-', med: 'ND', max: '-', var: '-' },
            { parameter: 'OTROS', min: '', med: 'Picos de corta duración T<24H', max: '', var: '' }
        ];
    }

    /**
     * BLOQUE A.4.2: Narrativa de Cierre de Riesgo Químico
     */
    static generateRiskConcludingNarrative(project: Project): string[] {
        const projectName = project.name || 'XXXX';
        return [
            `Hay en la fuente pocos contaminantes de naturaleza química que pueden dar lugar a riesgos agudos de salud pública. La buena calidad de la fuente de agua y el sencillo tratamiento que requiere, reduce las dosis necesarias de Cloro, como también la posible formación de subproductos, haciendo más eficiente la desinfección.`,
            `En este caso, se cuenta con una fuente bastante aceptable en términos fisicoquímicos, y en consecuencia, el diseño de la planta debe garantizar un efluente de excelente calidad a la comunidad del Corregimiento ${projectName}.`
        ];
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
     * BLOQUE G: Blindaje Sanitario (Nuevo Eje Transversal)
     */
    static generateSanitaryShieldNarrative(quality: any, project: Project): string {
        if (!quality || !quality.turbidity || !quality.fecal_coliforms) return "El análisis de blindaje sanitario se encuentra pendiente de datos de entrada.";

        const isFime = project.treatment_category === 'fime';
        const complexity = quality.complexity_level || 'media';

        let narrative = `Análisis de Blindaje Sanitario y Multibarreras:\n\n`;
        narrative += `La fuente de abastecimiento presenta una calidad ${complexity === 'alta' ? 'crítica' : complexity === 'media' ? 'regular' : 'aceptable'}, con una carga de turbiedad de ${quality.turbidity} UNT y riesgo microbiológico de ${quality.fecal_coliforms} UFC/100ml. `;

        if (isFime) {
            narrative += `Para mitigar este riesgo, el sistema FIME actúa como una secuencia de barreras de atenuación. El Filtro Grueso Dinámico actúa como primera línea de defensa para picos de sólidos, seguido por la biofiltración gruesa y fina. El objetivo de diseño es alcanzar una reducción acumulada superior a 4-Logs en patógenos antes de la desinfección final. `;
        } else {
            narrative += `El tren de tratamiento propuesto integra procesos físico-químicos de alta tasa para garantizar la reducción de carga antes de la desinfección. `;
        }

        if (quality.irca_score) {
            narrative += `El Índice de Riesgo de Calidad de Agua (IRCA) calculado inicialmente es del ${quality.irca_score}%, lo que exige una eficiencia de remoción superior al 95% en los procesos de clarificación y filtración.`;
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
