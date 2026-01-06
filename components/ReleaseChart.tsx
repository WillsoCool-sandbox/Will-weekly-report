
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Text } from 'recharts';
import { ReleasePoint } from '../types.ts';

interface ReleaseChartProps {
  releases: ReleasePoint[];
  projectName: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    const isMobile = data.projectName?.toLowerCase().includes('mobile');
    
    return (
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 max-w-xs">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{data.fullLabel}</p>
        <p className="text-sm font-bold text-blue-400 mb-2">
          {isMobile ? `Version ${data.version}` : 'Product Release'}
        </p>
        <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">{data.description}</p>
        <div className="flex items-center justify-between border-t border-slate-800 pt-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Volume:</span>
          <span className="text-sm font-black text-blue-400">
            {isMobile ? `Version ${data.version}` : (data.storiesCount || 0) + ' Story Points'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ReleaseChart: React.FC<ReleaseChartProps> = ({ releases, projectName }) => {
  const isMobileProject = projectName.toLowerCase().includes('mobile');

  const chartData = useMemo(() => {
    if (!releases || releases.length === 0) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return releases
      .map(r => {
        const d = new Date(r.date);
        // MOBILE ONLY uses height 1. Others use storiesCount for height to show volume.
        const positionValue = isMobileProject ? 1 : (Number(r.storiesCount) || 0);
        
        return {
          ...r,
          projectName,
          displayValue: positionValue,
          timestamp: isNaN(d.getTime()) ? Date.now() : d.getTime(),
          weekLabel: !isNaN(d.getTime()) ? `${d.getDate()} ${months[d.getMonth()]}` : 'N/A',
          fullLabel: r.date
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [releases, projectName, isMobileProject]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center p-8">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">No Historical Data</p>
        <p className="text-slate-500 text-sm max-w-xs">Release points for "{projectName}" will appear here once reports are uploaded.</p>
      </div>
    );
  }

  // Domain configuration: flat line for mobile, dynamic for others.
  const maxVal = Math.max(...chartData.map(d => d.displayValue));
  const yDomain = isMobileProject ? [0, 4] : [0, Math.max(20, maxVal + 10)];

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 40, right: 60, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" verticalFill={['#fff', '#f8fafc']} fillOpacity={0.4} />
          
          <XAxis 
            dataKey="weekLabel" 
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            dy={10}
            padding={{ left: 20, right: 20 }}
          />
          
          <YAxis 
            type="number" 
            domain={yDomain} 
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
            dx={-5}
            padding={{ top: 0, bottom: 0 }} 
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
          
          <Line 
            type="linear"
            dataKey="displayValue" 
            stroke="#3b82f6" 
            strokeWidth={4} 
            connectNulls={true}
            activeDot={{ r: 8, fill: '#1e40af', strokeWidth: 2, stroke: '#fff' }}
            animationDuration={1000}
            label={(props: any) => {
              const { x, y, index } = props;
              const point = chartData[index];
              if (!point) return null;

              const labelText = isMobileProject 
                ? point.version 
                : `${point.storiesCount || 0} Story Points`;

              return (
                <Text
                  x={x}
                  y={y - 22}
                  fill="#1e40af"
                  fontSize={11}
                  fontWeight={800}
                  textAnchor="middle"
                  className="drop-shadow-sm pointer-events-none select-none"
                >
                  {labelText}
                </Text>
              );
            }}
            dot={(props: any) => {
              const { cx, cy } = props;
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={6} 
                  fill="#3b82f6" 
                  stroke="#fff" 
                  strokeWidth={2}
                  className="filter drop-shadow-md"
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-8 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
          <span>Point Height = {isMobileProject ? 'Version Release (Fixed)' : 'Story Points Total (Volume)'}</span>
        </div>
      </div>
    </div>
  );
};

export default ReleaseChart;
