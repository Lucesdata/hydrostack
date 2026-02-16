import { describe, it, expect } from 'vitest';
import {
    getGranulometry,
    getTotalStructureHeight,
    PFD_GRANULOMETRY,
    FGAC_GRANULOMETRY,
    FLA_GRANULOMETRY
} from '@/lib/fime-granulometry';

describe('fime-granulometry', () => {
    it('returns correct granulometry for PFD', () => {
        const result = getGranulometry('pfd');
        expect(result).not.toBeNull();
        expect(result?.moduleKey).toBe('fime_grueso_dinamico');
        expect(result?.layers).toHaveLength(3);
        expect(result?.total_bed_height_m).toBe(0.60);
    });

    it('returns correct granulometry for FGAC', () => {
        const result = getGranulometry('fgac');
        expect(result).not.toBeNull();
        expect(result?.moduleKey).toBe('fime_grueso_ascendente');
        expect(result?.layers).toHaveLength(5);
        expect(result?.total_bed_height_m).toBe(0.90);
    });

    it('returns correct granulometry for FLA', () => {
        const result = getGranulometry('fla');
        expect(result).not.toBeNull();
        expect(result?.moduleKey).toBe('fime_lento_arena');
        expect(result?.layers).toHaveLength(4);
        expect(result?.total_bed_height_m).toBe(1.10);
    });

    it('returns null for unknown module', () => {
        expect(getGranulometry('unknown')).toBeNull();
    });

    it('calculates total structure height correctly', () => {
        // PFD: 0.60 (bed) + 0.10 (water) + 0.20 (freeboard) = 0.90
        expect(getTotalStructureHeight('pfd')).toBeCloseTo(0.90, 1);

        // FGAC: 0.90 (bed) + 0.10 (water) + 0.20 (freeboard) = 1.20
        expect(getTotalStructureHeight('fgac')).toBeCloseTo(1.20, 1);

        // FLA: 1.10 (bed) + 1.10 (water) + 0.30 (freeboard) = 2.50
        expect(getTotalStructureHeight('fla')).toBeCloseTo(2.50, 1);
    });

    it('contains mandatory normative details', () => {
        [PFD_GRANULOMETRY, FGAC_GRANULOMETRY, FLA_GRANULOMETRY].forEach(g => {
            expect(g.material_source).toBeDefined();
            expect(g.preparation_method).toBeDefined();
            expect(g.washing_method).toBeDefined();
            g.layers.forEach(l => {
                expect(l.d10_mm).toBeGreaterThan(0);
                expect(l.cu).toBeGreaterThan(0);
                expect(l.thickness_m).toBeGreaterThan(0);
            });
        });
    });
});
