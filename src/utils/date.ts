import { format, subDays, subMonths, subWeeks, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TimeRange } from '../types';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  return format(new Date(date), pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
};

export const getTimeRangeDates = (timeRange: TimeRange): { start: Date; end: Date } => {
  const end = endOfDay(new Date());
  let start: Date;

  switch (timeRange) {
    case '7d':
      start = startOfDay(subDays(end, 6));
      break;
    case '30d':
      start = startOfDay(subDays(end, 29));
      break;
    case '90d':
      start = startOfDay(subDays(end, 89));
      break;
    case '180d':
      start = startOfDay(subDays(end, 179));
      break;
    case '1y':
      start = startOfDay(subMonths(end, 12));
      break;
    default:
      start = startOfDay(subDays(end, 29));
  }

  return { start, end };
};

export const getTimeRangeLabel = (timeRange: TimeRange): string => {
  const labels: Record<TimeRange, string> = {
    '7d': '近7天',
    '30d': '近30天',
    '90d': '近90天',
    '180d': '近180天',
    '1y': '近1年',
  };
  return labels[timeRange];
};

export const generateDateSeries = (start: Date, end: Date, interval: 'day' | 'month' = 'day'): string[] => {
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(format(current, 'yyyy-MM-dd'));
    if (interval === 'day') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }

  return dates;
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(date);
};

export const getWeekRange = (weekOffset: number = 0): { start: Date; end: Date } => {
  const now = new Date();
  const weekStart = startOfDay(subWeeks(now, weekOffset));
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = endOfDay(new Date(weekStart));
  weekEnd.setDate(weekEnd.getDate() + 6);
  return { start: weekStart, end: weekEnd };
};
