
import { FimePipingEngine } from '../fime-piping-engine';

describe('FimePipingEngine', () => {

    describe('selectOptimalDiameter', () => {
        it('should select diameter within velocity range for gravity flow', () => {
            // Test Case: 10 L/s flow
            // Q = 0.010 m3/s
            // Try 3" (0.0762m) -> A = 0.00456 -> V = 2.19 m/s (Too high > 2.0? RAS limit is flexible but let's see logic)
            // Logic uses v_max = 2.5 for GRAVITY_FLOW. So 3" might pass.
            // Try 4" (0.1016m) -> A = 0.00811 -> V = 1.23 m/s (Perfect)
            // The engine picks smallest D where V <= v_max. 
            // 3" gives 2.19 m/s which is <= 2.5. So it might pick 3".
            // Let's verify the logic in the file: v_max = 2.5.

            const spec = FimePipingEngine.selectOptimalDiameter(10, 'GRAVITY_FLOW');

            expect(spec.actual_velocity_ms).toBeLessThanOrEqual(2.5);
            expect(spec.actual_velocity_ms).toBeGreaterThanOrEqual(0.6);
            expect(spec.compliance_check).toBe('OK');
        });

        it('should select larger diameter for wash drain (higher flow)', () => {
            // Wash flow 30 L/s
            const spec = FimePipingEngine.selectOptimalDiameter(30, 'WASH_DRAIN');

            // Allow higher velocities for drains
            expect(spec.actual_velocity_ms).toBeLessThanOrEqual(5.0);
            expect(spec.recommended_diameter_inch).toBeGreaterThanOrEqual(4);
        });
    });

    describe('generateValveSchedule', () => {
        it('should generate correct valves for full train', () => {
            const modules = ['pfd', 'fgac', 'fla'];
            const valves = FimePipingEngine.generateValveSchedule(modules, 10);

            // Should have:
            // 1 Main Inlet
            // 2 PFD (Inlet + Wash)
            // 2 FGAC (Inlet + Wash)
            // 3 FLA (Inlet + Outlet + Drain)
            // Total = 8 valves

            expect(valves.length).toBe(8);
            expect(valves.find(v => v.function.includes('Lavado PFD'))).toBeDefined();
            expect(valves.find(v => v.function.includes('Desagüe Mantenimiento FLA'))).toBeDefined();
        });
    });
});
