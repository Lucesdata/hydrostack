import { Hexagon, Triangle, Circle, Box, Aperture } from 'lucide-react';

const logos = [
    { icon: Hexagon, name: 'Arup' },
    { icon: Triangle, name: 'STANTEC' },
    { icon: Circle, name: 'AECOM' },
    { icon: Box, name: 'JACOBS' },
    { icon: Aperture, name: 'VEOLIA' },
];

export default function LogosSection() {
    return (
        <section
            className="relative py-16 overflow-hidden"
            style={{ background: 'var(--ocean-900)' }}
        >
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.15), transparent)' }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.1), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 text-center">
                <p
                    className="text-xs font-mono tracking-widest uppercase mb-10"
                    style={{ color: 'var(--text-muted)' }}
                >
                    // Impulsando la próxima generación de proyectos de infraestructura
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                    {logos.map(({ icon: Icon, name }) => (
                        <div
                            key={name}
                            className="flex items-center gap-2.5 font-bold text-lg transition-all duration-300 cursor-default"
                            style={{
                                color: 'var(--text-muted)',
                                opacity: 0.35,
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.opacity = '1';
                                (e.currentTarget as HTMLDivElement).style.color = 'var(--teal-400)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.opacity = '0.35';
                                (e.currentTarget as HTMLDivElement).style.color = 'var(--text-muted)';
                            }}
                        >
                            <Icon className="w-5 h-5 fill-current" />
                            {name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
