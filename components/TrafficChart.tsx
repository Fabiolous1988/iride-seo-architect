import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrafficData } from '../types';

interface TrafficChartProps {
  data: TrafficData[];
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
            formatter={(value: number) => [value.toLocaleString(), 'Est. Visits']}
          />
          <Area 
            type="monotone" 
            dataKey="visits" 
            stroke="#818cf8" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVisits)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};