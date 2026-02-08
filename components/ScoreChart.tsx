import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ScoreChartProps {
  score: number;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const data = [
    {
      name: 'Score',
      value: score,
      fill: score >= 90 ? '#22c55e' : score >= 70 ? '#eab308' : '#ef4444',
    },
  ];

  return (
    <div className="relative w-full h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={20} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            label={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
        <div className="text-4xl font-bold text-slate-800">{score}</div>
        <div className="text-xs text-slate-500 uppercase tracking-wide">ATS Score</div>
      </div>
    </div>
  );
};
