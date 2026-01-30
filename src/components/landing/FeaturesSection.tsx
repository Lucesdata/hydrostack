import { Check } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="bg-slate-50 py-24 font-sans">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <span className="inline-block bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full mb-6 shadow-sm">ENGINEERING INTELLIGENCE</span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight mb-6">
                        Dimension complex systems with confidence.
                    </h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        Hydrostack translates raw water data into fully engineered process designs, complete with equipment lists, hydraulic profiles, and operational parameters.
                    </p>

                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-500 rounded-lg p-1.5 mt-1">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <div>
                                <span className="text-lg text-slate-900 font-medium block">Automated Mass Balance</span>
                                <span className="text-sm text-slate-500">Instant calculation of solids, COD, BOD, and Nitrogen removal.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-500 rounded-lg p-1.5 mt-1">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <div>
                                <span className="text-lg text-slate-900 font-medium block">Compliance Validation</span>
                                <span className="text-sm text-slate-500">Auto-check designs against local EPA/EU environmental standards.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-500 rounded-lg p-1.5 mt-1">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <div>
                                <span className="text-lg text-slate-900 font-medium block">Dynamic Scaling</span>
                                <span className="text-sm text-slate-500">Resize entire plant parameters instantly based on population growth scenarios.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Abstract industrial representation */}
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 relative border border-slate-800 group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565514020128-2c2a05217b94?q=80&w=2546&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                        {/* Code/Data Overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-8 font-mono text-xs">
                            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-lg text-slate-300 space-y-2 shadow-xl">
                                <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                                    <span className="text-emerald-400">Simulation_Result_v2.json</span>
                                    <span className="text-slate-500">24ms</span>
                                </div>
                                <p><span className="text-purple-400">const</span> <span className="text-sky-300">reactorVolume</span> = <span className="text-amber-300">4500.5</span>; <span className="text-slate-500">{`// m3`}</span></p>
                                <p><span className="text-purple-400">const</span> <span className="text-sky-300">aerationDemand</span> = <span className="text-amber-300">240</span>; <span className="text-slate-500">{`// kgO2/h`}</span></p>
                                <p><span className="text-purple-400">let</span> <span className="text-sky-300">energyEfficiency</span> = <span className="text-amber-300">0.85</span>;</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">PASSED</span>
                                    <span className="bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">OPTIMIZED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
