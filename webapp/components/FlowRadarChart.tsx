'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { FlowScores, Flow } from '@/lib/types';
import { FLOW_LABELS } from '@/lib/content';

interface Props {
  flowScores: FlowScores;
  weakestFlow: Flow;
}

const FLOW_ORDER: Flow[] = ['demand', 'sales', 'delivery', 'expansion'];

export function FlowRadarChart({ flowScores, weakestFlow }: Props) {
  const data = FLOW_ORDER.map((flow) => ({
    subject: FLOW_LABELS[flow],
    score: flowScores[flow],
    fullMark: 100,
    isWeakest: flow === weakestFlow,
  }));

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 16, right: 32, left: 32, bottom: 16 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Flow Health"
            dataKey="score"
            stroke="#4d65ff"
            fill="#4d65ff"
            fillOpacity={0.12}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/100`, 'Flow Health']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              color: '#111111',
              fontSize: '13px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
