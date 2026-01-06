
export type DashboardCategory = 'New Development' | 'Weekly Highlight' | 'Support & Marketing';

export interface Metric {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

export interface ReleasePoint {
  date: string;
  version: string;
  description: string;
  impactScore: number; 
  storiesCount?: number; // New field for number of stories/tasks
}

export interface ProjectData {
  name: string;
  summary: string;
  metrics: Metric[];
  blockers: string[];
  releases: ReleasePoint[];
}

export interface CategoryData {
  summary: string;
  metrics: Metric[];
  blockers: string[];
}

export interface WeeklyHighlight {
  id: string;
  weekRange: string;
  summary: string;
  achievements: string[];
  metrics: { label: string; value: string }[];
  timestamp: number;
}

export interface PdfAnalysisResult {
  executiveSummary: string;
  weeklyHighlight: {
    weekRange: string;
                summary: string;
                achievements: string[];
              };
              categories: {
                supportMarketing: CategoryData;
                newDevelopment: {
                  projects: ProjectData[];
                };
                opsEnhancement: CategoryData;
              };
            }

            export interface SavedReport {
              id: string;
              name: string;
              timestamp: number;
              data: PdfAnalysisResult;
            }

            export interface StatData {
              title: string;
              subtitle: string;
              value: string;
              trend: string;
              icon: string;
              color: string;
              active?: boolean;
            }

            export interface ChartDataPoint {
              date: string;
              count: number;
              trend: number;
            }

            export interface Milestone {
              id: string;
              title: string;
              status: 'completed' | 'in-progress' | 'pending';
              date: string;
            }
