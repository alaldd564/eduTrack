'use client'

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts'

interface ProgressChartProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function ProgressChart({
  progress,
  size = 'md',
  label,
}: ProgressChartProps) {
  const data = [{ value: progress, fill: 'url(#progressGradient)' }]

  const sizeConfig = {
    sm: { width: 80, height: 80, innerRadius: 25, outerRadius: 35, fontSize: 'text-sm' },
    md: { width: 140, height: 140, innerRadius: 45, outerRadius: 60, fontSize: 'text-2xl' },
    lg: { width: 200, height: 200, innerRadius: 65, outerRadius: 85, fontSize: 'text-4xl' },
  }

  const config = sizeConfig[size]

  return (
    <div className="relative flex flex-col items-center">
      <div style={{ width: config.width, height: config.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.22 250)" />
                <stop offset="100%" stopColor="oklch(0.7 0.2 170)" />
              </linearGradient>
            </defs>
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'oklch(0.18 0.015 260)' }}
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-mono font-bold tracking-tight text-foreground ${config.fontSize}`}>
          {progress}%
        </span>
        {label && (
          <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
