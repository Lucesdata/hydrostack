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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // --- General Engineering Benchmark Calculations ---
    const baseFlowRef = 6.5; // lps (Technical reference flow)
    const currentQmdMax = calculations?.calculated_flows?.qmd_max || 0;
    const scalingFactor = currentQmdMax / baseFlowRef;

    // Benchmarks scaled from 30kg Alum / 4kg Cl for 6.5 lps
    const alumKgBenchmark = 30 * scalingFactor;
    const chlorineKgBenchmark = 4 * scalingFactor;

    // Costs (OpEx)
    const priceAlum = calculations?.project_opex?.alum_price_per_kg || 0;
    const priceCl = calculations?.project_opex?.chlorine_price_per_kg || 0;
    const salary = calculations?.project_opex?.operator_monthly_salary || 0;
    const energy = calculations?.project_opex?.energy_monthly_cost || 0;

    const opMonthlyTotal = (alumMonthlyKg * priceAlum) + (chlorineMonthlyKg * priceCl) + salary + energy;
    const opCostPerM3 = prodMensualM3 > 0 ? opMonthlyTotal / prodMensualM3 : 0;


    return (
        <div className="report-container" style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

            {/* Print Header */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-gray-medium)' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Vista Previa del Informe</h1>
                    <p style={{ color: 'var(--color-gray-dark)' }}>Resumen técnico avanzado conforme a RAS 0330.</p>
                </div>
                <Button onClick={handlePrint} variant="primary">
                    🖨️ Imprimir / Guardar PDF
                </Button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>HYDROSTACK</h2>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-foreground)' }}>INFORME TÉCNICO DE AUDITORÍA Y DISEÑO</p>
                <div style={{ marginTop: '1rem', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>
                    <p><strong>Proyecto:</strong> {project?.name}</p>
                    <p><strong>Comunidad:</strong> {calculations?.community_name}</p>
                    <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div style={{
                marginBottom: '4rem',
                padding: '2rem',
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '5px solid var(--color-primary)',
                lineHeight: '1.8'
            }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Memoria Descriptiva y Justificación Técnica
                </h3>

                <p style={{ marginBottom: '1.5rem', textAlign: 'justify', fontSize: '1rem' }}>
                    {NarrativeEngine.generateIntroduction(project)}
                </p>

                <p style={{ marginBottom: '1.5rem', textAlign: 'justify', fontSize: '1rem' }}>
                    {NarrativeEngine.generateEngineeringDecisions(calculations?.module_statuses || [])}
                </p>

                <p style={{ marginBottom: '1.5rem', textAlign: 'justify', fontSize: '1rem' }}>
                    {NarrativeEngine.generateDemandNarrative(calculations)}
                </p>

                <p style={{ marginBottom: '1.5rem', textAlign: 'justify', fontSize: '1rem' }}>
                    {NarrativeEngine.generateTreatmentNarrative(calculations, project)}
                </p>

                <p style={{ textAlign: 'justify', fontSize: '1rem' }}>
                    {NarrativeEngine.generateViabilityJustification(calculations?.project_viability)}
                </p>
            </div>

            <Section title="Bloque A: Contexto y Localización">
                <DataPoint label="Municipio" value={calculations?.municipality} />
                <DataPoint label="Dominio" value={project?.project_domain ? DOMAIN_LABELS[project.project_domain as keyof typeof DOMAIN_LABELS] : ''} />
                <DataPoint label="Contexto" value={project?.project_context ? CONTEXT_LABELS[project.project_context as keyof typeof CONTEXT_LABELS] : ''} />
                <DataPoint label="Nivel de Alcance" value={project?.project_level ? LEVEL_LABELS[project.project_level as keyof typeof LEVEL_LABELS] : ''} />
            </Section>

            <Section title="Bloque B: Demanda y Población">
                <DataPoint label="Población Futura" value={calculations?.calculated_flows?.final_population ? `${calculations.calculated_flows.final_population.toLocaleString()} hab.` : null} />
                <DataPoint label="Método Proyección" value={calculations?.calculated_flows?.method || 'Geométrico'} />
                <DataPoint label="Afluencia Estacional (Pico)" value={calculations?.project_seasonal_data?.daily_tourist_count ? `+ ${calculations.project_seasonal_data.daily_tourist_count} hab.` : 'No aplica'} />
                <DataPoint label="Consumo Diario (Uso)" value={consumption?.daily_availability || 'Diario'} />
            </Section>

            <Section title="Bloque C: Fuente y Calidad">
                <DataPoint label="Tipo de Fuente" value={source?.source_type} />
                <DataPoint label="Permanencia" value={source?.is_permanent} />
                <DataPoint label="IRCA (Estado Actual)" value={quality?.irca_score !== null ? `${quality.irca_score.toFixed(1)}%` : 'Sin datos'} />
                <DataPoint label="Turbiedad Máxima" value={quality?.turbidity ? `${quality.turbidity} UNT` : 'No reportado'} />
            </Section>

            <div style={{ marginTop: '2rem', marginBottom: '3rem', padding: '2rem', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369A1', marginBottom: '1.5rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Bloque D: RÉGIMEN HIDRÁULICO DE DISEÑO (RAS 0330)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
                    <div>
                        <p style={{ fontSize: '0.65rem', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>Qmd (Caudal Medio)</p>
                        <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0C4A6E' }}>{calculations?.calculated_flows?.qmd || '0'} <small style={{ fontSize: '0.8rem', fontWeight: 400 }}>L/s</small></p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.65rem', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>QMD (Máximo Diario)</p>
                        <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0369A1' }}>{qmdMax} <small style={{ fontSize: '0.8rem', fontWeight: 400 }}>L/s</small></p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.65rem', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>QMH (Máximo Horario)</p>
                        <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0C4A6E' }}>{calculations?.calculated_flows?.qmh_max || '0'} <small style={{ fontSize: '0.8rem', fontWeight: 400 }}>L/s</small></p>
                    </div>
                </div>
            </div>

            <Section title="Bloque E: Ingeniería de Tratamiento">
                <DataPoint label="Tecnología Seleccionada" value={project?.treatment_category ? CATEGORY_LABELS[project.treatment_category as keyof typeof CATEGORY_LABELS] : 'No definida'} />
                {calculations.project_desarenador && <DataPoint label="Dimensiones Desarenador" value={`${calculations.project_desarenador.length}m x ${calculations.project_desarenador.width}m`} />}
                {calculations.project_compact_ptap && <DataPoint label="Capacidad PTAP" value={`${qmdMax} L/s (Lamelas: ${calculations.project_compact_ptap.lamellar_area}m²)`} />}
                {calculations.project_filtros_lentos && <DataPoint label="Unidades FLA" value={`${calculations.project_filtros_lentos.number_of_units} unidades`} />}
                {calculations.project_jar_test && <DataPoint label="Dosis Coagulante" value={`${calculations.project_jar_test.optimal_dose_alum} mg/L`} />}
            </Section>

            <Section title="Bloque F: Evaluación de Sostenibilidad">
                <DataPoint label="O&M m³ Producido" value={calculations?.project_opex ? `$${opCostPerM3.toFixed(2)} COP` : 'Pendiente'} />
                <DataPoint label="Gasto Total Mensual" value={calculations?.project_opex ? `$${Math.round(opMonthlyTotal).toLocaleString()} COP` : null} />
                <DataPoint label="Viabilidad de Sitio" value={calculations?.project_viability?.gravity_arrival ? 'Gravedad (Óptimo)' : 'Bombeo'} />
                <DataPoint label="EPP Obligatorio" value={
                    [
                        calculations?.project_seasonal_data?.ppe_heavy_gloves && 'Guantes',
                        calculations?.project_seasonal_data?.ppe_safety_boots && 'Botas',
                        calculations?.project_seasonal_data?.ppe_goggles && 'Gafas'
                    ].filter(Boolean).join(', ') || 'Equipos Básicos'
                } />
            </Section>

            <div style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', borderRadius: '4px', border: '1px solid #FCA5A5', fontSize: '0.85rem', marginBottom: '3rem' }}>
                <p style={{ fontWeight: 800, color: '#991B1B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Apéndice Técnico: Mantenimiento Crítico</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <li><strong>Mezcla Rápida:</strong> Inspección cada 30 días</li>
                    <li><strong>Desarenador:</strong> Limpieza cada 45 días</li>
                    <li><strong>Filtros:</strong> Lavado cada {calculations?.project_viability?.filter_cleaning_days || 15} días</li>
                    <li><strong>Dosificación:</strong> Calibración semanal</li>
                </ul>
            </div>

            <div style={{ marginTop: '5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-gray-dark)', borderTop: '1px solid var(--color-gray-medium)', paddingTop: '2rem' }}>
                <p>Este informe constituye un diagnóstico técnico basado en la resolución 0330 de 2017 (RAS).</p>
                <p>Generado por HydroStack v1.0 Professional Audit Module.</p>
            </div>

            <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid black', marginBottom: '0.5rem' }}></div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>INGENIERO PROYECTISTA</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid black', marginBottom: '0.5rem' }}></div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>CONTROL DE CALIDAD / REVISOR</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background-color: white !important; }
                    .report-container { box-shadow: none !important; padding: 0 !important; }
                    aside { display: none !important; }
                    nav { display: none !important; }
                }
            `}</style>
        </div >
    );
}
