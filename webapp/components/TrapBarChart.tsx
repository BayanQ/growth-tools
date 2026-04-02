'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { TrapScores, Trap } from '@/lib/types';
import { TRAP_LABELS } from '@/lib/content';

interface Props {
  trapScores: TrapScores;
  primaryTrap: Trap;
}

const TRAP_ORDER: Trap[] = [
  'growth_by_addition',
  'key_person_reliance',
  'acquisition_over_expansion',
  'activity_confusion',
];

export function TrapBarChart({ trapScores, primaryTrap }: Props) {
  const data = TRAP_ORDER.map((trap) => ({
    name: TRAP_LABELS[trap],
    score: trapScores[trap],
    isPrimary: trap === primaryTrap,
  }));

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={170}
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/100`, 'Trap Score']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              color: '#111111',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isPrimary ? '#ef4444' : '#f97316'}
                opacity={entry.isPrimary ? 1 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
