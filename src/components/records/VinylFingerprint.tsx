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

  // Chart dimensions - larger for readability
  const svgSize = 500;
  const svgCenter = svgSize / 2;
  const maxRadius = 160;
  const innerRadius = 40;
  const labelRadius = maxRadius + 50;

  // Calculate segment angles - each axis gets a third of the circle
  const axisAngle = (Math.PI * 2) / data.axes.length;

  return (
    <Card variant="elevated" className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
        {/* SVG Chart */}
        <div className="relative flex items-center justify-center">
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="w-full h-auto max-w-[450px] sm:max-w-[550px] lg:max-w-[650px]"
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
              cx={svgCenter}
              cy={svgCenter}
              r={maxRadius}
              fill="url(#vinylGradient)"
            />

            {/* Grooves - many concentric circles */}
            {Array.from({ length: 40 }, (_, i) => {
              const grooveRadius = innerRadius + 5 + ((maxRadius - innerRadius - 5) * i) / 40;
              return (
                <circle
                  key={`groove-${i}`}
                  cx={svgCenter}
                  cy={svgCenter}
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
                cx={svgCenter}
                cy={svgCenter}
                r={innerRadius + (maxRadius - innerRadius) * scale}
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="2"
              />
            ))}

            {/* Center label area */}
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={innerRadius + 2}
              fill="url(#labelGradient)"
              stroke="#333"
              strokeWidth="1"
            />

            {/* Label ring detail */}
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={innerRadius - 3}
              fill="none"
              stroke="#444"
              strokeWidth="0.5"
            />

            {/* Center spindle hole */}
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={4}
              fill="#000"
              stroke="#222"
              strokeWidth="1"
            />

            {/* Spindle hole highlight */}
            <circle
              cx={svgCenter - 1}
              cy={svgCenter - 1}
              r={2}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />

            {/* Axis divider lines - subtle */}
            {data.axes.map((axis, axisIndex) => {
              const angle = axisIndex * axisAngle - Math.PI / 2;
              const startX = svgCenter + Math.cos(angle) * (innerRadius + 5);
              const startY = svgCenter + Math.sin(angle) * (innerRadius + 5);
              const endX = svgCenter + Math.cos(angle) * (maxRadius - 2);
              const endY = svgCenter + Math.sin(angle) * (maxRadius - 2);

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
                const x = svgCenter + Math.cos(angle) * radius;
                const y = svgCenter + Math.sin(angle) * radius;

                // Create arc segment
                const arcStartAngle = startAngle + itemIndex * segmentAngle;
                const arcEndAngle = startAngle + (itemIndex + 1) * segmentAngle;

                const innerX1 = svgCenter + Math.cos(arcStartAngle) * innerRadius;
                const innerY1 = svgCenter + Math.sin(arcStartAngle) * innerRadius;
                const innerX2 = svgCenter + Math.cos(arcEndAngle) * innerRadius;
                const innerY2 = svgCenter + Math.sin(arcEndAngle) * innerRadius;
                const outerX1 = svgCenter + Math.cos(arcStartAngle) * radius;
                const outerY1 = svgCenter + Math.sin(arcStartAngle) * radius;
                const outerX2 = svgCenter + Math.cos(arcEndAngle) * radius;
                const outerY2 = svgCenter + Math.sin(arcEndAngle) * radius;

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
              cx={svgCenter}
              cy={svgCenter}
              r={maxRadius}
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="3"
              style={{ pointerEvents: 'none' }}
            />
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={maxRadius - 1.5}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />

            {/* Shine overlay */}
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={maxRadius - 2}
              fill="url(#vinylShine)"
              style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }}
            />

            {/* Outer rim highlight */}
            <circle
              cx={svgCenter}
              cy={svgCenter}
              r={maxRadius + 2}
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="4"
              style={{ pointerEvents: 'none' }}
            />

            {/* Curved text paths for category labels */}
            {data.axes.map((axis, axisIndex) => {
              const startAngle = axisIndex * axisAngle - Math.PI / 2;
              const endAngle = startAngle + axisAngle;
              const midAngle = (startAngle + endAngle) / 2;
              const arcRadius = labelRadius;

              // Check if the label is in the bottom half of the circle (sin > 0 in SVG coords)
              // If so, flip the arc direction so text appears right-side up
              const needsFlip = Math.sin(midAngle) > 0;

              // Calculate arc endpoints - swap if flipping
              const arcStartX = svgCenter + Math.cos(needsFlip ? endAngle : startAngle) * arcRadius;
              const arcStartY = svgCenter + Math.sin(needsFlip ? endAngle : startAngle) * arcRadius;
              const arcEndX = svgCenter + Math.cos(needsFlip ? startAngle : endAngle) * arcRadius;
              const arcEndY = svgCenter + Math.sin(needsFlip ? startAngle : endAngle) * arcRadius;

              const pathId = `labelPath-${axisIndex}`;
              const largeArc = axisAngle > Math.PI ? 1 : 0;
              const sweepFlag = needsFlip ? 0 : 1;

              return (
                <g key={`label-${axis.label}`}>
                  <defs>
                    <path
                      id={pathId}
                      d={`M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${arcEndX} ${arcEndY}`}
                      fill="none"
                    />
                  </defs>
                  <text
                    fill={axis.color}
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                      fontFamily: 'var(--font-oswald), "Impact", sans-serif',
                      letterSpacing: '0.2em'
                    }}
                    className="text-lg sm:text-xl lg:text-2xl font-semibold uppercase"
                  >
                    <textPath
                      href={`#${pathId}`}
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      {axis.label}
                    </textPath>
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-vinyl-50">{records.length}</p>
              <p className="text-sm sm:text-base text-vinyl-400 uppercase tracking-widest">records</p>
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
      </div>

      <p className="text-center text-[11px] sm:text-xs text-vinyl-500 mt-4">
        Your Vinyl Fingerprint — hover over segments for details
      </p>
    </Card>
  );
}
