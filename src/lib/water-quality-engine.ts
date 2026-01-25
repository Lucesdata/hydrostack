import {
    WaterQualityState,
    IRCAResult,
    QualityEvolutionStep,
    ModuleKey
} from '@/types/project';

/**
 * 🧪 MOTOR DE CALIDAD DE AGUA (WATER QUALITY ENGINE)
 * 
 * Responsable de la trazabilidad sanitaria, remoción acumulada
 * y blindaje del proyecto.
 */
export class WaterQualityEngine {

    // Pesos IRCA (Res. 2115/2007)
    private static readonly IRCA_WEIGHTS = {
        fecal_coliforms: 25,
        total_coliforms: 15,
        turbidity: 15,
        color: 6,
        ph: 1.5,
        iron: 1.5,
        alkalinity: 1,
        hardness: 1,
        chlorides: 1, // Suponiendo extensiones futuras
        sulfates: 1,
        nitrates: 1
    };

    // Límites Legales (Colombia)
    private static readonly LEGAL_LIMITS = {
        ph: { min: 6.5, max: 9.0 },
        turbidity: 2.0,
        color: 15,
        total_coliforms: 0,
        fecal_coliforms: 0,
        iron: 0.3,
        alkalinity: 200,
        hardness: 300
    };

    /**
     * Calcula el IRCA dinámico basado en un estado de calidad.
     */
    static calculateIRCA(state: WaterQualityState): IRCAResult {
        let score = 0;
        let totalPossible = 0;

        // Evaluación de parámetros
        const check = (val: number, limit: number | { min: number; max: number }, weight: number) => {
            totalPossible += weight;
            if (typeof limit === 'object') {
                if (val < limit.min || val > limit.max) score += weight;
            } else {
                if (val > limit) score += weight;
            }
        };

        check(state.ph, this.LEGAL_LIMITS.ph, this.IRCA_WEIGHTS.ph);
        check(state.turbidity, this.LEGAL_LIMITS.turbidity, this.IRCA_WEIGHTS.turbidity);
        check(state.color, this.LEGAL_LIMITS.color, this.IRCA_WEIGHTS.color);
        check(state.total_coliforms, this.LEGAL_LIMITS.total_coliforms, this.IRCA_WEIGHTS.total_coliforms);
        check(state.fecal_coliforms, this.LEGAL_LIMITS.fecal_coliforms, this.IRCA_WEIGHTS.fecal_coliforms);
        check(state.iron, this.LEGAL_LIMITS.iron, this.IRCA_WEIGHTS.iron);
        check(state.alkalinity, this.LEGAL_LIMITS.alkalinity, this.IRCA_WEIGHTS.alkalinity);
        check(state.hardness, this.LEGAL_LIMITS.hardness, this.IRCA_WEIGHTS.hardness);

        const finalScore = totalPossible > 0 ? (score / totalPossible) * 100 : 0;

        return this.classifyIRCA(finalScore);
    }

    private static classifyIRCA(score: number): IRCAResult {
        if (score <= 5) return { score, risk_level: 'SIN RIESGO', color: '#10B981', label: 'Agua Apta', sanitary_status: 'Apto' };
        if (score <= 14) return { score, risk_level: 'RIESGO BAJO', color: '#3B82F6', label: 'Riesgo Bajo', sanitary_status: 'Condicionado' };
        if (score <= 35) return { score, risk_level: 'RIESGO MEDIO', color: '#F59E0B', label: 'Riesgo Medio', sanitary_status: 'Condicionado' };
        if (score <= 80) return { score, risk_level: 'RIESGO ALTO', color: '#EF4444', label: 'Riesgo Alto', sanitary_status: 'No Apto' };
        return { score, risk_level: 'INVIABLE', color: '#7F1D1D', label: 'Inviable', sanitary_status: 'No Apto' };
    }

    /**
     * Clasifica la complejidad del agua cruda para guiar la selección tecnológica.
     */
    static classifyComplexity(state: WaterQualityState): 'baja' | 'media' | 'alta' {
        if (state.turbidity > 100 || state.fecal_coliforms > 20000 || state.color > 50) return 'alta';
        if (state.turbidity > 20 || state.fecal_coliforms > 1000 || state.color > 20) return 'media';
        return 'baja';
    }

    /**
     * Define los modelos de remoción por componente.
     */
    static getRemovalModel(moduleKey: ModuleKey): Partial<Record<keyof WaterQualityState, number>> {
        switch (moduleKey) {
            case 'desarenador':
                return { turbidity: 10 }; // Remoción física simple
            case 'fime_pretratamiento':
                return { turbidity: 30, color: 10 };
            case 'fime_grueso_dinamico':
                return { turbidity: 50, fecal_coliforms: 30 };
            case 'fime_grueso_asdesc':
                return { turbidity: 40, fecal_coliforms: 40 };
            case 'fime_lento_arena':
                return { turbidity: 95, color: 60, fecal_coliforms: 99.9 }; // 3 log
            case 'compact_sedimentation':
                return { turbidity: 80, fecal_coliforms: 50 };
            case 'compact_filtration':
                return { turbidity: 90, color: 40, fecal_coliforms: 80 };
            case 'compact_disinfection':
                return { fecal_coliforms: 99.99, total_coliforms: 99.99 }; // Blindaje final
            default:
                return {};
        }
    }

    /**
     * Aplica la remoción a un estado de calidad.
     */
    static applyRemoval(
        input: WaterQualityState,
        removals: Partial<Record<keyof WaterQualityState, number>>
    ): WaterQualityState {
        const output = { ...input };

        Object.keys(removals).forEach(key => {
            const k = key as keyof WaterQualityState;
            const efficiency = (removals[k] || 0) / 100;

            if (k === 'ph') return; // El pH no se remueve, cambia por química (TODO)

            // Microbiología se trata mejor como escala logarítmica si es > 90%
            if (efficiency >= 0.9 && (k === 'fecal_coliforms' || k === 'total_coliforms')) {
                output[k] = input[k] * (1 - efficiency);
            } else {
                output[k] = input[k] * (1 - efficiency);
            }

            // Redondear para evitar ruidos de coma flotante
            output[k] = Math.max(0, parseFloat(output[k].toFixed(4)));
        });

        return output;
    }

    /**
     * Genera la trayectoria completa de calidad basada en los módulos habilitados.
     */
    static calculateEvolution(
        rawQuality: WaterQualityState,
        activeModules: ModuleKey[]
    ): QualityEvolutionStep[] {
        let currentState = { ...rawQuality };
        const evolution: QualityEvolutionStep[] = [];

        // Aseguramos un orden lógico de tratamiento (simplificado por ahora)
        const logicalOrder: ModuleKey[] = [
            'desarenador',
            'fime_pretratamiento',
            'fime_grueso_dinamico',
            'fime_grueso_asdesc',
            'fime_lento_arena',
            'compact_mixing',
            'compact_flocculation',
            'compact_sedimentation',
            'compact_filtration',
            'compact_disinfection'
        ];

        const treatmentSteps = logicalOrder.filter(m => activeModules.includes(m));

        treatmentSteps.forEach(m => {
            const removals = this.getRemovalModel(m);
            const inputState = { ...currentState };
            const outputState = this.applyRemoval(inputState, removals);

            evolution.push({
                module_key: m,
                label: this.getModuleLabel(m),
                input_quality: inputState,
                output_quality: outputState,
                removal_percentages: removals,
                irca_after: this.calculateIRCA(outputState),
                timestamp: new Date().toISOString()
            });

            currentState = outputState;
        });

        return evolution;
    }

    private static getModuleLabel(m: ModuleKey): string {
        const labels: Partial<Record<ModuleKey, string>> = {
            desarenador: 'Desarenador',
            fime_pretratamiento: 'Pretratamiento (FIME)',
            fime_grueso_dinamico: 'Filtro Grueso Dinámico',
            fime_grueso_asdesc: 'Filtro Grueso Ascendente/Descendente',
            fime_lento_arena: 'Filtro Lento en Arena',
            compact_sedimentation: 'Sedimentador Lamelar',
            compact_filtration: 'Filtración Rápida',
            compact_disinfection: 'Desinfección (Cloración)'
        };
        return labels[m] || m;
    }
}
