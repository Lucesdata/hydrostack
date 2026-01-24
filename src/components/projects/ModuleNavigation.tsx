"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ModuleKey, ProjectModuleStatus } from '@/types/project';
import Button from '@/components/ui/Button';

interface ModuleNavigationProps {
    projectId: string;
    currentModuleKey: ModuleKey;
}

interface NavItem {
    label: string;
    href: string;
    moduleKey: ModuleKey;
    block: string;
}

export default function ModuleNavigation({ projectId, currentModuleKey }: ModuleNavigationProps) {
    const router = useRouter();
    const supabase = createClient();
    const [enabledModules, setEnabledModules] = useState<NavItem[]>([]);
    const [loading, setLoading] = useState(true);

    const navItems: NavItem[] = [
        { label: 'Información General', href: `/dashboard/projects/${projectId}/general`, moduleKey: 'general', block: 'Bloque A: Contexto' },
        { label: 'Población y Censo', href: `/dashboard/projects/${projectId}/population`, moduleKey: 'population', block: 'Bloque B: Demanda' },
        { label: 'Población Estacional', href: `/dashboard/projects/${projectId}/floating-population`, moduleKey: 'floating_population', block: 'Bloque B: Demanda' },
        { label: 'Consumo de Agua', href: `/dashboard/projects/${projectId}/consumption`, moduleKey: 'consumption', block: 'Bloque B: Demanda' },
        { label: 'Fuente de Agua', href: `/dashboard/projects/${projectId}/source`, moduleKey: 'source', block: 'Bloque C: Fuente' },
        { label: 'Calidad del Agua', href: `/dashboard/projects/${projectId}/quality`, moduleKey: 'quality', block: 'Bloque C: Calidad' },
        { label: 'Caudales de Diseño', href: `/dashboard/projects/${projectId}/caudales`, moduleKey: 'caudales', block: 'Bloque D: Hidráulica' },
        { label: 'Almacenamiento', href: `/dashboard/projects/${projectId}/tank`, moduleKey: 'tank', block: 'Bloque D: Hidráulica' },
        { label: 'Conducción', href: `/dashboard/projects/${projectId}/conduccion`, moduleKey: 'conduccion', block: 'Bloque D: Hidráulica' },
        { label: 'Desarenador', href: `/dashboard/projects/${projectId}/desarenador`, moduleKey: 'desarenador', block: 'Bloque E: Tratamiento' },
        { label: 'Ensayo de Jarras', href: `/dashboard/projects/${projectId}/jar-test`, moduleKey: 'jar_test', block: 'Bloque E: Tratamiento' },
        { label: 'Filtro Lento', href: `/dashboard/projects/${projectId}/filtro-lento`, moduleKey: 'filtro_lento', block: 'Bloque E: Tratamiento' },
        { label: 'Ingeniería Compacta', href: `/dashboard/projects/${projectId}/compact-design`, moduleKey: 'compact_design', block: 'Bloque E: Tratamiento' },
        { label: 'Costos (OpEx)', href: `/dashboard/projects/${projectId}/costs`, moduleKey: 'costs', block: 'Bloque F: Evaluación' },
        { label: 'Viability y O&M', href: `/dashboard/projects/${projectId}/viability`, moduleKey: 'viability', block: 'Bloque F: Evaluación' },
        { label: 'Selección de Tecnología', href: `/dashboard/projects/${projectId}/tech-selection`, moduleKey: 'tech_selection', block: 'Bloque F: Evaluación' },
        { label: 'Informe Final', href: `/dashboard/projects/${projectId}/report`, moduleKey: 'general', block: 'Finalización' }
    ];

    useEffect(() => {
        const fetchStatuses = async () => {
            const { data } = await supabase
                .from('project_module_status')
                .select('*')
                .eq('project_id', projectId);

            if (data) {
                const statusMap = new Map();
                data.forEach((s: any) => statusMap.set(s.module_key, s.status));

                const filtered = navItems.filter(item => {
                    if (item.href.includes('/report')) return true;
                    return statusMap.get(item.moduleKey) !== 'not_applicable';
                });
                setEnabledModules(filtered);
            }
            setLoading(false);
        };

        fetchStatuses();
    }, [projectId, supabase]);

    if (loading) return null;

    const currentIndex = enabledModules.findIndex(m => m.moduleKey === currentModuleKey);
    const effectiveIndex = currentIndex === -1 && typeof window !== 'undefined' && window.location.pathname.includes('/report')
        ? enabledModules.length - 1
        : currentIndex;

    const currentItem = enabledModules[effectiveIndex];
    const prevModule = effectiveIndex > 0 ? enabledModules[effectiveIndex - 1] : null;
    const nextModule = effectiveIndex < enabledModules.length - 1 ? enabledModules[effectiveIndex + 1] : null;

    return (
        <div style={{
            marginTop: '3.5rem',
            paddingTop: '2rem',
            borderTop: '2px dashed var(--color-gray-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    {prevModule && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                            <Button
                                variant="outline"
                                onClick={() => router.push(prevModule.href)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                            >
                                ← {prevModule.label}
                            </Button>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-gray-dark)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
                                Volver al módulo anterior
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                    {currentItem && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {currentItem.block}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>
                                En desarrollo: {currentItem.label}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {nextModule ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                            <Button
                                onClick={() => router.push(nextModule.href)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                            >
                                {nextModule.label} →
                            </Button>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-gray-dark)', fontStyle: 'italic', paddingRight: '0.5rem' }}>
                                Continuar con el siguiente componente hidráulico
                            </span>
                        </div>
                    ) : (
                        currentModuleKey !== 'general' && typeof window !== 'undefined' && !window.location.pathname.includes('/report') && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                <Button
                                    onClick={() => router.push(`/dashboard/projects/${projectId}/report`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-success)', color: 'white', fontSize: '0.85rem' }}
                                >
                                    Consolidar Memoria Técnica →
                                </Button>
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-gray-dark)', fontStyle: 'italic', paddingRight: '0.5rem' }}>
                                    Finalizar y generar reporte técnico
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
