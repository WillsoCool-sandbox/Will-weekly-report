
// Fix: Import React to resolve 'Cannot find namespace React' error when using React.FC
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import StatCard from './components/StatCard.tsx';
import ChartSection from './components/ChartSection.tsx';
import MilestonesSection from './components/MilestonesSection.tsx';
import WeeklyHighlightsDashboard from './components/WeeklyHighlightsDashboard.tsx';
import ReleaseChart from './components/ReleaseChart.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import { MOCK_STATS, MOCK_HIGHLIGHTS } from './constants.tsx';
import { PRE_LOADED_REPORTS } from './initialData.ts';
import { analyzeDocument } from './services/geminiService.ts';
import { PdfAnalysisResult, SavedReport, DashboardCategory, WeeklyHighlight, ReleasePoint, StatData, ChartDataPoint } from './types.ts';
import { FileText, Sparkles, BarChart3, Zap, ShieldAlert, Rocket } from 'lucide-react';
import { db } from './db.ts';

const App: React.FC = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<DashboardCategory>('Weekly Highlight');
  const [activeProjectName, setActiveProjectName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [supportActiveIndex, setSupportActiveIndex] = useState(0);

  useEffect(() => {
    const initDb = async () => {
      try {
        const count = await db.reports.count();
        const hasSeededBefore = localStorage.getItem('dev_dashboard_seeded') === 'true';

        if (count === 0 && !hasSeededBefore && PRE_LOADED_REPORTS.length > 0) {
          await db.reports.bulkAdd(PRE_LOADED_REPORTS);
          localStorage.setItem('dev_dashboard_seeded', 'true');
        } else if (count === 0) {
          localStorage.setItem('dev_dashboard_seeded', 'true');
        }
        
        const allReports = await db.reports.orderBy('timestamp').reverse().toArray();
        setReports(allReports);
        if (allReports.length > 0) {
          setActiveReportId(allReports[0].id);
        }
        setDbStatus('connected');
      } catch (err) {
        console.error("Database initialization failed", err);
        setDbStatus('error');
      }
    };
    initDb();
  }, []);

  const getProjectKey = (name: string) => {
    return name.toLowerCase().replace(/[\s-]/g, '');
  };

  const activeReport = useMemo(() => 
    reports.find(r => r.id === activeReportId) || null, 
  [reports, activeReportId]);

  const projectMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    reports.forEach(r => {
      if (r.data?.categories?.newDevelopment?.projects) {
        r.data.categories.newDevelopment.projects.forEach(p => {
          const key = getProjectKey(p.name);
          if (key === 'enduserportal') {
            mapping[key] = 'End-user Portal';
          } else if (!mapping[key]) {
            mapping[key] = p.name;
          }
        });
      }
    });
    return mapping;
  }, [reports]);

  const allProjectNames = useMemo(() => {
    return Object.values(projectMapping).sort();
  }, [projectMapping]);

  // Fix: Set default project name if none selected to ensure "New Development" view works
  useEffect(() => {
    if (allProjectNames.length > 0 && !activeProjectName) {
      setActiveProjectName(allProjectNames[0]);
    }
  }, [allProjectNames, activeProjectName]);

  // Fix: Defined activeProjectFromReport to resolve 'Cannot find name' error
  const activeProjectFromReport = useMemo(() => {
    if (!activeReport || !activeProjectName) return null;
    const activeKey = getProjectKey(activeProjectName);
    return activeReport.data?.categories?.newDevelopment?.projects?.find(
      p => getProjectKey(p.name) === activeKey
    ) || null;
  }, [activeReport, activeProjectName]);

  const aggregatedReleases = useMemo(() => {
    if (!activeProjectName) return [];
    const activeKey = getProjectKey(activeProjectName);
    const releases: ReleasePoint[] = [];
    const seenVersions = new Set<string>();

    reports.forEach(r => {
      const projects = r.data?.categories?.newDevelopment?.projects;
      if (projects) {
        const project = projects.find(p => getProjectKey(p.name) === activeKey);
        if (project && project.releases) {
          project.releases.forEach(rel => {
            const key = `${rel.version}-${rel.date}`;
            if (!seenVersions.has(key)) {
              releases.push(rel);
              seenVersions.add(key);
            }
          });
        }
      }
    });
    return releases;
  }, [reports, activeProjectName]);

  const projectSummaryMetrics = useMemo(() => {
    if (aggregatedReleases.length === 0) return null;
    let totalTickets = 0;
    aggregatedReleases.forEach(rel => {
      totalTickets += (rel.storiesCount || 0);
    });
    return { total: totalTickets };
  }, [aggregatedReleases]);

  const allHighlights = useMemo<WeeklyHighlight[]>(() => {
    return reports.map(r => ({
      id: r.id,
      weekRange: r.data?.weeklyHighlight?.weekRange || 'Unknown Range',
      summary: r.data?.weeklyHighlight?.summary || 'No Summary Available',
      achievements: r.data?.weeklyHighlight?.achievements || [],
      metrics: [], 
      timestamp: r.timestamp
    }));
  }, [reports]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const mimeType = file.type;
    const fileName = file.name;
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeDocument(base64, mimeType, fileName);
        
        const newReport: SavedReport = {
          id: Date.now().toString(),
          name: fileName,
          timestamp: Date.now(),
          data: result as PdfAnalysisResult
        };

        await db.reports.add(newReport);
        localStorage.setItem('dev_dashboard_seeded', 'true');
        
        const updatedReports = await db.reports.orderBy('timestamp').reverse().toArray();
        setReports(updatedReports);
        setActiveReportId(newReport.id);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
      alert("Analysis failed.");
    }
  };

  const supportDashboardData = useMemo(() => {
    const jobCategories = [
      { title: 'Customer card created & sent', keywords: ['customer card', 'cards email'], icon: 'user-plus', subtitle: 'Loyalty & Engagement' },
      { title: 'Mail sent', keywords: ['mail sent', 'sent mail', 'emails sent'], icon: 'mail', subtitle: 'Outreach Campaign' },
      { title: 'Customer support', keywords: ['customer support', 'emails responded', 'tickets', 'resolution'], icon: 'headset', subtitle: 'Support Analysis' },
      { title: 'ICT news card created', keywords: ['ict news', 'create card ict news', 'news card', 'publications'], icon: 'newspaper', subtitle: 'News Production' },
      { title: 'Demo sites created', keywords: ['demo sites', 'demo portals', 'demo plugit'], icon: 'globe', subtitle: 'Sales Enablement' },
      { title: 'Card cover created', keywords: ['card cover', 'covers', 'design tasks', 'design work'], icon: 'image', subtitle: 'Creative Assets' },
    ];

    const totals: Record<string, number> = {};
    const histories: Record<string, ChartDataPoint[]> = {};
    jobCategories.forEach(job => {
      totals[job.title] = 0;
      histories[job.title] = [];
    });

    const chronoReports = [...reports].sort((a, b) => a.timestamp - b.timestamp);

    chronoReports.forEach(report => {
      const sm = report.data?.categories?.supportMarketing;
      if (!sm || !sm.metrics) return;

      const dateLabel = report.data?.weeklyHighlight?.weekRange?.split(' - ')[0] || report.name;

      jobCategories.forEach(job => {
        // FILTER and SUM all matching metrics in this report
        const matchingMetrics = sm.metrics.filter(rm => 
          job.keywords.some(k => rm.label.toLowerCase().includes(k)) || 
          rm.label.toLowerCase().includes(job.title.toLowerCase().split(' ')[0])
        );

        let reportSum = 0;
        matchingMetrics.forEach(m => {
          const valNum = parseInt(m.value.replace(/[^0-9]/g, '')) || 0;
          reportSum += valNum;
        });

        totals[job.title] += reportSum;
        histories[job.title].push({
          date: dateLabel,
          count: reportSum,
          trend: 0
        });
      });
    });

    const metrics: StatData[] = jobCategories.map(job => ({
      title: job.title,
      subtitle: job.subtitle,
      value: totals[job.title] > 0 ? `${totals[job.title]} Total` : '0',
      trend: reports.length > 0 ? `Aggregated across ${reports.length} weeks` : 'Awaiting Data',
      icon: job.icon,
      color: 'blue'
    }));

    return { metrics, histories };
  }, [reports]);

  const getDashboardContent = () => {
    if (activeCategory === 'Support & Marketing') {
      return {
        metrics: supportDashboardData.metrics,
        summary: activeReport?.data?.categories?.supportMarketing?.summary || "Select a report for AI analysis summary.",
        blockers: activeReport?.data?.categories?.supportMarketing?.blockers || []
      };
    }

    if (!activeReport) {
      return {
        metrics: MOCK_STATS.map(s => ({ ...s, value: '0', trend: 'Awaiting Report' })),
        summary: "Select a report to see categorized AI insights.",
        blockers: []
      };
    }

    if (activeCategory === 'Weekly Highlight') return null;

    let summary = "";
    let metrics: any[] = [];
    let blockers: string[] = [];

    if (activeCategory === 'New Development') {
      const proj = activeProjectFromReport;
      if (proj) {
        summary = proj.summary;
        metrics = proj.metrics || [];
        blockers = proj.blockers || [];
      }
    }

    return {
      metrics: metrics.map(m => ({
        title: m.label,
        subtitle: 'Latest Report',
        value: m.value,
        trend: m.trend,
        icon: 'target',
        color: 'blue'
      })),
      summary,
      blockers
    };
  };

  const dashboardContent = getDashboardContent();
  const activeMetricTitle = activeCategory === 'Support & Marketing' && dashboardContent 
    ? dashboardContent.metrics[supportActiveIndex]?.title 
    : undefined;

  const customChartData = (activeCategory === 'Support & Marketing' && activeMetricTitle)
    ? supportDashboardData.histories[activeMetricTitle]
    : undefined;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar 
        reports={reports}
        activeReportId={activeReportId}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        onReportSelect={setActiveReportId}
        onFileUpload={handleFileUpload}
        onClearAll={async () => { if(confirm('Clear all?')) { await db.reports.clear(); setReports([]); setActiveReportId(null); } }}
        onExport={() => {}} 
        onImport={() => {}}
        onDownloadSeedFile={() => {}}
        isUploading={isUploading}
      />
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        
        <div className="p-6 max-w-[1400px] mx-auto w-full space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{activeCategory}</h2>
              <p className="text-slate-400 font-medium text-xs">KPI Tracking & Aggregation</p>
            </div>
            {activeReport && (
               <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-sm">
                 <FileText className="w-3.5 h-3.5 text-blue-500" />
                 <span className="text-[11px] font-bold text-slate-700">{activeReport.name}</span>
               </div>
            )}
          </div>

          {activeCategory === 'Weekly Highlight' ? (
            <WeeklyHighlightsDashboard highlights={allHighlights} />
          ) : dashboardContent && (
            <>
              {activeCategory === 'New Development' && activeProjectName && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  {projectSummaryMetrics && (
                    <div className="flex items-center gap-10">
                      <span className="text-black font-semibold text-sm tracking-tight">
                        Total tickets : <span className="text-2xl font-black ml-1 text-emerald-500">{projectSummaryMetrics.total}</span>
                      </span>
                    </div>
                  )}
                  {allProjectNames.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {allProjectNames.map(name => (
                        <button
                          key={name}
                          onClick={() => setActiveProjectName(name)}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            activeProjectName === name 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="max-h-[300px]">
                    <ReleaseChart releases={aggregatedReleases} projectName={activeProjectName} />
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-2 md:grid-cols-3 ${activeCategory === 'Support & Marketing' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-4`}>
                {dashboardContent.metrics.map((stat, index) => (
                  <StatCard 
                    key={index} 
                    {...stat} 
                    active={activeCategory === 'Support & Marketing' ? supportActiveIndex === index : index === 0} 
                    onClick={activeCategory === 'Support & Marketing' ? () => setSupportActiveIndex(index) : undefined}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                   <ChartSection 
                      category={activeCategory} 
                      activeMetricTitle={activeMetricTitle} 
                      customData={customChartData}
                   />
                   <MilestonesSection />
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <h3 className="text-base font-bold text-slate-800">AI Insight</h3>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-600 text-[13px] leading-relaxed">
                        {dashboardContent.summary}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Detected Blockers</p>
                        {dashboardContent.blockers.length > 0 ? dashboardContent.blockers.map((blocker, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-rose-900 font-medium leading-tight">{blocker}</span>
                          </div>
                        )) : (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[11px] font-medium">
                            No blockers detected.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="h-12" />
        </div>
      </main>
      <AIAssistant />
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Agent Analysis</h2>
          <p className="text-slate-400 mt-2 font-bold tracking-widest text-[10px] uppercase">Processing multi-line data...</p>
        </div>
      )}
    </div>
  );
};

export default App;
