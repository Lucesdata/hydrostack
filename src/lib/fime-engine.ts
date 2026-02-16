import { ModuleKey } from '@/types/project';
import {
    PFD_GRANULOMETRY,
    FGAC_GRANULOMETRY,
    FLA_GRANULOMETRY,
    getGranulometry,
    getTotalStructureHeight,
    type ModuleGranulometry
} from './fime-granulometry';

// ─── TYPES PARA MEMORIAS DE CÁLCULO ──────────────────────────────────

export interface CalculationStep {
    /** Variable being calculated */
    variable: string;
    /** Human-readable formula */
    formula: string;
    /** Substituted values */
    substitution: string;
    /** Numerical result */
    result: string;
    /** Units */
    unit: string;
    /** Normative reference */
    reference?: string;
}

export interface ModuleMemoria {
    /** Module name */
    moduleName: string;
    /** Design flow data */
    designFlow: { qmd_lps: number; qmd_m3h: number };
    /** Step-by-step calculations */
    steps: CalculationStep[];
    /** Design parameters used */
    designParams: Record<string, string | number>;
    /** Final results summary */
    results: Record<string, string | number>;
    /** Normative compliance checks */
    compliance: { check: string; value: string; limit: string; status: 'OK' | 'ALERTA' }[];
    /** Granulometric specifications (if applicable) */
    granulometry?: ModuleGranulometry;
}

export interface DisinfectionMemoria extends ModuleMemoria {
    /** CT compliance */
    ct_compliance: { ct_required: number; ct_provided: number; compliant: boolean };
    /** Storage tank */
    storage: { volume_m3: number; retention_hours: number; population: number };
}

// ─── CLASE PRINCIPAL ──────────────────────────────────────────────────

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
                    area_predial: Number((q_m3h * 15).toFixed(0)),
                    separacion_unidades: 1.5,
                    accesos_operativos: 'SÍ'
                };
            case 'fime_balance_masas':
                return this.calculateTotalRemoval(initialTurb, initialColi, true, true, true);
        }
        return {};
    }

    /**
     * Calcula la remoción acumulada del tren FIME.
     * Factores basados en CINARA-IRC / Proyecto La Paz (Tabla 5.2):
     *   FGDi: Turbiedad 50%, Color 20%, Coliformes 0.5 Log
     *   FGAC: Turbiedad 60%, Color 30%, Coliformes 1.5 Log
     *   FLA:  Turbiedad 95%, Color 30%, Coliformes 2.0 Log (CINARA Tabla 6.3)
     */
    static calculateTotalRemoval(turb: number, coli: number, hasFGD: boolean, hasFG: boolean, hasFLA: boolean, color?: number) {
        let currentTurb = turb;
        let currentColor = color ?? 0;
        let coliLogs = 0;

        if (hasFGD) {
            currentTurb *= 0.50;    // 50% remoción (CINARA / La Paz Tabla 5.2)
            currentColor *= 0.80;   // 20% remoción
            coliLogs += 0.5;        // 0.5 Log
        }
        if (hasFG) {
            currentTurb *= 0.4;     // 60% remoción FGAC
            currentColor *= 0.70;   // ~30% remoción
            coliLogs += 1.5;
        }
        if (hasFLA) {
            currentTurb *= 0.05;    // 95% remoción (CINARA Tabla 6.3)
            currentColor *= 0.70;   // 30% remoción (CINARA: 30-100%)
            coliLogs += 2.0;        // ~99% ≈ 2 Log (CINARA Tabla 6.3)
        }

        const residualColi = coli * Math.pow(10, -coliLogs);
        const meetsTurb = currentTurb <= 2.0;          // Res. 2115/2007
        const meetsColor = currentColor <= 15 || !color; // Res. 2115/2007: ≤ 15 UPC
        const meetsHealth = residualColi < 1.0;        // 0 UFC/100mL (o < 1 NMP)

        return {
            remocion_turbiedad: Number((100 - (currentTurb / turb * 100)).toFixed(1)),
            remocion_color: color ? Number((100 - (currentColor / color * 100)).toFixed(1)) : null,
            remocion_sst: 95,
            turbiedad_final: Number(currentTurb.toFixed(2)),
            color_final: color ? Number(currentColor.toFixed(1)) : null,
            logs_patogenos: Number(coliLogs.toFixed(1)),
            coliformes_residuales: Number(residualColi.toFixed(1)),
            cumple_normatividad: meetsTurb && meetsColor && meetsHealth,
            observacion: meetsTurb && meetsColor && meetsHealth
                ? "DISEÑO SEGURO: El esquema FIME propuesto garantiza la potabilización bajo norma."
                : `ALERTA: Turbiedad Final ${currentTurb.toFixed(1)} UNT, Color Final ${currentColor.toFixed(1)} UPC, Coli Residual ${residualColi.toFixed(1)}. Se requiere optimizar pretratamiento.`
        };
    }

    static calculateModuleDimensions(qmdLps: number, vf: number, numUnits: number, ratioLA: number) {
        if (!qmdLps || numUnits < 1) return null;

        const q_total_m3h = (qmdLps * 3600) / 1000;
        const q_unit_m3h = q_total_m3h / numUnits;
        const area_unit = q_unit_m3h / vf;

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

    // ═══════════════════════════════════════════════════════════════════
    // MEMORIAS DE CÁLCULO DETALLADAS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Genera la memoria de cálculo detallada para la Prefiltración Dinámica (PFD).
     * Incluye: número de módulos, velocidad de paso, TRH, carga hidráulica,
     * pérdidas de carga, y criterios de limpieza.
     */
    static calculatePFDMemoria(
        qmdLps: number,
        quality: { turbidity?: number; color?: number; fecal_coliforms?: number }
    ): ModuleMemoria {
        const q_m3h = qmdLps * 3.6;
        const q_m3s = qmdLps / 1000;
        const turb = quality?.turbidity ?? 50;

        // Velocidad de filtración según calidad del agua
        const vf = turb > 100 ? 3.0 : turb > 50 ? 4.0 : 5.0;
        const numModules = turb > 50 ? 2 : 1;
        const q_per_module_m3h = q_m3h / numModules;

        // Área de filtración
        const area = q_per_module_m3h / vf;
        const ratio = 3; // L:a typical
        const width = Math.sqrt(area / ratio);
        const length = ratio * width;

        // TRH (tiempo de retención hidráulica)
        const bedHeight = PFD_GRANULOMETRY.total_bed_height_m;
        const porosity = 0.38; // promedio ponderado
        const volume_lecho = area * bedHeight;
        const volume_poros = volume_lecho * porosity;
        const trh_min = (volume_poros / (q_per_module_m3h / 60));

        // Carga hidráulica superficial
        const chs = q_per_module_m3h / area;

        // Pérdida de carga
        const hf_lecho = 0.15; // m (típico PFD limpio)
        const hf_entrada_salida = 0.05; // m
        const hf_total = hf_lecho + hf_entrada_salida;

        // Velocidad de paso interparticular
        const v_paso = (q_per_module_m3h / 3600) / (area * porosity) * 1000; // mm/s

        // Frecuencia de limpieza
        const cleaningDays = turb > 100 ? 1 : turb > 50 ? 3 : 7;

        const steps: CalculationStep[] = [
            {
                variable: 'Caudal de diseño (QMD)',
                formula: 'Dato de entrada',
                substitution: `${qmdLps} L/s`,
                result: q_m3h.toFixed(2),
                unit: 'm³/h',
                reference: 'RAS 0330 Art. 40'
            },
            {
                variable: 'Velocidad de filtración (Vf)',
                formula: 'Según turbiedad de entrada: >100 UNT → 3 m/h, 50-100 → 4 m/h, <50 → 5 m/h',
                substitution: `Turbiedad = ${turb} UNT`,
                result: vf.toFixed(1),
                unit: 'm/h',
                reference: 'Guía CINARA — Tabla PFD'
            },
            {
                variable: 'Número de módulos (n)',
                formula: 'n = 2 si turbiedad > 50 UNT, 1 si ≤ 50',
                substitution: `Turbiedad = ${turb} UNT`,
                result: numModules.toString(),
                unit: 'unidades',
                reference: 'Guía CINARA — Criterio de redundancia'
            },
            {
                variable: 'Caudal por módulo',
                formula: 'Q_mod = QMD / n',
                substitution: `${q_m3h.toFixed(2)} / ${numModules}`,
                result: q_per_module_m3h.toFixed(2),
                unit: 'm³/h',
            },
            {
                variable: 'Área de filtración por módulo',
                formula: 'A = Q_mod / Vf',
                substitution: `${q_per_module_m3h.toFixed(2)} / ${vf}`,
                result: area.toFixed(2),
                unit: 'm²',
                reference: 'Dimensionamiento hidráulico estándar'
            },
            {
                variable: 'Ancho del filtro (a)',
                formula: 'a = √(A / (L:a))',
                substitution: `√(${area.toFixed(2)} / ${ratio})`,
                result: width.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Largo del filtro (L)',
                formula: 'L = (L:a) × a',
                substitution: `${ratio} × ${width.toFixed(2)}`,
                result: length.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Volumen del lecho filtrante',
                formula: 'V_lecho = A × H_lecho',
                substitution: `${area.toFixed(2)} × ${bedHeight}`,
                result: volume_lecho.toFixed(3),
                unit: 'm³',
            },
            {
                variable: 'Tiempo de retención hidráulica (TRH)',
                formula: 'TRH = (V_lecho × ε) / Q_mod',
                substitution: `(${volume_lecho.toFixed(3)} × ${porosity}) / (${q_per_module_m3h.toFixed(2)} / 60)`,
                result: trh_min.toFixed(1),
                unit: 'min',
                reference: 'Parámetro de control operativo'
            },
            {
                variable: 'Carga hidráulica superficial (CHS)',
                formula: 'CHS = Q_mod / A',
                substitution: `${q_per_module_m3h.toFixed(2)} / ${area.toFixed(2)}`,
                result: chs.toFixed(2),
                unit: 'm³/(m²·h)',
            },
            {
                variable: 'Velocidad de paso interparticular',
                formula: 'v_paso = Q / (A × ε)',
                substitution: `${(q_per_module_m3h / 3600).toFixed(5)} / (${area.toFixed(2)} × ${porosity})`,
                result: v_paso.toFixed(2),
                unit: 'mm/s',
            },
            {
                variable: 'Pérdida de carga total',
                formula: 'hf = hf_lecho + hf_E/S',
                substitution: `${hf_lecho} + ${hf_entrada_salida}`,
                result: hf_total.toFixed(2),
                unit: 'm',
                reference: 'Condición de lecho limpio'
            },
        ];

        return {
            moduleName: 'Prefiltración Dinámica en Grava (PFD)',
            designFlow: { qmd_lps: qmdLps, qmd_m3h: q_m3h },
            steps,
            designParams: {
                velocidad_filtracion_m_h: vf,
                num_modulos: numModules,
                relacion_largo_ancho: ratio,
                turbiedad_entrada_UNT: turb,
            },
            results: {
                num_modulos: numModules,
                velocidad_filtracion_m_h: vf,
                area_por_modulo_m2: Number(area.toFixed(2)),
                ancho_m: Number(width.toFixed(2)),
                largo_m: Number(length.toFixed(2)),
                trh_min: Number(trh_min.toFixed(1)),
                chs_m3_m2_h: Number(chs.toFixed(2)),
                perdida_carga_m: hf_total,
                frecuencia_limpieza_dias: cleaningDays,
                velocidad_paso_mm_s: Number(v_paso.toFixed(2)),
            },
            compliance: [
                {
                    check: 'Velocidad de filtración',
                    value: `${vf} m/h`,
                    limit: '2-5 m/h',
                    status: (vf >= 2 && vf <= 5) ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Pérdida de carga (lecho limpio)',
                    value: `${hf_total} m`,
                    limit: '< 0.30 m',
                    status: hf_total <= 0.30 ? 'OK' : 'ALERTA'
                },
            ],
            granulometry: PFD_GRANULOMETRY,
        };
    }

    /**
     * Genera la memoria de cálculo detallada para el FGAC.
     */
    static calculateFGACMemoria(
        qmdLps: number,
        quality: { turbidity?: number; color?: number; fecal_coliforms?: number },
        params: { vf: number; num_units: number; ratio_l_a: number }
    ): ModuleMemoria {
        const q_m3h = qmdLps * 3.6;
        const turb = quality?.turbidity ?? 30;

        const q_per_unit = q_m3h / params.num_units;
        const area = q_per_unit / params.vf;
        const width = Math.sqrt(area / params.ratio_l_a);
        const length = params.ratio_l_a * width;
        const real_vf = q_per_unit / (width * length);

        // TRH
        const bedHeight = FGAC_GRANULOMETRY.total_bed_height_m;
        const porosity = 0.36;
        const volume_lecho = area * bedHeight;
        const volume_poros = volume_lecho * porosity;
        const trh_min = (volume_poros / (q_per_unit / 60));

        // Pérdida de carga (mayor que PFD por capas más finas)
        const hf_lecho = 0.30;
        const hf_accesorios = 0.10;
        const hf_total = hf_lecho + hf_accesorios;

        // Carga hidráulica
        const chs = q_per_unit / area;

        // Estructura total
        const h_total = getTotalStructureHeight('fgac');

        // Eficiencia esperada
        const rem_turb_pct = turb > 50 ? '50-70%' : '70-80%';

        const steps: CalculationStep[] = [
            {
                variable: 'Caudal de diseño (QMD)',
                formula: 'Dato de entrada',
                substitution: `${qmdLps} L/s`,
                result: q_m3h.toFixed(2),
                unit: 'm³/h',
                reference: 'RAS 0330 Art. 40'
            },
            {
                variable: 'Velocidad de filtración (Vf)',
                formula: 'Parámetro de diseño (rango: 0.3-0.6 m/h)',
                substitution: `Adoptado: ${params.vf} m/h`,
                result: params.vf.toFixed(2),
                unit: 'm/h',
                reference: 'Guía CINARA — Sección 10.3'
            },
            {
                variable: 'Tipo de filtro',
                formula: 'Ascendente en Capas — seleccionado por eficiencia y facilidad de lavado',
                substitution: 'FGAC vs FGH → FGAC preferido para caudales < 10 L/s y autoconstrucción',
                result: 'Ascendente',
                unit: '',
                reference: 'Guía CINARA — Selección de Esquema'
            },
            {
                variable: 'Número de unidades',
                formula: 'Mínimo 2 para operación continua durante mantenimiento',
                substitution: `Adoptado: ${params.num_units}`,
                result: params.num_units.toString(),
                unit: 'unidades',
                reference: 'Guía CINARA — Criterio mínimo'
            },
            {
                variable: 'Caudal por unidad',
                formula: 'Q_u = QMD / n',
                substitution: `${q_m3h.toFixed(2)} / ${params.num_units}`,
                result: q_per_unit.toFixed(2),
                unit: 'm³/h',
            },
            {
                variable: 'Área de filtración por unidad',
                formula: 'A = Q_u / Vf',
                substitution: `${q_per_unit.toFixed(2)} / ${params.vf}`,
                result: area.toFixed(2),
                unit: 'm²',
            },
            {
                variable: 'Ancho del filtro (a)',
                formula: 'a = √(A / (L:a))',
                substitution: `√(${area.toFixed(2)} / ${params.ratio_l_a})`,
                result: width.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Largo del filtro (L)',
                formula: 'L = (L:a) × a',
                substitution: `${params.ratio_l_a} × ${width.toFixed(2)}`,
                result: length.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Velocidad de filtración real',
                formula: 'Vf_real = Q_u / (a × L)',
                substitution: `${q_per_unit.toFixed(2)} / (${width.toFixed(2)} × ${length.toFixed(2)})`,
                result: real_vf.toFixed(3),
                unit: 'm/h',
            },
            {
                variable: 'Volumen del lecho filtrante',
                formula: 'V = A × H_lecho (5 capas)',
                substitution: `${area.toFixed(2)} × ${bedHeight}`,
                result: volume_lecho.toFixed(2),
                unit: 'm³',
            },
            {
                variable: 'Tiempo de retención hidráulica (TRH)',
                formula: 'TRH = (V × ε) / Q_u',
                substitution: `(${volume_lecho.toFixed(2)} × ${porosity}) / (${q_per_unit.toFixed(2)} / 60)`,
                result: trh_min.toFixed(1),
                unit: 'min',
            },
            {
                variable: 'Carga hidráulica superficial',
                formula: 'CHS = Q_u / A',
                substitution: `${q_per_unit.toFixed(2)} / ${area.toFixed(2)}`,
                result: chs.toFixed(2),
                unit: 'm³/(m²·h)',
            },
            {
                variable: 'Pérdida de carga total',
                formula: 'hf = hf_lecho + hf_accesorios',
                substitution: `${hf_lecho} + ${hf_accesorios}`,
                result: hf_total.toFixed(2),
                unit: 'm',
                reference: 'Condición de lecho limpio'
            },
            {
                variable: 'Altura total estructura',
                formula: 'H = H_lecho + H_sobrenadante + Borde_libre',
                substitution: `${bedHeight} + ${FGAC_GRANULOMETRY.supernatant_height_m} + ${FGAC_GRANULOMETRY.freeboard_m}`,
                result: h_total.toFixed(2),
                unit: 'm',
            },
        ];

        return {
            moduleName: 'Filtro Grueso Ascendente en Capas (FGAC)',
            designFlow: { qmd_lps: qmdLps, qmd_m3h: q_m3h },
            steps,
            designParams: {
                velocidad_filtracion_m_h: params.vf,
                num_unidades: params.num_units,
                relacion_largo_ancho: params.ratio_l_a,
                turbiedad_entrada_UNT: turb,
            },
            results: {
                area_por_unidad_m2: Number(area.toFixed(2)),
                ancho_m: Number(width.toFixed(2)),
                largo_m: Number(length.toFixed(2)),
                vf_real_m_h: Number(real_vf.toFixed(3)),
                trh_min: Number(trh_min.toFixed(1)),
                chs_m3_m2_h: Number(chs.toFixed(2)),
                perdida_carga_m: hf_total,
                altura_estructura_m: Number(h_total.toFixed(2)),
                remocion_turbiedad_esperada: rem_turb_pct,
            },
            compliance: [
                {
                    check: 'Velocidad de filtración (Vf)',
                    value: `${params.vf} m/h`,
                    limit: '0.3 - 0.6 m/h',
                    status: (params.vf >= 0.3 && params.vf <= 0.6) ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Área por unidad',
                    value: `${area.toFixed(2)} m²`,
                    limit: '≤ 20 m²',
                    status: area <= 20 ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Mínimo de unidades',
                    value: `${params.num_units}`,
                    limit: '≥ 2',
                    status: params.num_units >= 2 ? 'OK' : 'ALERTA'
                },
            ],
            granulometry: FGAC_GRANULOMETRY,
        };
    }

    /**
     * Genera la memoria de cálculo detallada para el FLA.
     */
    static calculateFLAMemoria(
        qmdLps: number,
        params: { vf: number; num_units: number; ratio_l_a: number }
    ): ModuleMemoria {
        const q_m3h = qmdLps * 3.6;

        const q_per_unit = q_m3h / params.num_units;
        const area_unit = q_per_unit / params.vf;
        const area_total = area_unit * params.num_units;
        const width = Math.sqrt(area_unit / params.ratio_l_a);
        const length = params.ratio_l_a * width;
        const real_vf = q_per_unit / (width * length);

        // Perfil estratigráfico
        const sandHeight = 0.80;
        const supportHeight = 0.25; // CINARA: 0.15 + 0.05 + 0.05 = 0.25m (La Paz Tabla 9.4)
        const supernatant = FLA_GRANULOMETRY.supernatant_height_m;
        const freeboard = FLA_GRANULOMETRY.freeboard_m;
        const h_total = sandHeight + supportHeight + supernatant + freeboard;

        // TRH en el lecho de arena
        const sand_porosity = 0.40;
        const vol_sand = area_unit * sandHeight;
        const vol_poros = vol_sand * sand_porosity;
        const trh_min = (vol_poros / (q_per_unit / 60));

        // Carga hidráulica
        const chs = q_per_unit / area_unit;

        // Pérdida de carga
        const hf_sand_clean = 0.05; // m (lecho limpio)
        const hf_sand_dirty = 1.0;  // m (antes del raspado)
        const hf_support = 0.02;

        // Tiempo de maduración
        const maturation_days = 21; // típico para Colombia

        const steps: CalculationStep[] = [
            {
                variable: 'Caudal de diseño (QMD)',
                formula: 'Dato de entrada',
                substitution: `${qmdLps} L/s`,
                result: q_m3h.toFixed(2),
                unit: 'm³/h',
                reference: 'RAS 0330 Art. 40'
            },
            {
                variable: 'Velocidad de filtración (Vf)',
                formula: 'Parámetro de diseño (rango normativo: 0.10 - 0.20 m/h)',
                substitution: `Adoptado: ${params.vf} m/h`,
                result: params.vf.toFixed(2),
                unit: 'm/h',
                reference: 'RAS 0330 Art. 142 / Guía CINARA'
            },
            {
                variable: 'Número de unidades',
                formula: 'Mínimo 2 para operación continua durante raspado',
                substitution: `Adoptado: ${params.num_units}`,
                result: params.num_units.toString(),
                unit: 'unidades',
                reference: 'RAS 0330 Art. 143'
            },
            {
                variable: 'Caudal por unidad',
                formula: 'Q_u = QMD / n',
                substitution: `${q_m3h.toFixed(2)} / ${params.num_units}`,
                result: q_per_unit.toFixed(2),
                unit: 'm³/h',
            },
            {
                variable: 'Área de filtración por unidad',
                formula: 'A_u = Q_u / Vf',
                substitution: `${q_per_unit.toFixed(2)} / ${params.vf}`,
                result: area_unit.toFixed(2),
                unit: 'm²',
            },
            {
                variable: 'Área total de filtración',
                formula: 'A_total = A_u × n',
                substitution: `${area_unit.toFixed(2)} × ${params.num_units}`,
                result: area_total.toFixed(2),
                unit: 'm²',
            },
            {
                variable: 'Ancho del filtro (a)',
                formula: 'a = √(A_u / (L:a))',
                substitution: `√(${area_unit.toFixed(2)} / ${params.ratio_l_a})`,
                result: width.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Largo del filtro (L)',
                formula: 'L = (L:a) × a',
                substitution: `${params.ratio_l_a} × ${width.toFixed(2)}`,
                result: length.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Velocidad de filtración real',
                formula: 'Vf_real = Q_u / (a × L)',
                substitution: `${q_per_unit.toFixed(2)} / (${width.toFixed(2)} × ${length.toFixed(2)})`,
                result: real_vf.toFixed(3),
                unit: 'm/h',
            },
            {
                variable: 'Profundidad del lecho de arena',
                formula: 'Normativo: 0.80 m (mín. 0.60 m después de raspados)',
                substitution: 'Arena sílice D10 = 0.15-0.30 mm, Cu ≤ 2.0',
                result: sandHeight.toFixed(2),
                unit: 'm',
                reference: 'RAS 0330 Art. 144 / Guía CINARA'
            },
            {
                variable: 'Altura de capas de soporte',
                formula: 'Σ espesores (grava gruesa + media + fina)',
                substitution: '0.15 + 0.05 + 0.05 (CINARA / La Paz Tabla 9.4)',
                result: supportHeight.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Carga hidráulica (agua sobrenadante)',
                formula: 'Regulada por vertedero de salida',
                substitution: `Altura: ${supernatant} m`,
                result: supernatant.toFixed(2),
                unit: 'm',
                reference: 'Garantiza distribución uniforme sobre el lecho'
            },
            {
                variable: 'Altura total de la caja (estructura)',
                formula: 'H = H_arena + H_soporte + H_agua + Borde_libre',
                substitution: `${sandHeight} + ${supportHeight} + ${supernatant} + ${freeboard}`,
                result: h_total.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'TRH en el lecho de arena',
                formula: 'TRH = (V_arena × ε) / Q_u',
                substitution: `(${vol_sand.toFixed(2)} × ${sand_porosity}) / (${q_per_unit.toFixed(2)} / 60)`,
                result: trh_min.toFixed(1),
                unit: 'min',
            },
            {
                variable: 'Carga hidráulica superficial (CHS)',
                formula: 'CHS = Q_u / A_u',
                substitution: `${q_per_unit.toFixed(2)} / ${area_unit.toFixed(2)}`,
                result: chs.toFixed(3),
                unit: 'm³/(m²·h)',
            },
            {
                variable: 'Pérdida de carga (lecho limpio)',
                formula: 'Pérdida inicial con arena nueva',
                substitution: 'Típico para arena sílice D10=0.20mm',
                result: hf_sand_clean.toFixed(2),
                unit: 'm',
            },
            {
                variable: 'Pérdida de carga máxima (antes de raspado)',
                formula: 'Indicador de necesidad de raspado',
                substitution: 'Cuando hf ≥ 1.0 m → programar raspado',
                result: hf_sand_dirty.toFixed(2),
                unit: 'm',
                reference: 'Criterio operativo de mantenimiento'
            },
            {
                variable: 'Tiempo de maduración biológica',
                formula: 'Período necesario para formación de Schmutzdecke',
                substitution: 'Condiciones tropicales (15-25°C)',
                result: maturation_days.toString(),
                unit: 'días',
                reference: 'Guía CINARA — Protocolo de arranque FLA'
            },
        ];

        return {
            moduleName: 'Filtro Lento de Arena (FLA)',
            designFlow: { qmd_lps: qmdLps, qmd_m3h: q_m3h },
            steps,
            designParams: {
                velocidad_filtracion_m_h: params.vf,
                num_unidades: params.num_units,
                relacion_largo_ancho: params.ratio_l_a,
            },
            results: {
                area_total_m2: Number(area_total.toFixed(2)),
                area_por_unidad_m2: Number(area_unit.toFixed(2)),
                ancho_m: Number(width.toFixed(2)),
                largo_m: Number(length.toFixed(2)),
                vf_real_m_h: Number(real_vf.toFixed(3)),
                profundidad_arena_m: sandHeight,
                altura_total_estructura_m: Number(h_total.toFixed(2)),
                trh_min: Number(trh_min.toFixed(1)),
                chs_m3_m2_h: Number(chs.toFixed(3)),
                tiempo_maduracion_dias: maturation_days,
                hf_limpio_m: hf_sand_clean,
                hf_maximo_m: hf_sand_dirty,
            },
            compliance: [
                {
                    check: 'Velocidad de filtración (Vf)',
                    value: `${params.vf} m/h`,
                    limit: '0.10 - 0.30 m/h (CINARA Tabla 6.4)',
                    status: (params.vf >= 0.10 && params.vf <= 0.30) ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Área por unidad',
                    value: `${area_unit.toFixed(2)} m²`,
                    limit: '≤ 100 m²',
                    status: area_unit <= 100 ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Mínimo de unidades',
                    value: `${params.num_units}`,
                    limit: '≥ 2',
                    status: params.num_units >= 2 ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Profundidad del lecho de arena',
                    value: `${sandHeight} m`,
                    limit: '≥ 0.50 m (mín. operativo con pretratamiento FIME)',
                    status: sandHeight >= 0.50 ? 'OK' : 'ALERTA'
                },
            ],
            granulometry: FLA_GRANULOMETRY,
        };
    }

    /**
     * Genera la memoria de cálculo detallada para Desinfección y Almacenamiento.
     * Incluye: CT normativo, cámara de contacto, tanque de almacenamiento,
     * dosificación detallada y cumplimiento regulatorio.
     */
    /**
     * Obtiene el CT requerido según RAS-2000 Tabla C.8.2.A
     * basado en pH y temperatura del agua.
     */
    static getCTRequired(ph: number = 7.0, temperature: number = 20): number {
        // RAS-2000 Tabla C.8.2.A — CT requerido (mg·min/L) para inactivación
        // de Giardia (2-log) con cloro libre
        if (ph <= 7.0) {
            return temperature >= 20 ? 16 : temperature >= 15 ? 24 : 32;
        } else if (ph <= 7.5) {
            return temperature >= 20 ? 22 : temperature >= 15 ? 32 : 45;
        } else if (ph <= 8.0) {
            return temperature >= 20 ? 32 : temperature >= 15 ? 45 : 64;
        } else {
            return temperature >= 20 ? 45 : temperature >= 15 ? 64 : 90;
        }
    }

    static calculateDisinfectionMemoria(
        qmdLps: number,
        population: number,
        params: { contact_time: number; chlorine_dose: number; chlorine_concentration: number },
        quality?: { ph?: number; temperature?: number }
    ): DisinfectionMemoria {
        const q_m3h = qmdLps * 3.6;
        const q_m3min = (qmdLps * 60) / 1000;
        const q_m3day = qmdLps * 86.4;

        // Volumen cámara de contacto
        const vol_contact = q_m3min * params.contact_time;

        // CT normativo según RAS-2000 Tabla C.8.2.A (adaptativo a pH y T)
        const ct_required = this.getCTRequired(quality?.ph, quality?.temperature);
        const ct_provided = params.chlorine_dose * params.contact_time;
        const ct_compliant = ct_provided >= ct_required;

        // Dosificación
        const flow_l_day = qmdLps * 86400;
        const chlorine_pure_kg_day = (flow_l_day * params.chlorine_dose) / 1000000;
        const commercial_kg_day = chlorine_pure_kg_day / (params.chlorine_concentration / 100);
        const commercial_kg_month = commercial_kg_day * 30;

        // Tanque de almacenamiento (RAS 0330 Art. 81)
        // Para comunidades rurales: V = QMD × factor de regulación (8-12h)
        const regulation_hours = 8; // horas para regulación (mínimo RAS 0330)
        const vol_storage = q_m3h * regulation_hours;

        // Dimensiones sugeridas del tanque (rectangular)
        const storage_depth = 2.5; // m (profundidad útil típica)
        const storage_area = vol_storage / storage_depth;
        const storage_width = Math.sqrt(storage_area / 2); // ratio 2:1
        const storage_length = 2 * storage_width;

        // Residual objetivo
        const residual_min = 0.3; // mg/L
        const residual_max = 2.0; // mg/L

        // Dimensiones sugeridas cámara de contacto
        const contact_depth = 1.5; // m
        const contact_area = vol_contact / contact_depth;
        const contact_width = Math.sqrt(contact_area / 3); // ratio 3:1 (tipo serpentín)
        const contact_length = 3 * contact_width;

        const steps: CalculationStep[] = [
            {
                variable: 'Caudal de diseño (QMD)',
                formula: 'Dato de entrada',
                substitution: `${qmdLps} L/s`,
                result: q_m3h.toFixed(2),
                unit: 'm³/h',
                reference: 'RAS 0330 Art. 40'
            },
            {
                variable: 'Producción diaria',
                formula: 'Q_day = QMD × 86.4',
                substitution: `${qmdLps} × 86.4`,
                result: q_m3day.toFixed(1),
                unit: 'm³/día',
            },
            // --- Cámara de contacto ---
            {
                variable: 'Tiempo de contacto (t)',
                formula: 'Parámetro de diseño (mín. 30 min RAS)',
                substitution: `Adoptado: ${params.contact_time} min`,
                result: params.contact_time.toString(),
                unit: 'min',
                reference: 'RAS 0330 Art. 130'
            },
            {
                variable: 'Volumen cámara de contacto',
                formula: 'V_contacto = Q × t',
                substitution: `${q_m3min.toFixed(4)} m³/min × ${params.contact_time} min`,
                result: vol_contact.toFixed(2),
                unit: 'm³',
            },
            {
                variable: 'Profundidad útil cámara',
                formula: 'Adoptado por criterio constructivo',
                substitution: `h = ${contact_depth} m`,
                result: contact_depth.toFixed(1),
                unit: 'm',
            },
            {
                variable: 'Dimensiones cámara (serpentín)',
                formula: 'A = V/h, ancho = √(A/3), largo = 3 × ancho',
                substitution: `A=${contact_area.toFixed(2)}m², a=${contact_width.toFixed(2)}m`,
                result: `${contact_width.toFixed(2)} × ${contact_length.toFixed(2)}`,
                unit: 'm',
            },
            // --- CT Normativo ---
            {
                variable: 'CT requerido (Giardia 2-log)',
                formula: 'RAS-2000 Tabla C.8.2.A',
                substitution: `pH=${quality?.ph ?? 7.0}, T=${quality?.temperature ?? 20}°C`,
                result: ct_required.toString(),
                unit: 'mg·min/L',
                reference: 'RAS-2000 Tabla C.8.2.A / Verificación normativa'
            },
            {
                variable: 'CT proporcionado',
                formula: 'CT = Dosis × t_contacto',
                substitution: `${params.chlorine_dose} × ${params.contact_time}`,
                result: ct_provided.toFixed(1),
                unit: 'mg·min/L',
            },
            {
                variable: 'Cumplimiento CT',
                formula: 'CT_proporcionado ≥ CT_requerido',
                substitution: `${ct_provided.toFixed(1)} ≥ ${ct_required}`,
                result: ct_compliant ? 'CUMPLE' : 'NO CUMPLE',
                unit: '',
                reference: 'Verificación normativa obligatoria'
            },
            // --- Dosificación ---
            {
                variable: 'Dosis de cloro objetivo',
                formula: 'Parámetro de diseño',
                substitution: `${params.chlorine_dose} mg/L`,
                result: params.chlorine_dose.toFixed(1),
                unit: 'mg/L',
                reference: 'Res. 2115/2007 — Residual: 0.3-2.0 mg/L'
            },
            {
                variable: 'Concentración del producto comercial',
                formula: 'HTH (Hipoclorito de Calcio)',
                substitution: `${params.chlorine_concentration}% de cloro activo`,
                result: params.chlorine_concentration.toString(),
                unit: '%',
            },
            {
                variable: 'Consumo diario de cloro puro',
                formula: 'Cl_puro = (Q_día × Dosis) / 10⁶',
                substitution: `(${flow_l_day.toFixed(0)} × ${params.chlorine_dose}) / 10⁶`,
                result: chlorine_pure_kg_day.toFixed(4),
                unit: 'kg/día',
            },
            {
                variable: 'Consumo diario de producto comercial',
                formula: 'Cl_comercial = Cl_puro / (Concentración/100)',
                substitution: `${chlorine_pure_kg_day.toFixed(4)} / ${params.chlorine_concentration / 100}`,
                result: commercial_kg_day.toFixed(3),
                unit: 'kg/día',
            },
            {
                variable: 'Consumo mensual de producto comercial',
                formula: 'Cl_mes = Cl_día × 30',
                substitution: `${commercial_kg_day.toFixed(3)} × 30`,
                result: commercial_kg_month.toFixed(2),
                unit: 'kg/mes',
            },
            // --- Tanque de almacenamiento ---
            {
                variable: 'Factor de regulación',
                formula: 'Horas de reserva (RAS 0330 Art. 81)',
                substitution: `${regulation_hours} horas para comunidad rural`,
                result: regulation_hours.toString(),
                unit: 'horas',
                reference: 'RAS 0330 Art. 81'
            },
            {
                variable: 'Volumen tanque de almacenamiento',
                formula: 'V_almac = Q_m3h × t_regulación',
                substitution: `${q_m3h.toFixed(2)} × ${regulation_hours}`,
                result: vol_storage.toFixed(1),
                unit: 'm³',
            },
            {
                variable: 'Dimensiones tanque (rectangular)',
                formula: 'h=2.5m, ratio 2:1, A=V/h, a=√(A/2), L=2a',
                substitution: `A=${storage_area.toFixed(2)}m², a=${storage_width.toFixed(2)}m`,
                result: `${storage_width.toFixed(2)} × ${storage_length.toFixed(2)} × ${storage_depth}`,
                unit: 'm',
            },
        ];

        return {
            moduleName: 'Desinfección y Almacenamiento',
            designFlow: { qmd_lps: qmdLps, qmd_m3h: q_m3h },
            steps,
            designParams: {
                tiempo_contacto_min: params.contact_time,
                dosis_cloro_mg_l: params.chlorine_dose,
                concentracion_producto_pct: params.chlorine_concentration,
                poblacion_diseno: population,
            },
            results: {
                vol_camara_contacto_m3: Number(vol_contact.toFixed(2)),
                dim_camara_m: `${contact_width.toFixed(2)} × ${contact_length.toFixed(2)} × ${contact_depth}`,
                ct_proporcionado: Number(ct_provided.toFixed(1)),
                ct_cumple: ct_compliant ? 'SÍ' : 'NO',
                consumo_diario_kg: Number(commercial_kg_day.toFixed(3)),
                consumo_mensual_kg: Number(commercial_kg_month.toFixed(2)),
                residual_requerido_mg_l: `${residual_min} - ${residual_max}`,
                vol_almacenamiento_m3: Number(vol_storage.toFixed(1)),
                dim_tanque_m: `${storage_width.toFixed(2)} × ${storage_length.toFixed(2)} × ${storage_depth}`,
                tiempo_regulacion_h: regulation_hours,
            },
            compliance: [
                {
                    check: 'CT normativo (Giardia 2-log)',
                    value: `${ct_provided.toFixed(1)} mg·min/L`,
                    limit: `≥ ${ct_required} mg·min/L`,
                    status: ct_compliant ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Tiempo de contacto mínimo',
                    value: `${params.contact_time} min`,
                    limit: '≥ 30 min',
                    status: params.contact_time >= 30 ? 'OK' : 'ALERTA'
                },
                {
                    check: 'Cloro residual en red',
                    value: `${residual_min} - ${residual_max} mg/L`,
                    limit: '0.3 - 2.0 mg/L (Res. 2115)',
                    status: 'OK'
                },
            ],
            ct_compliance: {
                ct_required,
                ct_provided,
                compliant: ct_compliant,
            },
            storage: {
                volume_m3: Number(vol_storage.toFixed(1)),
                retention_hours: regulation_hours,
                population,
            },
        };
    }
}
