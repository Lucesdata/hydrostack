'use client';

import React from 'react';
import type { DimensionScores } from '@/types/tech-selector';

interface RadarEntry {
    label: string;
    color: string;
    dimensions: DimensionScores;
}

interface Props {
    entries: RadarEntry[];
    size?: number;
}

const AXES: { key: keyof DimensionScores; label: string; shortLabel: string }[] = [
    { key: 'technological', label: 'Tecnológica', shortLabel: 'T' },
    { key: 'economic', label: 'Económica', shortLabel: 'E' },
    { key: 'sociocultural', label: 'Socio-cultural', shortLabel: 'S' },
    { key: 'environmental', label: 'Ambiental', shortLabel: 'A' },
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number): [number, number] {
    const rad = (angle - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export default function RadarChart({ entries, size = 280 }: Props) {
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 40;
    const levels = [20, 40, 60, 80, 100];
    const angleStep = 360 / AXES.length;

    // Generate polygon points for a given set of dimension scores
    function getPolygonPoints(dimensions: DimensionScores): string {
        return AXES.map((axis, i) => {
            const value = dimensions[axis.key];
            const r = (value / 100) * maxR;
            const [x, y] = polarToCartesian(cx, cy, r, i * angleStep);
            return `${x},${y}`;
        }).join(' ');
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
                {/* Grid levels */}
                {levels.map(level => {
                    const r = (level / 100) * maxR;
                    const points = Array.from({ length: AXES.length }, (_, i) => {
                        const [x, y] = polarToCartesian(cx, cy, r, i * angleStep);
                        return `${x},${y}`;
                    }).join(' ');
                    return (
                        <polygon
                            key={level}
                            points={points}
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="0.5"
                        />
                    );
                })}

                {/* Axis lines + labels */}
                {AXES.map((axis, i) => {
                    const [x, y] = polarToCartesian(cx, cy, maxR, i * angleStep);
                    const [lx, ly] = polarToCartesian(cx, cy, maxR + 18, i * angleStep);
                    return (
                        <g key={axis.key}>
                            <line
                                x1={cx} y1={cy} x2={x} y2={y}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="0.5"
                            />
                            <text
                                x={lx} y={ly}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="fill-slate-500 text-[9px] font-mono"
                            >
                                {axis.shortLabel}
                            </text>
                        </g>
                    );
                })}

                {/* Technology polygons */}
                {entries.map((entry, idx) => (
                    <g key={idx}>
                        <polygon
                            points={getPolygonPoints(entry.dimensions)}
                            fill={entry.color}
                            fillOpacity={0.12}
                            stroke={entry.color}
                            strokeWidth="1.5"
                            strokeOpacity={0.7}
                        />
                        {/* Data points */}
                        {AXES.map((axis, i) => {
                            const value = entry.dimensions[axis.key];
                            const r = (value / 100) * maxR;
                            const [x, y] = polarToCartesian(cx, cy, r, i * angleStep);
                            return (
                                <circle
                                    key={axis.key}
                                    cx={x} cy={y} r={2.5}
                                    fill={entry.color}
                                    stroke="#0a0c10"
                                    strokeWidth="1"
                                />
                            );
                        })}
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3">
                {entries.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] text-slate-400 font-mono">{entry.label}</span>
                    </div>
                ))}
            </div>

            {/* Axis Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {AXES.map(axis => (
                    <span key={axis.key} className="text-[9px] text-slate-600 font-mono">
                        <span className="text-slate-400">{axis.shortLabel}</span> = {axis.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
