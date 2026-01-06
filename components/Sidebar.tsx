
import React, { useRef } from 'react';
import { Code2, Upload, ChevronRight, BarChart3, Loader2, FileText, Sparkles, Trash2, Download, FolderOpen, Save, Mail } from 'lucide-react';
import { SavedReport, DashboardCategory } from '../types.ts';

interface SidebarProps {
  reports: SavedReport[];
  activeReportId: string | null;
  activeCategory: DashboardCategory;
  onCategorySelect: (cat: DashboardCategory) => void;
  onReportSelect: (id: string) => void;
  onFileUpload: (file: File) => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onDownloadSeedFile: () => void;
  isUploading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  reports, 
  activeReportId, 
  activeCategory, 
  onCategorySelect, 
  onReportSelect, 
  onFileUpload, 
  onClearAll,
  onExport,
  onImport,
  onDownloadSeedFile,
  isUploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const categories: { id: DashboardCategory; icon: any; color: string }[] = [
    { id: 'Weekly Highlight', icon: Sparkles, color: 'text-purple-400' },
    { id: 'New Development', icon: Code2, color: 'text-blue-400' },
    { id: 'Support & Marketing', icon: Mail, color: 'text-amber-400' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
  };

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-md shadow-lg shadow-blue-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dev Reports</h1>
        </div>
      </div>

      <nav className="px-4 py-2 space-y-1 mt-2">
        <p className="px-2 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Dashboards</p>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeCategory === cat.id 
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                  : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeCategory === cat.id ? cat.color : 'text-slate-500'}`} />
              {cat.id}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-6 space-y-3">
        <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Analyzing...' : 'Upload New Report'}
        </button>

        <div className="pt-2">
           <p className="px-2 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Developer Persistence</p>
           <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={onDownloadSeedFile}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-blue-400 border-2 border-blue-500/30 hover:bg-blue-500/10 rounded-xl transition-all shadow-lg shadow-blue-500/5"
              title="Download current data as initialData.ts"
            >
              <Save className="w-3.5 h-3.5" />
              Download initialData.ts
            </button>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="file" 
                ref={importInputRef} 
                className="hidden" 
                accept=".json"
                onChange={handleImportChange}
              />
              <button 
                onClick={() => importInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 rounded-lg transition-all"
              >
                <FolderOpen className="w-3 h-3" />
                Import
              </button>
              <button 
                onClick={onExport}
                className="flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 rounded-lg transition-all"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto flex flex-col border-t border-slate-800/50">
        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Report History</p>
          {reports.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors uppercase tracking-widest"
              title="Clear all reports"
            >
              <Trash2 className="w-2.5 h-2.5" />
              Clear
            </button>
          )}
        </div>
        
        <div className="space-y-1 flex-1">
          {reports.length === 0 ? (
            <div className="px-3 py-8 text-center border-2 border-dashed border-slate-800/50 rounded-2xl bg-slate-900/30">
              <p className="text-[10px] text-slate-600 font-medium">No reports yet</p>
            </div>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                onClick={() => onReportSelect(report.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs rounded-lg transition-all text-left group ${
                  activeReportId === report.id 
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-lg' 
                    : 'hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${activeReportId === report.id ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="truncate flex-1 font-medium">{report.name}</span>
                {activeReportId === report.id && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
