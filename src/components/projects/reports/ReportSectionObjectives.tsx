
import React from 'react';

interface ReportSectionObjectivesProps {
    project: any;
}

export default function ReportSectionObjectives({ project }: ReportSectionObjectivesProps) {
    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '3rem',
            backgroundColor: 'white'
        }}>
            {/* 2. OBJETIVOS */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    color: '#111827',
                    textTransform: 'uppercase'
                }}>2. Objetivos</h2>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        color: '#374151'
                    }}>2.1. General</h3>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        textAlign: 'justify',
                        color: '#4b5563'
                    }}>
                        Realizar los estudios y diseños definitivos para la construcción del sistema de potabilización de agua del {project?.name || 'proyecto'}, garantizando el suministro de agua potable en cantidad y calidad, conforme a la normatividad vigente (RAS 2017 y Resolución 2115 de 2007).
                    </p>
                </div>

                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        color: '#374151'
                    }}>2.2. Específicos</h3>
                    <ul style={{
                        listStyleType: 'disc',
                        paddingLeft: '1.5rem',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#4b5563',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <li>Analizar la información básica disponible, incluyendo topografía, calidad de agua y censo poblacional.</li>
                        <li>Calcular la población de diseño y la demanda hídrica proyectada para el horizonte del proyecto.</li>
                        <li>Seleccionar y justificar técnicamente la tecnología de tratamiento más adecuada para las condiciones locales.</li>
                        <li>Diseñar hidráulicamente las unidades de tratamiento (Filtración en Múltiples Etapas).</li>
                        <li>Elaborar el presupuesto de obras y el manual de operación y mantenimiento del sistema.</li>
                    </ul>
                </div>
            </div>

            {/* 3. CONSIDERACIONES GENERALES */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    color: '#111827',
                    textTransform: 'uppercase'
                }}>3. Consideraciones Generales</h2>
                <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'justify',
                    color: '#4b5563',
                    marginBottom: '1rem'
                }}>
                    El presente estudio se enmarca dentro de las políticas nacionales de saneamiento básico y agua potable. Se ha considerado la ubicación geográfica del proyecto en {project?.location || 'la zona de estudio'}, evaluando factores climáticos, topográficos y socioeconómicos que influyen en la sostenibilidad de la infraestructura.
                </p>
                <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'justify',
                    color: '#4b5563'
                }}>
                    El diseño se rige por el Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico (RAS 2017), adoptando criterios de eficiencia costos y facilidad operativa, esenciales para la viabilidad a largo plazo en contextos rurales o periurbanos.
                </p>
            </div>
        </div>
    );
}
