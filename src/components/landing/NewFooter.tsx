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
                            La plataforma inteligente para dimensionar, simular y optimizar infraestructura de agua potable y saneamiento.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Producto</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Motor de Dimensionamiento</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Estimador de Costos</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Generador de Planos</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Guía Normativa (RAS)</a></li>
                        </ul>
                    </div>

                    {/* Contact & Map */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="font-semibold text-white mb-6">Soporte Estratégico</h4>
                        <div className="grid sm:grid-cols-2 gap-8">
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                                        <Mail className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="group-hover:text-emerald-400 transition-colors">soporte@hydrostack.io</span>
                                </li>
                                <li className="flex items-start gap-3 group">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors mt-0.5">
                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">Barcelona, España</span>
                                        <span className="text-[11px] leading-tight">Sant Feliu de Llobregat,<br />Carrer de la Santa Creu, 10</span>
                                    </div>
                                </li>
                            </ul>

                            {/* Map Integration */}
                            <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-video sm:aspect-auto sm:h-32">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.4!2d2.04!3d41.38!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a499318c6e2b97%3A0x1d1d1d1d!2sCarrer%20de%20la%20Santa%20Creu%2C%2010%2C%2008980%20Sant%20Feliu%20de%20Llobregat%2C%20Barcelona!5e0!3m2!1ses!2ses!4v1710312345678!5m2!1ses!2ses"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2) opacity(0.6)' }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="scale-110 group-hover:scale-100 transition-transform duration-700"
                                ></iframe>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 backdrop-blur-md">
                                        Sede Central
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-white mb-6">Recursos</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentación</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Casos de Estudio</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog de Ingeniería</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Acceso API</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">Copyright © 2025 Hydrostack Inc. Todos los derechos reservados.</p>
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
