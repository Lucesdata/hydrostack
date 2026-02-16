import { describe, it, expect } from 'vitest';
import { FimeEngine } from '@/lib/fime-engine';

describe('FimeEngine.calculateModuleDimensions', () => {
    it('returns null for invalid inputs', () => {
        expect(FimeEngine.calculateModuleDimensions(0, 2, 2, 2)).toBeNull();
        expect(FimeEngine.calculateModuleDimensions(5, 2, 0, 2)).toBeNull();
    });

    it('calculates correct dimensions for standard FGDi', () => {
        // 5 L/s, Vf=2 m/h, 2 units, ratio L:A = 3
        const result = FimeEngine.calculateModuleDimensions(5, 2, 2, 3);
        expect(result).not.toBeNull();
        if (!result) return;

        // Q total = 5 * 3600 / 1000 = 18 m³/h
        // Q per unit = 9 m³/h
        // Area per unit = 9 / 2 = 4.5 m²
        // a = sqrt(4.5 / 3) = sqrt(1.5) = 1.2247
        // L = 3 * 1.2247 = 3.6742
        expect(result.q_unit_lps).toBeCloseTo(2.5, 1);
        expect(result.q_unit_m3h).toBeCloseTo(9, 0);
        expect(result.area_unit_m2).toBeCloseTo(4.5, 1);
        expect(result.width_a).toBeCloseTo(1.2247, 2);
        expect(result.length_l).toBeCloseTo(3.6742, 2);
        // Real Vf should match input Vf
        expect(result.real_vf).toBeCloseTo(2, 1);
    });

    it('scales linearly with flow rate', () => {
        const result1 = FimeEngine.calculateModuleDimensions(2, 2, 2, 3);
        const result2 = FimeEngine.calculateModuleDimensions(4, 2, 2, 3);
        expect(result1).not.toBeNull();
        expect(result2).not.toBeNull();
        if (!result1 || !result2) return;

        // Double flow → double area
        expect(result2.area_unit_m2).toBeCloseTo(result1.area_unit_m2 * 2, 1);
    });

    it('distributes flow correctly across units', () => {
        const r2 = FimeEngine.calculateModuleDimensions(10, 2, 2, 3);
        const r4 = FimeEngine.calculateModuleDimensions(10, 2, 4, 3);
        expect(r2).not.toBeNull();
        expect(r4).not.toBeNull();
        if (!r2 || !r4) return;

        expect(r2.q_unit_lps).toBeCloseTo(5, 1);
        expect(r4.q_unit_lps).toBeCloseTo(2.5, 1);
    });
});

describe('FimeEngine.calculateTotalRemoval', () => {
    it('calculates removal with full FiME train (FGD + FG + FLA)', () => {
        const result = FimeEngine.calculateTotalRemoval(50, 1000, true, true, true, 30);

        // FGD: 50 * 0.50 = 25, Color: 30 * 0.80 = 24, logs += 0.5
        // FG:  25 * 0.40 = 10, Color: 24 * 0.70 = 16.8, logs += 1.5
        // FLA: 10 * 0.05 = 0.5, Color: 16.8 * 0.70 = 11.76, logs += 2.0
        // Total logs = 4.0
        expect(result.turbiedad_final).toBeCloseTo(0.5, 1);
        expect(result.color_final).toBeCloseTo(11.8, 1);
        expect(result.logs_patogenos).toBeCloseTo(4.0, 1);
        expect(result.remocion_turbiedad).toBeCloseTo(99.0, 0);
        expect(result.cumple_normatividad).toBe(true);
    });

    it('fails compliance without FLA (insufficient pathogen removal)', () => {
        const result = FimeEngine.calculateTotalRemoval(50, 1000, true, true, false);

        // Without FLA: logs = 0.5 + 1.5 = 2.0 (< 4.0 threshold)
        expect(result.logs_patogenos).toBeCloseTo(2.0, 1);
        expect(result.cumple_normatividad).toBe(false);
    });

    it('handles zero coliform input', () => {
        const result = FimeEngine.calculateTotalRemoval(1, 0, true, true, true);
        // Zero coliforms → meetsHealth always true
        expect(result.cumple_normatividad).toBe(true);
    });

    it('detects high turbidity non-compliance', () => {
        // Very high turbidity that still exceeds 2.0 UNT after treatment
        // 500 * 0.5 * 0.4 * 0.05 = 5.0 > 2.0
        const result = FimeEngine.calculateTotalRemoval(500, 1000, true, true, true);
        expect(result.turbiedad_final).toBeCloseTo(5.0, 1);
        expect(result.cumple_normatividad).toBe(false);
        expect(result.observacion).toContain('ALERTA');
    });

    it('confirms safe design message when compliant', () => {
        const result = FimeEngine.calculateTotalRemoval(50, 0, true, true, true);
        expect(result.cumple_normatividad).toBe(true);
        expect(result.observacion).toContain('DISEÑO SEGURO');
    });

    it('validates against La Paz reference project (QMD=1.95 L/s)', () => {
        // La Paz: Turb=4.1, Coli=56, Color=10, FGDi+FLA (no FGAC)
        const result = FimeEngine.calculateTotalRemoval(4.1, 56, true, false, true, 10);
        // FGDi: 4.1 * 0.50 = 2.05, Color: 10 * 0.80 = 8.0, Logs: 0.5
        // FLA:  2.05 * 0.05 = 0.10, Color: 8.0 * 0.70 = 5.6, Logs: 0.5 + 2.0 = 2.5

        // La Paz actually achieves 99% coli removal = 2 log total.
        // Our engine predicts 2.5 Log (0.5 + 2.0), which is safe/conservative.
        expect(result.turbiedad_final).toBeLessThan(1.0);
        expect(result.color_final).toBeLessThan(15);
        expect(result.cumple_normatividad).toBe(true);
    });

    it('validates FGDi dimensions against La Paz (a=0.75m, L=2.3m)', () => {
        const result = FimeEngine.calculateModuleDimensions(1.95, 2.0, 2, 3);
        expect(result).not.toBeNull();
        expect(result!.area_unit_m2).toBeCloseTo(1.75, 1);
        expect(result!.width_a).toBeCloseTo(0.76, 1); // 0.76m
        expect(result!.length_l).toBeCloseTo(2.30, 1); // 2.30m
    });

    it('validates RAS-2000 CT compliance for La Paz conditions', () => {
        // La Paz: pH 7.5, T=20°C -> CT=22 min
        const ct = FimeEngine.getCTRequired(7.5, 20);
        expect(ct).toBe(22);

        // Cold water condition: pH 7.5, T=15°C -> CT=32 min
        const ctCold = FimeEngine.getCTRequired(7.5, 15);
        expect(ctCold).toBe(32);
    });
});

describe('FimeEngine.getSizingRules', () => {
    it('returns correct pre-treatment rules for high turbidity', () => {
        const rules = FimeEngine.getSizingRules('fime_pretratamiento', 5, { turbidity: 120 }) as any;
        expect(rules.captacion_tipo).toBe('Lateral con Rejas');
        expect(rules.desarenado_previo).toBe('SÍ');
    });

    it('returns correct pre-treatment rules for low turbidity', () => {
        const rules = FimeEngine.getSizingRules('fime_pretratamiento', 5, { turbidity: 30 }) as any;
        expect(rules.captacion_tipo).toBe('Sumergida');
        expect(rules.desarenado_previo).toBe('NO'); // 30 is not > 50
    });

    it('calculates FGDi area correctly', () => {
        // 5 L/s = 18 m³/h, Vfgd = 5 m/h → area = 3.6 m²
        const rules = FimeEngine.getSizingRules('fime_grueso_dinamico', 5, {}) as any;
        expect(rules.velocidad_filtracion).toBe(5.0);
        expect(rules.area_requerida).toBeCloseTo(3.6, 1);
    });

    it('calculates FLA area correctly', () => {
        // 5 L/s = 18 m³/h, Vfla = 0.15 m/h → area = 120 m²
        const rules = FimeEngine.getSizingRules('fime_lento_arena', 5, {}) as any;
        expect(rules.velocidad_filtracion).toBe(0.15);
        expect(rules.area_total).toBeCloseTo(120, 0);
    });

    it('returns balance de masas for full train', () => {
        const rules = FimeEngine.getSizingRules('fime_balance_masas', 5, {
            turbidity: 50,
            coli_fecal: 1000,
        }) as any;
        expect(rules.cumple_normatividad).toBeDefined();
        expect(rules.turbiedad_final).toBeDefined();
    });

    it('returns empty object for unknown module', () => {
        const rules = FimeEngine.getSizingRules('unknown_module' as any, 5, {});
        expect(rules).toEqual({});
    });
});

describe('FimeEngine Memoria de Cálculo', () => {
    const qmd = 5.0; // 5 Lps = 18 m3h
    const quality = { turbidity: 60, coli_fecal: 1000 };

    it('calculatePFDMemoria returns structured data', () => {
        const memoria = FimeEngine.calculatePFDMemoria(qmd, quality);
        expect(memoria.moduleName).toContain('PFD');
        expect(memoria.steps.length).toBeGreaterThan(10);
        expect(memoria.results.num_modulos).toBe(2); // for turb=60
        expect(memoria.results.velocidad_filtracion_m_h).toBe(4.0);
        expect(memoria.compliance.find(c => c.check === 'Velocidad de filtración')?.status).toBe('OK');
    });

    it('calculateFGACMemoria returns structured data', () => {
        const params = { vf: 0.5, num_units: 2, ratio_l_a: 4 };
        const memoria = FimeEngine.calculateFGACMemoria(qmd, quality, params);
        expect(memoria.moduleName).toContain('FGAC');
        expect(memoria.steps.find(s => s.variable === 'Ancho del filtro (a)')).toBeDefined();
        expect(memoria.results.vf_real_m_h).toBeCloseTo(0.5, 2);
        expect(memoria.granulometry?.layers).toHaveLength(5);
    });

    it('calculateFLAMemoria returns structured data', () => {
        const params = { vf: 0.15, num_units: 3, ratio_l_a: 2 };
        const memoria = FimeEngine.calculateFLAMemoria(qmd, params);
        expect(memoria.moduleName).toContain('FLA');
        expect(memoria.results.area_total_m2).toBeCloseTo(120, 0); // 18 / 0.15 = 120
        expect(memoria.compliance.find(c => c.check === 'Área por unidad')?.status).toBe('OK'); // 120 / 3 = 40 <= 100
    });

    it('calculateDisinfectionMemoria returns structured data', () => {
        const params = { contact_time: 25, chlorine_dose: 1.0, chlorine_concentration: 75 };
        const population = 595;
        // La Paz conditions: pH 7.5, T=20°C -> CT req = 22
        // Provided: 1.0 * 25 = 25 > 22 -> OK
        const memoria = FimeEngine.calculateDisinfectionMemoria(1.95, population, params, { ph: 7.5, temperature: 20 });

        expect(memoria.moduleName).toContain('Desinfección');
        expect(memoria.results.ct_proporcionado).toBe(25);
        expect(memoria.results.ct_cumple).toBe('SÍ');

        // Cold water fail check: pH 7.5, T=15°C -> CT req = 32
        const memoriaCold = FimeEngine.calculateDisinfectionMemoria(1.95, population, params, { ph: 7.5, temperature: 15 });
        expect(memoriaCold.results.ct_cumple).toBe('NO');
    });
});
