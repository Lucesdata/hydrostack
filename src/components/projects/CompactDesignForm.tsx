"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function CompactDesignForm({
    projectId,
    initialData,
    designFlow
}: {
    projectId: string;
    initialData: any;
    designFlow: number;
}) {
    const [formData, setFormData] = useState({
        mixing_gradient: initialData?.mixing_gradient ?? 1000,
        floc_retention_time: initialData?.floc_retention_time ?? 20,
        lamellar_loading_rate: initialData?.lamellar_loading_rate ?? 120,
        filtration_rate: initialData?.filtration_rate ?? 7,
        chlorine_contact_time: initialData?.chlorine_contact_time ?? 20,
    });

    const [results, setResults] = useState({
        lamellarArea: 0,
        filterArea: 0,
        contactVolume: 0,
        flocVolume: 0,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // Engineering Calculations for Compact PRFV
    useEffect(() => {
        if (designFlow) {
            const Q_Ls = designFlow;
            const Q_m3h = (Q_Ls * 3600) / 1000;
            const Q_m3d = Q_m3h * 24;

            // 1. Flocculation Volume (V = Q * t)
            const Vfloc = (Q_m3h * formData.floc_retention_time) / 60;

            // 2. Lamellar Area (As = Q / q)
            const As_lam = Q_m3d / formData.lamellar_loading_rate;

            // 3. Filter Area (Af = Q / Vf)
            const Af_filt = Q_m3h / formData.filtration_rate;

            // 4. Contact Volume (V = Q * t)
            const Vcontact = (Q_m3h * formData.chlorine_contact_time) / 60;

            setResults({
                flocVolume: parseFloat(Vfloc.toFixed(2)),
                lamellarArea: parseFloat(As_lam.toFixed(2)),
                filterArea: parseFloat(Af_filt.toFixed(2)),
                contactVolume: parseFloat(Vcontact.toFixed(2))
            });
        }
    }, [formData, designFlow]);

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
                .from('project_compact_ptap')
                .upsert({
                    project_id: projectId,
                    design_flow: designFlow,
                    ...formData,
                    lamellar_area: results.lamellarArea,
                    filter_area: results.filterArea,
                    tank_contact_volume: results.contactVolume,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage('Diseño de PTAP compacta guardado exitosamente.');
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
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-gray-medium)', paddingBottom: '0.5rem' }}>
                    Ingeniería: PTAP Compacta en PRFV
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ fontWeight: 600, color: 'var(--color-gray-dark)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Floculación y Mezcla</p>
                        </div>
                        <Input id="mixing_gradient" name="mixing_gradient" type="number" label="Gradiente de Mezcla (G) [s⁻¹]" value={formData.mixing_gradient} onChange={handleInputChange} />
                        <Input id="floc_retention_time" name="floc_retention_time" type="number" label="T. Retención Floc [min]" value={formData.floc_retention_time} onChange={handleInputChange} />

                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <p style={{ fontWeight: 600, color: 'var(--color-gray-dark)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Sedimentación y Filtración</p>
                        </div>
                        <Input id="lamellar_loading_rate" name="lamellar_loading_rate" type="number" label="Tasa de Carga Lamelar [m³/m²/d]" value={formData.lamellar_loading_rate} onChange={handleInputChange} />
                        <Input id="filtration_rate" name="filtration_rate" type="number" label="Tasa de Filtración [m/h]" value={formData.filtration_rate} onChange={handleInputChange} />

                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <p style={{ fontWeight: 600, color: 'var(--color-gray-dark)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>Desinfección (Tanque de Contacto)</p>
                        </div>
                        <Input id="chlorine_contact_time" name="chlorine_contact_time" type="number" label="T. de Contacto Mínimo [min]" value={formData.chlorine_contact_time} onChange={handleInputChange} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <Button type="submit" disabled={loading} variant={saved ? 'secondary' : 'primary'}>
                            {loading ? 'Guardando...' : 'Guardar Ingeniería'}
                        </Button>
                        {saved && (
                            <Button type="button" onClick={() => router.push(`/dashboard/projects/${projectId}/costs`)} style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                                Continuar a Costos OpEx {"->"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ position: 'sticky', top: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-primary-dark, #1e293b)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dimensiones Requeridas</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>VOLUMEN FLOCULACIÓN</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{results.flocVolume} m³</p>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>ÁREA SEDIMENTADOR LAMELAR</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{results.lamellarArea} m²</p>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>ÁREA DE FILTRACIÓN</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{results.filterArea} m²</p>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>VOLUMEN TANQUE CONTACTO CLORO</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{results.contactVolume} m³</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                            Diseño basado en parámetros de alta tasa para plantas compactas en PRFV.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
