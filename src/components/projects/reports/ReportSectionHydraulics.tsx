
import React from 'react';
import { HydraulicNode } from '@/lib/fime-hydraulic-profile';

export default function ReportSectionHydraulics({ profile }: { profile: HydraulicNode[] }) {
    if (!profile || profile.length === 0) return null;

    // SVG Configuration
    const width = 800;
    const height = 300;
    const padding = 40;

    // Scaling
    const numNodes = profile.length;
    const stepX = (width - 2 * padding) / (numNodes - 1);

    // Find min/max elevation to scale Y
    const minElev = Math.min(...profile.map(n => n.elevation_bottom)) - 1.0;
    const maxElev = Math.max(...profile.map(n => n.water_level)) + 1.0;
    const rangeY = maxElev - minElev;

    const getY = (val: number) => height - padding - ((val - minElev) / rangeY) * (height - 2 * padding);
    const getX = (idx: number) => padding + idx * stepX;

    // Generate Path for Water Level
    const pathWater = profile.map((n, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(n.water_level)}`
    ).join(' ');

    // Generate Path for Bottom Level
    const pathBottom = profile.map((n, i) =>
        `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(n.elevation_bottom)}`
    ).join(' ');

    return (
        <div style={{ breakInside: 'avoid', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Bloque I: Perfil Hidráulico Longitudinal
            </h3>

            <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', overflowX: 'auto' }}>
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                        const y = padding + pct * (height - 2 * padding);
                        return <line key={pct} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />;
                    })}

                    {/* Bottom Ground/Structure Line */}
                    <path d={pathBottom} fill="none" stroke="#64748B" strokeWidth="3" />

                    {/* Water Level Line */}
                    <path d={pathWater} fill="none" stroke="#3B82F6" strokeWidth="2" />

                    {/* Nodes and Labels */}
                    {profile.map((node, i) => (
                        <g key={node.id}>
                            {/* Vertical drop line */}
                            <line
                                x1={getX(i)} y1={getY(node.water_level)}
                                x2={getX(i)} y2={getY(node.elevation_bottom)}
                                stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2"
                            />

                            {/* Water Point */}
                            <circle cx={getX(i)} cy={getY(node.water_level)} r="4" fill="#3B82F6" />

                            {/* Text Label (Name) */}
                            <text x={getX(i)} y={padding / 2} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E293B">
                                {node.name}
                            </text>

                            {/* Elevation Text */}
                            <text x={getX(i)} y={getY(node.water_level) - 8} textAnchor="middle" fontSize="9" fill="#0369A1">
                                {node.water_level.toFixed(2)}m
                            </text>

                            <text x={getX(i)} y={getY(node.elevation_bottom) + 12} textAnchor="middle" fontSize="9" fill="#64748B">
                                Fondo: {node.elevation_bottom.toFixed(2)}m
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#EFF6FF', borderRadius: '4px', borderLeft: '3px solid #3B82F6' }}>
                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#1E40AF' }}>Pérdida Total</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A' }}>
                        {profile[profile.length - 1].accumulated_head_loss.toFixed(2)} m
                    </p>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '4px', borderLeft: '3px solid #166534' }}>
                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#166534' }}>Cota Entrega</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D' }}>
                        {profile[profile.length - 1].water_level.toFixed(2)} m
                    </p>
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '1rem' }}>
                <strong>Nota:</strong> Las cotas mostradas son relativas a la captación (Cota 100.00m).
            </p>
        </div>
    );
}
