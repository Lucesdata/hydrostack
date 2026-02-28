/**
 * Expert Technology Selector — Type Definitions
 * HydroStack v2.0
 *
 * Complete type system for the multicriteria decision engine,
 * smart form inputs, and visual dashboard outputs.
 */

// ═══════════════════════════════════════════════
// INPUT TYPES (Smart Form)
// ═══════════════════════════════════════════════

export type WaterSourceType = 'surface' | 'groundwater' | 'rainwater' | 'seawater';

export type SeasonalVariability = 'low' | 'medium' | 'high';

export type QualityTarget = 'who' | 'national' | 'custom';

export type SettlementType = 'rural' | 'semi_rural' | 'urban';

export type EnergyAvailability = 'none' | 'intermittent' | 'stable';

export type OperatorSkill = 'none' | 'basic' | 'technical';

export type BudgetRange = 'very_low' | 'low' | 'medium' | 'high';

export type LevelOption = 'low' | 'medium' | 'high';

/**
 * Step 1: Water Source Characterization
 */
export interface SourceInputs {
    sourceType: WaterSourceType;
    turbidity: number;           // NTU
    tds: number;                 // mg/L
    ironManganese: number;       // mg/L
    nitrates: number;            // mg/L
    microbiologicalContamination: boolean;
    seasonalVariability: SeasonalVariability;
}

/**
 * Step 2: Design Parameters
 */
export interface DesignInputs {
    flowRate: number;            // L/s
    population: number;
    peakFactor: number;          // 1.0–3.0
    qualityTarget: QualityTarget;
}

/**
 * Step 3: Context & Constraints
 */
export interface ContextInputs {
    settlementType: SettlementType;
    energyAvailability: EnergyAvailability;
    operatorSkill: OperatorSkill;
    budgetRange: BudgetRange;
}

/**
 * Step 4: Environmental & Social Context
 */
export interface EnvironmentInputs {
    communityAcceptance: LevelOption;
    localMaterialAvailability: LevelOption;
    sparePartsAccess: LevelOption;
    sludgeDisposalPossibility: boolean;
}

/**
 * Complete selector inputs (all 4 steps combined)
 */
export interface SelectorInputs {
    source: SourceInputs;
    design: DesignInputs;
    context: ContextInputs;
    environment: EnvironmentInputs;
}

// ═══════════════════════════════════════════════
// TECHNOLOGY DATABASE TYPES
// ═══════════════════════════════════════════════

export type TechnologyId =
    | 'slow_sand'
    | 'rapid_sand'
    | 'compact_clarification'
    | 'ultrafiltration'
    | 'reverse_osmosis'
    | 'package_plant'
    | 'mbr_mbbr';

/**
 * Removal efficiency profile per technology
 */
export interface RemovalEfficiency {
    turbidity: number;       // % removal
    tds: number;             // % removal
    ironManganese: number;   // % removal
    nitrates: number;        // % removal
    microbiological: number; // log removal (e.g. 2 = 99%, 4 = 99.99%)
}

/**
 * Full technology profile
 */
export interface TechnologyProfile {
    id: TechnologyId;
    name: string;
    shortName: string;
    color: string;
    icon: string;               // Lucide icon name

    // Performance
    removalEfficiency: RemovalEfficiency;
    flowRange: [number, number]; // L/s [min, max]
    areaFactor: number;          // m²/L/s

    // Operational
    energyDemand: 'none' | 'low' | 'medium' | 'high';
    energyKwhPerM3: number;
    operationalComplexity: 'low' | 'medium' | 'high';
    maintenanceDifficulty: 'low' | 'medium' | 'high';

    // Economic
    capexRange: [number, number]; // USD per L/s [min, max]
    opexPerM3: number;            // USD/m³

    // Context
    typicalContext: string;
    description: string;

    // Treatment train steps
    treatmentTrain: string[];

    // Hard filter requirements
    requiresEnergy: boolean;
    requiresChemicals: boolean;
    requiresSpareParts: boolean;
    minSpaceRequired: 'low' | 'medium' | 'high';
}

// ═══════════════════════════════════════════════
// SCORING / OUTPUT TYPES
// ═══════════════════════════════════════════════

/**
 * The 4 IGST dimensions
 */
export interface DimensionScores {
    sociocultural: number;   // S (0–100)
    economic: number;        // E (0–100)
    environmental: number;   // A (0–100)
    technological: number;   // T (0–100)
}

/**
 * Viability filter result
 */
export interface ViabilityFilter {
    name: string;
    passed: boolean;
    reason: string;
}

/**
 * A scored technology with full result data
 */
export interface ScoredTechnology {
    profile: TechnologyProfile;
    igst: number;                        // Global IGST score (0–100)
    dimensions: DimensionScores;
    viable: boolean;                     // Passed all hard filters
    filters: ViabilityFilter[];
    recommended: boolean;                // Top recommendation
    justification: {
        selectionReason: string;
        limitingFactors: string[];
        risks: string[];
        operationalRecommendations: string[];
    };
}

/**
 * Treatment train step for the visual diagram
 */
export interface TreatmentTrainStep {
    label: string;
    type: 'source' | 'pretreatment' | 'clarification' | 'filtration' | 'disinfection' | 'storage';
    color: string;
}

/**
 * Dynamic Weights applied by the IGST Engine
 */
export interface IgstWeights {
    sociocultural: number;
    economic: number;
    environmental: number;
    technological: number;
}

/**
 * Complete selector result
 */
export interface SelectorResult {
    technologies: ScoredTechnology[];
    recommendedTechId: TechnologyId | null;
    treatmentTrain: TreatmentTrainStep[];
    weights: IgstWeights;
    timestamp: string;
}
