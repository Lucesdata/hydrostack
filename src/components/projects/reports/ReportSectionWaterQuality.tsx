import React, { useMemo } from 'react';
import { Project } from '@/types/project';
import { NarrativeEngine } from '@/lib/narrative-engine';

interface ReportSectionWaterQualityProps {
    project: Project;
}

export default function ReportSectionWaterQuality({ project }: ReportSectionWaterQualityProps) {
    const tableData = useMemo(() => NarrativeEngine.getAverageWaterQuality(), []);
    const concludingParagraphs = useMemo(() => NarrativeEngine.generateRiskConcludingNarrative(project), [project]);

    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '4rem 5rem',
            backgroundColor: 'white',
            minHeight: '297mm', // A4 height
            position: 'relative',
            fontFamily: '"Times New Roman", Times, serif'
        }}>
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: '2rem',
                right: '5rem',
                textAlign: 'right',
                borderBottom: '1px solid #e5e7eb',
                width: 'calc(100% - 10rem)',
                paddingBottom: '0.5rem',
                marginBottom: '4rem'
            }}>
                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#9ca3af' }}>
                    Planta de Potabilización {project?.name || 'XXXX'}
                </div>
                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#9ca3af' }}>
                    Secretaría de Salud Municipal de {project?.location || 'XXXX'}
                </div>
            </div>

            <div style={{ marginTop: '4rem' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    color: '#000',
                    textAlign: 'center'
                }}>
                    Tabla 4.1 Características de la Fuente de Abastecimiento
                </h3>

                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '3rem',
                    fontSize: '0.9rem',
                    color: '#000'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fff' }}>
                            <th style={cellStyle}>PARAMETRO</th>
                            <th style={cellStyle}>MINIMO</th>
                            <th style={cellStyle}>MEDIO</th>
                            <th style={cellStyle}>MAXIMO</th>
                            <th style={cellStyle}>VARIANZA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ ...cellStyle, fontWeight: row.parameter.includes('TURBIEDAD') || row.parameter.includes('COLOR') || row.parameter.includes('Coliformes') ? 700 : 400 }}>
                                    {row.parameter}
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{row.min}</td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{row.med}</td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{row.max}</td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>{row.var}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '2rem' }}>
                    {concludingParagraphs.map((paragraph, index) => (
                        <p key={index} style={{
                            fontSize: '1.05rem',
                            lineHeight: '1.8',
                            textAlign: 'justify',
                            color: '#000',
                            marginBottom: '1.5rem'
                        }}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: '3rem',
                left: '5rem',
                right: '5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#9ca3af',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '0.5rem'
            }}>
                <div style={{ fontStyle: 'italic' }}>Ing. Gilberto PARRA B</div>
                <div>9</div>
                <div style={{ fontStyle: 'italic' }}>Informe Final STAP {project?.name || 'XXXX'}</div>
            </div>
        </div>
    );
}

const cellStyle: React.CSSProperties = {
    border: '1px solid #000',
    padding: '0.4rem 0.6rem',
    textAlign: 'left'
};
