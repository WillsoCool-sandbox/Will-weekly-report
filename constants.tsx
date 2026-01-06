
import { ChartDataPoint, Milestone, StatData, WeeklyHighlight } from './types';

export const MOCK_STATS: StatData[] = [
  {
    title: 'Perfect Stack',
    subtitle: '(Current)',
    value: '0 Done',
    trend: 'Awaiting Report',
    icon: 'target',
    color: 'emerald'
  },
  {
    title: 'Total Cards Created',
    subtitle: 'Cumulative',
    value: '0',
    trend: 'Awaiting Data',
    icon: 'file-text',
    color: 'blue'
  },
  {
    title: 'Total Tasks Listed',
    subtitle: 'Backlog',
    value: '0',
    trend: 'Awaiting Data',
    icon: 'list-todo',
    color: 'indigo'
  }
];

export const MOCK_HIGHLIGHTS: WeeklyHighlight[] = [];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: 'Week 1', count: 0, trend: 0 },
  { date: 'Week 2', count: 0, trend: 0 },
  { date: 'Week 3', count: 0, trend: 0 },
  { date: 'Week 4', count: 0, trend: 0 },
];

export const MOCK_MILESTONES: Milestone[] = [];
