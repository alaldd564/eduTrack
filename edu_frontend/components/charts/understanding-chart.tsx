'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { UnderstandingHistory } from '@/lib/types'

interface UnderstandingChartProps {
  data: UnderstandingHistory[]
}

export function UnderstandingChart({ data }: UnderstandingChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="understandingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.7 0.2 170)" stopOpacity={0.4} />
              <stop offset="50%" stopColor="oklch(0.7 0.2 170)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="oklch(0.7 0.2 170)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.22 0.02 260)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'oklch(0.6 0.01 260)', 
              fontSize: 11, 
              fontFamily: 'Geist Mono, monospace' 
            }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'oklch(0.6 0.01 260)', 
              fontSize: 11, 
              fontFamily: 'Geist Mono, monospace' 
            }}
            width={35}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.12 0.015 260)',
              border: '1px solid oklch(0.22 0.02 260)',
              borderRadius: '12px',
              color: 'oklch(0.95 0 0)',
              fontFamily: 'Geist Mono, monospace',
              fontSize: '12px',
              boxShadow: '0 0 20px oklch(0.65 0.22 250 / 0.2)',
            }}
            formatter={(value: number) => [`${value}%`, 'Understanding']}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Area
            type="monotone"
            dataKey="understanding"
            stroke="oklch(0.7 0.2 170)"
            strokeWidth={2}
            fill="url(#understandingGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: 'oklch(0.7 0.2 170)',
              stroke: 'oklch(0.12 0.015 260)',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
