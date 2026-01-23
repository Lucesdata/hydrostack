import { createClient } from '@/utils/supabase/server';

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

    return (
        <aside style={{
            width: '280px',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-secondary)', // Assuming a secondary bg or white
            borderLeft: '1px solid var(--color-gray-medium)',
            height: 'calc(100vh - 80px)',
            position: 'sticky',
            top: '0',
            overflowY: 'auto',
            fontSize: '0.9rem'
        }}>
            <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--color-primary)',
                paddingBottom: '0.5rem'
            }}>
                Resumen del Proyecto
            </h3>

            {/* Technical Status Overview */}
            <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-gray-medium)',
                marginBottom: '2rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Estructura Técnica</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Esenciales</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-error)' }}>{essentialCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Aplicados</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{appliedCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>No Aplican</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-gray-dark)' }}>{notApplicableCount}</span>
                    </div>
                </div>
            </div>

            {/* Section 1: Population */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>1. Población</h4>
                {population ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Comunidad:</strong> {population.community_name || '-'}</li>
                        <li><strong>Actual:</strong> {population.initial_population?.toLocaleString() || '-'} hab.</li>
                        <li><strong>Futura:</strong> {population.calculated_flows?.final_population?.toLocaleString() || '-'} hab.</li>
                        {seasonalData?.daily_tourist_count > 0 && (
                            <li style={{ color: 'var(--color-primary)', fontWeight: 600 }}><strong>Adicional:</strong> +{seasonalData.daily_tourist_count} hab.</li>
                        )}
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin datos</p>
                )}
            </div>

            {/* Section 2: Source */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>2. Fuente</h4>
                {source ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Tipo:</strong> {source.source_type || '-'}</li>
                        <li><strong>Permanente:</strong> {source.is_permanent || '-'}</li>
                        <li><strong>Distancia:</strong> {source.distance_to_community ? `${source.distance_to_community} m` : '-'}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin datos</p>
                )}
            </div>

            {/* Section 3: Consumption */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>3. Consumo</h4>
                {consumption ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Usos:</strong> {consumption.main_uses?.length ? consumption.main_uses.join(', ') : '-'}</li>
                        <li><strong>Disponibilidad:</strong> {consumption.daily_availability === 'Sí' ? 'Diaria' : 'Intermitente'}</li>
                        <li><strong>Tanque:</strong> {consumption.has_storage || '-'}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin datos</p>
                )}
            </div>

            {/* Section 4: Quality */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>4. Calidad</h4>
                {quality ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Análisis:</strong> {quality.has_analysis || '-'}</li>
                        {quality.irca_score !== null && (
                            <li><strong>IRCA:</strong> {quality.irca_score.toFixed(1)}%</li>
                        )}
                        <li><strong>Tratamiento:</strong> {quality.home_treatment?.length ? quality.home_treatment.join(', ') : '-'}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin datos</p>
                )}
            </div>

            {/* Section 5: Caudales */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>5. Caudales</h4>
                {population?.calculated_flows?.qmd ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Qmd:</strong> {population.calculated_flows.qmd} L/s</li>
                        <li><strong>QMD:</strong> {population.calculated_flows.qmd_max} L/s</li>
                        <li><strong>QMH:</strong> {population.calculated_flows.qmh_max} L/s</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin cálculos</p>
                )}
            </div>

            {/* Section 6: Tank */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>6. Tanque</h4>
                {population?.calculated_flows?.tank_capacity ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Capacidad:</strong> {population.calculated_flows.tank_capacity} m³</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin diseño</p>
                )}
            </div>

            {/* Section 7: Conduccion */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>7. Conducción</h4>
                {conduccion?.residual_pressure !== undefined ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Presión:</strong> {conduccion.residual_pressure} m.c.a</li>
                        <li><strong>Longitud:</strong> {conduccion.length} m</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin diseño</p>
                )}
            </div>

            {/* Section 8: Desarenador */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>8. Desarenador</h4>
                {desarenador ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Dimensiones:</strong> {desarenador.length}m x {desarenador.width}m</li>
                        <li><strong>Cámaras:</strong> {desarenador.number_of_chambers}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin diseño</p>
                )}
            </div>

            {/* Section 9: Filtro Lento */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>9. Filtro Lento</h4>
                {filters ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Unidades:</strong> {filters.number_of_units}</li>
                        <li><strong>Área Unid:</strong> {filters.unit_width * filters.unit_length} m²</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin diseño</p>
                )}
            </div>

            {/* Section 10: Jar Test */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>10. Jar Test</h4>
                {jarTest ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Dosis Alumbre:</strong> {jarTest.optimal_dose_alum} mg/L</li>
                        <li><strong>pH Óptimo:</strong> {jarTest.optimal_ph}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin datos</p>
                )}
            </div>

            {/* Section 11: Compact Design */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>12. PTAP Compacta</h4>
                {compact ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Área Lamelas:</strong> {compact.lamellar_area} m²</li>
                        <li><strong>Vol. Contacto:</strong> {compact.tank_contact_volume} m³</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin diseño</p>
                )}
            </div>

            {/* Section 13: OpEx */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>13. Costo Operativo</h4>
                {opex ? (
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-success-light, #ecfdf5)', borderRadius: '4px', border: '1px solid var(--color-success)' }}>
                        <p style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.95rem' }}>
                            Calculado conforme a RAS
                        </p>
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin cálculos</p>
                )}
            </div>

            {/* Section 14: Viability */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '0.5rem' }}>14. Viabilidad</h4>
                {viability ? (
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-gray-dark)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li><strong>Gravedad:</strong> {viability.gravity_arrival ? '✓' : '✗'}</li>
                        <li><strong>Lote:</strong> {viability.lot_stability ? '✓' : '✗'}</li>
                    </ul>
                ) : (
                    <p style={{ color: 'var(--color-gray-medium)', fontStyle: 'italic' }}>Sin datos</p>
                )}
            </div>

            <div style={{
                marginTop: 'auto',
                padding: '1rem',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
            }}>
                <p><strong>Estado:</strong> {opex ? 'Auditoría Técnica Completa (RAS)' : 'Ingeniería en Desarrollo'}</p>
            </div>
        </aside>
    );
}
