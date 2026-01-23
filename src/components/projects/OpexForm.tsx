"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ModuleWarning from './ModuleWarning';

export default function OpexForm({
    projectId,
    initialData,
    designFlow,
    jarTestData
}: {
    projectId: string;
    initialData: any;
    designFlow: number;
    jarTestData: any;
}) {
    const [formData, setFormData] = useState({
        alum_price_per_kg: initialData?.alum_price_per_kg ?? 2500,
        chlorine_price_per_kg: initialData?.chlorine_price_per_kg ?? 8000,
        operator_monthly_salary: initialData?.operator_monthly_salary ?? 650000,
        energy_monthly_cost: initialData?.energy_monthly_cost ?? 0,
    });

    const [results, setResults] = useState({
        costPerM3: 0,
        monthlyChemicalCost: 0,
        totalMonthlyCost: 0,
        m3PerMonth: 0
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // OpEx Calculations
    useEffect(() => {
        if (designFlow) {
            const Q_Ls = designFlow;
            const Q_m3d = (Q_Ls * 86400) / 1000;
            const Q_m3month = Q_m3d * 30;

            // Alum consumption (from Jar Test dose)
            const alumDose = jarTestData?.optimal_dose_alum ?? 30; // default 30 mg/L if not set
            const alumDailyKg = (Q_m3d * alumDose) / 1000;
            const alumMonthlyCost = alumDailyKg * 30 * formData.alum_price_per_kg;

            // Chlorine consumption (approx 3 mg/L if not defined)
            const chlorineDose = 3;
            const chlorineDailyKg = (Q_m3d * chlorineDose) / 1000;
            const chlorineMonthlyCost = chlorineDailyKg * 30 * formData.chlorine_price_per_kg;

            const chemMonthlyTotal = alumMonthlyCost + chlorineMonthlyCost;
            const totalMonthly = chemMonthlyTotal + Number(formData.operator_monthly_salary) + Number(formData.energy_monthly_cost);

            const unitCost = Q_m3month > 0 ? totalMonthly / Q_m3month : 0;

            setResults({
                costPerM3: parseFloat(unitCost.toFixed(2)),
                monthlyChemicalCost: Math.round(chemMonthlyTotal),
                totalMonthlyCost: Math.round(totalMonthly),
                m3PerMonth: Math.round(Q_m3month)
            });
        }
    }, [formData, designFlow, jarTestData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { error: upsertError } = await supabase
                .from('project_opex')
                .upsert({
                    project_id: projectId,
                    ...formData,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage('Cálculo de OpEx guardado.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <ModuleWarning projectId={projectId} moduleKey="costs" />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Cálculo de Costo Operativo (OpEx)
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input id="alum_price_per_kg" name="alum_price_per_kg" type="number" label="Precio Alumbre ($/kg)" value={formData.alum_price_per_kg} onChange={handleInputChange} />
                        <Input id="chlorine_price_per_kg" name="chlorine_price_per_kg" type="number" label="Precio Cloro ($/kg)" value={formData.chlorine_price_per_kg} onChange={handleInputChange} />
                        <Input id="operator_monthly_salary" name="operator_monthly_salary" type="number" label="Salario Operador (Mes)" value={formData.operator_monthly_salary} onChange={handleInputChange} />
                        <Input id="energy_monthly_cost" name="energy_monthly_cost" type="number" label="Costo Energía (Mes)" value={formData.energy_monthly_cost} onChange={handleInputChange} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Costos'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/viability`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Continuar a Viabilidad {"->"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-success)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '1.5rem' }}>Costo Producido</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>COSTO POR M³</p>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>${results.costPerM3} <span style={{ fontSize: '1rem', fontWeight: 400 }}>COP</span></p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>PRODUCCIÓN MENSUAL</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{results.m3PerMonth.toLocaleString()} m³/mes</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-gray-medium)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>GASTO TOTAL MENSUAL</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>${results.totalMonthlyCost.toLocaleString()} COP</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)' }}>Insumos Químicos: ${results.monthlyChemicalCost.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
