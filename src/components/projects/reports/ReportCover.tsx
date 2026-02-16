
import React from 'react';

interface ReportCoverProps {
    projectName: string;
    location: string;
    date: string;
    version?: string;
    entityName?: string;
}

export default function ReportCover({
    projectName,
    location,
    date,
    version = "1.0",
    entityName = "COMUNIDAD BENEFICIARIA"
}: ReportCoverProps) {
    return (
        <div className="report-cover" style={{
            width: '100%',
            minHeight: '1100px', // Aproximadamente una página A4/Carta
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '4rem 3rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb', // Borde sutil para vista en pantalla
            boxSizing: 'border-box',
            position: 'relative',
            marginBottom: '0', // Importante para el salto de página
            pageBreakAfter: 'always' // Clave para impresión
        }}>

            {/* Header / Logos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: '0.8rem',
                    borderRadius: '8px'
                }}>
                    LOGO PROYECTO
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h4 style={{
                        margin: 0,
                        color: '#111827',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        HYDROSTACK
                    </h4>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>Ingeniería de Aguas</p>
                </div>
            </div>

            {/* Central Title Block */}
            <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: 'auto' }}>
                <div style={{
                    width: '60px',
                    height: '4px',
                    backgroundColor: '#0ea5e9', // Primary brand color
                    margin: '0 auto 2rem auto'
                }}></div>

                <h1 style={{
                    fontSize: '2.5rem',
                    color: '#111827',
                    fontWeight: 900,
                    lineHeight: '1.2',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em'
                }}>
                    MEMORIA TÉCNICA<br />Y DE DISEÑO
                </h1>

                <h2 style={{
                    fontSize: '1.25rem',
                    color: '#4b5563',
                    fontWeight: 400,
                    marginBottom: '4rem'
                }}>
                    SISTEMA DE POTABILIZACIÓN — TECNOLOGÍA FiME
                </h2>

                <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #f3f4f6',
                    display: 'inline-block',
                    minWidth: '60%'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#9ca3af',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.1em'
                    }}>
                        PROYECTO
                    </p>
                    <h3 style={{
                        fontSize: '1.75rem',
                        color: '#1f2937',
                        fontWeight: 700,
                        margin: 0
                    }}>
                        {projectName || 'NOMBRE DEL PROYECTO'}
                    </h3>
                </div>
            </div>

            {/* Bottom Details */}
            <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>UBICACIÓN</p>
                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: 500 }}>{location || 'Departamento, Municipio'}</p>
                </div>

                <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>BENEFICIARIO</p>
                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: 500 }}>{entityName}</p>
                </div>

                <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>FECHA DE EMISIÓN</p>
                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: 500 }}>{date}</p>
                </div>

                <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>VERSIÓN DEL DOCUMENTO</p>
                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: 500 }}>rev. {version}</p>
                </div>
            </div>

            {/* Footer Copyright */}
            <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.7rem', color: '#d1d5db' }}>
                <p>Generado automáticamente por Hydrostack Platform © {new Date().getFullYear()}</p>
            </div>

            <style jsx global>{`
                @media print {
                    .report-cover {
                        border: none !important;
                        height: 100vh !important;
                        width: 100vw !important;
                        margin: 0 !important;
                        padding: 2cm !important; /* Ajuste para márgenes físicos */
                    }
                }
            `}</style>
        </div>
    );
}
