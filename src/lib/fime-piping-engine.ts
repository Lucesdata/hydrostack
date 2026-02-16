
/**
 * MOTOR DE TUBERÍAS Y VÁLVULAS — FiME
 * 
 * Responsable de seleccionar diámetros óptimos, materiales y valvulería
 * basado en criterios de velocidad y pérdidas.
 */

export interface PipeSpec {
    section_id: string;
    description: string;
    flow_lps: number;
    recommended_diameter_inch: number;
    actual_velocity_ms: number;
    material: string;
    sdr: string; // Relación Dimensión Estándar (Standard Dimension Ratio)
    compliance_check: 'OK' | 'LOW_VELOCITY' | 'HIGH_VELOCITY';
}

export interface ValveSpec {
    id: string;
    type: 'GATE' | 'BUTTERFLY' | 'CHECK' | 'AIR';
    diameter_inch: number;
    function: string;
    location: string;
}

export class FimePipingEngine {

    /**
     * Selecciona el diámetro comercial óptimo para mantener velocidad entre v_min y v_max.
     * Criterio RAS: 0.6 m/s < v < 2.0 m/s para conducción
     */
    static selectOptimalDiameter(
        flow_lps: number,
        type: 'GRAVITY_FLOW' | 'WASH_DRAIN' = 'GRAVITY_FLOW'
    ): PipeSpec {
        const Q_m3s = flow_lps / 1000;

        // Diámetros comerciales comunes en pulgadas
        // Diámetros comerciales comunes en pulgadas (incluyendo acometidas rurales)
        const commercial_diameters = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 6, 8, 10, 12];

        let best_dia = 0;
        let best_vel = 0;
        let compliance: 'OK' | 'LOW_VELOCITY' | 'HIGH_VELOCITY' = 'HIGH_VELOCITY';

        // Iterar para encontrar el menor diámetro que cumpla v < v_max
        // Para desagües de lavado, se permiten velocidades mayores (> 2.5 m/s es ideal para autolimpieza)
        const v_min = type === 'GRAVITY_FLOW' ? 0.6 : 1.5;
        const v_max = type === 'GRAVITY_FLOW' ? 2.5 : 5.0;

        for (const d of commercial_diameters) {
            const D_m = d * 0.0254;
            const Area = Math.PI * Math.pow(D_m / 2, 2);
            const Velocity = Q_m3s / Area;

            if (Velocity <= v_max) {
                best_dia = d;
                best_vel = Velocity;
                compliance = (Velocity >= v_min) ? 'OK' : 'LOW_VELOCITY';
                break; // Encontramos el diámetro más económico que cumple v_max
            }
        }

        // Si incluso el más grande excede velocidad (raro en estos caudales), quedarse con el mayor
        if (best_dia === 0) {
            best_dia = commercial_diameters[commercial_diameters.length - 1];
            const D_m = best_dia * 0.0254;
            best_vel = Q_m3s / (Math.PI * Math.pow(D_m / 2, 2));
            compliance = 'HIGH_VELOCITY';
        }

        return {
            section_id: 'unknown',
            description: 'Tubería calculada',
            flow_lps: flow_lps,
            recommended_diameter_inch: best_dia,
            actual_velocity_ms: Number(best_vel.toFixed(2)),
            material: 'PVC',
            sdr: type === 'GRAVITY_FLOW' ? 'RDE 21' : 'RDE 41', // Presión vs Sanitaria
            compliance_check: compliance
        };
    }

    /**
     * Genera la lista completa de valvulería requerida por módulo.
     */
    static generateValveSchedule(modules: string[], qmd_lps: number): ValveSpec[] {
        const valves: ValveSpec[] = [];
        const main_pipe = this.selectOptimalDiameter(qmd_lps);
        const drain_pipe = this.selectOptimalDiameter(qmd_lps * 3, 'WASH_DRAIN'); // Caudal lavado ≈ 3x QMD

        let id_counter = 1;

        // CAPTACIÓN
        valves.push({
            id: `V-${id_counter++}`,
            type: 'GATE',
            diameter_inch: main_pipe.recommended_diameter_inch,
            function: 'Corte Entrada Planta',
            location: 'Llegada Desarenador'
        });

        if (modules.includes('pfd') || modules.includes('fime_pretratamiento')) {
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: main_pipe.recommended_diameter_inch, function: 'Entrada PFD', location: 'Cámara reparto PFD' });
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: drain_pipe.recommended_diameter_inch, function: 'Lavado PFD', location: 'Fondo PFD' });
        }

        if (modules.includes('fgac') || modules.includes('fime_grueso_asdesc')) {
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: main_pipe.recommended_diameter_inch, function: 'Entrada FGAC', location: 'Cámara reparto FGAC' });
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: drain_pipe.recommended_diameter_inch, function: 'Lavado FGAC', location: 'Fondo FGAC' });
        }

        if (modules.includes('fla') || modules.includes('fime_lento_arena')) {
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: main_pipe.recommended_diameter_inch, function: 'Entrada FLA', location: 'Cámara reparto FLA' });
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: main_pipe.recommended_diameter_inch, function: 'Salida FLA', location: 'Cámara recolección FLA' });
            // El FLA no tiene lavado hidráulico, solo desagüe de mantenimiento
            valves.push({ id: `V-${id_counter++}`, type: 'GATE', diameter_inch: main_pipe.recommended_diameter_inch, function: 'Desagüe Mantenimiento FLA', location: 'Fondo FLA' });
        }

        return valves;
    }
}
