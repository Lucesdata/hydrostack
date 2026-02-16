/**
 * MOTOR DE OPERACIÓN Y MANTENIMIENTO (O&M) — FiME
 * 
 * Genera protocolos de operación y mantenimiento adaptados
 * al proyecto específico de tratamiento FiME.
 * Base normativa: Guía CINARA + RAS 0330 (Resolución 0330 de 2017)
 */

// ─── TYPES ──────────────────────────────────────────────────────────────

export interface ProtocolStep {
    order: number;
    action: string;
    detail: string;
    frequency?: string;
    responsible?: string;
    warning?: string;
}

export interface WashingProtocol {
    moduleName: string;
    method: string;
    frequency: string;
    duration: string;
    steps: ProtocolStep[];
    indicators: string[];
    warnings: string[];
}

export interface MaintenanceSchedule {
    task: string;
    frequency: string;
    responsible: string;
    materials: string;
    notes: string;
}

export interface QualityControlProcedure {
    parameter: string;
    method: string;
    frequency: string;
    acceptable_range: string;
    action_if_exceeded: string;
}

export interface ContingencyProtocol {
    event: string;
    severity: 'ALTA' | 'MEDIA' | 'BAJA';
    immediate_action: string;
    corrective_action: string;
    prevention: string;
}

// ─── MOTOR PRINCIPAL ────────────────────────────────────────────────────

export class FimeOymEngine {

    /**
     * Protocolo de arranque inicial del sistema FiME.
     */
    static generateStartupProtocol(projectData: {
        modules: string[];
        qmd_lps?: number;
    }): ProtocolStep[] {
        const steps: ProtocolStep[] = [
            {
                order: 1,
                action: 'Inspección Física de Estructuras',
                detail: 'Verificar integridad de muros, losas, tuberías, válvulas y accesorios. Confirmar ausencia de fisuras, fugas o defectos constructivos.',
                responsible: 'Ingeniero residente',
            },
            {
                order: 2,
                action: 'Verificación del Lecho Filtrante',
                detail: 'Confirmar granulometría correcta según diseño (D10, Cu). Verificar espesores de cada capa. Realizar prueba de permeabilidad in situ.',
                responsible: 'Ingeniero sanitario',
                warning: 'NO omitir este paso — un lecho mal graduado comprometerá toda la eficiencia del sistema.',
            },
            {
                order: 3,
                action: 'Lavado Inicial de Lechos',
                detail: 'Cargar cada unidad filtrante con agua limpia de fondo hacia arriba hasta desborde. Repetir 3-5 veces hasta que el agua de lavado salga clara.',
                responsible: 'Operador de planta',
            },
            {
                order: 4,
                action: 'Prueba Hidráulica de Estanqueidad',
                detail: 'Llenar cada unidad al nivel máximo. Mantener 24 horas. Verificar que el descenso no supere 5 mm en 24 horas.',
                responsible: 'Ingeniero residente',
            },
            {
                order: 5,
                action: 'Calibración de Caudales',
                detail: `Ajustar válvulas para distribuir el QMD (${projectData.qmd_lps?.toFixed(2) ?? 'N/A'} L/s) uniformemente entre las unidades paralelas. Verificar con medidor de caudal portátil.`,
                responsible: 'Operador de planta',
            },
            {
                order: 6,
                action: 'Arranque Secuencial',
                detail: 'Iniciar el flujo de agua desde el pretratamiento (PFD) hacia las siguientes etapas. Arrancar una unidad a la vez. Monitorear el comportamiento hidráulico.',
                responsible: 'Operador de planta',
            },
            {
                order: 7,
                action: 'Período de Maduración Biológica (FLA)',
                detail: 'Operar el FLA a caudal reducido (50% del QMD) durante 15-30 días para permitir la formación de la biopelícula (Schmutzdecke). NO distribuir agua al público durante este período.',
                responsible: 'Operador de planta',
                warning: 'El agua NO es potable hasta que la biopelícula esté madura. Mínimo 15 días en clima tropical.',
            },
            {
                order: 8,
                action: 'Inicio de Desinfección',
                detail: 'Activar la dosificación de cloro. Verificar cloro residual en salida del tanque: 0.3-2.0 mg/L. Ajustar dosis según demanda de cloro.',
                responsible: 'Operador de planta',
            },
            {
                order: 9,
                action: 'Muestreo de Verificación',
                detail: 'Tomar muestras en puntos de control: salida PFD, salida FGAC, salida FLA, salida tanque de contacto, y red de distribución. Enviar a laboratorio certificado.',
                responsible: 'Ingeniero sanitario',
            },
            {
                order: 10,
                action: 'Habilitación para Distribución',
                detail: 'Si los resultados de laboratorio cumplen Resolución 2115/2007 (turbiedad ≤ 2 UNT, cloro residual 0.3-2.0 mg/L, ausencia de coliformes), habilitar la distribución pública.',
                responsible: 'Ingeniero sanitario / Autoridad de salud',
                warning: 'Documentar todos los resultados. Esta acta de arranque es clave para la auditoría.',
            },
        ];

        return steps;
    }

    /**
     * Protocolos de lavado por módulo.
     */
    static generateWashingProtocol(moduleKey: string): WashingProtocol {
        switch (moduleKey) {
            case 'pfd':
            case 'fime_grueso_dinamico':
                return {
                    moduleName: 'Prefiltración Dinámica (PFD)',
                    method: 'Descarga rápida de fondo (shock hidráulico)',
                    frequency: 'Cada 1-7 días según turbiedad de entrada',
                    duration: '5-10 minutos por unidad',
                    steps: [
                        { order: 1, action: 'Cerrar entrada de agua cruda', detail: 'Cerrar válvula de entrada al módulo PFD que será lavado.' },
                        { order: 2, action: 'Abrir válvula de desagüe de fondo', detail: 'Apertura rápida y completa de la válvula de compuerta (≥ 4") del fondo del filtro.' },
                        { order: 3, action: 'Observar agua de lavado', detail: 'El agua saldrá turbia. Mantener abierto hasta que el agua se aclare (5-10 min).' },
                        { order: 4, action: 'Cerrar desagüe', detail: 'Cerrar válvula de fondo una vez el agua esté clara.' },
                        { order: 5, action: 'Abrir entrada', detail: 'Restablecer el flujo de agua cruda. Verificar nivel de operación normal.' },
                    ],
                    indicators: [
                        'Aumento de turbiedad en el efluente > 5 UNT',
                        'Disminución del caudal efluente > 20%',
                        'Nivel de agua sobre el lecho > sobrenadante máximo',
                    ],
                    warnings: [
                        'Nunca lavar todas las unidades simultáneamente',
                        'Tiempo mínimo entre lavados de unidades paralelas: 2 horas',
                    ],
                };

            case 'fgac':
            case 'fime_grueso_ascendente':
                return {
                    moduleName: 'Filtro Grueso Ascendente en Capas (FGAC)',
                    method: 'Descarga rápida de fondo con fluidificación parcial',
                    frequency: 'Cada 2-4 semanas según carga de sólidos',
                    duration: '15-20 minutos por unidad',
                    steps: [
                        { order: 1, action: 'Cerrar entrada al FGAC', detail: 'Cerrar válvula de ingreso y desviar flujo a la otra unidad.' },
                        { order: 2, action: 'Drenar parcialmente', detail: 'Abrir válvula de desagüe superior hasta el nivel del lecho filtrante.' },
                        { order: 3, action: 'Descarga de fondo rápida', detail: 'Abrir completamente la válvula de fondo (≥ 4"). El golpe hidráulico fluidifica las capas y libera los sólidos retenidos.' },
                        { order: 4, action: 'Repetir si necesario', detail: 'Si el agua de desagüe sigue turbia después de 10 min, cerrar y repetir el ciclo.' },
                        { order: 5, action: 'Rellenar', detail: 'Cerrar desagüe. Abrir entrada lentamente. Verificar que la distribución del flujo sea uniforme.' },
                        { order: 6, action: 'Período de estabilización', detail: 'Desechar las primeras 10 minutos de efluente (recirculación o desecho) antes de reconectar a la línea de producción.' },
                    ],
                    indicators: [
                        'Pérdida de carga > 0.40 m (medida con piezómetros)',
                        'Efluente con turbiedad > 10 UNT sostenida',
                        'Tiempo desde último lavado > 4 semanas',
                    ],
                    warnings: [
                        'No usar lavado a contracorriente con agua a presión — puede desplazar las capas',
                        'Si las capas se mezclan, se debe reconstruir el lecho manualmente',
                        'Documentar fecha y hora de cada lavado en la bitácora',
                    ],
                };

            case 'fla':
            case 'fime_lento_arena':
                return {
                    moduleName: 'Filtro Lento de Arena (FLA)',
                    method: 'Raspado manual superficial de la Schmutzdecke',
                    frequency: 'Cada 30-90 días (según pérdida de carga)',
                    duration: '4-8 horas para una unidad completa',
                    steps: [
                        { order: 1, action: 'Cerrar entrada al FLA', detail: 'Cerrar válvula de ingreso a la unidad que será raspada. Desviar todo el caudal a la(s) otra(s) unidad(es).' },
                        { order: 2, action: 'Drenar agua sobrenadante', detail: 'Drenar cuidadosamente hasta que el nivel quede 10-20 cm por debajo de la superficie de la arena.' },
                        { order: 3, action: 'Raspado manual', detail: 'Retirar los 1-2 cm superiores de arena con una pala plana. Trabajar por franjas para mantener la superficie nivelada.', warning: 'NO caminar directamente sobre la arena — usar tablas de apoyo.' },
                        { order: 4, action: 'Limpieza de la arena retirada', detail: 'Lavar la arena extraída con agua limpia y secar al sol. Almacenar para reposición futura.' },
                        { order: 5, action: 'Nivelación', detail: 'Verificar que la superficie quede plana y nivelada. Usar nivel de albañil.' },
                        { order: 6, action: 'Re-llenado lento', detail: 'Llenar la unidad lentamente desde el fondo (si es posible) o por encima con difusor para no perturbar la arena.' },
                        { order: 7, action: 'Período de maduración', detail: 'Operar a caudal reducido durante 7-14 días para re-formación parcial de la biopelícula.', warning: 'El agua de esta unidad NO debe enviarse a la red durante la maduración.' },
                    ],
                    indicators: [
                        'Pérdida de carga acumulada ≥ 1.0 m',
                        'Caudal de producción disminuye > 30%',
                        'Profundidad de arena remanente: verificar que no sea < 0.60 m',
                    ],
                    warnings: [
                        'NUNCA lavar con retrolavado a presión — destruye la biopelícula',
                        'Si la arena baja a < 0.60 m, se debe reponer arena con la arena lavada almacenada',
                        'Después de 10-15 raspados, se debe reconstituir el lecho completo',
                        'Llevar registro de la profundidad de arena después de cada raspado',
                    ],
                };

            default:
                return {
                    moduleName: 'Módulo desconocido',
                    method: 'N/A',
                    frequency: 'N/A',
                    duration: 'N/A',
                    steps: [],
                    indicators: [],
                    warnings: [],
                };
        }
    }

    /**
     * Calendario de mantenimiento rutinario.
     */
    static generateRoutineMaintenanceSchedule(): MaintenanceSchedule[] {
        return [
            {
                task: 'Medición de turbiedad (entrada y salida de cada unidad)',
                frequency: 'Diario',
                responsible: 'Operador',
                materials: 'Turbidímetro portátil',
                notes: 'Registrar en bitácora. Alerta si salida > 2 UNT.',
            },
            {
                task: 'Medición de cloro residual en red',
                frequency: 'Diario',
                responsible: 'Operador',
                materials: 'Kit de cloro DPD',
                notes: 'Verificar 0.3-2.0 mg/L. Si < 0.3, ajustar dosificación.',
            },
            {
                task: 'Inspección visual de flujos y niveles',
                frequency: 'Diario',
                responsible: 'Operador',
                materials: 'Regla graduada',
                notes: 'Verificar distribución uniforme de caudal entre unidades.',
            },
            {
                task: 'Limpieza de canal de distribución y vertederos',
                frequency: 'Semanal',
                responsible: 'Operador',
                materials: 'Cepillo, balde',
                notes: 'Remover algas, hojas y sedimentos.',
            },
            {
                task: 'Lavado de PFD (descarga de fondo)',
                frequency: 'Cada 1-7 días (según turbiedad)',
                responsible: 'Operador',
                materials: 'Llave para válvula de compuerta',
                notes: 'Ver protocolo de lavado PFD.',
            },
            {
                task: 'Lavado de FGAC',
                frequency: 'Cada 2-4 semanas',
                responsible: 'Operador',
                materials: 'Llave para válvula de compuerta',
                notes: 'Ver protocolo de lavado FGAC.',
            },
            {
                task: 'Inspección de la superficie del FLA',
                frequency: 'Semanal',
                responsible: 'Operador',
                materials: 'Visual',
                notes: 'Verificar formación de biopelícula uniforme. Detectar grietas o canales.',
            },
            {
                task: 'Raspado del FLA',
                frequency: 'Cada 30-90 días (según pérdida de carga)',
                responsible: 'Operador + supervisor',
                materials: 'Pala plana, tablas de apoyo, balde',
                notes: 'Ver protocolo de raspado FLA. Registrar profundidad remanente.',
            },
            {
                task: 'Inspección de válvulas y tuberías',
                frequency: 'Mensual',
                responsible: 'Operador',
                materials: 'Llave, grasa, repuestos',
                notes: 'Lubricar, verificar fugas. Reemplazar empaques si necesario.',
            },
            {
                task: 'Limpieza del tanque de almacenamiento',
                frequency: 'Trimestral',
                responsible: 'Operador + supervisor',
                materials: 'Bomba, cepillo, hipoclorito',
                notes: 'Drenar, limpiar sedimentos, desinfectar con solución de cloro.',
            },
            {
                task: 'Análisis de laboratorio completo',
                frequency: 'Mensual (mínimo)',
                responsible: 'Ingeniero sanitario',
                materials: 'Muestras para laboratorio certificado',
                notes: 'Turbiedad, color, pH, alcalinidad, coliformes totales y fecales, cloro residual.',
            },
            {
                task: 'Verificación de profundidad de arena (FLA)',
                frequency: 'Después de cada raspado',
                responsible: 'Operador',
                materials: 'Vara graduada',
                notes: 'Si arena < 0.60 m, programar reposición con arena lavada.',
            },
        ];
    }

    /**
     * Procedimientos de control de calidad del agua.
     */
    static generateQualityControlProcedures(): QualityControlProcedure[] {
        return [
            {
                parameter: 'Turbiedad',
                method: 'Turbidímetro nefelométrico (NTU/UNT)',
                frequency: 'Diario — salida de cada módulo',
                acceptable_range: '≤ 2 UNT (agua tratada)',
                action_if_exceeded: 'Verificar estado del lecho filtrante. Si persiste > 2 UNT por 2 días, programar lavado/raspado.',
            },
            {
                parameter: 'Color aparente',
                method: 'Comparador visual (Pt-Co/UPC)',
                frequency: 'Diario',
                acceptable_range: '≤ 15 UPC',
                action_if_exceeded: 'Posible paso de material fino. Verificar granulometría del lecho.',
            },
            {
                parameter: 'pH',
                method: 'Medidor de pH o papel indicador',
                frequency: 'Diario',
                acceptable_range: '6.5 – 9.0',
                action_if_exceeded: 'Verificar fuente. pH bajo puede afectar la eficiencia de la cloración.',
            },
            {
                parameter: 'Cloro residual libre',
                method: 'Kit DPD (N,N-dietil-p-fenilendiamina)',
                frequency: 'Diario — salida del tanque y puntos de la red',
                acceptable_range: '0.3 – 2.0 mg/L',
                action_if_exceeded: '< 0.3: aumentar dosis. > 2.0: reducir dosis. Verificar equipo dosificador.',
            },
            {
                parameter: 'Coliformes totales',
                method: 'Filtración por membrana o sustrato cromogénico',
                frequency: 'Mensual',
                acceptable_range: '0 UFC/100 mL',
                action_if_exceeded: 'Verificar integridad del tren de tratamiento. Revisar dosificación de cloro. Notificar a autoridad sanitaria si persiste.',
            },
            {
                parameter: 'Coliformes fecales (E. coli)',
                method: 'Filtración por membrana o sustrato cromogénico',
                frequency: 'Mensual',
                acceptable_range: '0 UFC/100 mL',
                action_if_exceeded: 'ALERTA SANITARIA. Suspender distribución. Aumentar cloración. Identificar fuente de contaminación.',
            },
        ];
    }

    /**
     * Protocolos de contingencia.
     */
    static generateContingencyProtocols(): ContingencyProtocol[] {
        return [
            {
                event: 'Turbiedad de fuente > 150 UNT (evento de crecida)',
                severity: 'ALTA',
                immediate_action: 'Cerrar captación. No alimentar el sistema FiME con agua de turbiedad > 150 UNT.',
                corrective_action: 'Esperar a que baje la turbiedad. Si la comunidad tiene reserva, usar tanque de almacenamiento.',
                prevention: 'Diseñar captación con rejillas y desarenador para retener sólidos gruesos.',
            },
            {
                event: 'Contaminación microbiológica en efluente',
                severity: 'ALTA',
                immediate_action: 'Suspender distribución inmediatamente. Aumentar dosis de cloro a 5 mg/L por 24h (supercloración).',
                corrective_action: 'Identificar punto de falla (bypass, lecho dañado, Schmutzdecke inmadura). Reparar y verificar con laboratorio antes de restablecer.',
                prevention: 'Mantener bitácora de mantenimiento al día. No omitir períodos de maduración.',
            },
            {
                event: 'Rotura de tubería principal',
                severity: 'ALTA',
                immediate_action: 'Cerrar válvula de corte más cercana. Notificar a la comunidad.',
                corrective_action: 'Reparar tubería con accesorios disponibles. Desinfectar tramo reparado antes de restablecer servicio.',
                prevention: 'Mantener inventario mínimo de repuestos (uniones, codos, pegamento PVC).',
            },
            {
                event: 'Falla en dosificador de cloro',
                severity: 'MEDIA',
                immediate_action: 'Cloración manual de emergencia (solución de hipoclorito directa al tanque de almacenamiento).',
                corrective_action: 'Reparar o reemplazar dosificador. Calibrar antes de retornar a operación automática.',
                prevention: 'Mantener dosificador de respaldo. Capacitar al operador en cloración manual.',
            },
            {
                event: 'Descenso de caudal de fuente (sequía)',
                severity: 'MEDIA',
                immediate_action: 'Reducir distribución a horas pico. Priorizar uso doméstico sobre otros usos.',
                corrective_action: 'Evaluar fuentes alternativas. Implementar ahorro de agua en la comunidad.',
                prevention: 'Dimensionar tanque de almacenamiento con factor de seguridad para sequías.',
            },
            {
                event: 'Arena del FLA por debajo de 0.60 m',
                severity: 'BAJA',
                immediate_action: 'Programar reposición de arena en la próxima semana.',
                corrective_action: 'Reponer con arena lavada y almacenada previamente. Verificar D10 y Cu.',
                prevention: 'Llevar registro de profundidad después de cada raspado. Almacenar arena lavada.',
            },
        ];
    }
}
