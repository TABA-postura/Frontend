import { useState, useEffect } from 'react';
import TopBar from '../../../components/TopBar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useWeeklyReport } from '../hooks/useWeeklyReport';

// 자세 이름 한국어 변환
const POSTURE_KOREAN_NAMES: Record<string, string> = {
  'TURTLE_NECK': '거북목',
  'FORWARD_HEAD': '거북목',
  'UNEQUAL_SHOULDERS': '어깨 불균형',
  'HEAD_TILT': '머리 기울임',
  'SHOULDER_TILT': '어깨 기울임',
  'SHOULDER_ASYMMETRY': '어깨 비대칭',
  'LEAN_BACK': '뒤로 기울임',
  'LEAN_FORWARD': '앞으로 기울임',
  'UPPER_BODY_TILT': '상체 기울임',
  'TOO_CLOSE_TO_SCREEN': '화면 과도하게 가까움',
  'ARM_SUPPORT_CHIN_REST': '팔 지지 / 턱 괴기',
  'LEFT_RIGHT_ASYMMETRY': '좌우 비대칭 자세',
  'BENT_BACK': '허리 굽힘',
};

const getPostureKoreanName = (posture: string): string => {
  return POSTURE_KOREAN_NAMES[posture] || posture;
};

function SelfCarePage() {
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'distribution'>('weekly');
  const [isVisible, setIsVisible] = useState(false);

  // 주간 리포트 API 호출
  const { data: reportData, isLoading, error, refetch } = useWeeklyReport();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // reportData가 변경될 때마다 콘솔에 출력
  useEffect(() => {
    if (reportData) {
      console.log('[SelfCarePage] reportData 업데이트:', {
        reportData,
        reportDataStringified: JSON.stringify(reportData, null, 2),
      });
    }
  }, [reportData]);

  // API 데이터를 차트 형식으로 변환
  const weeklyData = reportData?.dates?.map((date, index) => {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dateObj = new Date(date);
    const dayName = dayNames[dateObj.getDay()];
    
    return {
      day: dayName,
      posture: reportData.correctRatios[index] ?? 0,
      warnings: reportData.warningCounts[index] ?? 0,
    };
  }) ?? [];

  // 자세 분포 데이터 변환 (파이 차트용)
  const postureDistributionData = reportData?.postureDistribution
    ? Object.entries(reportData.postureDistribution).map(([name, value], index) => {
        const colors = [
          'rgba(255, 120, 120, 0.7)',
          'rgba(255, 190, 110, 0.7)',
          'rgba(255, 235, 100, 0.7)',
          'rgba(120, 255, 180, 0.7)',
          'rgba(140, 210, 255, 0.7)',
        ];
        return {
          name,
          value,
          color: colors[index % colors.length],
        };
      })
    : [];

  // 문제 유형별 추천 정보 매핑 (백엔드 키 사용)
  const issueRecommendations: Record<string, { title: string; description: string; icon: string; iconBg: string; iconColor: string; youtubeUrl: string }> = {
    'FORWARD_HEAD': {
      title: '거북목 개선 필요',
      description: '가장 많이 발생하는 문제입니다. 모니터 높이를 조정하고 목 스트레칭을 실시하세요.',
      icon: '▲',
      iconBg: '#fce7f3',
      iconColor: '#ef4444',
      youtubeUrl: 'https://www.youtube.com/watch?v=kgCj8UUEWjU',
    },
    'SLOUCHING': {
      title: '허리 굽힘 개선 필요',
      description: '허리가 굽어지는 문제가 발생합니다. 허리 스트레칭을 실시하세요.',
      icon: '▼',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      youtubeUrl: 'https://www.youtube.com/watch?v=abiyAQu-Pf0',
    },
    'UNEQUAL_SHOULDERS': {
      title: '어깨 불균형',
      description: '어깨 높이 차이가 자주 감지됩니다. 양쪽 어깨를 균등하게 사용하도록 주의하세요.',
      icon: '●',
      iconBg: '#fed7aa',
      iconColor: '#fb923c',
      youtubeUrl: 'https://www.youtube.com/watch?v=mUnSpfItRf0',
    },
    'SHOULDER_TILT': {
      title: '어깨 기울임 개선 필요',
      description: '한쪽 어깨가 기울어지는 문제가 발생합니다. 어깨 스트레칭을 실시하세요.',
      icon: '◆',
      iconBg: '#fed7aa',
      iconColor: '#fb923c',
      youtubeUrl: 'https://www.youtube.com/watch?v=mUnSpfItRf0',
    },
    'BODY_TILT': {
      title: '상체 기울임 개선 필요',
      description: '상체가 기울어지는 문제가 발생합니다. 코어 강화 운동을 실시하세요.',
      icon: '◀',
      iconBg: '#e0e7ff',
      iconColor: '#6366f1',
      youtubeUrl: 'https://www.youtube.com/watch?v=abiyAQu-Pf0',
    },
    'UPPER_BODY_TILT': {
      title: '상체 기울임 개선 필요',
      description: '상체가 기울어지는 문제가 발생합니다. 코어 강화 운동을 실시하세요.',
      icon: '■',
      iconBg: '#e0e7ff',
      iconColor: '#6366f1',
      youtubeUrl: 'https://www.youtube.com/watch?v=abiyAQu-Pf0',
    },
    'TOO_CLOSE': {
      title: '화면 거리 유지',
      description: '모니터와의 거리가 가까워지는 경향이 있습니다. 최소 50cm 이상 거리를 유지하세요.',
      icon: '◎',
      iconBg: '#dbeafe',
      iconColor: '#3b82f6',
      youtubeUrl: 'https://www.youtube.com/watch?v=euBLyvbjly0',
    },
    'ARM_SUPPORT': {
      title: '팔 지지 자세 감지',
      description: '손목/전완부 스트레칭 후, 양손을 무릎 위에 올려 바른 자세를 취해주세요.',
      icon: '◉',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      youtubeUrl: 'https://www.youtube.com/watch?v=kgCj8UUEWjU',
    },
    'CHIN_REST': {
      title: '턱 괴기 자세 감지',
      description: '턱 당기기 운동을 하거나 화면과 거리를 두고 목을 뒤로 밀어주세요.',
      icon: '◇',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      youtubeUrl: 'https://www.youtube.com/watch?v=kgCj8UUEWjU',
    },
    'ASYMMETRIC': {
      title: '복합 비대칭 자세',
      description: '좌우 비대칭 자세가 감지됩니다. 균형 잡힌 자세를 유지하세요.',
      icon: '▶',
      iconBg: '#e0e7ff',
      iconColor: '#6366f1',
      youtubeUrl: 'https://www.youtube.com/watch?v=TMrxOWW3MsA',
    },
    'HEAD_TILT': {
      title: '머리 기울임 개선',
      description: '머리가 기울어지는 문제가 발생합니다. 목 스트레칭을 실시하세요.',
      icon: '★',
      iconBg: '#fce7f3',
      iconColor: '#ef4444',
      youtubeUrl: 'https://www.youtube.com/watch?v=kgCj8UUEWjU',
    },
  };

  // 상위 3개 문제 유형 추출
  const top3Issues = reportData?.postureDistribution
    ? Object.entries(reportData.postureDistribution)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({
          name,
          count,
          ...issueRecommendations[name] || {
            title: name,
            description: '해당 문제에 대한 스트레칭을 실시하세요.',
            icon: '▲',
            iconBg: '#e5e7eb',
            iconColor: '#6b7280',
            youtubeUrl: 'https://www.youtube.com/watch?v=kgCj8UUEWjU',
          },
        }))
    : [];

  // 캘린더 데이터 생성 (현재 월 기준, 백엔드 데이터 사용)
  const getCalendarData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // 이번 달 1일이 무슨 요일인지 계산 (0=일요일, 1=월요일, ...)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // 이번 달의 마지막 날짜
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 백엔드에서 받은 데이터를 날짜별로 매핑
    const dataMap = new Map<number, number>();
    if (reportData?.dates && reportData?.correctRatios) {
      reportData.dates.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        // 같은 월인 경우에만 매핑
        if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
          const day = date.getDate();
          const ratio = reportData.correctRatios[index];
          dataMap.set(day, ratio);
        }
      });
    }
    
    const calendarData: Array<{ date: number | null; rate: number | null }> = [];
    
    // 첫 주의 빈 셀 추가
    for (let i = 0; i < firstDay; i++) {
      calendarData.push({ date: null, rate: null });
    }
    
    // 1일부터 마지막 날까지 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const rate = dataMap.get(day);
      calendarData.push({ 
        date: day, 
        rate: rate !== undefined ? rate : null // 백엔드 데이터가 있으면 사용, 없으면 null
      });
    }
    
    return calendarData;
  };

  const calendarDays = getCalendarData();

  const getCalendarColor = (rate: number | null): string => {
    if (rate === null) return 'rgba(255, 255, 255, 0.1)'; // 데이터 없음 (반투명)
    if (rate <= 60) return '#d15a5a'; // 빨강 (채도 더 높임)
    if (rate < 80) return '#d4a04a'; // 노랑 (채도 더 높임)
    return '#6fb87a'; // 초록 (채도 더 높임)
  };
    return (
    <div 
      style={{ 
        minHeight: '100vh',
        backgroundImage: 'url(/images/posetura_line.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      {/* 배경 오버레이 - 소라색 반투명 (파란색 톤) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(110, 175, 215, 0.3)',
          zIndex: 0,
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBar />
      
      {/* 4개의 카드 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          padding: '40px 80px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* 카드 1: 이번 주 평균 바른 자세 유지율 */}
        <div
          style={{
            borderRadius: '12px',
            background: isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            minHeight: '180px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.8s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          }}
        >
          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 500, margin: 0, fontFamily: "'Pretendard', sans-serif" }}>
            이번 주 평균 바른 자세 유지율
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ color: 'white', fontSize: '36px', fontWeight: 700, fontFamily: "'Pretendard', sans-serif" }}>
              {isLoading ? '...' : reportData?.weeklyAvgRatio?.toFixed(1) ?? '0.0'}%
            </span>
            </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
            <span style={{ 
              color: (reportData?.ratioChangeVsPreviousWeek ?? 0) >= 0 ? '#4ade80' : '#f87171', 
              fontSize: '14px', 
              fontFamily: "'Pretendard', sans-serif" 
            }}>
              전주 대비 {reportData?.ratioChangeVsPreviousWeek ? (reportData.ratioChangeVsPreviousWeek >= 0 ? '+' : '') + reportData.ratioChangeVsPreviousWeek.toFixed(1) : '0.0'}%
            </span>
          </div>
        </div>

        {/* 카드 2: 경고 횟수 */}
        <div
          style={{
            borderRadius: '12px',
            background: isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            minHeight: '180px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.8s ease 0.1s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          }}
        >
          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 500, margin: 0, fontFamily: "'Pretendard', sans-serif" }}>
            경고 횟수
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 600, fontFamily: "'Pretendard', sans-serif" }}>
              오늘 {isLoading ? '...' : reportData?.currentTotalWarning ?? 0}회
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
              이번 주 {isLoading ? '...' : reportData?.weeklyTotalWarning ?? 0}회
            </div>
          </div>
        </div>

        {/* 카드 3: 가장 많이 발생한 문제 */}
        <div
          style={{
            borderRadius: '12px',
            background: isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            minHeight: '180px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.8s ease 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          }}
        >
          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 500, margin: 0, fontFamily: "'Pretendard', sans-serif" }}>
            가장 많이 발생한 문제
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 600, fontFamily: "'Pretendard', sans-serif" }}>
              {isLoading ? '...' : (reportData?.mostFrequentIssue ? getPostureKoreanName(reportData.mostFrequentIssue) : '데이터 없음')}
            </div>
            {reportData?.postureDistribution && reportData.mostFrequentIssue && (
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
                {reportData.postureDistribution[reportData.mostFrequentIssue] ?? 0}회 발생
              </div>
            )}
          </div>
        </div>

        {/* 카드 4: 연속 목표 달성 일수 */}
        <div
          style={{
            borderRadius: '12px',
            background: isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            minHeight: '180px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.8s ease 0.3s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          }}
        >
          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 500, margin: 0, fontFamily: "'Pretendard', sans-serif" }}>
            연속 목표 달성 일수
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <div style={{ color: 'white', fontSize: '36px', fontWeight: 700, fontFamily: "'Pretendard', sans-serif" }}>
              {isLoading ? '...' : reportData?.currentConsecutiveAchievedDays ?? 0}일
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
              목표: 80% 이상 유지
            </div>
          </div>
        </div>
      </div>

      {/* 그래프 및 캘린더 섹션 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          padding: '40px 80px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* 왼쪽: 자세 분석 그래프 */}
        <div
          style={{
            borderRadius: '12px',
            background: isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.8s ease 0.4s',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, margin: '0 0 16px 0', fontFamily: "'Pretendard', sans-serif" }}>
            자세 분석 그래프
          </h3>
          
          {/* 탭 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedTab('weekly')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedTab === 'weekly' ? 'rgba(110, 175, 215, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                fontWeight: selectedTab === 'weekly' ? 600 : 400,
                fontFamily: "'Pretendard', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              주간 추이
            </button>
            <button
              onClick={() => setSelectedTab('distribution')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedTab === 'distribution' ? 'rgba(110, 175, 215, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                fontWeight: selectedTab === 'distribution' ? 600 : 400,
                fontFamily: "'Pretendard', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              자세 분포
            </button>
          </div>

          {selectedTab === 'weekly' && (
            <>
              {/* 일별 바른 자세 유지율 */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '0 0 16px 0', fontFamily: "'Pretendard', sans-serif" }}>
                  일별 바른 자세 유지율 (%)
                </h4>
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }} 
                    />
                    <Legend wrapperStyle={{ color: 'white' }} />
                    <Line 
                      type="monotone" 
                      dataKey="posture" 
                      stroke="#00ffff" 
                      strokeWidth={2} 
                      dot={{ fill: '#00ffff', r: 4 }}
                      name="유지율 (%)"
                    />
                  </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
                      데이터가 없습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* 일별 경고 횟수 */}
              <div>
                <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '0 0 16px 0', fontFamily: "'Pretendard', sans-serif" }}>
                  일별 경고 횟수
                </h4>
                {weeklyData.length > 0 ? (
                  <div style={{ backgroundColor: 'rgba(15, 30, 50, 0.3)', borderRadius: '8px', padding: '8px' }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={weeklyData} barSize={32}>
                    <defs>
                      <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff6666" stopOpacity={1} />
                        <stop offset="50%" stopColor="#ff4444" stopOpacity={1} />
                        <stop offset="100%" stopColor="#cc3366" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 30, 50, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }}
                      cursor={{ fill: 'rgba(10, 20, 35, 0.6)' }}
                    />
                    <Legend wrapperStyle={{ color: 'white' }} />
                    <Bar 
                      dataKey="warnings" 
                      fill="url(#warningGradient)" 
                      name="경고 횟수"
                      radius={[16, 16, 0, 0]}
                      shape={(props: any) => {
                        const { x, y, width, height } = props;
                        const radius = Math.min(width / 2, 20);
                        return (
                          <path
                            d={`M ${x},${y + radius}
                                Q ${x},${y} ${x + radius},${y}
                                L ${x + width - radius},${y}
                                Q ${x + width},${y} ${x + width},${y + radius}
                                L ${x + width},${y + height}
                                L ${x},${y + height}
                                Z`}
                            fill="url(#warningGradient)"
                          />
                        );
                      }}
                    />
                  </BarChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
                      데이터가 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedTab === 'distribution' && (
            <div>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '0 0 16px 0', fontFamily: "'Pretendard', sans-serif" }}>
                문제 유형 비율
              </h4>
              {postureDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={postureDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={135}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#7ff5f0"
                    strokeWidth={1}
                  >
                    {postureDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }} 
                  />
                </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
                    데이터가 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 오른쪽: 연속 목표 달성 체크 */}
        <div
          style={{
            borderRadius: '12px',
            background: isVisible 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)'
              : 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.8s ease 0.5s',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0', fontFamily: "'Pretendard', sans-serif" }}>
            연속 목표 달성 체크
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '0 0 24px 0', fontFamily: "'Pretendard', sans-serif" }}>
            일별 자세 유지율
          </p>

          {/* 캘린더 그리드 */}
          <div style={{ marginBottom: '24px' }}>
            {/* 요일 헤더 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div
                  key={day}
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '12px',
                    textAlign: 'center',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', padding: '0 4px' }}>
              {calendarDays.map((item, index) => (
                <div
                  key={index}
                  style={{
                    width: item.date ? '40px' : 'auto',
                    height: item.date ? '40px' : 'auto',
                    backgroundColor: item.date ? getCalendarColor(item.rate) : 'transparent',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.date && item.rate !== null ? 'white' : item.date ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: "'Pretendard', sans-serif",
                    border: item.date && item.rate === null ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                    margin: '0 auto',
                    cursor: item.date && item.rate !== null ? 'pointer' : 'default',
                  }}
                  title={item.date && item.rate !== null ? `${item.date}일: ${item.rate.toFixed(1)}%` : item.date ? `${item.date}일: 데이터 없음` : ''}
                >
                  {item.date}
                </div>
              ))}
        </div>
      </div>

          {/* 색상 범례 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#d15a5a', borderRadius: '4px' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontFamily: "'Pretendard', sans-serif" }}>
                60% 이하
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#d4a04a', borderRadius: '4px' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontFamily: "'Pretendard', sans-serif" }}>
                60-80%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#6fb87a', borderRadius: '4px' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontFamily: "'Pretendard', sans-serif" }}>
                80% 이상
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div style={{ padding: '40px 80px', textAlign: 'center' }}>
          <p style={{ color: 'white', fontSize: '16px', fontFamily: "'Pretendard', sans-serif" }}>
            데이터를 불러오는 중...
          </p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div style={{ padding: '40px 80px', textAlign: 'center' }}>
          <p style={{ color: '#f87171', fontSize: '16px', marginBottom: '16px', fontFamily: "'Pretendard', sans-serif" }}>
            데이터를 불러오는데 실패했습니다: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px',
              fontFamily: "'Pretendard', sans-serif",
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 맞춤 개선 추천 섹션 - recommendations가 있을 경우에만 렌더링 */}
      {reportData?.recommendations && reportData.recommendations.length > 0 && (
        <div
          style={{
            padding: '40px 80px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 600,
              margin: '0 0 32px 0',
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            맞춤 개선 추천
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {reportData.recommendations.map((recommendation, index) => {
              const issueInfo = issueRecommendations[recommendation.problemType] || {
                title: recommendation.problemType,
                icon: '▲',
                iconBg: '#fce7f3',
                iconColor: '#ef4444',
                youtubeUrl: 'https://www.youtube.com/watch?v=kgCj8UUEWjU',
              };
              
              return (
              <div
                key={index}
                style={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: issueInfo.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: issueInfo.iconColor, fontSize: '24px', fontWeight: 'bold' }}>{issueInfo.icon}</span>
                </div>
                <h3
                  style={{
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 600,
                    margin: 0,
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {issueInfo.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {recommendation.recommendedGuideTitle}를 추천합니다.
                </p>
                <button
                  onClick={() => window.open(issueInfo.youtubeUrl || 'https://www.youtube.com/watch?v=kgCj8UUEWjU', '_blank')}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: "'Pretendard', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  추천 스트레칭 보기 →
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 동적 맞춤 개선 추천 섹션 - 상위 3개 문제 유형 기반 */}
      {(!reportData?.recommendations || reportData.recommendations.length === 0) && (
        <div
          style={{
            padding: '40px 80px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 600,
              margin: '0 0 32px 0',
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            맞춤 개선 추천
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {top3Issues.length > 0 ? (
              top3Issues.map((issue, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '24px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: issue.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: issue.iconColor, fontSize: '24px', fontWeight: 'bold' }}>{issue.icon}</span>
                  </div>
                  <h3
                    style={{
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 600,
                      margin: 0,
                      fontFamily: "'Pretendard', sans-serif",
                    }}
                  >
                    {issue.title}
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0,
                      fontFamily: "'Pretendard', sans-serif",
                    }}
                  >
                    {issue.description} ({issue.count}회 발생)
                  </p>
                  <button
                    onClick={() => window.open(issue.youtubeUrl, '_blank')}
                    style={{
                      marginTop: 'auto',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 500,
                      fontFamily: "'Pretendard', sans-serif",
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    추천 스트레칭 보기 →
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '16px',
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                아직 측정된 자세 데이터가 없습니다. 모니터링을 시작해주세요.
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default SelfCarePage;
