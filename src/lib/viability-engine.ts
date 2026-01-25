import {
    ViabilityMatrixInputs,
    TechnologyViabilityResult,
    TreatmentCategory
} from '@/types/project';

/**
 * 🛰️ MOTOR DE VIABILIDAD TECNOLÓGICA (HYDROSTACK V1.6)
 * 
 * Este motor calcula puntajes de viabilidad (0-100) basados en 4 dimensiones.
 * NO es determinista; ORIENTA al ingeniero.
 */
export class ViabilityEngine {

    /**
     * Calcula la viabilidad para todas las tecnologías disponibles según el dominio.
     */
    static calculateViability(
        domain: 'water_treatment' | 'wastewater_treatment',
        inputs: ViabilityMatrixInputs
    ): TechnologyViabilityResult[] {
        const technologies = domain === 'water_treatment'
            ? this.getWaterTechnologies()
            : this.getWastewaterTechnologies();

        return technologies.map(tech => this.scoreTechnology(tech, inputs));
    }

    /**
     * Puntúa una tecnología específica basada en los inputs.
     */
    private static scoreTechnology(
        tech: { category: TreatmentCategory; name: string; metadata: any },
        inputs: ViabilityMatrixInputs
    ): TechnologyViabilityResult {

        let technical = 70; // Base score
        let operational = 70;
        let economic = 70;
        let environmental = 70;

        // --- LÓGICA DE PUNTUACIÓN (HEURÍSTICA TÉCNICA) ---

        // 1. Social / Territorial
        if (inputs.settlement_type === 'rural_disperso') {
            if (['fime', 'constructed_wetlands', 'facultative_lagoons', 'simplified_treatment'].includes(tech.category)) {
                operational += 20; technical += 10;
            } else {
                operational -= 30; economic -= 10;
            }
        }

        if (inputs.population_range === 'high') {
            if (['conventional_rapid', 'activated_sludge', 'uasb'].includes(tech.category)) {
                technical += 20; economic += 10;
            } else if (['fime', 'constructed_wetlands'].includes(tech.category)) {
                technical -= 20; // Limitaciones de escala
            }
        }

        // 2. Técnico-Operativo
        if (inputs.energy_access === 'none') {
            if (['fime', 'facultative_lagoons', 'constructed_wetlands'].includes(tech.category)) {
                operational += 30;
            } else {
                operational -= 50; technical -= 20;
            }
        }

        if (inputs.chemical_access === 'low') {
            if (['fime', 'simplified_treatment', 'facultative_lagoons'].includes(tech.category)) {
                operational += 20;
            } else {
                operational -= 30;
            }
        }

        // 3. Económico
        if (inputs.opex_tolerance === 'low') {
            if (['fime', 'facultative_lagoons', 'constructed_wetlands'].includes(tech.category)) {
                economic += 20;
            } else if (['reverse_osmosis', 'activated_sludge'].includes(tech.category)) {
                economic -= 40;
            }
        }

        // 4. Ambiental
        if (inputs.source_quality === 'poor' && tech.category === 'simplified_treatment') {
            technical -= 60; environmental -= 20;
        }

        if (inputs.climate_variability === 'high') {
            if (['fime', 'conventional_rapid'].includes(tech.category)) {
                technical += 10;
            } else if (['facultative_lagoons'].includes(tech.category)) {
                environmental -= 10; // Sensibilidad a temperatura/viento
            }
        }

        // Normalizar a rango 0-100
        const normalize = (v: number) => Math.max(0, Math.min(100, v));

        const finalScores = {
            technical: normalize(technical),
            operational: normalize(operational),
            economic: normalize(economic),
            environmental: normalize(environmental),
            global: 0
        };

        finalScores.global = Math.round(
            (finalScores.technical * 0.4) +
            (finalScores.operational * 0.3) +
            (finalScores.economic * 0.2) +
            (finalScores.environmental * 0.1)
        );

        return {
            category: tech.category,
            name: tech.name,
            scores: finalScores,
            metadata: tech.metadata
        };
    }

    private static getWaterTechnologies() {
        return [
            {
                category: 'fime' as TreatmentCategory,
                name: 'FIME (Filtración en Múltiples Etapas)',
                metadata: {
                    requirements: ['Agua superficial', 'Baja/Media turbiedad', 'Área disponible'],
                    strengths: ['Sin químicos', 'Bajo OpEx', 'Alta resiliencia rural'],
                    limitations: ['Requiere gran superficie', 'No remueve sales', 'Caudal limitado']
                }
            },
            {
                category: 'compact_plant' as TreatmentCategory,
                name: 'Planta Compacta (PRFV)',
                metadata: {
                    requirements: ['Energía eléctrica', 'Coagulantes químicos', 'Operador capacitado'],
                    strengths: ['Baja huella espacial', 'Alta eficiencia física', 'Fácil instalación'],
                    limitations: ['Dependencia de químicos', 'Sensible a cortes de energía']
                }
            },
            {
                category: 'conventional_rapid' as TreatmentCategory,
                name: 'Filtración Rápida Convencional',
                metadata: {
                    requirements: ['Diseño in-situ', 'Alta población', 'Suministro constante químicos'],
                    strengths: ['Estándar urbano', 'Larga vida útil', 'Trata altos caudales'],
                    limitations: ['Alto CapEx', 'Construcción civil compleja']
                }
            },
            {
                category: 'reverse_osmosis' as TreatmentCategory,
                name: 'Ósmosis Inversa / Membranas',
                metadata: {
                    requirements: ['Alta presión energética', 'Repuestos especializados', 'Agua salobre/marina'],
                    strengths: ['Alta pureza', 'Remueve sales/metales', 'Compacta'],
                    limitations: ['OpEx muy alto', 'Generación de rechazo (salmuera)']
                }
            },
            {
                category: 'simplified_treatment' as TreatmentCategory,
                name: 'Tratamiento Simplificado + Desinfección',
                metadata: {
                    requirements: ['Agua de excelente calidad', 'Bajo riesgo sanitario fuente'],
                    strengths: ['Mínima inversión', 'Operación casi nula'],
                    limitations: ['Inseguro ante contaminantes', 'No remueve turbiedad']
                }
            }
        ];
    }

    private static getWastewaterTechnologies() {
        return [
            {
                category: 'facultative_lagoons' as TreatmentCategory,
                name: 'Lagunas Facultativas',
                metadata: {
                    requirements: ['Terrenos extensos', 'Clima cálido preferible'],
                    strengths: ['Nulo consumo energía', 'Bajo mantenimiento', 'Remoción patógenos'],
                    limitations: ['Olores potenciales', 'Gran área requerida']
                }
            },
            {
                category: 'activated_sludge' as TreatmentCategory,
                name: 'Lodos Activados',
                metadata: {
                    requirements: ['Energía confiable (aireación)', 'Retiro de lodos frecuente'],
                    strengths: ['Excelente calidad efluente', 'Baja área requerida'],
                    limitations: ['Alto OpEx', 'Operación compleja/sensible']
                }
            },
            {
                category: 'uasb' as TreatmentCategory,
                name: 'Reactor UASB',
                metadata: {
                    requirements: ['Separador Fases', 'Clima estable'],
                    strengths: ['Baja producción lodos', 'Recuperación biogás', 'Baja energía'],
                    limitations: ['Post-tratamiento requerido', 'Arranque lento']
                }
            },
            {
                category: 'constructed_wetlands' as TreatmentCategory,
                name: 'Humedales Construidos',
                metadata: {
                    requirements: ['Sustrato filtrante', 'Plantas macrófitas'],
                    strengths: ['Estética paisajística', 'Sin energía', 'Sostenible'],
                    limitations: ['Riesgo mosquitos', 'Colmatación sustrato']
                }
            },
            {
                category: 'biodisks' as TreatmentCategory,
                name: 'Biodiscos (RBC)',
                metadata: {
                    requirements: ['Estructura mecánica rotante'],
                    strengths: ['Estable ante picos', 'Fácil visualización proceso'],
                    limitations: ['Mantenimiento piezas móviles', 'Costo inicial medio']
                }
            }
        ];
    }
}
