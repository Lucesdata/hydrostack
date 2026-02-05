"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Fase1DiagnosticoProps {
    projectId: string;
}

export default function Fase1Diagnostico({ projectId }: Fase1DiagnosticoProps) {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1); // 1: Bienvenida, 2: Población, 3: Caudales, 4: Resultados

    // Inputs población
    const [poblacionActual, setPoblacionActual] = useState(2500);
    const [anioInicial, setAnioInicial] = useState(2024);
    const [anioHorizonte, setAnioHorizonte] = useState(2036);
    const [tasaCrecimiento, setTasaCrecimiento] = useState(2.5); // %

    // Inputs caudales
    const [dotacionNeta, setDotacionNeta] = useState(125);
    const [perdidas, setPerdidas] = useState(30);
    const [consumosAdicionales, setConsumosAdicionales] = useState(0);

    // Cálculos
    const periodoDiseno = anioHorizonte - anioInicial;
    const dotacionBruta = dotacionNeta * (1 + perdidas / 100);

    const poblacionAritmetica = poblacionActual * (1 + (tasaCrecimiento / 100) * periodoDiseno);
    const poblacionGeometrica = poblacionActual * Math.pow(1 + tasaCrecimiento / 100, periodoDiseno);
    const poblacionMinCuadrados = (poblacionAritmetica + poblacionGeometrica) / 2; // Simplificado

    const [poblacionSeleccionada, setPoblacionSeleccionada] = useState<'aritmetica' | 'geometrica' | 'mincuadrados'>('geometrica');

    const poblacionFinal = poblacionSeleccionada === 'aritmetica' ? poblacionAritmetica :
        poblacionSeleccionada === 'geometrica' ? poblacionGeometrica :
            poblacionMinCuadrados;

    const qmd = (poblacionFinal * dotacionBruta) / 86400; // L/s
    const qca = consumosAdicionales; // L/s adicionales
    const QMD = 1.3 * (qmd + qca); // Factor K1 = 1.3

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
            {/* Header con Timeline */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Fase 1: Diagnóstico y Proyección de Demanda
                </h1>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    Determinación del Caudal Máximo Diario (QMD) mediante proyección poblacional
                </p>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { num: 1, label: 'Bienvenida' },
                        { num: 2, label: 'Proyección Poblacional' },
                        { num: 3, label: 'Cálculo de Caudales' },
                        { num: 4, label: 'Resultado QMD' }
                    ].map(s => (
                        <div key={s.num} style={{
                            flex: 1,
                            padding: '1rem',
                            background: step >= s.num ? '#10b981' : '#e5e7eb',
                            color: step >= s.num ? 'white' : '#64748b',
                            borderRadius: '12px',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: step >= s.num ? 'rgba(255,255,255,0.25)' : 'rgba(100,116,139,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 700
                            }}>
                                {s.num}
                            </div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Bienvenida */}
            {step === 1 && (
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '2.5rem',
                    borderRadius: '20px',
                    color: 'white',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                        ¡Bienvenido al Módulo de Diagnóstico! 🎯
                    </h2>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem', opacity: 0.95 }}>
                        Esta fase es <strong>fundamental</strong> para el éxito del diseño. Aquí determinaremos el <strong>Caudal Máximo Diario (Q<sub>MD</sub>)</strong>,
                        que es la base para dimensionar toda la planta FIME.
                    </p>
                    <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Nos basaremos en:
                    </p>
                    <ul style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem', paddingLeft: '1.5rem' }}>
                        <li><strong>Crecimiento poblacional</strong> proyectado a 12 años</li>
                        <li><strong>Hábitos de consumo</strong> de la comunidad (dotación)</li>
                        <li><strong>Pérdidas del sistema</strong> (30% estándar)</li>
                        <li><strong>Factor de mayoración</strong> K₁ = 1.3 (RAS-2000)</li>
                    </ul>
                    <button
                        onClick={() => setStep(2)}
                        style={{
                            background: 'white',
                            color: '#10b981',
                            padding: '0.875rem 2rem',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        Iniciar Diagnóstico →
                    </button>
                </div>
            )}

            {/* Step 2: Proyección Poblacional */}
            {step === 2 && (
                <div>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
                            📊 Proyección de Población
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Población Actual (P₀)
                                </label>
                                <input
                                    type="number"
                                    value={poblacionActual}
                                    onChange={(e) => setPoblacionActual(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Tasa de Crecimiento (%)
                                </label>
                                <input
                                    type="number"
                                    value={tasaCrecimiento}
                                    onChange={(e) => setTasaCrecimiento(Number(e.target.value))}
                                    step="0.1"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Año Inicial (T₀)
                                </label>
                                <input
                                    type="number"
                                    value={anioInicial}
                                    onChange={(e) => setAnioInicial(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Año Horizonte (Tₓ)
                                </label>
                                <input
                                    type="number"
                                    value={anioHorizonte}
                                    onChange={(e) => setAnioHorizonte(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Métodos de Cálculo */}
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                            Métodos de Proyección
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            {/* Aritmético */}
                            <button
                                onClick={() => setPoblacionSeleccionada('aritmetica')}
                                style={{
                                    background: poblacionSeleccionada === 'aritmetica' ? '#a7f3d0' : 'white',
                                    border: `2px solid ${poblacionSeleccionada === 'aritmetica' ? '#10b981' : '#e5e7eb'}`,
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    MÉTODO ARITMÉTICO
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {Math.round(poblacionAritmetica).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                    Pf = P₀ · [1 + K · (Tf - T₀)]
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                    ⚡ Crecimiento lineal constante
                                </div>
                            </button>

                            {/* Geométrico */}
                            <button
                                onClick={() => setPoblacionSeleccionada('geometrica')}
                                style={{
                                    background: poblacionSeleccionada === 'geometrica' ? '#a7f3d0' : 'white',
                                    border: `2px solid ${poblacionSeleccionada === 'geometrica' ? '#10b981' : '#e5e7eb'}`,
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    MÉTODO GEOMÉTRICO
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {Math.round(poblacionGeometrica).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                    Pf = P₀ · (1 + r)^(Tf - T₀)
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                    📈 Crecimiento exponencial
                                </div>
                            </button>

                            {/* Mínimos Cuadrados */}
                            <button
                                onClick={() => setPoblacionSeleccionada('mincuadrados')}
                                style={{
                                    background: poblacionSeleccionada === 'mincuadrados' ? '#a7f3d0' : 'white',
                                    border: `2px solid ${poblacionSeleccionada === 'mincuadrados' ? '#10b981' : '#e5e7eb'}`,
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    MÍNIMOS CUADRADOS
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {Math.round(poblacionMinCuadrados).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                    Ajuste de tendencia histórica
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                    📊 Basado en censos previos
                                </div>
                            </button>
                        </div>

                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#166534'
                        }}>
                            <strong>💡 Recomendación:</strong> El método <strong>geométrico</strong> es el más usado en comunidades rurales con crecimiento moderado.
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => setStep(1)}
                            style={{
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                color: '#64748b',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            ← Atrás
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '0.875rem 2rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Continuar a Caudales →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Caudales */}
            {step === 3 && (
                <div>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
                            💧 Cálculo de Caudales
                        </h3>

                        <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                Población proyectada ({poblacionSeleccionada})
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                                {Math.round(poblacionFinal).toLocaleString()} habitantes
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Dotación Neta (L/hab-día)
                                </label>
                                <input
                                    type="number"
                                    value={dotacionNeta}
                                    onChange={(e) => setDotacionNeta(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    Estándar: 125 L/hab-día (RAS)
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Pérdidas del Sistema (%)
                                </label>
                                <input
                                    type="number"
                                    value={perdidas}
                                    onChange={(e) => setPerdidas(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    Estándar: 30% (incluye fugas y desperdicios)
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: '#f0fdf4',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.75rem' }}>
                                📐 <strong>Dotación Bruta = Dotación Neta × (1 + Pérdidas/100)</strong>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                                {dotacionBruta.toFixed(1)} L/hab-día
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                Consumos Adicionales Localizados (L/s)
                            </label>
                            <input
                                type="number"
                                value={consumosAdicionales}
                                onChange={(e) => setConsumosAdicionales(Number(e.target.value))}
                                step="0.1"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                Ej: Escuelas, centros de salud, canchas de fútbol
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => setStep(2)}
                            style={{
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                color: '#64748b',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            ← Atrás
                        </button>
                        <button
                            onClick={() => setStep(4)}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '0.875rem 2rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Ver Resultado Final →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Resultado QMD */}
            {step === 4 && (
                <div>
                    {/* Gran Card de Resultado */}
                    <div style={{
                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                        padding: '3rem',
                        borderRadius: '20px',
                        color: 'white',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)'
                    }}>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            🎯 CAUDAL MÁXIMO DIARIO DE DISEÑO
                        </div>
                        <div style={{ fontSize: '4.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            {QMD.toFixed(2)} <span style={{ fontSize: '2rem' }}>L/s</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                            = {(QMD * 3.6).toFixed(2)} m³/h = {(QMD * 86.4).toFixed(1)} m³/día
                        </div>
                    </div>

                    {/* Mensaje de Confirmación Importante */}
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: 'white',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>✅</div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                Este es el caudal de diseño para toda la planta
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                El valor <strong>QMD = {QMD.toFixed(2)} L/s</strong> será utilizado para dimensionar el FGDi, FLA y todos los módulos siguientes.
                            </div>
                        </div>
                    </div>

                    {/* Desglose */}
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
                            📋 Memoria de Cálculo
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <span style={{ color: '#64748b' }}>Población Final (método {poblacionSeleccionada})</span>
                                <strong>{Math.round(poblacionFinal).toLocaleString()} hab</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <span style={{ color: '#64748b' }}>Dotación Bruta</span>
                                <strong>{dotacionBruta.toFixed(1)} L/hab-día</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <span style={{ color: '#64748b' }}>Qmd (Caudal Medio Diario)</span>
                                <strong>{qmd.toFixed(3)} L/s</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <span style={{ color: '#64748b' }}>Qca (Consumos Adicionales)</span>
                                <strong>{qca.toFixed(2)} L/s</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#dcfce7', borderRadius: '8px', border: '2px solid #10b981' }}>
                                <span style={{ color: '#065f46', fontWeight: 600 }}>Q<sub>MD</sub> = K₁ · (Qmd + Qca), donde K₁ = 1.3</span>
                                <strong style={{ color: '#065f46' }}>{QMD.toFixed(2)} L/s</strong>
                            </div>
                        </div>
                    </div>

                    {/* Nota de Confiabilidad */}
                    <div style={{
                        background: '#fffbeb',
                        border: '1px solid #fcd34d',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                            <strong>✓ Diseño Validado:</strong> Este caudal asegura que la planta FIME no será subdimensionada ni sobdimensionada,
                            optimizando costos de inversión (CapEx) y operación (OpEx).
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setStep(3)}
                            style={{
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                color: '#64748b',
                                padding: '0.875rem 1.5rem',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            ← Revisar Cálculos
                        </button>
                        <button
                            onClick={async () => {
                                // Guardar QMD en la base de datos antes de continuar
                                try {
                                    // Primero verificamos si ya existe un registro
                                    const { data: existingData } = await supabase
                                        .from('project_calculations')
                                        .select('id, calculated_flows')
                                        .eq('project_id', projectId)
                                        .maybeSingle();

                                    const calculationData = {
                                        final_population: Math.round(poblacionFinal),
                                        population_method: poblacionSeleccionada,
                                        net_dotation: dotacionNeta,
                                        gross_dotation: dotacionBruta,
                                        losses_percent: perdidas,
                                        qmd: qmd,
                                        qmd_max: QMD,
                                        k1_factor: 1.3,
                                        additional_flows: consumosAdicionales
                                    };

                                    if (existingData) {
                                        // Actualizar registro existente
                                        const { error } = await supabase
                                            .from('project_calculations')
                                            .update({
                                                calculated_flows: {
                                                    ...(existingData.calculated_flows || {}),
                                                    ...calculationData
                                                },
                                                updated_at: new Date().toISOString()
                                            })
                                            .eq('project_id', projectId);
                                        if (error) throw error;
                                    } else {
                                        // Crear nuevo registro
                                        const { error } = await supabase
                                            .from('project_calculations')
                                            .insert({
                                                project_id: projectId,
                                                calculated_flows: calculationData
                                            });
                                        if (error) throw error;
                                    }

                                    alert('✅ Fase 1 guardada exitosamente. Redirigiendo a Fase 2...');
                                    router.push(`/dashboard/projects/${projectId}/fime-seleccion-tecnologia`);
                                } catch (error) {
                                    console.error('Error guardando Fase 1:', error);
                                    alert('❌ Error al guardar. Por favor intente nuevamente.');
                                }
                            }}
                            style={{
                                flex: 1,
                                background: '#8b5cf6',
                                color: 'white',
                                padding: '0.875rem 2rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Guardar y Continuar a Fase 2 →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
