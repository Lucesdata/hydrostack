import { describe, it, expect } from 'vitest';
import { FimeOymEngine } from '@/lib/fime-oym-engine';

describe('FimeOymEngine', () => {
    it('generates a complete startup protocol', () => {
        const protocol = FimeOymEngine.generateStartupProtocol({
            modules: ['pfd', 'fgac', 'fla'],
            qmd_lps: 5.5
        });

        expect(protocol).toHaveLength(10);
        expect(protocol[0].action).toContain('Inspección');
        expect(protocol[6].action).toContain('Maduración');
        expect(protocol[4].detail).toContain('5.50 L/s');
    });

    it('generates specific washing protocols', () => {
        const pfd = FimeOymEngine.generateWashingProtocol('pfd');
        expect(pfd.moduleName).toContain('PFD');
        expect(pfd.steps).toHaveLength(5);

        const fgac = FimeOymEngine.generateWashingProtocol('fgac');
        expect(fgac.moduleName).toContain('FGAC');
        expect(fgac.method).toContain('Descarga');

        const fla = FimeOymEngine.generateWashingProtocol('fla');
        expect(fla.moduleName).toContain('FLA');
        expect(fla.method).toContain('Raspado');
        expect(fla.steps).toHaveLength(7);
    });

    it('returns empty protocol for unknown module', () => {
        const result = FimeOymEngine.generateWashingProtocol('unknown');
        expect(result.moduleName).toBe('Módulo desconocido');
        expect(result.steps).toHaveLength(0);
    });

    it('generates routine maintenance schedule', () => {
        const schedule = FimeOymEngine.generateRoutineMaintenanceSchedule();
        expect(schedule.length).toBeGreaterThan(5);
        expect(schedule.some(s => s.task.includes('cloro'))).toBe(true);
        expect(schedule.some(s => s.task.includes('turbiedad'))).toBe(true);
    });

    it('generates quality control procedures', () => {
        const procedures = FimeOymEngine.generateQualityControlProcedures();
        expect(procedures.length).toBeGreaterThan(3);
        expect(procedures.find(p => p.parameter === 'Turbiedad')).toBeDefined();
        expect(procedures.find(p => p.parameter === 'Coliformes fecales (E. coli)')).toBeDefined();
    });

    it('generates contingency protocols', () => {
        const contingencies = FimeOymEngine.generateContingencyProtocols();
        expect(contingencies.length).toBeGreaterThan(3);
        expect(contingencies.find(c => c.severity === 'ALTA')).toBeDefined();
        expect(contingencies.some(c => c.event.includes('crecida'))).toBe(true);
    });
});
