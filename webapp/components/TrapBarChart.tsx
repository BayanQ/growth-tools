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
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2a2a2a" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#525252' }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={{ stroke: '#2a2a2a' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={170}
            tick={{ fontSize: 12, fill: '#a3a3a3' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/100`, 'Trap Score']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #2a2a2a',
              backgroundColor: '#1d1d1d',
              color: '#f5f5f5',
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
