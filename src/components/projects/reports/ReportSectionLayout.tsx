
import React from 'react';
import { MasterPlan } from '@/lib/fime-layout-engine';

export default function ReportSectionLayout({ plan }: { plan: MasterPlan }) {
    if (!plan) return null;

    // Escala para visualización: 1m = 10px (o ajuste dinámico)
    // Para simplificar en PDF, usamos porcentajes relativos o unidades fijas escaladas
    const scale = 8; // pixels per meter

    return (
        <div style={{ breakInside: 'avoid', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Bloque H: Plan Maestro de Implantación (Layout)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '2rem' }}>
                {/* Canvas Visual */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: `${plan.required_length_m * scale}px`,
                    backgroundColor: '#F0FDF4',
                    border: '1px dashed #166534',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.7rem', fontWeight: 700, color: '#166534' }}>
                        ÁREA REQUERIDA: {plan.required_width_m}m x {plan.required_length_m}m
                    </div>

                    {plan.zones.map((zone) => (
                        <div key={zone.id} style={{
                            position: 'absolute',
                            left: `${zone.relative_x * scale}px`,
                            top: `${zone.relative_y * scale}px`,
                            width: `${zone.width_m * scale}px`,
                            height: `${zone.length_m * scale}px`,
                            backgroundColor: zone.color,
                            border: '2px solid rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#1E293B',
                            textAlign: 'center',
                            boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                            transform: `rotate(${zone.rotation_deg}deg)`
                        }}>
                            {zone.name}
                        </div>
                    ))}

                    {/* Flecha Norte */}
                    <div style={{ position: 'absolute', bottom: 20, right: 20, fontSize: '1.5rem' }}>
                        ⬆ N
                    </div>
                </div>

                {/* Leyenda y Datos */}
                <div>
                    <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Datos del Lote</h4>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}><strong>Área Total:</strong> {plan.total_area_m2} m²</p>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}><strong>Pendiente:</strong> {plan.terrain_slope_pct}% ({plan.layout_type})</p>
                        <p style={{ fontSize: '0.8rem' }}><strong>Flujo:</strong> Gravedad</p>
                    </div>

                    <div style={{ fontSize: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Convenciones</h4>
                        {plan.zones.map(z => (
                            <div key={z.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
                                <span style={{ width: '12px', height: '12px', backgroundColor: z.color, marginRight: '8px', border: '1px solid #94A3B8', borderRadius: '2px' }}></span>
                                <span>{z.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '1rem', fontStyle: 'italic' }}>
                * Esquema de distribución referencial. Las dimensiones finales deben ajustarse en campo según topografía de detalle.
            </p>
        </div>
    );
}
