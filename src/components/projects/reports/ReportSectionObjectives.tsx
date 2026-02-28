import React, { useMemo } from 'react';
import { Project } from '@/types/project';
import { NarrativeEngine } from '@/lib/narrative-engine';

interface ReportSectionObjectivesProps {
    project: Project;
}

export default function ReportSectionObjectives({ project }: ReportSectionObjectivesProps) {
    const objectives = useMemo(() => NarrativeEngine.generateObjectives(project), [project]);

    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '4rem 5rem',
            backgroundColor: 'white',
            minHeight: '297mm', // A4 height
            position: 'relative',
            fontFamily: '"Times New Roman", Times, serif'
        }}>
            {/* Header placeholder (similar to image) */}
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
                {/* 2. OBJETIVOS */}
                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    marginBottom: '2.5rem',
                    color: '#000',
                    textAlign: 'center'
                }}>2. OBJETIVOS</h2>

                {/* 2.1 GENERAL */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: '#000' }}>
                        <span style={{ fontWeight: 700 }}>2.1.</span>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>GENERAL</span>
                    </div>
                    <p style={{
                        fontSize: '1.05rem',
                        lineHeight: '1.6',
                        textAlign: 'justify',
                        color: '#000',
                        marginLeft: '3rem'
                    }}>
                        {objectives.general}
                    </p>
                </div>

                {/* 2.2 ESPECIFICOS */}
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: '#000' }}>
                        <span style={{ fontWeight: 700 }}>2.2.</span>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>ESPECIFICOS</span>
                    </div>
                    <ul style={{
                        listStyleType: 'disc',
                        marginLeft: '5rem',
                        fontSize: '1.05rem',
                        lineHeight: '1.8',
                        color: '#000',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {objectives.specifics.map((obj, index) => (
                            <li key={index} style={{ textAlign: 'justify' }}>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer placeholder (similar to image) */}
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
                <div>7</div>
                <div style={{ fontStyle: 'italic' }}>Informe Final STAP {project?.name || 'XXXX'}</div>
            </div>
        </div>
    );
}
