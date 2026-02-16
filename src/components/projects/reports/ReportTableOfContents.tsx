
import React from 'react';

export default function ReportTableOfContents() {
    const chapters = [
        { number: '1', title: 'INTRODUCCION', page: '6' },
        { number: '2', title: 'OBJETIVOS', page: '7' },
        { number: '2.1', title: 'GENERAL', page: '7', indent: true },
        { number: '2.2', title: 'ESPECIFICOS', page: '7', indent: true },
        { number: '3', title: 'CONSIDERACIONES GENERALES', page: '8' },
        { number: '4', title: 'IDENTIFICACION DEL RIESGO A TRATAR', page: '9' },
        { number: '5', title: 'SELECCIÓN Y JUSTIFICACION DE ETAPAS DE TRATAMIENTO', page: '11' },
        { number: '6', title: 'LA TECNOLOGÍA DE FILTRACIÓN EN MÚLTIPLES ETAPAS', page: '14' },
        { number: '6.1', title: 'FILTRACION GRUESA DINÁMICA', page: '14', indent: true },
        { number: '6.1.1', title: 'COMPONENTES PRINCIPALES DEL Fgdi', page: '15', indent: true, sub: true },
        { number: '6.1.2', title: 'CRITERIOS DE DISEÑO', page: '16', indent: true, sub: true },
        { number: '6.2', title: 'FILTRACION LENTA EN ARENA', page: '18', indent: true },
        { number: '6.2.1', title: 'PRINCIPIOS DEL TRATAMIENTO', page: '18', indent: true, sub: true },
        { number: '7', title: 'DESARROLLO URBANO', page: '22' },
        { number: '7.1', title: 'CAMBIO ARITMÉTICO O LINEAL', page: '22', indent: true },
        { number: '7.2', title: 'CAMBIO GEOMÉTRICO O EXPONENCIAL', page: '24', indent: true },
        { number: '7.3', title: 'MÉTODO DE MÍNIMOS CUADRADOS', page: '25', indent: true },
        { number: '8', title: 'CAUDALES DE DISEÑO', page: '28' },
        { number: '8.1', title: 'CAUDAL MEDIO Y MÁXIMO DE AGUA POTABLE', page: '28', indent: true },
        { number: '9', title: 'CALCULO HIDRAULICO DE UNIDADES DE TRATAMIENTO', page: '30' },
        { number: '9.1', title: 'FILTRACION GRUESA DINAMICA', page: '30', indent: true },
        { number: '9.1.1', title: 'CAMARA DE AQUIETAMIENTO', page: '30', indent: true, sub: true },
        { number: '9.1.2', title: 'CANALES DE AFORO', page: '31', indent: true, sub: true },
        { number: '9.1.3', title: 'CAMARA DE ENTRADA', page: '32', indent: true, sub: true },
        { number: '9.1.4', title: 'LECHO FILTRANTE', page: '32', indent: true, sub: true },
        { number: '9.1.5', title: 'SISTEMA DE RECOLECCION DRENAJE', page: '34', indent: true, sub: true },
        { number: '9.1.6', title: 'CAMARA DE REBOSE', page: '35', indent: true, sub: true },
        { number: '9.1.7', title: 'CAMARA DE LAVADO', page: '36', indent: true, sub: true },
        { number: '9.1.8', title: 'CAMARA DE LAVADO DE ARENA', page: '37', indent: true, sub: true },
        { number: '9.2', title: 'PERDIDAS HIDRAULICAS DE ENERGIA ENTRE Fgdi Y FLA', page: '38', indent: true },
        { number: '9.3', title: 'FILTRACION LENTA EN ARENA', page: '39', indent: true },
        { number: '9.3.1', title: 'CAMARA DE REBOSE', page: '39', indent: true, sub: true },
        { number: '9.3.2', title: 'CANAL DE AFORO', page: '39', indent: true, sub: true },
        { number: '9.3.3', title: 'CAMARA DE ENTRADA', page: '40', indent: true, sub: true },
        { number: '9.3.4', title: 'CAMARA DE FILTRACION Y LECHO FILTRANTE', page: '40', indent: true, sub: true },
        { number: '9.3.5', title: 'SISTEMA DE RECOLECCIÓN – DRENAJE', page: '41', indent: true, sub: true },
        { number: '9.3.6', title: 'CÁMARA DE SALIDA', page: '42', indent: true, sub: true },
        { number: '9.3.7', title: 'CÁMARA DE LAVADO DE ARENA', page: '43', indent: true, sub: true },
        { number: '9.3.8', title: 'CASETA DE ALMACENAMIENTO DE ARENA', page: '43', indent: true, sub: true },
        { number: '9.3.9', title: 'PERDIDAS HIDRAULICAS DE ENERGIA ENTRE FLA Y TANQUE DE CONTACTO', page: '44', indent: true, sub: true },
        { number: '10', title: 'DESINFECCION', page: '45' },
        { number: '10.1', title: 'TANQUE DOSIFICADOR DE CLORO', page: '45', indent: true },
        { number: '10.2', title: 'TANQUE DE CONTACTO', page: '46', indent: true },
        { number: '11', title: 'SISTEMA DE DESINFECCION', page: '47' },
        { number: '11.1', title: 'TANQUE DOSIFICADOR DE CLORO', page: '47', indent: true },
        { number: '11.2', title: 'TANQUE DE CONTACTO', page: '48', indent: true },
        { number: '12', title: 'MANUAL DE OPERACIÓN Y MANTENIMIENTO', page: '49' },
        { number: '12.1', title: 'FILTRACIÓN GRUESA DINÁMICA', page: '49', indent: true },
        { number: '12.2', title: 'FILTRACIÓN LENTA EN ARENA', page: '50', indent: true },
        { number: '13', title: 'ANEXOS', page: '55' },
    ];

    return (
        <div style={{
            pageBreakAfter: 'always',
            padding: '3rem',
            backgroundColor: 'white',
            minHeight: '1100px'
        }}>
            <h2 style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '2rem',
                textTransform: 'uppercase'
            }}>Tabla de Contenido</h2>

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                borderBottom: '2px solid #000',
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
                fontWeight: 'bold',
                fontSize: '0.9rem'
            }}>
                PAG
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {chapters.map((chapter, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        fontSize: chapter.sub ? '0.85rem' : chapter.indent ? '0.9rem' : '1rem',
                        fontWeight: chapter.sub ? 400 : chapter.indent ? 500 : 700,
                        paddingLeft: chapter.sub ? '3rem' : chapter.indent ? '1.5rem' : '0',
                        color: '#1f2937'
                    }}>
                        <div style={{ width: '60px', flexShrink: 0 }}>{chapter.number}</div>
                        <div style={{ flexGrow: 1, position: 'relative' }}>
                            <span style={{ backgroundColor: 'white', position: 'relative', zIndex: 1, paddingRight: '0.5rem' }}>
                                {chapter.title}
                            </span>
                            <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                left: 0,
                                width: '100%',
                                borderBottom: '1px dotted #9ca3af',
                                zIndex: 0
                            }} />
                        </div>
                        <div style={{ width: '30px', textAlign: 'right', flexShrink: 0 }}>{chapter.page}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
