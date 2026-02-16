
import React from 'react';
import { NarrativeEngine } from '@/lib/narrative-engine';

interface ReportIntroductionProps {
    project: any;
    calculations: any;
}

export default function ReportIntroduction({ project, calculations }: ReportIntroductionProps) {
    const introduction = NarrativeEngine.generateIntroduction(project);
    const domain = project.project_domain === 'water_treatment' ? 'Sistemas de Abastecimiento de Agua Potable' : 'Saneamiento Básico';

    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '3rem',
            backgroundColor: 'white'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
                color: '#111827',
                textTransform: 'uppercase'
            }}>1. Introducción</h2>

            <div style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#334155',
                textAlign: 'justify',
                marginBottom: '2rem'
            }}>
                <p style={{ marginBottom: '1.5rem' }}>
                    {introduction}
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    El presente informe técnico tiene como finalidad presentar los estudios y diseños definitivos para el sistema de potabilización, abarcando desde la captación hasta la distribución, asegurando el cumplimiento de los estándares de calidad exigidos por la normatividad colombiana.
                </p>
                <p>
                    Se aborda la problemática de salud pública asociada al consumo de agua no apta, proponiendo una solución tecnológica ({domain}) que sea técnica, económica y socialmente viable para la comunidad beneficiaria.
                </p>
            </div>
        </div>
    );
}
