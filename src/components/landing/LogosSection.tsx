import { Hexagon, Triangle, Circle, Box, Aperture } from 'lucide-react';

export default function LogosSection() {
    return (
        <section className="py-16 bg-slate-50 border-t border-slate-200 font-sans">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-8">Powering the next generation of infrastructure projects</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Hexagon className="fill-current text-slate-800" /> Arup</div>
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Triangle className="fill-current text-slate-800" /> STANTEC</div>
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Circle className="fill-current text-slate-800" /> AECOM</div>
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Box className="fill-current text-slate-800" /> JACOBS</div>
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Aperture className="fill-current text-slate-800" /> VEOLIA</div>
                </div>
            </div>
        </section>
    );
}
