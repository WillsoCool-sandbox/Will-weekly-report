
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Trophy, ArrowRight, Calendar } from 'lucide-react';
import { WeeklyHighlight } from '../types.ts';

interface WeeklyHighlightsDashboardProps {
  highlights: WeeklyHighlight[];
}

const WeeklyHighlightsDashboard: React.FC<WeeklyHighlightsDashboardProps> = ({ highlights }) => {
  // Helper to parse the weekRange string for sorting
  // Formats: "1 Dec - 5 Dec 2025" or "Highlight of week 22 Dec - 26 Dec 2025"
  const getSortValue = (str: string) => {
    try {
      if (!str) return 0;
      
      // Extract Year (4 digits, often at end)
      const yearMatch = str.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

      // Extract First Day and Month
      // Matches "1 Dec" or "22 Dec" or "01 Jan"
      const dateMatch = str.match(/(\d{1,2})\s+([A-Za-z]{3})/);
      let monthIndex = 0;
      let day = 0;

      if (dateMatch) {
        day = parseInt(dateMatch[1], 10);
        const months: Record<string, number> = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const monthStr = dateMatch[2].charAt(0).toUpperCase() + dateMatch[2].substring(1, 3).toLowerCase();
        monthIndex = months[monthStr] ?? 0;
      }

      // Create a sortable number: YYYYMMDD
      return year * 10000 + (monthIndex + 1) * 100 + day;
    } catch (e) {
      console.error("Sorting error for date:", str, e);
      return 0;
    }
  };

  // Sort highlights by extracted date descending (newest week first)
  const sortedHighlights = useMemo(() => 
    [...highlights].sort((a, b) => getSortValue(b.weekRange) - getSortValue(a.weekRange)), 
  [highlights]);

  // The most recent week's ID (after sorting by date)
  const latestId = sortedHighlights.length > 0 ? sortedHighlights[0].id : null;

  // State to track expanded rows
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(latestId ? [latestId] : []));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (highlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
        <Sparkles className="w-12 h-12 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">No Weekly Highlights</h3>
        <p className="text-slate-500 max-w-sm mt-2">Upload reports to generate weekly performance highlights automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-100 rounded-xl">
          <Trophy className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Weekly Milestone Archive</h2>
          <p className="text-slate-500 font-medium text-sm">Reviewing major wins and strategic growth.</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedHighlights.map((h) => {
          const isExpanded = expandedIds.has(h.id);
          const isLatest = h.id === latestId;

          return (
            <div 
              key={h.id} 
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'border-purple-200 shadow-xl shadow-purple-500/5' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <button 
                onClick={() => toggleExpand(h.id)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-colors ${
                    isExpanded ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{h.weekRange}</h3>
                      {isLatest && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full tracking-widest">Latest</span>
                      )}
                    </div>
                    <p className={`text-sm font-medium transition-colors ${isExpanded ? 'text-purple-600' : 'text-slate-400'}`}>
                      {isExpanded ? 'Showing full report' : h.summary.substring(0, 100) + '...'}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[2000px] opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <div className="p-8 pb-12">
                  <div className="max-w-3xl">
                    <div>
                      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                          Key Achievements
                        </h4>
                      </div>
                      <ul className="space-y-4">
                        {h.achievements && h.achievements.length > 0 ? h.achievements.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 group">
                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover:scale-125 transition-transform" />
                            <span className="text-[15px] text-slate-700 font-medium leading-relaxed">
                              {item}
                            </span>
                          </li>
                        )) : (
                          <li className="text-slate-400 italic text-sm">No specific achievements identified for this week.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyHighlightsDashboard;
