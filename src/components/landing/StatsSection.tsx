export default function StatsSection() {
    return (
        <section className="py-20 bg-white border-b border-slate-100 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center md:border-r border-slate-100 p-4">
                        <p className="text-4xl md:text-5xl font-semibold text-slate-900 mb-2 tracking-tight">4.2<span className="text-emerald-500 text-2xl align-top">GL</span></p>
                        <p className="text-slate-500 text-sm font-medium">Daily Flow Optimized</p>
                    </div>
                    <div className="text-center md:border-r border-slate-100 p-4">
                        <p className="text-4xl md:text-5xl font-semibold text-slate-900 mb-2 tracking-tight">850<span className="text-emerald-500 text-2xl align-top">+</span></p>
                        <p className="text-slate-500 text-sm font-medium">Projects Dimensioned</p>
                    </div>
                    <div className="text-center md:border-r border-slate-100 p-4">
                        <p className="text-4xl md:text-5xl font-semibold text-slate-900 mb-2 tracking-tight">30<span className="text-emerald-500 text-2xl align-top">%</span></p>
                        <p className="text-slate-500 text-sm font-medium">Energy Savings Avg.</p>
                    </div>
                    <div className="text-center p-4">
                        <p className="text-4xl md:text-5xl font-semibold text-slate-900 mb-2 tracking-tight">100<span className="text-emerald-500 text-2xl align-top">%</span></p>
                        <p className="text-slate-500 text-sm font-medium">Compliance Ready</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
