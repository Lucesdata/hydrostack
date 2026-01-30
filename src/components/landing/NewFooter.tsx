import { Layers, Mail, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

export default function NewFooter() {
    return (
        <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-white/10 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500/20 border border-emerald-500/30 p-1.5 rounded-lg">
                                <Layers className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-xl font-semibold tracking-tight">Hydrostack</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The intelligent platform for sizing, simulating, and optimizing wastewater treatment infrastructure.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Dimensioning Engine</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Cost Estimator</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Drawing Generator</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Compliance Guide</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-emerald-500" />
                                support@hydrostack.io
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                San Francisco, CA
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Case Studies</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Engineering Blog</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">API Access</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">Copyright © 2025 Hydrostack Inc. All Rights Reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
