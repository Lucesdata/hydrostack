
import React from 'react';
import { ValveSpec } from '@/lib/fime-piping-engine';

interface ReportSectionOandMProps {
    valves: ValveSpec[];
    activeModules: string[];
}

export default function ReportSectionOandM({ valves, activeModules }: ReportSectionOandMProps) {

    return (
        <div style={{ breakInside: 'avoid', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Bloque K: Operatividad y Valvulería
            </h3>

            {/* Listado de Válvulas */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', color: '#334155' }}>Inventario de Válvulas y Accesorios</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Función / Ubicación</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Diámetro</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tipo</th>
                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Operación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {valves.map((v, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '0.5rem', fontWeight: 800 }}>{v.id}</td>
                                <td style={{ padding: '0.5rem' }}>
                                    <strong>{v.function}</strong><br />
                                    <span style={{ color: '#64748B' }}>{v.location}</span>
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{v.diameter_inch}&quot;</td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                                        backgroundColor: v.type === 'GATE' ? '#E0E7FF' : '#FEF3C7',
                                        color: v.type === 'GATE' ? '#3730A3' : '#92400E'
                                    }}>
                                        {v.type === 'GATE' ? 'CORTINA' : v.type}
                                    </span>
                                </td>
                                <td style={{ padding: '0.5rem' }}>Manual</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Checklists */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369A1', marginBottom: '1rem' }}>
                        🛠 Verificación Pre-Operativa
                    </h4>
                    <ul style={{ fontSize: '0.8rem', paddingLeft: '1.2rem', color: '#0C4A6E' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Válvulas de lavado CERRADAS.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Válvulas de entrada y salida ABIERTAS.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Nivel de cloro en tanque &gt; 0.3 mg/L.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Rejilla de captación limpia.</li>
                        <li>Bitácora de operación disponible.</li>
                    </ul>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991B1B', marginBottom: '1rem' }}>
                        🚫 Prohibiciones
                    </h4>
                    <ul style={{ fontSize: '0.8rem', paddingLeft: '1.2rem', color: '#7F1D1D' }}>
                        <li style={{ marginBottom: '0.5rem' }}>NO operar sin cloro.</li>
                        {activeModules.includes('fgac') && (
                            <li style={{ marginBottom: '0.5rem' }}>NO lavar filtros gruesos con agua cruda (usar turbiedad &lt; 20 UNT).</li>
                        )}
                        {activeModules.includes('fla') && (
                            <li style={{ marginBottom: '0.5rem' }}>NO caminar sobre la arena del FLA (excepto raspado).</li>
                        )}
                        {activeModules.includes('fla') && (
                            <li style={{ marginBottom: '0.5rem' }}>NO lavar FLA por retrolavado (solo raspado superficial).</li>
                        )}
                        <li>NO alterar válvulas de calibración de caudal.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
