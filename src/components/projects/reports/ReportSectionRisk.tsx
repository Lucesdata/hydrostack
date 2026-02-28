import React, { useMemo } from 'react';
import { Project } from '@/types/project';
import { NarrativeEngine } from '@/lib/narrative-engine';

interface ReportSectionRiskProps {
    project: Project;
}

export default function ReportSectionRisk({ project }: ReportSectionRiskProps) {
    const considerations = useMemo(() => NarrativeEngine.generateGeneralConsiderations(project), [project]);
    const risks = useMemo(() => NarrativeEngine.generateRiskIdentification(project), [project]);

    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '4rem 5rem',
            backgroundColor: 'white',
            minHeight: '297mm', // A4 height
            position: 'relative',
            fontFamily: '"Times New Roman", Times, serif'
        }}>
            {/* Header placeholder */}
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

            <div style={{ marginTop: '6rem' }}>
                {/* 3. CONSIDERACIONES GENERALES */}
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        marginBottom: '2rem',
                        color: '#000',
                        textAlign: 'center',
                        textTransform: 'uppercase'
                    }}>3. CONSIDERACIONES GENERALES</h2>

                    <p style={{
                        fontSize: '1.05rem',
                        lineHeight: '1.8',
                        textAlign: 'justify',
                        color: '#000'
                    }}>
                        {considerations}
                    </p>
                </div>

                {/* 4. IDENTIFICACION DEL RIESGO A TRATAR */}
                <div>
                    <h2 style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        marginBottom: '2.5rem',
                        color: '#000',
                        textAlign: 'center',
                        textTransform: 'uppercase'
                    }}>4. IDENTIFICACION DEL RIESGO A TRATAR</h2>

                    {risks.map((paragraph, index) => (
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

            {/* Footer placeholder */}
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
                <div>8</div>
                <div style={{ fontStyle: 'italic' }}>Informe Final STAP {project?.name || 'XXXX'}</div>
            </div>
        </div>
    );
}
