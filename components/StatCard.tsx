
import React from 'react';
import { Target, FileText, Mail, ListTodo, Timer, Headset, Newspaper, Globe, Image, UserPlus } from 'lucide-react';
import { StatData } from '../types';

const IconMap: Record<string, any> = {
  'target': Target,
  'file-text': FileText,
  'mail': Mail,
  'list-todo': ListTodo,
  'timer': Timer,
  'headset': Headset,
  'newspaper': Newspaper,
  'globe': Globe,
  'image': Image,
  'user-plus': UserPlus
};

const StatCard: React.FC<StatData & { onClick?: () => void }> = ({ 
  title, 
  subtitle, 
  value, 
  trend, 
  icon, 
  active,
  onClick 
}) => {
  const Icon = IconMap[icon] || Target;
  
  const borderColor = active ? 'border-orange-400/80' : 'border-slate-100';
  const bgColor = active ? 'bg-orange-50/40' : 'bg-white';
  const iconColor = active ? 'text-orange-600' : 'text-slate-400';
  const shadowEffect = active ? 'shadow-md shadow-orange-500/5' : 'shadow-sm';
  
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer group h-full ${borderColor} ${bgColor} ${shadowEffect} hover:shadow-lg`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-0">
          <h3 className={`text-[11px] font-bold uppercase tracking-tight transition-colors leading-none mb-1 ${active ? 'text-slate-700' : 'text-slate-500'}`}>
            {title}
          </h3>
          <p className="text-slate-400 text-[10px] font-medium leading-none">{subtitle}</p>
        </div>
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${iconColor}`} />
      </div>
      
      <div className="mt-auto pt-2">
        <div className="text-2xl font-black text-slate-800 tracking-tighter leading-none">
          {value}
        </div>
        <div className={`text-[9px] font-bold mt-1.5 tracking-wide leading-none ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
