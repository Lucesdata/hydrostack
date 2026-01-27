"use client";

import React from 'react';
import { BrainCircuit, CheckCircle2, Gavel } from 'lucide-react';

export default function PhilosophySection() {
    return (
        <section id="philosophy" className="py-24 bg-surface/30">
            <div className="container px-4 mx-auto">
                <div className="max-w-3xl mx-auto mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-white font-sans">
                        Diseño asistido, no automatizado
                    </h2>
                    <p className="text-lg text-muted">
                        HydroStack no reemplaza al experto. Estructura el flujo de trabajo para que tu criterio técnico brille donde más importa.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Card 1 */}
                    <div className="p-8 transition-all border rounded-xl bg-surface border-surface/50 hover:border-primary/50 group">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-white">1. Asistencia</h3>
                        <p className="text-muted leading-relaxed">
                            Cálculos complejos y validaciones normativas (RAS 0330) pre-configuradas. Olvida las hojas de cálculo rotas.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-8 transition-all border rounded-xl bg-surface border-surface/50 hover:border-primary/50 group">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-white">2. Validación</h3>
                        <p className="text-muted leading-relaxed">
                            Alertas en tiempo real sobre parámetros fuera de rango, velocidades críticas y tiempos de retención.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-8 transition-all border rounded-xl bg-surface border-surface/50 hover:border-primary/50 group">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Gavel className="w-6 h-6" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-white">3. Decisión</h3>
                        <p className="text-muted leading-relaxed">
                            Tú defines la tecnología, los coeficientes y las correcciones. La firma final siempre es tuya.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
