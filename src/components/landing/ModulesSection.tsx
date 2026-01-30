import { Waves, FlaskConical, Filter, Trash2, Droplet, Zap } from 'lucide-react';

export default function ModulesSection() {
    const modules = [
        {
            icon: Waves,
            title: "Preliminary Treatment",
            description: "Dimensioning of screening channels, grit chambers, and oil & grease removal units based on peak flow."
        },
        {
            icon: FlaskConical,
            title: "Biological Reactors",
            description: "Sizing for Activated Sludge, SBR, or MBBR processes with precise oxygen demand calculations."
        },
        {
            icon: Filter,
            title: "Clarification",
            description: "Surface area and depth calculation for secondary clarifiers including sludge return ratios."
        },
        {
            icon: Trash2,
            title: "Sludge Management",
            description: "Thickening, digestion, and dewatering equipment sizing based on dry solids production."
        },
        {
            icon: Droplet,
            title: "Tertiary Filtration",
            description: "Sand filter and membrane sizing for high-quality effluent reuse standards."
        },
        {
            icon: Zap,
            title: "Energy Optimization",
            description: "AI analysis of pump and blower configurations to minimize operational kWh/m³."
        }
    ];

    return (
        <section className="py-24 bg-white font-sans">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">PLATFORM MODULES</span>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
                        Full-Cycle Treatment Plant Design
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        From preliminary screening to tertiary filtration, our algorithms handle every stage of the treatment process.
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
