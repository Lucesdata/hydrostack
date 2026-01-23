/**
 * IRCA Calculation Logic based on Resolución 2115 de 2007 (Colombia)
 * These are the assigned scores for parameters EXCEEDING the legal limit.
 */

export const IRCA_WEIGHTS = {
    fecal_coliforms: 25,
    total_coliforms: 15,
    turbidity: 15,
    color: 6,
    ph: 1.5,
    iron: 1.5,
    chlorides: 1,
    sulfates: 1,
    nitrates: 1,
    hardness: 1,
    alkalinity: 1,
    manganese: 1,
};

export const LEGAL_LIMITS = {
    ph: { min: 6.5, max: 9.0 },
    turbidity: 2.0, // UNT
    color: 15, // UPC
    total_coliforms: 0,
    fecal_coliforms: 0,
    iron: 0.3,
    chlorides: 250,
    sulfates: 250,
    nitrates: 10,
    hardness: 300,
    alkalinity: 200,
    manganese: 0.1,
};

export type IrcaParameters = {
    ph?: number;
    turbidity?: number;
    color?: number;
    iron?: number;
    chlorides?: number;
    sulfates?: number;
    nitrates?: number;
    hardness?: number;
    alkalinity?: number;
    manganese?: number;
    fecal_coliforms?: number;
    total_coliforms?: number;
};

export function calculateIRCA(params: IrcaParameters): number {
    let score = 0;
    let totalPossible = 0;

    // Check each parameter and add weight if it exceeds limit
    if (params.ph !== undefined) {
        totalPossible += IRCA_WEIGHTS.ph;
        if (params.ph < LEGAL_LIMITS.ph.min || params.ph > LEGAL_LIMITS.ph.max) {
            score += IRCA_WEIGHTS.ph;
        }
    }

    if (params.turbidity !== undefined) {
        totalPossible += IRCA_WEIGHTS.turbidity;
        if (params.turbidity > LEGAL_LIMITS.turbidity) {
            score += IRCA_WEIGHTS.turbidity;
        }
    }

    if (params.color !== undefined) {
        totalPossible += IRCA_WEIGHTS.color;
        if (params.color > LEGAL_LIMITS.color) {
            score += IRCA_WEIGHTS.color;
        }
    }

    if (params.iron !== undefined) {
        totalPossible += IRCA_WEIGHTS.iron;
        if (params.iron > LEGAL_LIMITS.iron) {
            score += IRCA_WEIGHTS.iron;
        }
    }

    if (params.chlorides !== undefined) {
        totalPossible += IRCA_WEIGHTS.chlorides;
        if (params.chlorides > LEGAL_LIMITS.chlorides) {
            score += IRCA_WEIGHTS.chlorides;
        }
    }

    if (params.sulfates !== undefined) {
        totalPossible += IRCA_WEIGHTS.sulfates;
        if (params.sulfates > LEGAL_LIMITS.sulfates) {
            score += IRCA_WEIGHTS.sulfates;
        }
    }

    if (params.nitrates !== undefined) {
        totalPossible += IRCA_WEIGHTS.nitrates;
        if (params.nitrates > LEGAL_LIMITS.nitrates) {
            score += IRCA_WEIGHTS.nitrates;
        }
    }

    if (params.hardness !== undefined) {
        totalPossible += IRCA_WEIGHTS.hardness;
        if (params.hardness > LEGAL_LIMITS.hardness) {
            score += IRCA_WEIGHTS.hardness;
        }
    }

    if (params.alkalinity !== undefined) {
        totalPossible += IRCA_WEIGHTS.alkalinity;
        if (params.alkalinity > LEGAL_LIMITS.alkalinity) {
            score += IRCA_WEIGHTS.alkalinity;
        }
    }

    if (params.manganese !== undefined) {
        totalPossible += IRCA_WEIGHTS.manganese;
        if (params.manganese > LEGAL_LIMITS.manganese) {
            score += IRCA_WEIGHTS.manganese;
        }
    }

    if (params.fecal_coliforms !== undefined) {
        totalPossible += IRCA_WEIGHTS.fecal_coliforms;
        if (params.fecal_coliforms > LEGAL_LIMITS.fecal_coliforms) {
            score += IRCA_WEIGHTS.fecal_coliforms;
        }
    }

    // Normalize to 0-100 scale based on parameters provided
    // Note: Standard IRCA assumes 100 points total, but here we adjust proportionally 
    // if only some parameters are available, or more accurately, 
    // we check if totalPossible is 100.

    return totalPossible > 0 ? (score / totalPossible) * 100 : 0;
}

export function getIrcaClassification(score: number) {
    if (score <= 5) return { level: 'SIN RIESGO', color: '#10B981', action: 'Agua apta para consumo humano.' };
    if (score <= 14) return { level: 'RIESGO BAJO', color: '#3B82F6', action: 'Persona prestadora y autoridad sanitaria deben revisar.' };
    if (score <= 35) return { level: 'RIESGO MEDIO', color: '#F59E0B', action: 'Mejoramiento de procesos de tratamiento.' };
    if (score <= 80) return { level: 'RIESGO ALTO', color: '#EF4444', action: 'Suspender consumo humano o tratamiento intensivo.' };
    return { level: 'INVIABLE SANITARIAMENTE', color: '#7F1D1D', action: 'Intervención inmediata de autoridades.' };
}
