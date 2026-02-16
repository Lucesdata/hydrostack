
import React from 'react';

export default function ReportSectionConstruction() {
    return (
        <div style={{ breakInside: 'avoid', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Bloque J: Especificaciones Técnicas de Construcción
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* 1. Hormigón y Estructuras */}
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.5rem' }}>
                        1. Concretos y Morteros
                    </h4>
                    <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
                        <li><strong>Concreto Estructural (Muros/Losas):</strong> 3000 psi (21 MPa). Impermeabilizado integralmente.</li>
                        <li><strong>Concreto de Limpieza:</strong> 2000 psi (14 MPa). Espesor mín. 5 cm.</li>
                        <li><strong>Acero de Refuerzo:</strong> Fy = 420 MPa (Grado 60). Corrugado.</li>
                        <li><strong>Recubrimientos:</strong> 5 cm (contacto con agua/suelo), 3 cm (aéreo).</li>
                        <li><strong>Curado:</strong> Húmedo continuo por mínimo 7 días.</li>
                    </ul>
                </div>

                {/* 2. Tuberías y Accesorios */}
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.5rem' }}>
                        2. Tuberías Hidráulicas
                    </h4>
                    <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
                        <li><strong>PVC Presión:</strong> RDE 21 para líneas principales. RDE 26 para venteos.</li>
                        <li><strong>PVC Sanitario:</strong> Solo para desagües finales y reboses sin presión.</li>
                        <li><strong>Uniones:</strong> Soldadura líquida de PVC (limpiador + soldadura).</li>
                        <li><strong>Válvulas:</strong> Cortina (cierre lento) para regulación. Mariposa para corte rápido.</li>
                        <li><strong>Soportes:</strong> Abrazaderas metálicas cada 3.0 m.</li>
                    </ul>
                </div>

                {/* 3. Mampostería y Acabados */}
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.5rem' }}>
                        3. Acabados y Protección
                    </h4>
                    <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
                        <li><strong>Pañete Impermeable:</strong> 1:3 con aditivo impermeabilizante integral (Sika-1 o similar).</li>
                        <li><strong>Pintura:</strong> Epóxica atóxica grado potable para interior tanque. Esmalte para tubería expuesta.</li>
                        <li><strong>Juntas:</strong> Cinta PVC O-22 en juntas de construcción. Sellante elástico de poliuretano.</li>
                    </ul>
                </div>

                {/* 4. Tolerancias */}
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.5rem' }}>
                        4. Tolerancias Aceptables
                    </h4>
                    <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
                        <li><strong>Nivelación de Vertederos:</strong> ± 1 mm (CRÍTICO para distribución uniforme).</li>
                        <li><strong>Verticalidad Muros:</strong> 1/300 de la altura.</li>
                        <li><strong>Espesor de Lechos:</strong> ± 2 cm.</li>
                        <li><strong>Cotas de Fondo:</strong> ± 1 cm.</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', border: '2px dashed #F59E0B', borderRadius: '4px', backgroundColor: '#FFFBEB' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    ⚠ PUNTOS DE CONTROL CRÍTICO (HOLD POINTS)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                    <div>
                        1. Recepción del terreno y replanteo topográfico.<br />
                        2. Verificación de armado de hierro antes de fundir.
                    </div>
                    <div>
                        3. Prueba de estanqueidad (24h) antes de rellenar.<br />
                        4. Nivelación de vertederos con nivel de precisión.
                    </div>
                </div>
            </div>
        </div>
    );
}
