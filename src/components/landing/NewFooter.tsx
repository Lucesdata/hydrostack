import { Layers, Mail, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

export default function NewFooter() {
    return (
        <footer
            className="relative pt-20 pb-10 font-sans overflow-hidden"
            style={{
                background: 'var(--ocean-950)',
                borderTop: '1px solid rgba(0,200,168,0.1)',
            }}
        >
            {/* Background grid */}
            <div className="absolute inset-0 bg-grid-ocean pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="p-1.5 rounded-lg"
                                style={{
                                    background: 'rgba(0,200,168,0.1)',
                                    border: '1px solid rgba(0,200,168,0.2)',
                                }}
                            >
                                <Layers className="w-5 h-5" style={{ color: 'var(--teal-400)' }} />
                            </div>
                            <span
                                className="text-xl font-display font-bold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Hydrostack
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            La plataforma inteligente para dimensionar, simular y optimizar
                            infraestructura de agua potable y saneamiento.
                        </p>
                        {/* Footer tagline */}
                        <p
                            className="text-xs font-mono"
                            style={{ color: 'rgba(0,200,168,0.35)', letterSpacing: '0.08em' }}
                        >
                            // ingeniería + precisión + agua
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4
                            className="text-xs font-mono tracking-widest uppercase mb-6"
                            style={{ color: 'var(--teal-400)' }}
                        >
                            Producto
                        </h4>
                        <ul className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                            {['Motor de Dimensionamiento', 'Estimador de Costos', 'Generador de Planos', 'Guía Normativa (RAS)'].map(link => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="transition-colors duration-200 hover:text-teal-400"
                                        style={{ color: 'var(--text-muted)' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-400)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Map */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4
                            className="text-xs font-mono tracking-widest uppercase mb-6"
                            style={{ color: 'var(--teal-400)' }}
                        >
                            Soporte Estratégico
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-8">
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-center gap-3 group">
                                    <div
                                        className="p-2 rounded-lg transition-all duration-200"
                                        style={{
                                            background: 'rgba(0,200,168,0.06)',
                                            border: '1px solid rgba(0,200,168,0.15)',
                                        }}
                                    >
                                        <Mail className="w-4 h-4" style={{ color: 'var(--teal-500)' }} />
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)' }}>soporte@hydrostack.io</span>
                                </li>
                                <li className="flex items-start gap-3 group">
                                    <div
                                        className="p-2 rounded-lg transition-all duration-200 mt-0.5"
                                        style={{
                                            background: 'rgba(0,200,168,0.06)',
                                            border: '1px solid rgba(0,200,168,0.15)',
                                        }}
                                    >
                                        <MapPin className="w-4 h-4" style={{ color: 'var(--teal-500)' }} />
                                    </div>
                                    <div>
                                        <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>Barcelona, España</span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            Sant Feliu de Llobregat,<br />Carrer de la Santa Creu, 10
                                        </span>
                                    </div>
                                </li>
                            </ul>

                            {/* Map */}
                            <div
                                className="relative group overflow-hidden rounded-xl aspect-video sm:aspect-auto sm:h-32"
                                style={{ border: '1px solid rgba(0,200,168,0.12)' }}
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.4!2d2.04!3d41.38!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a499318c6e2b97%3A0x1d1d1d1d!2sCarrer%20de%20la%20Santa%20Creu%2C%2010%2C%2008980%20Sant%20Feliu%20de%20Llobregat%2C%20Barcelona!5e0!3m2!1ses!2ses!4v1710312345678!5m2!1ses!2ses"
                                    width="100%" height="100%"
                                    style={{ border: 0, filter: 'grayscale(1) invert(0.85) contrast(1.1) opacity(0.5)' }}
                                    allowFullScreen={true} loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="scale-110 group-hover:scale-100 transition-transform duration-700"
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'linear-gradient(to top, var(--ocean-950) 0%, rgba(2,12,27,0.4) 60%, transparent 100%)' }}
                                />
                                <div className="absolute bottom-2 left-2">
                                    <div
                                        className="px-2 py-0.5 rounded-full text-xs font-mono"
                                        style={{
                                            background: 'rgba(0,200,168,0.12)',
                                            border: '1px solid rgba(0,200,168,0.25)',
                                            color: 'var(--teal-400)',
                                            backdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        Sede Central
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4
                            className="text-xs font-mono tracking-widest uppercase mb-6"
                            style={{ color: 'var(--teal-400)' }}
                        >
                            Recursos
                        </h4>
                        <ul className="space-y-4 text-sm">
                            {['Documentación', 'Casos de Estudio', 'Blog de Ingeniería', 'Acceso API'].map(link => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        style={{ color: 'var(--text-muted)' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-400)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                        className="transition-colors duration-200"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ borderTop: '1px solid rgba(0,200,168,0.08)' }}
                >
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        Copyright © 2025 Hydrostack Inc. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-5">
                        {[Linkedin, Twitter, Github].map((Icon, i) => (
                            <a
                                key={i} href="#"
                                style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-400)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
