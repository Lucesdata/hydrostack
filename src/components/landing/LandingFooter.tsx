"use client";

import React from 'react';

export default function LandingFooter() {
    return (
        <footer className="py-12 bg-background border-t border-surface">
            <div className="container px-4 mx-auto text-center md:text-left">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="col-span-2">
                        <div className="mb-4 text-xl font-bold text-white">HydroStack</div>
                        <p className="text-sm text-muted max-w-xs">
                            Estándar de calidad para el diseño de infraestructura de agua potable y saneamiento básico.
                        </p>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-surface/50 text-center text-sm text-muted flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} HydroStack Project. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
