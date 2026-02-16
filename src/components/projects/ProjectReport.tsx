"use client";

/**
 * MÓDULO: Informe Técnico Final
 * BLOQUE: G — Consolidación y Entrega
 * 
 * Función técnica:
 * - Consolidación de todos los datos técnicos de los 16 módulos anteriores.
 * - Cálculo de benchmarks de ingeniería para validación de resultados.
 * - Generación de OpEx estimado por m3.
 * - Preparación de vista optimizada para impresión/PDF (cumplimiento normativo RAS).
 * 
 * Este componente es el núcleo de salida (Output) del sistema.
 */

import { Project, ProjectModuleStatus, DOMAIN_LABELS, CONTEXT_LABELS, LEVEL_LABELS, CATEGORY_LABELS } from '@/types/project';
import Button from '@/components/ui/Button';
import { NarrativeEngine } from '@/lib/narrative-engine';
import { FimeEngine } from '@/lib/fime-engine';
import { getGranulometry } from '@/lib/fime-granulometry';
import { FimeOymEngine } from '@/lib/fime-oym-engine';

// Nuevos Motores de Ingeniería de Detalle
import { FimeLayoutEngine } from '@/lib/fime-layout-engine';
import { FimeHydraulicProfile } from '@/lib/fime-hydraulic-profile';
import { FimePipingEngine } from '@/lib/fime-piping-engine';

// Nuevos Componentes de Reporte
import ReportSectionLayout from './reports/ReportSectionLayout';
import ReportSectionHydraulics from './reports/ReportSectionHydraulics';
import ReportSectionConstruction from './reports/ReportSectionConstruction';
import ReportSectionOandM from './reports/ReportSectionOandM';
import ReportCover from './reports/ReportCover';
import ReportIntroduction from './reports/ReportIntroduction';
import ReportTableOfContents from './reports/ReportTableOfContents';
import ReportSectionObjectives from './reports/ReportSectionObjectives';
import ReportSectionTheoreticalFramework from './reports/ReportSectionTheoreticalFramework';


type REPORT_DATA = {
    project: any;
    calculations: any;
    source: any;
    consumption: any;
    quality: any;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '2.5rem', breakInside: 'avoid' }}>
        <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            borderBottom: '2px solid var(--color-primary-light)',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>
            {title}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {children}
        </div>
    </div>
);


const DataPoint = ({ label, value }: { label: string; value: any }) => (
    <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)', fontWeight: 600, marginBottom: '0.1rem' }}>{label}</p>
        <p style={{ fontSize: '1rem', color: 'var(--color-foreground)' }}>{value || 'No reportado'}</p>
    </div>
);

export default function ProjectReport({ data }: { data: REPORT_DATA }) {
    const { project, calculations, source, consumption, quality } = data;

    const handlePrint = () => {
        window.print();
    };

    // --- High-Level Engineering Constants (Phase 7 Audit) ---
    const qmdMax = calculations?.calculated_flows?.qmd_max || 0;
    const prodDiariaM3 = qmdMax * 86.4; // m3/day
    const prodMensualM3 = prodDiariaM3 * 30; // m3/month

    // Jar Test & Chemicals
    const alumDose = calculations?.project_jar_test?.optimal_dose_alum || 30; // mg/L
    const chlorineDose = 3; // mg/L (technical default)
    const alumDailyKg = (alumDose * prodDiariaM3) / 1000;
    const alumMonthlyKg = alumDailyKg * 30;
    const chlorineDailyKg = (chlorineDose * prodDiariaM3) / 1000;
    const chlorineMonthlyKg = chlorineDailyKg * 30;

    // Costs (OpEx)
    const priceAlum = calculations?.project_opex?.alum_price_per_kg || 0;
    const priceCl = calculations?.project_opex?.chlorine_price_per_kg || 0;
    const salary = calculations?.project_opex?.operator_monthly_salary || 0;
    const energy = calculations?.project_opex?.energy_monthly_cost || 0;

    const opMonthlyTotal = (alumMonthlyKg * priceAlum) + (chlorineMonthlyKg * priceCl) + salary + energy;
    const opCostPerM3 = prodMensualM3 > 0 ? opMonthlyTotal / prodMensualM3 : 0;

    // --- CÁLCULOS DE INGENIERÍA DE DETALLE (NUEVO) ---

    // 1. Identificar módulos activos
    const activeModules = [];
    if (calculations?.project_desarenador) activeModules.push('desarenador');
    if (calculations?.project_pfd?.number_of_modules > 0) activeModules.push('pfd');
    if (calculations?.project_filtros_gruesos?.number_of_units > 0) activeModules.push('fgac');
    if (calculations?.project_filtros_lentos?.number_of_units > 0) activeModules.push('fla');

    // 2. Generar Plan Maestro (Layout)
    const dimensionsInput: any = {
        'desarenador': {
            width: Number(calculations?.project_desarenador?.width || 0),
            length: Number(calculations?.project_desarenador?.length || 0),
            units: 1
        },
        'pfd': {
            width: 1.5, // Estimado si no hay dato detallado
            length: 4.5,
            units: calculations?.project_pfd?.number_of_modules || 0
        },
        'fgac': {
            width: 1.5,
            length: 4.5,
            units: calculations?.project_filtros_gruesos?.number_of_units || 0
        },
        'fla': {
            width: 3.0,
            length: 6.0,
            units: calculations?.project_filtros_lentos?.number_of_units || 0
        }
    };

    const masterPlan = FimeLayoutEngine.generateMasterPlan(qmdMax, activeModules, dimensionsInput);

    // 3. Generar Perfil Hidráulico
    const hydraulicProfile = FimeHydraulicProfile.calculateSystemProfile(qmdMax, 100.0, { pipe_diameter_raw: 3 });

    // 4. Generar Listado de Válvulas
    const valveSchedule = FimePipingEngine.generateValveSchedule(activeModules, qmdMax);



    // ... (existing imports)

    // ... (existing logic)

    return (
        <div className="report-container" style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', padding: '0', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

            {/* 0. PORTADA */}
            <ReportCover
                projectName={project?.name || 'PROYECTO SIN NOMBRE'}
                location={project?.location || 'Ubicación no definida'}
                date={new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                version="1.0"
                entityName={project?.entity || 'COMUNIDAD BENEFICIARIA'}
            />

            {/* TABLA DE CONTENIDO */}
            <ReportTableOfContents />

            {/* 1. INTRODUCCION */}
            <ReportIntroduction project={project} calculations={calculations} />

            {/* 2. OBJETIVOS & 3. CONSIDERACIONES */}
            <ReportSectionObjectives project={project} />

            {/* 4. IDENTIFICACION DEL RIESGO A TRATAR */}
            <div style={{ pageBreakAfter: 'always', padding: '3rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827', textTransform: 'uppercase' }}>4. Identificación del Riesgo a Tratar</h2>
                <div style={{ backgroundColor: '#fef2f2', padding: '2rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#991b1b', textAlign: 'justify' }}>
                        {NarrativeEngine.generateSanitaryShieldNarrative(calculations?.quality, project)}
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '6px' }}>
                            <strong>Turbiedad:</strong> {calculations?.quality?.turbidity || 0} UNT
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '6px' }}>
                            <strong>Coliformes Fecales:</strong> {calculations?.quality?.fecal_coliforms || 0} UFC/100ml
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. SELECCIÓN Y JUSTIFICACION DE ETAPAS DE TRATAMIENTO */}
            <div style={{ pageBreakAfter: 'always', padding: '3rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827', textTransform: 'uppercase' }}>5. Selección y Justificación de Etapas de Tratamiento</h2>
                <div style={{ fontSize: '1.0rem', lineHeight: '1.6', color: '#374151', textAlign: 'justify' }}>
                    <p style={{ marginBottom: '1.5rem' }}>
                        {NarrativeEngine.generateTreatmentNarrative(calculations, project)}
                    </p>
                    <p>
                        {NarrativeEngine.generateEngineeringDecisions(project?.module_statuses)}
                    </p>
                </div>
            </div>

            {/* 6. FIME TECH & 7. URBANO */}
            <ReportSectionTheoreticalFramework />

            {/* 8. CAUDALES DE DISEÑO */}
            <div style={{ pageBreakAfter: 'always', padding: '3rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827', textTransform: 'uppercase' }}>8. Caudales de Diseño</h2>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#374151' }}>8.1. Caudal Medio y Máximo de Agua Potable</h3>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', marginBottom: '1.5rem' }}>
                        {NarrativeEngine.generateDemandNarrative(calculations)}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <DataPoint label="Población Diseño" value={`${calculations?.calculated_flows?.final_population?.toLocaleString()} hab.`} />
                        <DataPoint label="QMD (Diseño)" value={`${qmdMax.toFixed(2)} L/s`} />
                        <DataPoint label="QMH (Redes)" value={`${calculations?.calculated_flows?.qmh_max?.toFixed(2)} L/s`} />
                    </div>
                </div>
            </div>

            {/* 9. CALCULO HIDRAULICO DE UNIDADES DE TRATAMIENTO */}
            <div style={{ pageBreakAfter: 'always', padding: '3rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827', textTransform: 'uppercase' }}>9. Cálculo Hidráulico de Unidades de Tratamiento</h2>
                <p style={{ marginBottom: '2rem', color: '#4b5563' }}>
                    A continuación, se presentan los parámetros de diseño, dimensionamiento y verificación hidráulica de cada unidad del sistema, conforme al RAS 0330.
                </p>

                {/* MEMORIA DE CÁLCULO DETALLADA INTEGRADA EN CAPITULO 9 */}
                {[
                    { key: 'pfd', title: '9.1. Filtración Gruesa Dinámica (FGDi) y Desarenador', method: FimeEngine.calculatePFDMemoria, params: [qmdMax, { turbidity: quality?.turbidity || 0 }] },
                    {
                        key: 'fgac',
                        title: '9.2. Pérdidas Hidráulicas (FGAC - Interconexión)', // Mapping loosely to TOC structure
                        method: FimeEngine.calculateFGACMemoria,
                        params: [qmdMax, { turbidity: quality?.turbidity || 0 }, {
                            vf: calculations.project_filtros_gruesos?.filtration_velocity || 0.6,
                            num_units: calculations.project_filtros_gruesos?.number_of_units || 2,
                            ratio_l_a: 4
                        }]
                    },
                    {
                        key: 'fla',
                        title: '9.3. Filtración Lenta en Arena (FLA)',
                        method: FimeEngine.calculateFLAMemoria,
                        params: [qmdMax, {
                            vf: calculations.project_filtros_lentos?.filtration_velocity || 0.15,
                            num_units: calculations.project_filtros_lentos?.number_of_units || 3,
                            ratio_l_a: 2
                        }]
                    }
                ].map((mod) => {
                    const memoria = mod.method(...(mod.params as [any, any, any]));
                    return (
                        <div key={mod.key} style={{ marginBottom: '3rem', breakInside: 'avoid' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                {mod.title}
                            </h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Variable / Componente</th>
                                        <th style={{ padding: '0.5rem' }}>Criterio RAS</th>
                                        <th style={{ padding: '0.5rem' }}>Valor de Diseño</th>
                                        <th style={{ padding: '0.5rem' }}>Resultado</th>
                                        <th style={{ padding: '0.5rem' }}>Unidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memoria.steps.map((step, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.5rem', fontWeight: 600 }}>{step.variable}</td>
                                            <td style={{ padding: '0.5rem', fontStyle: 'italic', color: '#64748B' }}>{step.formula}</td>
                                            <td style={{ padding: '0.5rem' }}>{step.substitution}</td>
                                            <td style={{ padding: '0.5rem', fontWeight: 700 }}>{step.result}</td>
                                            <td style={{ padding: '0.5rem' }}>{step.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>

            {/* 10. DESINFECCION */}
            <div style={{ pageBreakAfter: 'always', padding: '3rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827', textTransform: 'uppercase' }}>10. Desinfección</h2>
                <p style={{ marginBottom: '2rem', color: '#4b5563' }}>
                    El sistema de desinfección garantiza la inactivación de patógenos remanentes mediante cloración.
                </p>
                {/* Calculate Disinfection and Render */}
                {(() => {
                    const disMemoria = FimeEngine.calculateDisinfectionMemoria(qmdMax, calculations?.calculated_flows?.final_population || 1000, {
                        contact_time: calculations.project_disinfection?.contact_time || 30,
                        chlorine_dose: calculations.project_disinfection?.chlorine_dose || 2.0,
                        chlorine_concentration: 65
                    });
                    return (
                        <>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#374151' }}>10.1 y 10.2 Dosificación y Contacto</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <tbody>
                                    {disMemoria.steps.map((step, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.5rem', fontWeight: 600 }}>{step.variable}</td>
                                            <td style={{ padding: '0.5rem' }}>{step.substitution}</td>
                                            <td style={{ padding: '0.5rem', fontWeight: 700 }}>{step.result} {step.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )
                })()}
            </div>

            {/* 12. MANUAL DE O&M */}
            <div style={{ pageBreakAfter: 'always', marginTop: '0' }}>
                <ReportSectionOandM valves={valveSchedule} activeModules={activeModules} />
            </div>

            {/* 13. ANEXOS (PLANOS Y ESPECIFICACIONES) */}
            <div style={{ pageBreakAfter: 'always', padding: '3rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827', textTransform: 'uppercase' }}>13. Anexos</h2>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#374151' }}>A. Perfil Hidráulico</h3>
                <ReportSectionHydraulics profile={hydraulicProfile} />

                <div style={{ marginTop: '4rem', breakBefore: 'page' }}>
                    <ReportSectionLayout plan={masterPlan} />
                </div>
                <div style={{ marginTop: '3rem' }}></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#374151' }}>C. Especificaciones Constructivas</h3>
                <ReportSectionConstruction />
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    /* Hide UI elements */
                    .no-print, nav, footer, aside, .btn { 
                        display: none !important; 
                    }

                    /* Reset Page Layout for Print */
                    body, html {
                        background-color: white !important;
                        height: auto !important;
                        width: 100% !important;
                        overflow: visible !important;
                        display: block !important; /* Override flex on body */
                    }
                    
                    main {
                        display: block !important; /* Override flex: 1 */
                        height: auto !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* Report Container Reset */
                    .report-container { 
                        box-shadow: none !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        width: 100% !important; 
                        max-width: none !important; 
                        border-radius: 0 !important;
                        position: static !important;
                    }

                    /* Page Breaks */
                    h1, h2, h3 { 
                        break-after: avoid; 
                        page-break-after: avoid;
                    }
                    
                    table, figure, .break-inside-avoid {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
