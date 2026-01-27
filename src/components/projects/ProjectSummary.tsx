import { createClient } from '@/utils/supabase/server';
import { WaterQualityEngine } from '@/lib/water-quality-engine';

export default async function ProjectSummary({ projectId }: { projectId: string }) {
    const supabase = await createClient();

    // Fetch all related data in parallel
    const [
        { data: population },
        { data: source },
        { data: consumption },
        { data: quality },
        { data: conduccion },
        { data: treatment },
        { data: desarenador },
        { data: filters },
        { data: jarTest },
        { data: compact },
        { data: opex },
        { data: viability },
        { data: seasonalData },
        { data: moduleStatuses }
    ] = await Promise.all([
        supabase.from('project_calculations').select('*').eq('project_id', projectId).single(),
        supabase.from('project_sources').select('*').eq('project_id', projectId).single(),
        supabase.from('project_consumption').select('*').eq('project_id', projectId).single(),
        supabase.from('project_water_quality').select('*').eq('project_id', projectId).single(),
        supabase.from('project_conduccion').select('*').eq('project_id', projectId).single(),
        supabase.from('project_treatment').select('*').eq('project_id', projectId).single(),
        supabase.from('project_desarenador').select('*').eq('project_id', projectId).single(),
        supabase.from('project_filtros_lentos').select('*').eq('project_id', projectId).single(),
        supabase.from('project_jar_test').select('*').eq('project_id', projectId).single(),
        supabase.from('project_compact_ptap').select('*').eq('project_id', projectId).single(),
        supabase.from('project_opex').select('*').eq('project_id', projectId).single(),
        supabase.from('project_viability').select('*').eq('project_id', projectId).single(),
        supabase.from('project_seasonal_data').select('*').eq('project_id', projectId).single(),
        supabase.from('project_module_status').select('*').eq('project_id', projectId)
    ]);

    const essentialCount = moduleStatuses?.filter((m: any) => m.status === 'essential').length || 0;
    const appliedCount = moduleStatuses?.filter((m: any) => m.status !== 'not_applicable').length || 0;
    const notApplicableCount = moduleStatuses?.filter((m: any) => m.status === 'not_applicable').length || 0;

    // Map statuses for easy lookup
    const statusMap = new Map();
    moduleStatuses?.forEach((s: any) => statusMap.set(s.module_key, s.status));

    const isVisible = (key: string) => statusMap.get(key) !== 'not_applicable';

    return (
        <aside className="project-summary">
            <h3 style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--color-primary)',
                paddingBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                Gestión del Diseño Técnico
            </h3>

            {/* BLOCK A & B — Context & Demand */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>🟢 Bloque A+B: Población</p>
                {population ? (
                    <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <li><strong>Futura:</strong> {population.calculated_flows?.final_population?.toLocaleString() || '-'} hab.</li>
                            {seasonalData?.daily_tourist_count > 0 && (
                                <li style={{ color: 'var(--color-primary)', fontWeight: 600 }}><strong>+ Estacional:</strong> {seasonalData.daily_tourist_count} hab.</li>
                            )}
                            {consumption && <li><strong>Disponibilidad:</strong> {consumption.daily_availability}</li>}
                        </ul>
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Definición en proceso</p>
                )}
            </div>

            {/* BLOCK C — Source & Quality */}
            {isVisible('source') && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🟢 Bloque C: Fuente y Calidad</p>
                    <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '0.75rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {source && <li><strong>Fuente:</strong> {source.source_type}</li>}
                            {quality && (
                                <>
                                    <li><strong>Análisis:</strong> {quality.has_analysis}</li>
                                    {quality.irca_score !== null && (
                                        <li style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                backgroundColor: quality.irca_score > 80 ? '#fecaca' : quality.irca_score > 35 ? '#fde68a' : '#bbf7d0',
                                                color: quality.irca_score > 80 ? '#991b1b' : quality.irca_score > 35 ? '#92400e' : '#166534',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '4px',
                                                border: '1px solid currentColor'
                                            }}>
                                                IRCA {quality.irca_score.toFixed(0)}%
                                            </span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                                                {quality.complexity_level === 'alta' ? 'Alta Complejidad' : quality.complexity_level === 'media' ? 'Media Comp.' : 'Baja Comp.'}
                                            </span>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* BLOCK D — Hydraulic */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🟢 Bloque D: Caudales (RAS)</p>
                {population?.calculated_flows?.qmd ? (
                    <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '0.75rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <li><strong>QMD:</strong> {population.calculated_flows.qmd_max || '0'} L/s</li>
                            <li><strong>QMH:</strong> {population.calculated_flows.qmh_max || '0'} L/s</li>
                            {conduccion && <li><strong>Presión:</strong> {conduccion.residual_pressure} m.c.a</li>}
                        </ul>
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>En modelado hidráulico</p>
                )}
            </div>

            {/* BLOCK E — Tratamiento (Selective) */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🟡 Bloque E: Ingeniería Tratamiento</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isVisible('desarenador') && desarenador && (
                        <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>DESARENADOR</p>
                            <p>{desarenador.length}m x {desarenador.width}m</p>
                        </div>
                    )}
                    {isVisible('filtro_lento') && filters && (
                        <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>FILTRO LENTO</p>
                            <p>{filters.number_of_units} unidades · {filters.unit_width * filters.unit_length}m²</p>
                        </div>
                    )}
                    {isVisible('compact_design') && compact && (
                        <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>PTAP COMPACTA</p>
                            <p>Lamelas: {compact.lamellar_area}m²</p>
                        </div>
                    )}
                    {isVisible('jar_test') && jarTest && (
                        <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>JAR TEST</p>
                            <p>Dosis: {jarTest.optimal_dose_alum} mg/L</p>
                        </div>
                    )}
                    {!desarenador && !filters && !compact && !jarTest && (
                        <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Selección tecnológica en curso</p>
                    )}
                </div>
            </div>

            {/* BLOCK F — Close */}
            <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🟢 Bloque F: Evaluación</p>
                {opex ? (
                    <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #10b981' }}>
                        <p style={{ color: '#065f46', fontSize: '0.8rem', fontWeight: 700 }}>${opex.alum_price_per_kg ? 'Indicadores de Viabilidad' : 'Estructura OpEx Base'}</p>
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Análisis de viabilidad por iniciar</p>
                )}
            </div>

            <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                textAlign: 'center'
            }}>
                <p style={{ fontWeight: 700 }}>HydroStack Assistant</p>
                <p style={{ opacity: 0.8 }}>Normativa RAS 0330</p>
            </div>
        </aside>
    );
}
