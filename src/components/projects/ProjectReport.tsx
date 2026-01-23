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

import React from 'react';
import Button from '@/components/ui/Button';

type REPORT_DATA = {
    project: any;
    calculations: any;
    source: any;
    consumption: any;
    quality: any;
};

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

            <Section title="1. Localización y Población">
                <DataPoint label="Municipio" value={calculations?.municipality} />
                <DataPoint label="Población Futura" value={calculations?.calculated_flows?.final_population ? `${calculations.calculated_flows.final_population.toLocaleString()} hab.` : null} />
                <DataPoint label="Método Proyección" value={calculations?.calculated_flows?.method || 'Geométrico'} />
            </Section>

            <Section title="2. Dinámica de Población Estacional">
                <DataPoint label="Población Adicional (Pico)" value={calculations?.project_seasonal_data?.daily_tourist_count ? `${calculations.project_seasonal_data.daily_tourist_count} personas` : 'No definido'} />
                <DataPoint label="Factor Pico Estacional (FPE)" value={calculations?.project_seasonal_data?.seasonal_peak_factor || 1.0} />
                <div style={{ padding: '0.8rem', backgroundColor: '#FFFBEB', borderRadius: '4px', border: '1px solid #FEF3C7', fontSize: '0.85rem' }}>
                    <strong>Análisis de Demanda:</strong> Se ha aplicado un factor de incremento estacional para asegurar la capacidad del sistema en periodos de máxima afluencia.
                </div>
            </Section>

            <Section title="2. Diagnóstico de la Fuente">
                <DataPoint label="Tipo de Fuente" value={source?.source_type} />
                <DataPoint label="Caudal Concedido" value={source?.distance_to_community ? `${source.distance_to_community} m (ref)` : null} />
                <DataPoint label="Permanencia" value={source?.is_permanent} />
            </Section>

            <Section title="3. Calidad y Hábitos">
                <DataPoint label="Índice IRCA" value={quality?.irca_score !== null ? `${quality.irca_score.toFixed(1)}%` : 'No calculado'} />
                <DataPoint label="Turbiedad Fuente" value={quality?.turbidity ? `${quality.turbidity} UNT` : null} />
                <DataPoint label="Color Fuente" value={quality?.color ? `${quality.color} UPC` : null} />
            </Section>

            <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-light)', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    CAUDALES DE DISEÑO (RAS 0330)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid var(--color-gray-medium)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>Qmd (Medio)</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{calculations?.calculated_flows?.qmd || '0'} L/s</p>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'white', border: '2px solid var(--color-secondary)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>QMD (Máx Diario)</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{qmdMax} L/s</p>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid var(--color-primary-light)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>QMH (Máx Horario)</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>{calculations?.calculated_flows?.qmh_max || '0'} L/s</p>
                    </div>
                </div>
            </div>

            <Section title="4. Almacenamiento y Conducción">
                <DataPoint label="Tanque Requerido" value={calculations?.calculated_flows?.tank_capacity ? `${calculations.calculated_flows.tank_capacity} m³` : null} />
                <DataPoint label="Presión en Punto Crítico" value={calculations?.project_conduccion?.residual_pressure ? `${calculations.project_conduccion.residual_pressure} m.c.a` : null} />
            </Section>

            <Section title="5. Ingeniería de Detalle: Pre-tratamiento">
                <DataPoint label="Caudal Desarenador" value={calculations?.project_desarenador?.design_flow ? `${calculations.project_desarenador.design_flow} L/s` : null} />
                <DataPoint label="Dimensiones LxB" value={calculations?.project_desarenador?.length ? `${calculations.project_desarenador.length}m x ${calculations.project_desarenador.width}m` : null} />
            </Section>

            <Section title="6. Coagulación y Química (Referencias Técnicas)">
                <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700 }}>Benchmarks de Consumo Escalados (Referencia 6.5 L/s):</p>
                </div>
                <DataPoint label="Alumbre (Estimado)" value={`${alumMonthlyKg.toFixed(1)} kg/mes`} />
                <DataPoint label="Alumbre (Referencia)" value={`${alumKgBenchmark.toFixed(1)} kg/mes`} />
                <DataPoint label="Cloro (Estimado)" value={`${chlorineMonthlyKg.toFixed(1)} kg/mes`} />
                <DataPoint label="Cloro (Referencia)" value={`${chlorineKgBenchmark.toFixed(1)} kg/mes`} />
            </Section>

            <Section title="7. Ingeniería de Detalle: PTAP">
                <DataPoint label="Tipo de Planta" value={calculations?.project_compact_ptap ? 'Compacta PRFV High-Rate' : 'Convencional/Filtro Lento'} />
                <DataPoint label="Área de Filtración" value={calculations?.project_compact_ptap?.filter_area ? `${calculations.project_compact_ptap.filter_area} m²` : (calculations?.project_filtros_lentos?.number_of_units ? 'Ver Detalle Filtro Lento' : null)} />
                <DataPoint label="Tasa de Carga Lamelar" value={calculations?.project_compact_ptap?.lamellar_loading_rate ? `${calculations.project_compact_ptap.lamellar_loading_rate} m/m2/d` : null} />
            </Section>

            <Section title="8. Evaluación Económica (OpEx)">
                <DataPoint label="Costo Operativo por m³" value={calculations?.project_opex ? `$${opCostPerM3.toFixed(2)} COP` : 'No calculado'} />
                <DataPoint label="Costo Total Mensual" value={calculations?.project_opex ? `$${Math.round(opMonthlyTotal).toLocaleString()} COP` : null} />
                <DataPoint label="Producción Mensual" value={`${Math.round(prodMensualM3).toLocaleString()} m³`} />
            </Section>

            <Section title="9. Viabilidad, Mantenimiento y EPP">
                <div style={{ gridColumn: '1 / -1' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>EPP Obligatorio para Operario:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        {calculations?.project_seasonal_data?.ppe_heavy_gloves && <span style={{ padding: '0.3rem 0.6rem', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '0.75rem' }}>✅ Guantes Nitrilo</span>}
                        {calculations?.project_seasonal_data?.ppe_safety_boots && <span style={{ padding: '0.3rem 0.6rem', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '0.75rem' }}>✅ Botas Seguridad</span>}
                        {calculations?.project_seasonal_data?.ppe_goggles && <span style={{ padding: '0.3rem 0.6rem', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '0.75rem' }}>✅ Mono-gafas</span>}
                        {calculations?.project_seasonal_data?.ppe_mask && <span style={{ padding: '0.3rem 0.6rem', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '0.75rem' }}>✅ Mascarilla</span>}
                    </div>
                </div>
                <DataPoint label="Crono. Mezcla Rápida" value="30 días" />
                <DataPoint label="Crono. Desarenador" value="45 días" />
                <DataPoint label="Crono. Filtros" value={`${calculations?.project_viability?.filter_cleaning_days || 15} días`} />
            </Section>

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
        </div>
    );
}
