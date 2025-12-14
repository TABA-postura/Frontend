import { Link } from 'react-router-dom';
import '../../../assets/styles/Information.css';
import { useSelfCareStats } from '../hooks/useSelfCareStats';
import SummaryCard from '../components/SummaryCard';
import WarningSummaryCard from '../components/WarningSummaryCard';
import ProblemCard from '../components/ProblemCard';
import StreakCard from '../components/StreakCard';
import PostureChart from '../components/PostureChart';
import GoalStreakCalendar from '../components/GoalStreakCalendar';
import './SelfCarePage.css';

const SelfCarePage = () => {
  const { stats, weeklyData, postureDistribution, calendarData, loading, error } = useSelfCareStats();

  if (loading) {
    return (
      <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <div className="information-background">
          <div className="information-top-bar">
            <div className="information-logo-container">
              <Link to="/" className="information-logo-link">
                <span className="information-logo-text">Postura</span>
              </Link>
            </div>
            <div className="information-top-bar-line"></div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="loading-container">
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <div className="information-background">
          <div className="information-top-bar">
            <div className="information-logo-container">
              <Link to="/" className="information-logo-link">
                <span className="information-logo-text">Postura</span>
              </Link>
            </div>
            <div className="information-top-bar-line"></div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="error-container">
            <p>데이터를 불러오는데 실패했습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const trendValue = parseFloat((stats.averagePostureRate - stats.lastWeekAverageRate).toFixed(1));

  return (
    <div className="information-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* 상단 바 배경 */}
      <div className="information-background">
        <div className="information-top-bar">
          <div className="information-logo-container">
            <Link to="/" className="information-logo-link">
              <span className="information-logo-text">Postura</span>
            </Link>
          </div>
          <div className="information-top-bar-line"></div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* 헤더 섹션 */}
        <div className="selfcare-header">
          <div className="selfcare-header-content">
            <h1 className="selfcare-title">자기 관리</h1>
            <p className="selfcare-subtitle">나의 자세 개선 현황을 확인하세요</p>
          </div>
        </div>

        {/* 요약 카드 섹션 (2x2 그리드) */}
        <div className="selfcare-summary-grid">
          <SummaryCard
            title="이번 주 평균 바른 자세 유지율"
            value={`${stats.averagePostureRate.toFixed(1)}%`}
            trend={{
              value: Math.abs(trendValue),
              isPositive: trendValue > 0,
            }}
          />
          <WarningSummaryCard
            todayCount={stats.todayWarningCount}
            weekCount={stats.weekWarningCount}
          />
          <ProblemCard
            problemName={stats.mostFrequentProblem.name}
            count={stats.mostFrequentProblem.count}
          />
          <StreakCard
            days={stats.consecutiveDays}
            goalRate={stats.goalRate}
          />
        </div>

        {/* 메인 콘텐츠 영역 (2컬럼) */}
        <div className="selfcare-main-content">
          {/* 왼쪽: 자세 분석 그래프 */}
          <div className="selfcare-chart-section">
            <PostureChart
              weeklyData={weeklyData}
              postureDistribution={postureDistribution}
            />
          </div>

          {/* 오른쪽: 연속 목표 달성 캘린더 */}
          <div className="selfcare-calendar-section">
            <GoalStreakCalendar
              calendarData={calendarData}
              goalRate={stats.goalRate}
            />
          </div>
        </div>
      </div>

      {/* 도움말 버튼 */}
      <button className="help-button">?</button>
    </div>
  );
};

export default SelfCarePage;
