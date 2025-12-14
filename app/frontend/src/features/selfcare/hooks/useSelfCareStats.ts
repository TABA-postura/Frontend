import { useState, useEffect } from 'react';
import { getSelfCareStats, getWeeklyData, getPostureDistribution, getCalendarData } from '../api/selfCareApi';
import type { WeeklyStat, PostureDistributionItem, CalendarStat } from '../data/selfManagementStats';
import type { SelfCareStats } from '../api/selfCareApi';

export const useSelfCareStats = () => {
  const [stats, setStats] = useState<SelfCareStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyStat[]>([]);
  const [postureDistribution, setPostureDistribution] = useState<PostureDistributionItem[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, weekly, distribution, calendar] = await Promise.all([
          getSelfCareStats(),
          getWeeklyData(),
          getPostureDistribution(),
          getCalendarData(),
        ]);
        
        setStats(statsData);
        setWeeklyData(weekly);
        setPostureDistribution(distribution);
        setCalendarData(calendar);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
        console.error('Failed to fetch self-care stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    stats,
    weeklyData,
    postureDistribution,
    calendarData,
    loading,
    error,
  };
};
