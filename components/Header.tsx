
import React from 'react';
import { Languages, Bell, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-20">
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search insights..." 
          className="bg-transparent border-none outline-none text-sm text-slate-600 w-64 placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors uppercase tracking-tight">
          <Languages className="w-4 h-4" />
          English
        </button>
      </div>
    </header>
  );
};

export default Header;
