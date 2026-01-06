
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { MOCK_CHART_DATA } from '../constants';
import { generateInsight } from '../services/geminiService';
import { DashboardCategory, ChartDataPoint } from '../types';

interface ChartSectionProps {
  category: DashboardCategory;
  activeMetricTitle?: string;
  customData?: ChartDataPoint[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ category, activeMetricTitle, customData }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Use custom data if provided (real data from reports), otherwise use mock logic
  const displayData = useMemo(() => {
    if (customData && customData.length > 0) {
      // If we have custom data but it's too short, pad it for better visualization
      if (customData.length < 4) {
        const padding = MOCK_CHART_DATA.slice(0, 4 - customData.length);
        return [...padding, ...customData];
      }
      return customData;
    }
    
    if (!activeMetricTitle) return MOCK_CHART_DATA;
    
    const seed = activeMetricTitle.length;
    return MOCK_CHART_DATA.map((point, i) => {
      const variation = Math.sin(seed + i) * 15;
      const count = Math.max(0, Math.floor(point.count + variation + (seed % 10)));
      return {
        ...point,
        count,
        trend: Math.max(0, count * 0.8 + (variation / 2))
      };
    });
  }, [activeMetricTitle, customData]);

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await generateInsight({
      metric: activeMetricTitle || 'General Performance',
      data: displayData.slice(-4)
    }, category);
    setInsight(result || "Could not generate insight.");
    setLoading(false);
  };

  const chartTitle = activeMetricTitle || (category === 'New Development' ? 'Development Velocity' : 'Performance Volume');

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800 tracking-tight">{chartTitle}</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Historical trend for the selected metric over time.</p>
        </div>
        <button 
          onClick={handleGenerateInsight}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI Insight
        </button>
      </div>

      {insight && (
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-[12px] text-indigo-900 leading-relaxed">
            <span className="font-bold mr-2 text-indigo-700">AI Analysis:</span>
            {insight}
          </p>
        </div>
      )}

      <div className="h-[300px] w-full">
        <div className="flex items-center justify-end gap-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-[2px]"></span>
              Actual
           </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
            />
            <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
            {displayData.some(d => d.trend !== undefined && d.trend !== 0) && (
              <Line 
                type="monotone" 
                dataKey="trend" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;
