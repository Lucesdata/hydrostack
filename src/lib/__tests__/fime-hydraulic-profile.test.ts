
import { FimeHydraulicProfile } from '../fime-hydraulic-profile';

describe('FimeHydraulicProfile', () => {

    describe('calculateFrictionLoss (Hazen-Williams)', () => {
        it('should calculate friction loss correctly for a standard pipe', () => {
            // Test Case: 100m of 3" PVC pipe at 5 L/s
            // Manual calc approximation:
            // Q = 0.005 m3/s, D = 0.0762 m, C = 150
            // hf = 10.67 * 100 * (0.005^1.852) / (140^1.852 * 0.0762^4.87)
            // Expected value around 1.5 - 2.5m depending on precision

            const hf = FimeHydraulicProfile.calculateFrictionLoss(100, 5, 3, 140);

            // Checking range due to floating point nuances
            expect(hf).toBeGreaterThan(1.5);
            expect(hf).toBeLessThan(2.5);
        });

        it('should return 0 for zero length or flow', () => {
            expect(FimeHydraulicProfile.calculateFrictionLoss(0, 5, 3)).toBe(0);
            expect(FimeHydraulicProfile.calculateFrictionLoss(100, 0, 3)).toBe(0);
        });
    });

    describe('calculateMinorLosses', () => {
        it('should calculate minor losses correctly', () => {
            // 5 L/s in 3" pipe -> V ≈ 1.1 m/s -> V^2/2g ≈ 0.06 m
            // K = 2.0 (elbows + valves etc)
            // hf_minor ≈ 0.12 m

            const k_values = [0.9, 0.9, 0.2]; // 2 elbows, 1 gate valve
            const hf_minor = FimeHydraulicProfile.calculateMinorLosses(5, 3, k_values);

            expect(hf_minor).toBeGreaterThan(0.10);
            expect(hf_minor).toBeLessThan(0.15);
        });
    });

    describe('calculateSystemProfile', () => {
        it('should generate a profile with correct node sequence', () => {
            const profile = FimeHydraulicProfile.calculateSystemProfile(5, 100, { pipe_diameter_raw: 3 });

            expect(profile.length).toBeGreaterThan(0);
            expect(profile[0].id).toBe('desarenador_in');
            expect(profile[profile.length - 1].id).toBe('storage_tank');

            // Water should flow downhill (hydraulic grad line decreases)
            const firstNodeH = profile[0].water_level;
            const lastNodeH = profile[profile.length - 1].water_level;
            expect(lastNodeH).toBeLessThan(firstNodeH);

            // Check specific nodes exist
            expect(profile.find(n => n.id === 'pfd_out')).toBeDefined();
            expect(profile.find(n => n.id === 'fgac_out')).toBeDefined();
            expect(profile.find(n => n.id === 'fla_out')).toBeDefined();
        });

        it('should calculate accumulated head loss monotonically increasing', () => {
            const profile = FimeHydraulicProfile.calculateSystemProfile(5, 100, { pipe_diameter_raw: 3 });

            let prevLoss = -1;
            profile.forEach(node => {
                expect(node.accumulated_head_loss).toBeGreaterThan(prevLoss);
                prevLoss = node.accumulated_head_loss;
            });
        });
    });
});
