'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type CategoryData = {
  name: string
  value: number
}

const COLORS = ['#E8884A', '#2D3B3B', '#C4B49A', '#D4733A', '#F5E6D8', '#E8E0D5']

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={90}
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
