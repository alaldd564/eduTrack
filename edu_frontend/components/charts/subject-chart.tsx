'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Subject } from '@/lib/types'

interface SubjectChartProps {
  subjects: Subject[]
}

export function SubjectChart({ subjects }: SubjectChartProps) {
  const data = subjects.map((subject) => {
    const avgProgress =
      subject.chapters.reduce((sum, ch) => sum + ch.progress, 0) /
      subject.chapters.length
    const avgUnderstanding =
      subject.chapters.reduce((sum, ch) => sum + ch.understanding, 0) /
      subject.chapters.length

    return {
      name: subject.name,
      progress: Math.round(avgProgress),
      understanding: Math.round(avgUnderstanding),
    }
  })

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="progressBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.22 250)" />
              <stop offset="100%" stopColor="oklch(0.55 0.18 250)" />
            </linearGradient>
            <linearGradient id="understandingBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.7 0.2 170)" />
              <stop offset="100%" stopColor="oklch(0.6 0.16 170)" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.22 0.02 260)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
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
            formatter={(value: number, name: string) => [
              `${value}%`,
              name === 'progress' ? 'Progress' : 'Understanding',
            ]}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: '11px',
            }}
            formatter={(value) =>
              value === 'progress' ? 'Progress' : 'Understanding'
            }
          />
          <Bar
            dataKey="progress"
            fill="url(#progressBarGradient)"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="understanding"
            fill="url(#understandingBarGradient)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
