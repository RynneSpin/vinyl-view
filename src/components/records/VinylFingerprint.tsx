'use client';

import { useMemo, useState } from 'react';
import type { Record } from '@/types/record';
import Card from '../ui/Card';

interface VinylFingerprintProps {
  records: Record[];
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface AxisData {
  label: string;
  color: string;
  items: CategoryData[];
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export default function VinylFingerprint({ records }: VinylFingerprintProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const data = useMemo(() => {
    if (records.length === 0) return null;

    // Aggregate genres
    const genreCounts = new Map<string, number>();
    records.forEach(r => {
      r.genres.forEach(g => {
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      });
    });
    const genres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / records.length) * 100,
      }));

    // Aggregate decades
    const decadeCounts = new Map<string, number>();
    records.forEach(r => {
      if (r.year) {
        const decade = Math.floor(r.year / 10) * 10;
        const label = `${decade}s`;
        decadeCounts.set(label, (decadeCounts.get(label) || 0) + 1);
      }
    });
    const decades = Array.from(decadeCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / records.length) * 100,
      }));

    // Aggregate countries
    const countryCounts = new Map<string, number>();
    records.forEach(r => {
      if (r.country) {
        countryCounts.set(r.country, (countryCounts.get(r.country) || 0) + 1);
      }
    });
    const countries = Array.from(countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / records.length) * 100,
      }));

    return {
      axes: [
        { label: 'Genre', color: '#a855f7', items: genres },      // accent-purple
        { label: 'Decade', color: '#ec4899', items: decades },     // accent-pink
        { label: 'Country', color: '#3b82f6', items: countries },  // accent-blue
      ] as AxisData[],
    };
  }, [records]);

  if (!data || records.length === 0) {
    return null;
  }

  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const innerRadius = 30;

  // Calculate segment angles - each axis gets a quarter of the circle
  const axisAngle = (Math.PI * 2) / data.axes.length;

  return (
    <Card variant="elevated" className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-8">
        {/* SVG Chart */}
        <div className="relative flex-1 flex items-center justify-center min-w-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-auto max-w-[320px] sm:max-w-[420px] lg:max-w-none lg:w-[min(100%,560px)] aspect-square"
          >
            {/* Definitions for gradients and effects */}
            <defs>
              {/* Vinyl base gradient */}
              <radialGradient id="vinylGradient" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#2a2a2a" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0d0d0d" />
              </radialGradient>

              {/* Shine overlay */}
              <linearGradient id="vinylShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.08" />
                <stop offset="45%" stopColor="white" stopOpacity="0" />
                <stop offset="55%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="0.03" />
              </linearGradient>

              {/* Center label gradient */}
              <radialGradient id="labelGradient" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#3d3d3d" />
                <stop offset="100%" stopColor="#1f1f1f" />
              </radialGradient>
            </defs>

            {/* Vinyl base */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius}
              fill="url(#vinylGradient)"
            />

            {/* Grooves - many concentric circles */}
            {Array.from({ length: 40 }, (_, i) => {
              const grooveRadius = innerRadius + 5 + ((maxRadius - innerRadius - 5) * i) / 40;
              return (
                <circle
                  key={`groove-${i}`}
                  cx={center}
                  cy={center}
                  r={grooveRadius}
                  fill="none"
                  stroke={i % 3 === 0 ? '#1a1a1a' : '#252525'}
                  strokeWidth={i % 5 === 0 ? 0.8 : 0.4}
                  opacity={0.6}
                />
              );
            })}

            {/* Subtle groove highlight rings */}
            {[0.25, 0.5, 0.75].map((scale, i) => (
              <circle
                key={`highlight-${i}`}
                cx={center}
                cy={center}
                r={innerRadius + (maxRadius - innerRadius) * scale}
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="2"
              />
            ))}

            {/* Center label area */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius + 2}
              fill="url(#labelGradient)"
              stroke="#333"
              strokeWidth="1"
            />

            {/* Label ring detail */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius - 3}
              fill="none"
              stroke="#444"
              strokeWidth="0.5"
            />

            {/* Center spindle hole */}
            <circle
              cx={center}
              cy={center}
              r={4}
              fill="#000"
              stroke="#222"
              strokeWidth="1"
            />

            {/* Spindle hole highlight */}
            <circle
              cx={center - 1}
              cy={center - 1}
              r={2}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />

            {/* Axis divider lines - subtle */}
            {data.axes.map((axis, axisIndex) => {
              const angle = axisIndex * axisAngle - Math.PI / 2;
              const startX = center + Math.cos(angle) * (innerRadius + 5);
              const startY = center + Math.sin(angle) * (innerRadius + 5);
              const endX = center + Math.cos(angle) * (maxRadius - 2);
              const endY = center + Math.sin(angle) * (maxRadius - 2);

              return (
                <line
                  key={axis.label}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={axis.color}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="2 3"
                />
              );
            })}

            {/* Data segments */}
            {data.axes.map((axis, axisIndex) => {
              const startAngle = axisIndex * axisAngle - Math.PI / 2;
              const segmentAngle = axisAngle / Math.max(axis.items.length, 1);

              return axis.items.map((item, itemIndex) => {
                const angle = startAngle + (itemIndex + 0.5) * segmentAngle;
                const radius = innerRadius + (maxRadius - innerRadius) * (item.percentage / 100);
                const x = center + Math.cos(angle) * radius;
                const y = center + Math.sin(angle) * radius;

                // Create arc segment
                const arcStartAngle = startAngle + itemIndex * segmentAngle;
                const arcEndAngle = startAngle + (itemIndex + 1) * segmentAngle;

                const innerX1 = center + Math.cos(arcStartAngle) * innerRadius;
                const innerY1 = center + Math.sin(arcStartAngle) * innerRadius;
                const innerX2 = center + Math.cos(arcEndAngle) * innerRadius;
                const innerY2 = center + Math.sin(arcEndAngle) * innerRadius;
                const outerX1 = center + Math.cos(arcStartAngle) * radius;
                const outerY1 = center + Math.sin(arcStartAngle) * radius;
                const outerX2 = center + Math.cos(arcEndAngle) * radius;
                const outerY2 = center + Math.sin(arcEndAngle) * radius;

                const largeArc = segmentAngle > Math.PI ? 1 : 0;

                const pathD = `
                  M ${innerX1} ${innerY1}
                  L ${outerX1} ${outerY1}
                  A ${radius} ${radius} 0 ${largeArc} 1 ${outerX2} ${outerY2}
                  L ${innerX2} ${innerY2}
                  A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1}
                  Z
                `;

                return (
                  <g key={`${axis.label}-${item.name}`} className="cursor-pointer">
                    <path
                      d={pathD}
                      fill={axis.color}
                      fillOpacity={0.2 + (item.percentage / 100) * 0.5}
                      stroke={axis.color}
                      strokeWidth="0.5"
                      strokeOpacity="0.6"
                      style={{ mixBlendMode: 'screen' }}
                      className="transition-all duration-300 hover:fill-opacity-80 hover:stroke-opacity-100 hover:stroke-[1.5px]"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                        if (rect) {
                          setTooltip({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                            label: axis.label,
                            name: item.name,
                            value: item.value,
                            percentage: item.percentage,
                            color: axis.color,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  </g>
                );
              });
            })}

            {/* Outer edge bevel */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius}
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="3"
            />
            <circle
              cx={center}
              cy={center}
              r={maxRadius - 1.5}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />

            {/* Shine overlay */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius - 2}
              fill="url(#vinylShine)"
              style={{ mixBlendMode: 'overlay' }}
            />

            {/* Outer rim highlight */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius + 2}
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="4"
            />
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-vinyl-50">{records.length}</p>
              <p className="text-[10px] sm:text-xs text-vinyl-400">records</p>
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg shadow-lg bg-vinyl-800 border border-vinyl-700"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%) translateY(-8px)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: tooltip.color }}>
                {tooltip.label}
              </p>
              <p className="text-sm font-semibold text-vinyl-50">{tooltip.name}</p>
              <p className="text-xs text-vinyl-400">
                {tooltip.value} records ({Math.round(tooltip.percentage)}%)
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 w-full lg:w-52 flex-shrink-0 lg:justify-center">
          {data.axes.map((axis) => (
            <div key={axis.label} className="flex-1 lg:flex-none bg-vinyl-800/50 rounded-lg p-2.5 sm:p-3">
              <h4
                className="text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2"
                style={{ color: axis.color }}
              >
                {axis.label}
              </h4>
              <ul className="space-y-0.5 sm:space-y-1">
                {axis.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between text-[11px] sm:text-xs gap-2"
                  >
                    <span className="text-vinyl-300 truncate">{item.name}</span>
                    <span className="text-vinyl-500 flex-shrink-0">{item.value}</span>
                  </li>
                ))}
                {axis.items.length === 0 && (
                  <li className="text-[11px] text-vinyl-500">No data</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] sm:text-xs text-vinyl-500 mt-4 lg:mt-6">
        Your Vinyl Fingerprint — a unique visualization of your collection
      </p>
    </Card>
  );
}
