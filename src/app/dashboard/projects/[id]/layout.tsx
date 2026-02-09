/**
 * Layout de Proyecto - Solo Dashboard
 */
import React from 'react';

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="w-full min-h-screen bg-[#0a0c10] py-4">
            <div className="max-w-[1600px] mx-auto px-4">
                {children}
            </div>
        </div>
    );
}
