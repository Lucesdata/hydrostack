
import React from 'react';

export default function ReportSectionTheoreticalFramework() {
    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '3rem',
            backgroundColor: 'white'
        }}>
            {/* 6. LA TECNOLOGÍA DE FILTRACIÓN EN MÚLTIPLES ETAPAS */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    color: '#111827',
                    textTransform: 'uppercase'
                }}>6. La Tecnología de Filtración en Múltiples Etapas (FiME)</h2>

                <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'justify',
                    color: '#4b5563',
                    marginBottom: '2rem'
                }}>
                    La tecnología FiME es una solución robusta para el tratamiento de agua en comunidades rurales y periurbanas. Se basa en una serie de barreras múltiples que mejoran progresivamente la calidad del agua mediante procesos físicos y biológicos naturales, sin depender de la adición constante de sustancias químicas.
                </p>

                {/* 6.1. FILTRACIÓN GRUESA DINÁMICA */}
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        color: '#374151'
                    }}>6.1. Filtración Gruesa Dinámica (FGDi)</h3>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        textAlign: 'justify',
                        color: '#4b5563',
                        marginBottom: '1rem'
                    }}>
                        El Filtro Grueso Dinámico es la primera etapa del sistema. Su función es proteger las unidades posteriores de altas cargas de sólidos suspendidos. Opera con flujo vertical descendente y utiliza grava gruesa como medio filtrante.
                    </p>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#4b5563' }}>6.1.1. Componentes Principales</h4>
                    <ul style={{ listStyleType: 'circle', paddingLeft: '1.5rem', fontSize: '1rem', lineHeight: '1.6', color: '#4b5563' }}>
                        <li>Cámara de entrada y vertedero de distribución.</li>
                        <li>Lecho de grava fina en la superficie (capa delgada).</li>
                        <li>Lecho de soporte de grava gruesa.</li>
                        <li>Sistema de drenaje inferior.</li>
                    </ul>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>6.1.2. Criterios de Diseño</h4>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#4b5563' }}>
                        Velocidades de filtración altas (2.0 - 3.0 m/h) para promover la retención de sólidos gruesos y permitir lavados hidráulicos frecuentes.
                    </p>
                </div>

                {/* 6.2. FILTRACIÓN LENTA EN ARENA */}
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        color: '#374151'
                    }}>6.2. Filtración Lenta en Arena (FLA)</h3>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#4b5563' }}>6.2.1. Principios del Tratamiento</h4>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        textAlign: 'justify',
                        color: '#4b5563'
                    }}>
                        El FLA es el componente principal para la remoción microbiológica. La purificación se logra mediante una combinación de procesos biológicos (formación de la capa &quot;Schmutzdecke&quot;) y físicos (cernido y sedimentación) dentro del lecho de arena fina. Es capaz de remover bacterias, virus y quistes de Giardia con alta eficiencia.
                    </p>
                </div>
            </div>

            {/* 7. DESARROLLO URBANO */}
            <div>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    color: '#111827',
                    textTransform: 'uppercase'
                }}>7. Desarrollo Urbano y Poblacional</h2>
                <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'justify',
                    color: '#4b5563',
                    marginBottom: '2rem'
                }}>
                    La proyección de población es fundamental para definir la capacidad del sistema al final de su periodo de diseño. Se han analizado tres métodos estándar de crecimiento poblacional.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>7.1. Aritmético</h4>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Crecimiento constante en cantidad por unidad de tiempo. Adecuado para poblaciones con crecimiento estable y limitado.</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>7.2. Geométrico</h4>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Crecimiento proporcional al tamaño de la población. Supone una tasa de crecimiento porcentual constante.</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>7.3. Exponencial</h4>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Modelo de crecimiento continuo, útil para poblaciones con rápida expansión o disponibilidad de recursos ilimitada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
