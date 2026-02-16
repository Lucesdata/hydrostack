
import { describe, it, expect } from 'vitest';
import { FimeEngine } from '../fime-engine';
import { FimePipingEngine } from '../fime-piping-engine';
import { FimeHydraulicProfile } from '../fime-hydraulic-profile';

describe('RAS 0330 (2017) Compliance Verification', () => {

    // Scenario: "Campoalegre 2" - Rural School/Community
    // Qmd = 0.5 L/s (approx 43 m3/day)
    // Turbidity = 30 NTU (requires PFD + FGAC + FLA)
    const qmd_lps = 0.5;
    const modules = ['pfd', 'fgac', 'fla'];

    describe('Filtration Velocities', () => {
        it('should maintain FGAC velocity within 0.3 - 0.6 m/h', () => {
            // Using standard design
            const fgac = FimeEngine.calculateFGACMemoria(qmd_lps, { turbidity: 30 }, { vf: 0.6, num_units: 2, ratio_l_a: 4 });

            // Exact string in FimeEngine: 'Velocidad de filtración (Vf)'
            // We use includes to be safe against minor spacing changes
            const vf_step = fgac.steps.find(s => s.variable.includes('Velocidad de filtración'));
            const vf_val = parseFloat(vf_step?.result || '0');

            expect(vf_val).toBeGreaterThanOrEqual(0.3);
            expect(vf_val).toBeLessThanOrEqual(0.6);
        });

        it('should maintain FLA velocity within 0.1 - 0.2 m/h', () => {
            const fla = FimeEngine.calculateFLAMemoria(qmd_lps, { vf: 0.15, num_units: 2, ratio_l_a: 2 });

            // Exact string in FimeEngine: 'Velocidad de filtración (Vf)'
            const vf_step = fla.steps.find(s => s.variable.includes('Velocidad de filtración'));
            const vf_val = parseFloat(vf_step?.result || '0');

            expect(vf_val).toBeGreaterThanOrEqual(0.1);
            expect(vf_val).toBeLessThanOrEqual(0.2); // STRICT RAS limit
        });
    });

    describe('Piping & Velocities', () => {
        it('should strictly enforce minimum velocity 0.6 m/s for self-cleaning', () => {
            // Updated engine now includes smaller diameters (0.5", 0.75", 1")
            // 0.5 L/s in 0.5" (0.0127m) -> Area=1.26e-4 -> V=3.9 m/s (Too high > 2.5)
            // 0.5 L/s in 0.75" (0.019m) -> Area=2.85e-4 -> V=1.75 m/s (Perfect)
            // 0.5 L/s in 1.0" (0.0254m) -> Area=5.06e-4 -> V=0.98 m/s (Perfect)

            const spec = FimePipingEngine.selectOptimalDiameter(0.5, 'GRAVITY_FLOW');

            // Should be >= 0.6 m/s
            expect(spec.actual_velocity_ms).toBeGreaterThanOrEqual(0.6);
            // And <= 2.5 m/s
            expect(spec.actual_velocity_ms).toBeLessThanOrEqual(2.5);
        });
    });

    describe('Disinfection', () => {
        it('should ensure Contact Time > 20 min', () => {
            const dis = FimeEngine.calculateDisinfectionMemoria(qmd_lps, 500, { contact_time: 30, chlorine_dose: 2, chlorine_concentration: 65 });

            // Check based on the exact string used in FimeEngine 'compliance' array
            // check: 'Tiempo de contacto mínimo'
            const t_check = dis.compliance.find(c => c.check.includes('Tiempo de contacto'));

            expect(t_check).toBeDefined();
            expect(t_check?.status).toBe('OK');
        });
    });
});
