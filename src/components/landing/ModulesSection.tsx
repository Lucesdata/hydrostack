import { Users, Workflow, Filter, Trash2, Droplet, ClipboardCheck } from 'lucide-react';

export default function ModulesSection() {
    const modules = [
        {
            icon: Users,
            tag: 'POB',
            title: "Proyección Poblacional",
            description: "Cálculo de demanda hídrica incluyendo población flotante y turismo estacional (Método Geométrico/Lineal).",
            accent: 'var(--teal-500)',
        },
        {
            icon: Workflow,
            tag: 'IGST',
            title: "Selección de Tecnología",
            description: "Matriz de decisión automatizada para elegir entre FIME, Filtros Lentos o Convencionales según calidad del agua.",
            accent: 'var(--amber-500)',
        },
        {
            icon: Filter,
            tag: 'FGDi',
            title: "Filtración Gruesa",
            description: "Dimensionamiento de pre-filtros dinámicos para reducción de picos de turbiedad y sólidos suspendidos.",
            accent: 'var(--sky-400)',
        },
        {
            icon: Droplet,
            tag: 'FLA',
            title: "Filtros Lentos",
            description: "Diseño de bio-filtros de arena para remoción de patógenos sin uso de químicos intensivos.",
            accent: 'var(--teal-400)',
        },
        {
            icon: Trash2,
            tag: 'DES',
            title: "Desarenadores",
            description: "Cálculo hidráulico para unidades de remoción de arenas con zonas de entrada, sedimentación y lodos.",
            accent: '#818cf8',
        },
        {
            icon: ClipboardCheck,
            tag: 'RAS',
            title: "Análisis Normativo",
            description: "Verificación de cumplimiento con RAS-2000 y cálculo de Índice de Riesgo de Calidad (IRCA).",
            accent: 'var(--teal-500)',
        }
    ];

    return (
        <section
            id="modules"
            className="relative py-28 overflow-hidden"
            style={{ background: 'var(--ocean-800)' }}
        >
            {/* Grid background */}
            <div className="absolute inset-0 bg-grid-ocean pointer-events-none" />

            {/* Top accent */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.25), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-6"
                        style={{
                            border: '1px solid rgba(0,200,168,0.2)',
                            background: 'rgba(0,200,168,0.06)',
                            color: 'var(--sky-400)',
                        }}
                    >
                        Módulos de la Plataforma
                    </div>
                    <h2
                        className="font-display font-bold leading-tight mb-4"
                        style={{
                            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Ciclo completo de<br />
                        <em style={{ color: 'var(--teal-400)', fontStyle: 'italic' }}>acueductos rurales.</em>
                    </h2>
                    <p
                        className="text-base leading-relaxed"
                        style={{ color: 'var(--text-secondary)', maxWidth: '52ch' }}
                    >
                        Desde la estimación de la demanda hasta el diseño de detalle de unidades de filtración,
                        Hydrostack integra todo el flujo de ingeniería de agua potable.
                    </p>
                </div>

                {/* Modules grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(0,200,168,0.06)' }}>
                    {modules.map((module, index) => (
                        <div
                            key={index}
                            className="group relative p-8 transition-all duration-300"
                            style={{ background: 'var(--ocean-800)' }}
                        >
                            {/* Hover background */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{ background: 'var(--ocean-900)' }}
                            />

                            {/* Hover top accent line */}
                            <div
                                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `linear-gradient(90deg, ${module.accent}, transparent)` }}
                            />

                            <div className="relative z-10">
                                {/* Tag + Icon */}
                                <div className="flex items-center justify-between mb-5">
                                    <span
                                        className="text-xs font-mono tracking-widest"
                                        style={{ color: module.accent }}
                                    >
                                        {module.tag}
                                    </span>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                        style={{
                                            background: 'rgba(0,200,168,0.06)',
                                            border: `1px solid ${module.accent}25`,
                                        }}
                                    >
                                        <module.icon
                                            className="w-5 h-5 transition-colors duration-300"
                                            style={{ color: module.accent }}
                                        />
                                    </div>
                                </div>

                                <h3
                                    className="font-semibold text-base mb-3 leading-snug"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {module.title}
                                </h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {module.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
