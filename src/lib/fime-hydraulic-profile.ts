
/**
 * MOTOR DE CÁLCULO DE PERFIL HIDRÁULICO — FiME
 * 
 * Responsable de calcular la línea piezométrica, pérdidas de carga (fricción y menores),
 * y cotas de lámina de agua a lo largo del tren de tratamiento.
 * 
 * Referencia Normativa: RAS 0330 (2017)
 */

export interface HydraulicNode {
    id: string;             // e.g., 'captacion', 'pfd_in', 'pfd_out'
    name: string;           // Nombre descriptivo
    type: 'UNIT' | 'PIPE' | 'VALVE' | 'DROP';
    elevation_bottom: number; // Cota de fondo (m)
    water_level: number;      // Cota de lámina de agua (m)
    head_loss: number;        // Pérdida de carga en este nodo (m)
    accumulated_head_loss: number; // Pérdida acumulada desde el inicio (m)
    description?: string;
}

export interface PipeSegment {
    length_m: number;
    diameter_inch: number;
    material: 'PVC' | 'HG' | 'CONCRETE';
    c_factor: number; // Coeficiente de Hazen-Williams
    flow_lps: number;
    accessories: string[]; // e.g., ['elbow_90', 'valve_gate']
}

export class FimeHydraulicProfile {

    /**
     * Calcula la pérdida de carga por fricción usando Hazen-Williams.
     * hf = (10.67 * L * Q^1.852) / (C^1.852 * D^4.87)
     */
    static calculateFrictionLoss(length_m: number, flow_lps: number, diameter_inch: number, c_factor: number = 140): number {
        if (length_m <= 0 || flow_lps <= 0 || diameter_inch <= 0) return 0;

        const Q_m3s = flow_lps / 1000;
        const D_m = diameter_inch * 0.0254;

        // Fórmula Hazen-Williams en sistema métrico
        const numerator = 10.67 * length_m * Math.pow(Q_m3s, 1.852);
        const denominator = Math.pow(c_factor, 1.852) * Math.pow(D_m, 4.87);

        return numerator / denominator;
    }

    /**
     * Calcula pérdidas menores por accesorios (K * v^2 / 2g).
     */
    static calculateMinorLosses(flow_lps: number, diameter_inch: number, k_values: number[]): number {
        if (flow_lps <= 0 || diameter_inch <= 0 || k_values.length === 0) return 0;

        const Q_m3s = flow_lps / 1000;
        const D_m = diameter_inch * 0.0254;
        const Area = Math.PI * Math.pow(D_m / 2, 2);
        const Velocity = Q_m3s / Area;
        const g = 9.81;

        const v_head = (Math.pow(Velocity, 2)) / (2 * g);
        const total_k = k_values.reduce((a, b) => a + b, 0);

        return total_k * v_head;
    }

    /**
     * Coeficientes K típicos para accesorios comunes.
     */
    static getKValue(accessory: string): number {
        const k_map: Record<string, number> = {
            'elbow_90': 0.9,
            'elbow_45': 0.4,
            'tee_straight': 0.2, // Paso directo
            'tee_branch': 2.0,   // Salida lateral
            'valve_gate_open': 0.2,
            'valve_butterfly_open': 0.3,
            'entrance_sharp': 0.5,
            'exit_submerged': 1.0,
            'screen': 0.1 // Rejilla limpia
        };
        return k_map[accessory] || 0;
    }

    /**
     * Genera el perfil hidráulico completo del sistema.
     * Asume Cota 100.00m en la salida de la captación como referencia relativa si no se provee.
     */
    static calculateSystemProfile(
        qmd_lps: number,
        start_elevation: number = 100.0,
        units_params: any
    ): HydraulicNode[] {
        const nodes: HydraulicNode[] = [];
        let current_h = start_elevation; // Cota de energía (Hgl)
        let accumulated_loss = 0;

        // 1. CAPTACIÓN -> DESARENADOR
        // Pérdida en conducción inicial (asumida 50m, 3", PVC)
        const pipe1: PipeSegment = {
            length_m: 50,
            diameter_inch: units_params.pipe_diameter_raw || 3,
            material: 'PVC',
            c_factor: 150,
            flow_lps: qmd_lps,
            accessories: ['entrance_sharp', 'elbow_90', 'valve_gate_open']
        };

        const hf1_fric = this.calculateFrictionLoss(pipe1.length_m, pipe1.flow_lps, pipe1.diameter_inch, pipe1.c_factor);
        const k_vals1 = pipe1.accessories.map(acc => this.getKValue(acc));
        const hf1_minor = this.calculateMinorLosses(pipe1.flow_lps, pipe1.diameter_inch, k_vals1);
        const hf1_total = hf1_fric + hf1_minor;

        accumulated_loss += hf1_total;
        current_h -= hf1_total;

        nodes.push({
            id: 'desarenador_in',
            name: 'Entrada Desarenador',
            type: 'UNIT',
            elevation_bottom: current_h - 1.5, // 1.5m profundidad típica
            water_level: current_h,
            head_loss: hf1_total,
            accumulated_head_loss: accumulated_loss,
            description: 'Llegada a desarenador'
        });

        // 2. DESARENADOR (Pérdida interna baja)
        const hf_des = 0.05; // 5cm pérdida en vertedero salida
        accumulated_loss += hf_des;
        current_h -= hf_des;

        nodes.push({
            id: 'desarenador_out',
            name: 'Salida Desarenador',
            type: 'UNIT',
            elevation_bottom: current_h - 1.5,
            water_level: current_h,
            head_loss: hf_des,
            accumulated_head_loss: accumulated_loss,
            description: 'Vertedero de salida'
        });

        // 3. PFD (Prefiltro)
        // Caída recomendada entre unidades para oxigenación y separación física: 0.50m
        const drop_pfd = 0.50;
        current_h -= drop_pfd;
        accumulated_loss += drop_pfd; // Pérdida geométrica

        const hf_pfd_dirty = 0.30; // Pérdida máxima operativa
        accumulated_loss += hf_pfd_dirty;
        current_h -= hf_pfd_dirty;

        nodes.push({
            id: 'pfd_out',
            name: 'Salida PFD',
            type: 'UNIT',
            elevation_bottom: current_h - 1.8, // Altura caja PFD
            water_level: current_h,
            head_loss: hf_pfd_dirty + drop_pfd,
            accumulated_head_loss: accumulated_loss,
            description: 'Salida prefiltro'
        });

        // 4. FGAC (Filtro Grueso)
        const drop_fgac = 0.20; // Conexión corta
        current_h -= drop_fgac;
        accumulated_loss += drop_fgac;

        const hf_fgac_dirty = 0.40; // Pérdida operativa
        accumulated_loss += hf_fgac_dirty;
        current_h -= hf_fgac_dirty;

        nodes.push({
            id: 'fgac_out',
            name: 'Salida FGAC',
            type: 'UNIT',
            elevation_bottom: current_h - 2.0, // Altura caja FGAC
            water_level: current_h,
            head_loss: hf_fgac_dirty + drop_fgac,
            accumulated_head_loss: accumulated_loss,
            description: 'Salida filtro grueso'
        });

        // 5. FLA (Filtro Lento)
        const drop_fla = 0.20;
        current_h -= drop_fla;
        accumulated_loss += drop_fla;

        // El FLA tiene una pérdida variable significativa (hasta 1.0m)
        // Diseñamos para la condición crítica (lecho sucio)
        const hf_fla_critical = 1.0;
        accumulated_loss += hf_fla_critical;
        current_h -= hf_fla_critical;

        nodes.push({
            id: 'fla_out',
            name: 'Salida FLA',
            type: 'UNIT',
            elevation_bottom: current_h - 2.5, // Altura caja FLA
            water_level: current_h,
            head_loss: hf_fla_critical + drop_fla,
            accumulated_head_loss: accumulated_loss,
            description: 'Salida filtro lento (crítico)'
        });

        // 6. TANQUE CONTACTO / ALMACENAMIENTO
        const drop_tank = 0.30; // Caída a tanque
        current_h -= drop_tank;
        accumulated_loss += drop_tank;

        nodes.push({
            id: 'storage_tank',
            name: 'Tanque Almacenamiento',
            type: 'UNIT',
            elevation_bottom: current_h - 2.5, // Profundidad tanque
            water_level: current_h,
            head_loss: drop_tank,
            accumulated_head_loss: accumulated_loss,
            description: 'Nivel máximo tanque'
        });

        return nodes;
    }
}
