
import React from 'react';
import { Target, CheckCircle2, Timer, AlertCircle } from 'lucide-react';
import { MOCK_MILESTONES } from '../constants';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'in-progress': return <Timer className="w-4 h-4 text-blue-500" />;
    default: return <AlertCircle className="w-4 h-4 text-slate-300" />;
  }
};

const MilestonesSection: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-rose-500" />
        <h3 className="text-lg font-bold text-slate-800">Recent Milestones (Top 5)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MILESTONES.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-4 border border-slate-50 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <StatusIcon status={m.status} />
              <div>
                <p className="text-sm font-semibold text-slate-700">{m.title}</p>
                <p className="text-xs text-slate-400 uppercase tracking-tight">{m.status.replace('-', ' ')}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{m.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestonesSection;
