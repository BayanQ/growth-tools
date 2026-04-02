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
          <PolarGrid stroke="#2a2a2a" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 13, fill: '#a3a3a3', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#525252' }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Flow Health"
            dataKey="score"
            stroke="#cbfb45"
            fill="#cbfb45"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/100`, 'Flow Health']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #2a2a2a',
              backgroundColor: '#1d1d1d',
              color: '#f5f5f5',
              fontSize: '13px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
