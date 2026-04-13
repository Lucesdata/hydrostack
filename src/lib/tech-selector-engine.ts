/**
 * Expert Technology Selector Engine — HydroStack v2.0
 *
 * Multicriteria decision engine for drinking water treatment technology selection.
 * Implements IGST scoring (4 dimensions) with hard viability filters.
 *
 * References:
 * - WHO Guidelines for Drinking-water Quality (4th Ed.)
 * - Resolución 0330 de 2017 (Colombia)
 * - CINARA/UniValle FiME Guidelines
 * - AWWA Water Treatment Plant Design (5th Ed.)
 */

import type {
    TechnologyId,
    TechnologyProfile,
    SelectorInputs,
    DimensionScores,
    ScoredTechnology,
    SelectorResult,
    TreatmentTrainStep,
    ViabilityFilter,
    IgstWeights,
} from '@/types/tech-selector';

// ═══════════════════════════════════════════════
// TECHNOLOGY DATABASE (7 Technologies)
// ═══════════════════════════════════════════════

export const TECHNOLOGIES: Record<TechnologyId, TechnologyProfile> = {
    slow_sand: {
        id: 'slow_sand',
        name: 'Filtración Lenta en Arena (FiME)',
        shortName: 'FiME',
        color: '#16a34a',
        icon: 'Layers',
        removalEfficiency: {
            turbidity: 95,
            tds: 5,
            ironManganese: 40,
            nitrates: 10,
            microbiological: 3,
        },
        flowRange: [0.5, 50],
        areaFactor: 25,
        energyDemand: 'none',
        energyKwhPerM3: 0,
        operationalComplexity: 'low',
        maintenanceDifficulty: 'low',
        capexRange: [2000, 3500],
        opexPerM3: 0.03,
        typicalContext: 'Comunidades rurales con agua superficial de turbiedad ≤70 NTU',
        description: 'Filtración en Múltiples Etapas por gravedad: FGDi → FGAC → FLA. Sin químicos, sin electricidad. Basado en procesos biológicos naturales del schmutzdecke.',
        treatmentTrain: ['Captación', 'FGDi', 'FGAC', 'FLA', 'Desinfección', 'Almacenamiento'],
        requiresEnergy: false,
        requiresChemicals: false,
        requiresSpareParts: false,
        minSpaceRequired: 'high',
    },
    rapid_sand: {
        id: 'rapid_sand',
        name: 'Filtración Rápida Convencional',
        shortName: 'Convencional',
        color: '#6b7280',
        icon: 'Building2',
        removalEfficiency: {
            turbidity: 97,
            tds: 10,
            ironManganese: 85,
            nitrates: 15,
            microbiological: 4,
        },
        flowRange: [5, 500],
        areaFactor: 12,
        energyDemand: 'high',
        energyKwhPerM3: 0.50,
        operationalComplexity: 'high',
        maintenanceDifficulty: 'medium',
        capexRange: [6000, 12000],
        opexPerM3: 0.18,
        typicalContext: 'Plantas municipales urbanas de mediana/gran escala',
        description: 'Tren completo: Coagulación → Floculación → Sedimentación → Filtración Rápida → Desinfección. Requiere operador capacitado y suministro constante de químicos.',
        treatmentTrain: ['Captación', 'Coagulación', 'Floculación', 'Sedimentación', 'Filtración Rápida', 'Desinfección', 'Almacenamiento'],
        requiresEnergy: true,
        requiresChemicals: true,
        requiresSpareParts: true,
        minSpaceRequired: 'medium',
    },
    compact_clarification: {
        id: 'compact_clarification',
        name: 'Planta Compacta de Clarificación',
        shortName: 'Compacta',
        color: '#f97316',
        icon: 'Box',
        removalEfficiency: {
            turbidity: 95,
            tds: 8,
            ironManganese: 75,
            nitrates: 10,
            microbiological: 3,
        },
        flowRange: [0.5, 25],
        areaFactor: 3,
        energyDemand: 'medium',
        energyKwhPerM3: 0.30,
        operationalComplexity: 'medium',
        maintenanceDifficulty: 'medium',
        capexRange: [4000, 7000],
        opexPerM3: 0.12,
        typicalContext: 'Zonas semi-rurales o municipios pequeños con espacio limitado',
        description: 'Sistema contenerizado con procesos convencionales en menor espacio. Coagulación, floculación, sedimentación lamelar y filtración rápida integrados.',
        treatmentTrain: ['Captación', 'Coag-Floc Integrado', 'Sed. Lamelar', 'Filtración', 'Desinfección', 'Almacenamiento'],
        requiresEnergy: true,
        requiresChemicals: true,
        requiresSpareParts: true,
        minSpaceRequired: 'low',
    },
    ultrafiltration: {
        id: 'ultrafiltration',
        name: 'Ultrafiltración por Membrana (UF)',
        shortName: 'UF Membrana',
        color: '#3b82f6',
        icon: 'Filter',
        removalEfficiency: {
            turbidity: 99.9,
            tds: 5,
            ironManganese: 30,
            nitrates: 5,
            microbiological: 5,
        },
        flowRange: [0.5, 30],
        areaFactor: 1.5,
        energyDemand: 'medium',
        energyKwhPerM3: 0.25,
        operationalComplexity: 'high',
        maintenanceDifficulty: 'high',
        capexRange: [8000, 15000],
        opexPerM3: 0.18,
        typicalContext: 'Instalaciones con requisitos estrictos de calidad microbiológica',
        description: 'Barrera física absoluta por fibra hueca (0.01–0.1 µm). Máxima remoción microbiológica. Requiere electricidad, mantenimiento de membranas y CIP periódico.',
        treatmentTrain: ['Captación', 'Pre-filtro', 'UF (Fibra Hueca)', 'Desinfección', 'Almacenamiento'],
        requiresEnergy: true,
        requiresChemicals: false,
        requiresSpareParts: true,
        minSpaceRequired: 'low',
    },
    reverse_osmosis: {
        id: 'reverse_osmosis',
        name: 'Ósmosis Inversa (RO)',
        shortName: 'Ósmosis Inversa',
        color: '#9333ea',
        icon: 'Atom',
        removalEfficiency: {
            turbidity: 99.99,
            tds: 99,
            ironManganese: 50,
            nitrates: 95,
            microbiological: 7,
        },
        flowRange: [0.1, 100],
        areaFactor: 2,
        energyDemand: 'high',
        energyKwhPerM3: 3.5,
        operationalComplexity: 'high',
        maintenanceDifficulty: 'high',
        capexRange: [15000, 30000],
        opexPerM3: 0.55,
        typicalContext: 'Desalinización de agua de mar o tratamiento de agua con alto TDS',
        description: 'Rechazo total de solutos a través de membrana semipermeable de alta presión. Obligatoria para desalinización. Produce agua ultra-pura pero requiere alto consumo energético y genera rechazo (salmuera).',
        treatmentTrain: ['Captación', 'Pre-tratamiento', 'Bomba HP', 'Módulos RO', 'Post-tratamiento', 'Almacenamiento'],
        requiresEnergy: true,
        requiresChemicals: true,
        requiresSpareParts: true,
        minSpaceRequired: 'medium',
    },
    package_plant: {
        id: 'package_plant',
        name: 'Planta Paquete (Package Plant)',
        shortName: 'Package Plant',
        color: '#eab308',
        icon: 'Package',
        removalEfficiency: {
            turbidity: 93,
            tds: 5,
            ironManganese: 65,
            nitrates: 10,
            microbiological: 2,
        },
        flowRange: [0.2, 15],
        areaFactor: 2.5,
        energyDemand: 'low',
        energyKwhPerM3: 0.15,
        operationalComplexity: 'low',
        maintenanceDifficulty: 'low',
        capexRange: [3000, 6000],
        opexPerM3: 0.08,
        typicalContext: 'Comunidades pequeñas, campamentos, emergencias, zonas de conflicto',
        description: 'Unidad prefabricada todo-en-uno con filtración multimedia, desinfección UV o cloración integrada. Instalación rápida, operación simplificada, ideal para respuesta rápida.',
        treatmentTrain: ['Captación', 'Filtración Multimedia', 'Desinfección UV/Cl₂', 'Almacenamiento'],
        requiresEnergy: true,
        requiresChemicals: false,
        requiresSpareParts: true,
        minSpaceRequired: 'low',
    },

    iron_removal: {
        id: 'iron_removal',
        name: 'Remoción de Hierro y Manganeso',
        shortName: 'Fe/Mn Removal',
        color: '#d97706',
        icon: 'Wind',
        removalEfficiency: {
            turbidity: 85,
            tds: 10,
            ironManganese: 95,
            nitrates: 10,
            microbiological: 2,
        },
        flowRange: [0.5, 50],
        areaFactor: 8,
        energyDemand: 'low',
        energyKwhPerM3: 0.10,
        operationalComplexity: 'medium',
        maintenanceDifficulty: 'low',
        capexRange: [3000, 6000],
        opexPerM3: 0.06,
        typicalContext: 'Agua subterránea con hierro, manganeso y dureza elevada',
        description: 'Tren de oxidación-filtración para agua subterránea: Aireación (cascada/bandeja) → Sedimentación → Filtración Rápida Descendente → Desinfección. Oxida Fe²⁺/Mn²⁺ y los retiene en el lecho filtrante.',
        treatmentTrain: ['Captación (Pozo)', 'Aireación (Cascada)', 'Sedimentación', 'Filtración Rápida', 'Desinfección', 'Almacenamiento'],
        requiresEnergy: true,
        requiresChemicals: false,
        requiresSpareParts: false,
        minSpaceRequired: 'medium',
    },
};

// ═══════════════════════════════════════════════
// HARD VIABILITY FILTERS
// ═══════════════════════════════════════════════

function evaluateHardFilters(
    tech: TechnologyProfile,
    inputs: SelectorInputs
): ViabilityFilter[] {
    const filters: ViabilityFilter[] = [];
    const src = inputs.source;
    const pop = inputs.design.population;

    // 1. Energy filter
    filters.push({
        name: 'Disponibilidad Energética',
        passed: !tech.requiresEnergy || inputs.context.energyAvailability !== 'none',
        reason: tech.requiresEnergy && inputs.context.energyAvailability === 'none'
            ? `${tech.shortName} requiere energía eléctrica, pero el sitio no tiene acceso`
            : 'Requisito energético compatible',
    });

    // 2. Operator skill filter
    const complexityRequiresSkill = tech.operationalComplexity === 'high' && inputs.context.operatorSkill === 'none';
    filters.push({
        name: 'Capacidad Operativa',
        passed: !complexityRequiresSkill,
        reason: complexityRequiresSkill
            ? `${tech.shortName} requiere operador técnico, pero no hay personal capacitado disponible`
            : 'Capacidad operativa compatible',
    });

    // 3. Spare parts filter
    const noSpareParts = tech.requiresSpareParts && inputs.environment.sparePartsAccess === 'low';
    filters.push({
        name: 'Acceso a Repuestos',
        passed: !noSpareParts,
        reason: noSpareParts
            ? `${tech.shortName} requiere repuestos especializados no disponibles localmente`
            : 'Acceso a repuestos compatible',
    });

    // 4. Space filter
    const spaceInsufficient = tech.minSpaceRequired === 'high' && inputs.context.settlementType === 'urban';
    filters.push({
        name: 'Espacio Disponible',
        passed: !spaceInsufficient,
        reason: spaceInsufficient
            ? `${tech.shortName} requiere gran superficie, incompatible con contexto urbano denso`
            : 'Espacio disponible compatible',
    });

    // 5. Source-type compatibility filter (CINARA diagram)
    if (src.sourceType === 'seawater') {
        // Seawater: ONLY reverse_osmosis is viable
        const isRO = tech.id === 'reverse_osmosis';
        filters.push({
            name: 'Compatibilidad con Agua de Mar',
            passed: isRO,
            reason: isRO
                ? 'Ósmosis Inversa es la única tecnología viable para desalinización'
                : `${tech.shortName} no puede remover sales disueltas del agua de mar`,
        });
    } else if (src.sourceType === 'groundwater') {
        // Groundwater: FiME is not viable (cannot treat minerals/hardness)
        if (tech.id === 'slow_sand') {
            filters.push({
                name: 'Compatibilidad con Agua Subterránea',
                passed: false,
                reason: 'FiME está diseñada para agua superficial. El agua subterránea requiere oxidación (aireación) y filtración rápida para remover hierro, manganeso y dureza',
            });
        }
        // iron_removal is designed for groundwater — no filter needed
        // Others (conventional, compact, etc.) can work with groundwater too
    } else if (src.sourceType === 'surface' || src.sourceType === 'rainwater') {
        // Surface/Rain: iron_removal is not designed for these sources
        if (tech.id === 'iron_removal') {
            filters.push({
                name: 'Compatibilidad con Fuente',
                passed: false,
                reason: 'Remoción de Fe/Mn está diseñada para agua subterránea, no para agua superficial o lluvia',
            });
        }
    }

    // 6. Population-based filter for FiME (space/retention time limits)
    if (tech.id === 'slow_sand' && pop > 25000) {
        filters.push({
            name: 'Escala Poblacional',
            passed: false,
            reason: `FiME requiere ${tech.areaFactor} m²/L/s, inviable para poblaciones >25,000 hab. Se requiere planta convencional de filtración rápida`,
        });
    }

    return filters;
}

// ═══════════════════════════════════════════════
// DIMENSION SCORING (0–100 per dimension)
// ═══════════════════════════════════════════════

function clamp(val: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * S — Socio-cultural dimension (20%)
 * Evaluates community fit, operator alignment, and local resource availability.
 */
function scoreSociocultural(tech: TechnologyProfile, inputs: SelectorInputs): number {
    let score = 60; // base

    // Community acceptance alignment
    const acceptance = inputs.environment.communityAcceptance;
    if (acceptance === 'high') score += 10;
    else if (acceptance === 'low') {
        // Complex/industrial-looking tech gets penalized in low-acceptance contexts
        if (tech.operationalComplexity === 'high') score -= 25;
        else if (tech.operationalComplexity === 'low') score += 15;
    }

    // Operator skill alignment
    const skill = inputs.context.operatorSkill;
    const complexity = tech.operationalComplexity;
    if (skill === 'technical') score += 10;
    else if (skill === 'basic') {
        if (complexity === 'high') score -= 20;
        else if (complexity === 'low') score += 15;
    } else { // none
        if (complexity === 'low') score += 20;
        else if (complexity === 'medium') score -= 15;
        else score -= 35;
    }

    // Local materials
    const materials = inputs.environment.localMaterialAvailability;
    if (materials === 'high') {
        if (!tech.requiresSpareParts && !tech.requiresChemicals) score += 15;
    } else if (materials === 'low') {
        if (tech.requiresSpareParts) score -= 15;
        if (tech.requiresChemicals) score -= 10;
    }

    // Settlement context bonus
    if (inputs.context.settlementType === 'rural' && complexity === 'low') score += 10;
    if (inputs.context.settlementType === 'urban' && complexity === 'high') score += 5;

    // Population limit for low-complexity (operator burden)
    if (inputs.design.population > 10000 && tech.id === 'slow_sand') {
        score -= 15; // Unmanageable manual labor for sand washing at this scale
    }

    return clamp(score);
}

/**
 * E — Economic dimension (30%)
 * Evaluates CAPEX and OPEX alignment with budget constraints.
 */
function scoreEconomic(tech: TechnologyProfile, inputs: SelectorInputs): number {
    let score = 60; // base

    const budget = inputs.context.budgetRange;
    const avgCapex = (tech.capexRange[0] + tech.capexRange[1]) / 2;
    const opex = tech.opexPerM3;

    // CAPEX scoring relative to budget
    if (budget === 'very_low') {
        if (avgCapex <= 3500) score += 30;
        else if (avgCapex <= 7000) score += 5;
        else if (avgCapex <= 15000) score -= 20;
        else score -= 40;
    } else if (budget === 'low') {
        if (avgCapex <= 5000) score += 25;
        else if (avgCapex <= 10000) score += 5;
        else if (avgCapex <= 20000) score -= 15;
        else score -= 30;
    } else if (budget === 'medium') {
        if (avgCapex <= 10000) score += 15;
        else if (avgCapex <= 20000) score += 5;
        else score -= 15;
    } else { // high
        score += 10; // All techs are feasible with high budget
    }

    // OPEX scoring
    if (opex <= 0.05) score += 15;
    else if (opex <= 0.15) score += 5;
    else if (opex <= 0.30) score -= 5;
    else score -= 15;

    // Flow-based CAPEX adjustment
    const flow = inputs.design.flowRate;
    if (flow < tech.flowRange[0]) score -= 15;
    else if (flow > tech.flowRange[1]) score -= 20;

    // Population-based economic adjustment
    // FiME scales poorly for large populations (25 m²/L/s = huge land cost)
    const pop = inputs.design.population;
    if (pop > 10000) {
        if (tech.id === 'slow_sand') score -= 20; // Land acquisition costs explode
        if (tech.id === 'rapid_sand' || tech.id === 'compact_clarification') score += 10; // Economies of scale
    }

    // Source-type economic adjustment
    // iron_removal is purpose-built for GW (optimized OPEX), package_plant is generic
    if (inputs.source.sourceType === 'groundwater') {
        if (tech.id === 'iron_removal') score += 10; // Lower lifecycle cost for Fe/Mn-specific design
        if (tech.id === 'package_plant') score -= 5;  // Not optimized for mineral water
    }

    return clamp(score);
}

/**
 * A — Environmental dimension (20%)
 * Evaluates energy footprint, sludge/waste, and environmental impact.
 */
function scoreEnvironmental(tech: TechnologyProfile, inputs: SelectorInputs): number {
    let score = 65; // base

    // Energy demand
    if (tech.energyDemand === 'none') score += 25;
    else if (tech.energyDemand === 'low') score += 10;
    else if (tech.energyDemand === 'medium') score -= 5;
    else score -= 20; // high

    // Chemical dependency
    if (!tech.requiresChemicals) score += 15;
    else score -= 10;

    // Sludge/brine disposal
    if (tech.id === 'reverse_osmosis') {
        if (!inputs.environment.sludgeDisposalPossibility) score -= 25;
        else score -= 10;
    }

    // Energy availability vs demand (penalize mismatch)
    if (inputs.context.energyAvailability === 'intermittent' && tech.energyDemand === 'high') {
        score -= 15;
    }

    // Space efficiency (urban benefit for compact)
    if (tech.areaFactor <= 5 && inputs.context.settlementType === 'urban') score += 10;

    // Massive land footprint penalty for FiME at large scale
    if (inputs.design.population > 10000 && tech.id === 'slow_sand') {
        score -= 15; // Environmental impact of extensive land use
    }

    return clamp(score);
}

/**
 * T — Technological dimension (30%)
 * Evaluates treatment capability vs. water quality requirements.
 */
function scoreTechnological(tech: TechnologyProfile, inputs: SelectorInputs): number {
    let score = 55; // base

    const src = inputs.source;
    const pop = inputs.design.population;

    // ── Turbidity handling ──
    if (src.turbidity <= 20) {
        score += 15; // Most techs handle low turbidity
    } else if (src.turbidity <= 70) {
        if (tech.removalEfficiency.turbidity >= 95) score += 15;
        else if (tech.removalEfficiency.turbidity >= 90) score += 5;
        else score -= 10;
    } else if (src.turbidity <= 200) {
        if (tech.removalEfficiency.turbidity >= 97) score += 10;
        else score -= 20;
        if (tech.id === 'slow_sand') score -= 30;
    } else {
        if (tech.removalEfficiency.turbidity >= 99) score += 5;
        else score -= 30;
        if (tech.id === 'slow_sand') score -= 40;
    }

    // ── TDS handling ──
    if (src.tds > 1000) {
        if (tech.removalEfficiency.tds >= 90) score += 20;
        else score -= 25;
    } else if (src.tds > 500) {
        if (tech.removalEfficiency.tds >= 50) score += 10;
        else score -= 10;
    }

    // ── Iron/Manganese ──
    if (src.ironManganese > 0.5) {
        if (tech.removalEfficiency.ironManganese >= 90) score += 15;
        else if (tech.removalEfficiency.ironManganese >= 80) score += 5;
        else if (tech.removalEfficiency.ironManganese < 50) score -= 15;
    }

    // ── Nitrates ──
    if (src.nitrates > 45) {
        if (tech.removalEfficiency.nitrates >= 80) score += 15;
        else score -= 20;
    }

    // ── Microbiological ──
    if (src.microbiologicalContamination) {
        if (tech.removalEfficiency.microbiological >= 4) score += 15;
        else if (tech.removalEfficiency.microbiological >= 3) score += 5;
        else score -= 15;
    }

    // ── Source type compatibility (CINARA routing) ──
    if (src.sourceType === 'seawater') {
        if (tech.id === 'reverse_osmosis') score += 25;
        else score -= 40;
    } else if (src.sourceType === 'groundwater') {
        // iron_removal is the ideal technology for groundwater
        if (tech.id === 'iron_removal') score += 25;
        // Conventional/compact can handle GW with chemicals
        else if (tech.id === 'rapid_sand') score += 10;
        else if (tech.id === 'compact_clarification') score += 5;
        // FiME cannot treat minerals/hardness (hard filter blocks it, but score too)
        else if (tech.id === 'slow_sand') score -= 40;
    } else if (src.sourceType === 'surface') {
        // FiME is ideal for surface water with low turbidity
        if (tech.id === 'slow_sand' && src.turbidity <= 70) score += 15;
        // iron_removal is not for surface water (hard filter blocks it, but score too)
        if (tech.id === 'iron_removal') score -= 30;
    } else if (src.sourceType === 'rainwater') {
        if (tech.id === 'rapid_sand') score -= 15; // Overkill
        if (tech.id === 'reverse_osmosis') score -= 20;
        if (tech.id === 'iron_removal') score -= 30;
    }

    // ── Population-based adjustments ──
    if (pop > 10000) {
        // Large populations: FiME is impractical (too much space, long retention)
        if (tech.id === 'slow_sand') score -= 30;
        // Conventional and compact are better suited for scale
        if (tech.id === 'rapid_sand') score += 15;
        if (tech.id === 'compact_clarification') score += 10;
    } else if (pop <= 5000) {
        // Small communities: FiME and package plants excel
        if (tech.id === 'slow_sand') score += 10;
        if (tech.id === 'package_plant') score += 10;
    }

    // ── Seasonal variability resilience ──
    if (src.seasonalVariability === 'high') {
        if (tech.operationalComplexity === 'low') score += 5;
        else if (tech.id === 'ultrafiltration') score -= 10;
    }

    // ── Quality Target Alignment (WHO vs National) ──
    const target = inputs.design.qualityTarget;
    if (target === 'who') {
        // WHO has strict microbiological targets (requires multi-barrier or absolute barrier)
        if (tech.removalEfficiency.microbiological >= 4) score += 10;
        else if (tech.removalEfficiency.microbiological <= 2) score -= 15;
    } else if (target === 'national') {
        // Standard national regulations (e.g., Res 0330)
        if (tech.removalEfficiency.microbiological >= 3) score += 5;
    }

    // ── Flow range fit ──
    const flow = inputs.design.flowRate;
    if (flow >= tech.flowRange[0] && flow <= tech.flowRange[1]) score += 10;
    else score -= 15;

    return clamp(score);
}

// ═══════════════════════════════════════════════
// JUSTIFICATION GENERATOR
// ═══════════════════════════════════════════════

function generateJustification(
    tech: TechnologyProfile,
    dimensions: DimensionScores,
    inputs: SelectorInputs,
    isTop: boolean
): ScoredTechnology['justification'] {
    const selectionReason = isTop
        ? `${tech.name} obtiene el mejor puntaje IGST global gracias a su equilibrio entre las 4 dimensiones evaluadas. Su perfil de remoción es compatible con la calidad del agua cruda (${inputs.source.turbidity} NTU, TDS ${inputs.source.tds} mg/L) y el contexto operativo del proyecto (${inputs.context.settlementType}).`
        : `${tech.name} presenta un perfil parcialmente compatible con las condiciones del proyecto.`;

    const limitingFactors: string[] = [];
    if (dimensions.sociocultural < 50) limitingFactors.push('Baja aceptabilidad socio-cultural en el contexto del proyecto');
    if (dimensions.economic < 50) limitingFactors.push('Costos (CAPEX/OPEX) fuera del rango presupuestal');
    if (dimensions.environmental < 50) limitingFactors.push('Impacto ambiental significativo (energía, residuos o químicos)');
    if (dimensions.technological < 50) limitingFactors.push('Capacidad de remoción insuficiente para la calidad del agua cruda');
    if (inputs.design.flowRate < tech.flowRange[0]) limitingFactors.push(`Caudal de diseño (${inputs.design.flowRate} L/s) por debajo del mínimo de la tecnología (${tech.flowRange[0]} L/s)`);
    if (inputs.design.flowRate > tech.flowRange[1]) limitingFactors.push(`Caudal de diseño (${inputs.design.flowRate} L/s) excede el máximo de la tecnología (${tech.flowRange[1]} L/s)`);

    const risks: string[] = [];
    if (tech.requiresEnergy && inputs.context.energyAvailability === 'intermittent') risks.push('Riesgo de parada por intermitencia energética');
    if (tech.requiresChemicals) risks.push('Dependencia de cadena de suministro de productos químicos');
    if (tech.requiresSpareParts) risks.push('Necesidad de acceso a repuestos especializados');
    if (inputs.source.seasonalVariability === 'high') risks.push('Variabilidad estacional puede afectar el rendimiento');
    if (tech.id === 'reverse_osmosis') risks.push('Generación de salmuera/rechazo requiere disposición adecuada');

    const operationalRecommendations: string[] = [];
    if (tech.operationalComplexity === 'high') operationalRecommendations.push('Capacitar operador(es) antes de la puesta en marcha');
    if (tech.requiresChemicals) operationalRecommendations.push('Establecer acuerdos de suministro de productos químicos');
    if (inputs.source.turbidity > 50) operationalRecommendations.push('Considerar pretratamiento (desarenador o pre-sedimentación)');
    operationalRecommendations.push('Implementar programa de monitoreo de calidad del agua');
    if (tech.maintenanceDifficulty === 'high') operationalRecommendations.push('Establecer contrato de mantenimiento preventivo');

    return { selectionReason, limitingFactors, risks, operationalRecommendations };
}

// ═══════════════════════════════════════════════
// TREATMENT TRAIN GENERATOR
// ═══════════════════════════════════════════════

function generateTreatmentTrain(tech: TechnologyProfile): TreatmentTrainStep[] {
    const typeMap: Record<string, TreatmentTrainStep['type']> = {
        'Captación': 'source',
        'Captación (Pozo)': 'source',
        'Pre-filtro': 'pretreatment',
        'Pre-tratamiento': 'pretreatment',
        'FGDi': 'pretreatment',
        'FGAC': 'filtration',
        'FLA': 'filtration',
        'Aireación (Cascada)': 'pretreatment',
        'Coag-Floc Integrado': 'clarification',
        'Coagulación': 'clarification',
        'Floculación': 'clarification',
        'Sedimentación': 'clarification',
        'Sed. Lamelar': 'clarification',
        'Filtración': 'filtration',
        'Filtración Rápida': 'filtration',
        'Filtración Multimedia': 'filtration',
        'UF (Fibra Hueca)': 'filtration',
        'Bomba HP': 'pretreatment',
        'Módulos RO': 'filtration',
        'Post-tratamiento': 'disinfection',
        'Desinfección': 'disinfection',
        'Desinfección UV/Cl₂': 'disinfection',
        'Almacenamiento': 'storage',
    };

    const colorMap: Record<TreatmentTrainStep['type'], string> = {
        source: '#06b6d4',
        pretreatment: '#f59e0b',
        clarification: '#8b5cf6',
        filtration: '#3b82f6',
        disinfection: '#ef4444',
        storage: '#10b981',
    };

    return tech.treatmentTrain.map(label => {
        const type = typeMap[label] || 'pretreatment';
        return { label, type, color: colorMap[type] };
    });
}

// ═══════════════════════════════════════════════
// DYNAMIC WEIGHT CALCULATION
// ═══════════════════════════════════════════════

/**
 * Calculates dynamic dimension weights based on project context.
 * Base weights: S=0.20, E=0.30, A=0.20, T=0.30
 */
function calculateDynamicWeights(inputs: SelectorInputs): IgstWeights {
    let s = 0.20;
    let e = 0.30;
    let a = 0.20;
    let t = 0.30;

    // 1. Source Type Adjustments
    if (inputs.source.sourceType === 'seawater') {
        t += 0.15;
        a += 0.05;
        s -= 0.10;
        e -= 0.10;
    } else if (inputs.source.sourceType === 'groundwater' || inputs.source.ironManganese > 0.5) {
        t += 0.05;
        s -= 0.05;
    }

    // 2. Budget / Capital Source Adjustments
    if (inputs.context.budgetRange === 'high') {
        t += 0.10;
        e -= 0.10;
    } else if (inputs.context.budgetRange === 'low' || inputs.context.budgetRange === 'very_low') {
        e += 0.10;
        t -= 0.10;
        if (inputs.context.budgetRange === 'very_low') {
            s += 0.05;
            e += 0.05;
            t -= 0.05;
            a -= 0.05;
        }
    }

    // 3. Population-based adjustments
    // Large populations: technological fit and economics matter more
    if (inputs.design.population > 10000) {
        t += 0.05;
        a -= 0.05;
    }

    // Ensure weights don't drop below 0.05 and normalize to exactly 1.0
    s = Math.max(0.05, s);
    e = Math.max(0.05, e);
    a = Math.max(0.05, a);
    t = Math.max(0.05, t);

    const total = s + e + a + t;
    return {
        sociocultural: Math.round((s / total) * 100) / 100,
        economic: Math.round((e / total) * 100) / 100,
        environmental: Math.round((a / total) * 100) / 100,
        technological: Math.round((t / total) * 100) / 100,
    };
}

// ═══════════════════════════════════════════════
// MAIN SELECTOR FUNCTION
// ═══════════════════════════════════════════════

/**
 * Runs the complete technology selection algorithm.
 * 1. Evaluates hard viability filters
 * 2. Computes IGST scores for each viable technology
 * 3. Ranks and generates justifications
 *
 * @returns Complete selector result with ranked technologies and treatment train
 */
export function runSelector(inputs: SelectorInputs): SelectorResult {
    const techIds = Object.keys(TECHNOLOGIES) as TechnologyId[];

    const weights = calculateDynamicWeights(inputs);

    const scored: ScoredTechnology[] = techIds.map(id => {
        const tech = TECHNOLOGIES[id];

        // 1. Hard viability filters
        const filters = evaluateHardFilters(tech, inputs);
        const viable = filters.every(f => f.passed);

        // 2. Dimension scoring (even for non-viable, for comparison)
        const dimensions: DimensionScores = {
            sociocultural: scoreSociocultural(tech, inputs),
            economic: scoreEconomic(tech, inputs),
            environmental: scoreEnvironmental(tech, inputs),
            technological: scoreTechnological(tech, inputs),
        };

        // 3. IGST global score using dynamic weights
        const igst = viable
            ? clamp(
                weights.sociocultural * dimensions.sociocultural +
                weights.economic * dimensions.economic +
                weights.environmental * dimensions.environmental +
                weights.technological * dimensions.technological
            )
            : 0;

        return {
            profile: tech,
            igst,
            dimensions,
            viable,
            filters,
            recommended: false,
            justification: { selectionReason: '', limitingFactors: [], risks: [], operationalRecommendations: [] },
        };
    });

    // Sort by IGST descending (viable first)
    scored.sort((a, b) => {
        if (a.viable !== b.viable) return a.viable ? -1 : 1;
        return b.igst - a.igst;
    });

    // Mark top viable as recommended
    const topViable = scored.find(s => s.viable);
    if (topViable) topViable.recommended = true;

    // Generate justifications
    scored.forEach(s => {
        s.justification = generateJustification(s.profile, s.dimensions, inputs, s.recommended);
    });

    // Treatment train for recommended technology
    const treatmentTrain = topViable
        ? generateTreatmentTrain(topViable.profile)
        : [];

    return {
        technologies: scored,
        recommendedTechId: topViable?.profile.id || null,
        treatmentTrain,
        weights,
        timestamp: new Date().toISOString(),
    };
}
