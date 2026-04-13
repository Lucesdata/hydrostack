import { describe, it, expect } from 'vitest';
import { runSelector } from '@/lib/tech-selector-engine';
import type { SelectorInputs } from '@/types/tech-selector';

const createBaseInputs = (): SelectorInputs => ({
    source: {
        sourceType: 'surface',
        turbidity: 10,
        tds: 150,
        ironManganese: 0.1,
        nitrates: 5,
        microbiologicalContamination: true,
        seasonalVariability: 'medium',
    },
    design: {
        flowRate: 10,
        population: 5000,
        peakFactor: 1.5,
        qualityTarget: 'national',
    },
    context: {
        settlementType: 'rural',
        energyAvailability: 'stable',
        operatorSkill: 'technical',
        budgetRange: 'medium',
    },
    environment: {
        communityAcceptance: 'high',
        localMaterialAvailability: 'medium',
        sparePartsAccess: 'medium',
        sludgeDisposalPossibility: true,
    }
});

describe('CINARA Source-Type Routing', () => {

    it('seawater: only reverse_osmosis is viable, all others blocked', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'seawater';
        inputs.source.tds = 35000;

        const result = runSelector(inputs);

        // RO must be the recommendation
        expect(result.recommendedTechId).toBe('reverse_osmosis');

        // All non-RO technologies must be non-viable
        const nonRO = result.technologies.filter(t => t.profile.id !== 'reverse_osmosis');
        nonRO.forEach(t => {
            expect(t.viable).toBe(false);
        });

        // RO itself must be viable
        const ro = result.technologies.find(t => t.profile.id === 'reverse_osmosis');
        expect(ro!.viable).toBe(true);
    });

    it('groundwater: FiME is non-viable, iron_removal is recommended', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'groundwater';
        inputs.source.turbidity = 5;
        inputs.source.tds = 500;
        inputs.source.ironManganese = 0.8;

        const result = runSelector(inputs);

        // FiME must be blocked (non-viable)
        const fime = result.technologies.find(t => t.profile.id === 'slow_sand');
        expect(fime!.viable).toBe(false);

        // iron_removal should be recommended
        expect(result.recommendedTechId).toBe('iron_removal');

        // iron_removal must be viable
        const ironRemoval = result.technologies.find(t => t.profile.id === 'iron_removal');
        expect(ironRemoval!.viable).toBe(true);
    });

    it('surface water: iron_removal is non-viable', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'surface';

        const result = runSelector(inputs);

        const ironRemoval = result.technologies.find(t => t.profile.id === 'iron_removal');
        expect(ironRemoval!.viable).toBe(false);
    });

    it('rainwater: iron_removal is non-viable', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'rainwater';
        inputs.source.turbidity = 2;
        inputs.source.tds = 20;

        const result = runSelector(inputs);

        const ironRemoval = result.technologies.find(t => t.profile.id === 'iron_removal');
        expect(ironRemoval!.viable).toBe(false);
    });
});

describe('Population-Based Routing', () => {

    it('large population (>10k) surface water: Convencional preferred over FiME', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'surface';
        inputs.source.turbidity = 30;
        inputs.design.population = 15000;
        inputs.design.flowRate = 30;

        const result = runSelector(inputs);

        const conv = result.technologies.find(t => t.profile.id === 'rapid_sand');
        const fime = result.technologies.find(t => t.profile.id === 'slow_sand');

        // Conventional should score higher than FiME for large populations
        expect(conv!.igst).toBeGreaterThan(fime!.igst);
    });

    it('very large population (>25k): FiME is non-viable', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'surface';
        inputs.design.population = 30000;
        inputs.design.flowRate = 60;

        const result = runSelector(inputs);

        const fime = result.technologies.find(t => t.profile.id === 'slow_sand');
        expect(fime!.viable).toBe(false);
    });

    it('small rural community: FiME is viable and scores well', () => {
        const inputs = createBaseInputs();
        inputs.source.sourceType = 'surface';
        inputs.source.turbidity = 15;
        inputs.design.population = 3000;
        inputs.design.flowRate = 5;
        inputs.context.settlementType = 'rural';
        inputs.context.budgetRange = 'low';
        inputs.context.operatorSkill = 'basic';
        inputs.context.energyAvailability = 'none';

        const result = runSelector(inputs);

        // FiME should be recommended for small rural surface water with no energy
        expect(result.recommendedTechId).toBe('slow_sand');
    });
});

describe('Quality Target Routing', () => {

    it('WHO target penalizes technologies with low microbiological removal', () => {
        const inputsNational = createBaseInputs();
        inputsNational.design.qualityTarget = 'national';

        const inputsWho = createBaseInputs();
        inputsWho.design.qualityTarget = 'who';

        const resultNational = runSelector(inputsNational);
        const resultWho = runSelector(inputsWho);

        const ppNational = resultNational.technologies.find(t => t.profile.id === 'package_plant');
        const ppWho = resultWho.technologies.find(t => t.profile.id === 'package_plant');

        // package_plant has 2-log micro removal. Under National no penalty/bonus, under WHO receives -15.
        expect(ppWho!.dimensions.technological).toBeLessThan(ppNational!.dimensions.technological);
    });
});
