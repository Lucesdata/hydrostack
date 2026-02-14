import { ModuleKey } from '@/types/project';

export class FimeEngine {
    static getSizingRules(moduleKey: ModuleKey, qmdLps: number, quality: any) {
        const q_m3h = qmdLps * 3.6;
        const initialTurb = quality?.turbidity || 50;
        const initialColi = quality?.coli_fecal || 1000;

        switch (moduleKey) {
            case 'fime_pretratamiento':
                return {
                    captacion_tipo: initialTurb > 100 ? 'Lateral con Rejas' : 'Sumergida',
                    desarenado_previo: initialTurb > 50 ? 'SÍ' : 'NO',
                    proteccion_hidraulica: 'Cámara de aquietamiento y macro-medición'
                };
            case 'fime_grueso_dinamico':
                const v_fgd = 5.0; // m/h recommended
                return {
                    velocidad_filtracion: v_fgd,
                    area_requerida: Number((q_m3h / v_fgd).toFixed(2)),
                    perdida_carga: 0.15
                };
            case 'fime_grueso_asdesc':
                const v_fga = 0.6; // m/h
                return {
                    unidades_count: 2,
                    altura_lecho: 1.2,
                    granulometria: 'Grava fina (1/4") a media (1/2")',
                    tiempo_retencion: 20,
                    area_total: Number((q_m3h / v_fga).toFixed(2))
                };
            case 'fime_lento_arena':
                const v_fla = 0.15; // m/h standard FLA
                return {
                    area_total: Number((q_m3h / v_fla).toFixed(2)),
                    numero_unidades: 2,
                    velocidad_filtracion: v_fla,
                    tiempo_maduracion: 15
                };
            case 'fime_hidraulica':
                return {
                    balance_caudales: qmdLps,
                    perdida_acumulada: 2.5,
                    operacion_gravedad: 'SÍ'
                };
            case 'fime_implantacion':
                return {
                    area_predial: Number((q_m3h * 15).toFixed(0)), // Rough estimate
                    separacion_unidades: 1.5,
                    accesos_operativos: 'SÍ'
                };
            case 'fime_balance_masas':
                return this.calculateTotalRemoval(initialTurb, initialColi, true, true, true);
        }
        return {};
    }

    static calculateTotalRemoval(turb: number, coli: number, hasFGD: boolean, hasFG: boolean, hasFLA: boolean) {
        let currentTurb = turb;
        let coliLogs = 0;

        if (hasFGD) {
            currentTurb *= 0.85; // 15% rem
            coliLogs += 0.2;
        }
        if (hasFG) {
            currentTurb *= 0.4; // 60% rem additional
            coliLogs += 1.5;
        }
        if (hasFLA) {
            currentTurb *= 0.05; // 95% rem additional (FLA is very efficient if turb is low)
            coliLogs += 3.5;
        }

        // Potability limits (Colombia RAS / Res 2115)
        const meetsTurb = currentTurb <= 2.0;
        const meetsHealth = coliLogs >= 4.0 || (coli === 0);

        return {
            remocion_turbiedad: Number((100 - (currentTurb / turb * 100)).toFixed(1)),
            remocion_sst: 95,
            turbiedad_final: Number(currentTurb.toFixed(2)),
            logs_patogenos: Number(coliLogs.toFixed(1)),
            cumple_normatividad: meetsTurb && meetsHealth,
            observacion: meetsTurb && meetsHealth
                ? "DISEÑO SEGURO: El esquema FIME propuesto garantiza la potabilización bajo norma."
                : `ALERTA: Turbiedad Final ${currentTurb.toFixed(1)} UNT. Se requiere optimizar pretratamiento.`
        };
    }

    static calculateModuleDimensions(qmdLps: number, vf: number, numUnits: number, ratioLA: number) {
        if (!qmdLps || numUnits < 1) return null;

        const q_total_m3h = (qmdLps * 3600) / 1000;
        const q_unit_m3h = q_total_m3h / numUnits;
        const area_unit = q_unit_m3h / vf;

        // Math: Area = L * a, L = ratio * a => Area = ratio * a^2 => a = sqrt(Area / ratio)
        const width = Math.sqrt(area_unit / ratioLA);
        const length = ratioLA * width;
        const real_vf = q_unit_m3h / (width * length);

        return {
            q_unit_lps: qmdLps / numUnits,
            q_unit_m3h: q_unit_m3h,
            area_unit_m2: area_unit,
            width_a: width,
            length_l: length,
            real_vf: real_vf
        };
    }
}
