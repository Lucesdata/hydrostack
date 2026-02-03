import { Users, Workflow, Filter, Trash2, Droplet, ClipboardCheck } from 'lucide-react';

export default function ModulesSection() {
    const modules = [
        {
            icon: Users,
            title: "Proyección Poblacional",
            description: "Cálculo de demanda hídrica incluyendo población flotante y turismo estacional (Método Geométrico/Lineal)."
        },
        {
            icon: Workflow,
            title: "Selección de Tecnología",
            description: "Matriz de decisión automatizada para elegir entre FIME, Filtros Lentos o Convencionales según calidad del agua."
        },
        {
            icon: Filter,
            title: "Filtración Gruesa (FGDi)",
            description: "Dimensionamiento de pre-filtros dinámicos para reducción de picos de turbiedad y sólidos suspendidos."
        },
        {
            icon: Droplet,
            title: "Filtros Lentos (FLA)",
            description: "Diseño de bio-filtros de arena para remoción de patógenos sin uso de químicos intensivos."
        },
        {
            icon: Trash2,
            title: "Desarenadores",
            description: "Cálculo hidráulico para unidades de remoción de arenas con zonas de entrada, sedimentación y lodos."
        },
        {
            icon: ClipboardCheck,
            title: "Análisis Normativo",
            description: "Verificación de cumplimiento con RAS-2000 y cálculo de Índice de Riesgo de Calidad (IRCA)."
        }
    ];

    return (
        <section className="py-24 bg-white font-sans">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">MÓDULOS DE LA PLATAFORMA</span>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
                        Ciclo Completo de Acueductos Rurales
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        Desde la estimación de la demanda hasta el diseño de detalle de unidades de filtración, Hydrostack integra todo el flujo de ingeniería de agua potable.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => (
                        <div key={index} className="bg-slate-50 hover:bg-white p-8 rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:border-emerald-500/30 group-hover:bg-emerald-50 transition-colors">
                                <module.icon className="w-6 h-6 text-slate-700 group-hover:text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{module.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{module.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
