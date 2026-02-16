
/**
 * MOTOR DE IMPLANTACIÓN Y LAYOUT — FiME
 * 
 * Genera el esquema de distribución espacial de la planta,
 * calculando áreas requeridas, zonas de operación y coordenadas relativas.
 */

export interface FacilityZone {
    id: string;
    name: string;
    width_m: number;
    length_m: number;
    area_m2: number;
    relative_x: number; // Coordenada X relativa (0,0 es esquina superior izquierda del predio)
    relative_y: number; // Coordenada Y relativa
    rotation_deg: number;
    color: string;
    description: string;
}

export interface MasterPlan {
    total_area_m2: number;
    required_width_m: number;
    required_length_m: number;
    terrain_slope_pct: number;
    layout_type: 'LINEAR' | 'U_SHAPE' | 'COMPACT';
    zones: FacilityZone[];
}

export class FimeLayoutEngine {

    /**
     * Genera el plan maestro de implantación.
     */
    static generateMasterPlan(
        qmd_lps: number,
        modules: string[],
        dimensions: Record<string, { width: number; length: number; units: number }>
    ): MasterPlan {

        const slope = 5; // Asumir pendiente suave 5% si no hay dato
        const layout_type = slope > 15 ? 'U_SHAPE' : 'LINEAR'; // En pendiente fuerte, mejor zig-zag/U

        const zones: FacilityZone[] = [];
        const current_x = 2.0; // Margen inicial
        let current_y = 2.0;
        let max_width = 0;

        // 1. ZONA DE ACCESO Y MANIOBRAS
        zones.push({
            id: 'access_zone',
            name: 'Zona Acceso / Descarga',
            width_m: 6.0,
            length_m: 4.0,
            area_m2: 24.0,
            relative_x: 0,
            relative_y: 0,
            rotation_deg: 0,
            color: '#CBD5E1', // gray-300
            description: 'Acceso vehicular y recepción de químicos'
        });
        current_y += 5.0;

        // 2. DESARENADOR (Siempre al inicio)
        if (dimensions['desarenador']) {
            const w = dimensions['desarenador'].width + 2; // +2m perimetral
            const l = dimensions['desarenador'].length + 2;
            zones.push({
                id: 'desarenador_zone',
                name: 'Desarenador',
                width_m: w,
                length_m: l,
                area_m2: w * l,
                relative_x: current_x,
                relative_y: current_y,
                rotation_deg: 0,
                color: '#93C5FD', // blue-300
                description: 'Estructura de concreto reforzado'
            });
            current_y += l + 2.0; // Espacio entre unidades
            max_width = Math.max(max_width, w);
        }

        // 3. PFD
        if (modules.includes('pfd') && dimensions['pfd']) {
            const w = (dimensions['pfd'].width * dimensions['pfd'].units) + 3; // +3m circulación
            const l = dimensions['pfd'].length + 2;
            zones.push({
                id: 'pfd_zone',
                name: 'Pre-Filtración (PFD)',
                width_m: w,
                length_m: l,
                area_m2: w * l,
                relative_x: current_x,
                relative_y: current_y,
                rotation_deg: 0,
                color: '#60A5FA', // blue-400
                description: 'Batería de filtros de grava gruesa'
            });
            current_y += l + 3.0;
            max_width = Math.max(max_width, w);
        }

        // 4. FGAC
        if (modules.includes('fgac') && dimensions['fgac']) {
            const w = (dimensions['fgac'].width * dimensions['fgac'].units) + 3;
            const l = dimensions['fgac'].length + 2;
            zones.push({
                id: 'fgac_zone',
                name: 'Filtros Gruesos (FGAC)',
                width_m: w,
                length_m: l,
                area_m2: w * l,
                relative_x: current_x,
                relative_y: current_y,
                rotation_deg: 0,
                color: '#3B82F6', // blue-500
                description: 'Filtros ascendentes en serie'
            });
            current_y += l + 3.0;
            max_width = Math.max(max_width, w);
        }

        // 5. FLA (El más grande)
        if (modules.includes('fla') && dimensions['fla']) {
            const w = (dimensions['fla'].width * dimensions['fla'].units) + 4; // +4m circulación (carretillas arena)
            const l = dimensions['fla'].length + 2;
            zones.push({
                id: 'fla_zone',
                name: 'Filtros Lentos (FLA)',
                width_m: w,
                length_m: l,
                area_m2: w * l,
                relative_x: current_x,
                relative_y: current_y,
                rotation_deg: 0,
                color: '#2563EB', // blue-600
                description: 'Área principal de tratamiento biológico'
            });
            current_y += l + 4.0;
            max_width = Math.max(max_width, w);
        }

        // 6. CASETAS OPERATIVAS (Laboratorio + Cloración)
        zones.push({
            id: 'ops_building',
            name: 'Caseta Operaciones',
            width_m: 6.0,
            length_m: 4.0,
            area_m2: 24.0,
            relative_x: max_width + 5.0, // Al costado
            relative_y: 10.0,
            rotation_deg: 90,
            color: '#FDE047', // yellow-300
            description: 'Laboratorio básico y almacén'
        });

        const total_len = current_y + 5.0;
        const total_wid = Math.max(max_width, 10.0) + 10.0; // +10m margen lateral

        return {
            total_area_m2: Number((total_len * total_wid).toFixed(1)),
            required_width_m: Number(total_wid.toFixed(1)),
            required_length_m: Number(total_len.toFixed(1)),
            terrain_slope_pct: slope,
            layout_type: layout_type,
            zones: zones
        };
    }
}
