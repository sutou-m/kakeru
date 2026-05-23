'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type MonthlyData = {
  month: string
  income: number
  expense: number
}

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#C4B49A' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#C4B49A' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v === 0 ? '0' : `¥${(v / 10000).toFixed(0)}万`
          }
          width={52}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? `¥${value.toLocaleString('ja-JP')}`
              : String(value)
          }
          contentStyle={{
            borderRadius: '10px',
            border: '1px solid #E8E0D5',
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="income" name="収入" fill="#E8884A" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expense" name="支出" fill="#2D3B3B" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
