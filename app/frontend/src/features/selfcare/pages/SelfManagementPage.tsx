import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWeeklyReport } from '../../../hooks/useWeeklyReport';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/SelfManagement.css';
import TopImageBar from '../../../components/TopImageBar';
import './SelfManagementPage.css';

// Recharts 컴포넌트 import
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

type TabValue = 'weekly' | 'distribution';

// 파이 차트 색상 팔레트
const PIE_CHART_COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#fa709a',
  '#fee140',
  '#30cfd0',
  '#a8edea',
];

function SelfManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<TabValue>('weekly');

  // 백엔드 API에서 주간 리포트 데이터 조회 (이번 주 월요일 자동 계산)
  const { data: reportData, isLoading, error } = useWeeklyReport();

  // 날짜 포맷팅 함수 (YYYY-MM-DD -> MM/DD 또는 요일)
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  };

  // 그래프용 데이터 변환
  const weeklyChartData = useMemo(() => {
    if (!reportData) return [];
    return reportData.dates.map((date, index) => ({
      day: formatDate(date),
      date: date,
      posture: Math.round(reportData.correctRatios[index] || 0),
      warnings: reportData.warningCounts[index] || 0,
    }));
  }, [reportData]);

  // 파이 차트용 데이터 변환
  const pieChartData = useMemo(() => {
    if (!reportData?.postureDistribution) return [];
    return Object.entries(reportData.postureDistribution).map(([name, value], index) => ({
      name: name.replace(/_/g, ' '),
      value,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    }));
  }, [reportData]);

  // 캘린더 데이터 변환 (이번 주 데이터만 표시)
  const calendarData = useMemo(() => {
    if (!reportData) return [];
    return reportData.dates.map((date, index) => {
      const ratio = reportData.correctRatios[index] || 0;
      const dateObj = new Date(date);
      return {
        date: dateObj.getDate().toString(),
        rate: Math.round(ratio),
      };
    });
  }, [reportData]);

  const getCalendarColor = (rate: number): string => {
    if (rate <= 60) return 'calendar-day--red';
    if (rate <= 80) return 'calendar-day--yellow';
    return 'calendar-day--green';
  };

  // 추천 스트레칭 클릭 핸들러
  const handleRecommendationClick = (guideId: number) => {
    // InformationPage로 이동하고 해당 guideId의 상세 정보 표시
    navigate(`/information?guideId=${guideId}`);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="self-management-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <div className="dashboard-content">
          <main className="main-content self-management-main">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              <p>데이터를 불러오는 중...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !reportData) {
    return (
      <div className="self-management-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <div className="dashboard-content">
          <main className="main-content self-management-main">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
              <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                {error?.message || '알 수 없는 오류'}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="self-management-container" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="dashboard-content">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar left-sidebar">
          <nav className="sidebar-nav">
            <Link to="/monitor" className={`nav-item ${location.pathname === '/monitor' ? 'active' : ''}`}>
              <div className="nav-icon blue">📊</div>
              <div className="nav-text">
                <span className="nav-title">실시간 자세 분석</span>
              </div>
            </Link>
            <Link to="/information" className={`nav-item ${location.pathname === '/information' ? 'active' : ''}`}>
              <div className="nav-icon blue">📚</div>
              <div className="nav-text">
                <span className="nav-title">정보 제공</span>
              </div>
            </Link>
            <div className={`nav-item ${location.pathname === '/selfcare' ? 'active' : ''}`}>
              <div className="nav-icon">👤</div>
              <div className="nav-text">
                <span className="nav-title">자기 관리</span>
              </div>
            </div>
          </nav>
          <div className="cookie-link">쿠키 관리 또는 옵트 아웃</div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="main-content self-management-main">
          <TopImageBar />
          
          <div className="content-header">
            <h1 className="main-title">자기 관리</h1>
            <p className="main-subtitle">
              실시간 분석 결과를 기반으로 나의 자세 개선 추이와 목표 달성 현황을 확인할 수 있습니다.
            </p>
          </div>

          {/* Summary 카드 4개 */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--blue">📈</span>
                <h3 className="stat-card__title">금일 자세 유지율</h3>
              </div>
              <div className="stat-card__value">{Math.round(reportData.currentAvgRatio)}%</div>
              <div className={`stat-card__change ${reportData.ratioChangeVsPreviousWeek >= 0 ? 'positive' : 'negative'}`}>
                {reportData.ratioChangeVsPreviousWeek >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(Math.round(reportData.ratioChangeVsPreviousWeek * 10) / 10)}% 전주 대비
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--red">⚠️</span>
                <h3 className="stat-card__title">금일 경고 횟수</h3>
              </div>
              <div className="stat-card__value">{reportData.currentTotalWarning}회</div>
              <div className="stat-card__change">
                이번 주 총 {reportData.weeklyTotalWarning}회
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--green">🎯</span>
                <h3 className="stat-card__title">주간 평균 유지율</h3>
              </div>
              <div className="stat-card__value">{Math.round(reportData.weeklyAvgRatio)}%</div>
              <div className="stat-card__change positive">
                {reportData.mostFrequentIssue ? `주요 문제: ${reportData.mostFrequentIssue.replace(/_/g, ' ')}` : '데이터 없음'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--purple">🏆</span>
                <h3 className="stat-card__title">연속 달성</h3>
              </div>
              <div className="stat-card__value">{reportData.currentConsecutiveAchievedDays}일</div>
              <div className="stat-card__change positive">목표 달성 중</div>
            </div>
          </div>

          {/* 그래프 섹션 */}
          <div className="charts-section">
            <div className="tabs-container">
              <div className="tabs-list">
                <button
                  className={`tab-trigger ${selectedTab === 'weekly' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('weekly')}
                >
                  주간 추이
                </button>
                <button
                  className={`tab-trigger ${selectedTab === 'distribution' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('distribution')}
                >
                  문제 유형 분포
                </button>
              </div>

              {selectedTab === 'weekly' && (
                <div className="tab-content">
                  <div className="chart-card">
                    <h3 className="chart-title">주간 자세 유지율 추이</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="posture" stroke="#667eea" strokeWidth={2} name="자세 유지율 (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">주간 경고 횟수</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="warnings" fill="#ef4444" name="경고 횟수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {selectedTab === 'distribution' && (
                <div className="tab-content">
                  <div className="chart-card">
                    <h3 className="chart-title">문제 유형 분포</h3>
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => {
                              const { name, percent } = props;
                              return `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`;
                            }}
                            outerRadius={135}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#7ff5f0"
                            strokeWidth={1}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>데이터가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 캘린더 및 추천 섹션 */}
          <div className="bottom-section">
            {/* 캘린더 */}
            <div className="calendar-card">
              <h3 className="calendar-title">이번 달 자세 달성 현황</h3>
              <div className="calendar-grid">
                {calendarData.map((item) => (
                  <div key={item.date} className={`calendar-day ${getCalendarColor(item.rate)}`}>
                    <span className="calendar-day__date">{item.date}</span>
                    <span className="calendar-day__rate">{item.rate}%</span>
                  </div>
                ))}
              </div>
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-color legend-color--red"></span>
                  <span>60% 이하</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color legend-color--yellow"></span>
                  <span>60-80%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color legend-color--green"></span>
                  <span>80% 이상</span>
                </div>
              </div>
            </div>

            {/* 맞춤 개선 추천 */}
            <div className="recommendations-section">
              <h3 className="section-title">맞춤 개선 추천</h3>
              <div className="recommendations-list">
                {reportData.recommendations && reportData.recommendations.length > 0 ? (
                  reportData.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-card">
                      <div className="rec-header">
                        <span className="rec-icon warning">⚠️</span>
                        <h4 className="rec-title">{rec.problemType.replace(/_/g, ' ')}</h4>
                      </div>
                      <p className="rec-description">
                        {rec.recommendedGuideTitle} 스트레칭을 추천합니다.
                      </p>
                      <button
                        className="rec-button"
                        onClick={() => handleRecommendationClick(rec.guideId)}
                      >
                        <span>추천 스트레칭 보기</span>
                        <span className="rec-button-icon">→</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    추천할 스트레칭이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 도움말 버튼 */}
      <button className="help-button">?</button>
    </div>
  );
}

export default SelfManagementPage;

