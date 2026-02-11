"use client";

import FimeTechSelection from '@/components/projects/FimeTechSelection';
import { useParams } from 'next/navigation';
import { ChevronRight, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function FimeTechSelectionPage() {
    const params = useParams();
    const projectId = params.id as string;

    return (
        <div className="max-w-6xl mx-auto space-y-4 pb-10 px-4 sm:px-0">
            {/* Compact Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                        <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Proyectos</Link>
                        <ChevronRight className="w-3 h-3 translate-y-[0.5px]" />
                        <span className="text-emerald-400/80">Configuración FIME</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        Perfil de Calidad y Selección
                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono hidden sm:block">
                            Fase 2
                        </div>
                    </h1>
                </div>
                <p className="text-slate-400 text-xs max-w-sm sm:text-right hidden sm:block leading-tight">
                    Validación normativa de la fuente y recomendación tecnológica basada en el modelo CINARA.
                </p>
            </div>

            <FimeTechSelection projectId={projectId} />
        </div>
    );
}
