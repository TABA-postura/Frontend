import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  weeklyData,
  postureDistribution,
  calendarData,
} from '../data/selfManagementStats';
import '../../../assets/styles/Home.css';
import '../../../assets/styles/SelfManagement.css';
import './SelfManagementPage.css';

// Recharts 컴포넌트 import (recharts가 설치되어 있다고 가정)
// 만약 설치되지 않았다면: npm install recharts
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

function SelfManagementPage() {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<TabValue>('weekly');

  const getCalendarColor = (rate: number): string => {
    if (rate <= 60) return 'calendar-day--red';
    if (rate <= 80) return 'calendar-day--yellow';
    return 'calendar-day--green';
  };

  // 통계 계산
  const averagePosture = Math.round(
    weeklyData.reduce((sum, item) => sum + item.posture, 0) / weeklyData.length
  );
  const totalWarnings = weeklyData.reduce((sum, item) => sum + item.warnings, 0);
  const improvementRate = weeklyData[weeklyData.length - 1].posture - weeklyData[0].posture;
  const currentStreak = 5; // 연속 달성 일수 (임시)

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
                <h3 className="stat-card__title">평균 자세 점수</h3>
              </div>
              <div className="stat-card__value">{averagePosture}%</div>
              <div className={`stat-card__change ${improvementRate >= 0 ? 'positive' : 'negative'}`}>
                {improvementRate >= 0 ? '↑' : '↓'} {Math.abs(improvementRate)}% 전주 대비
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--red">⚠️</span>
                <h3 className="stat-card__title">총 경고 횟수</h3>
              </div>
              <div className="stat-card__value">{totalWarnings}회</div>
              <div className="stat-card__change positive">↓ 12% 전주 대비</div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--green">🎯</span>
                <h3 className="stat-card__title">목표 달성률</h3>
              </div>
              <div className="stat-card__value">85%</div>
              <div className="stat-card__change positive">목표: 90%</div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <span className="stat-card__icon stat-card__icon--purple">🏆</span>
                <h3 className="stat-card__title">연속 달성</h3>
              </div>
              <div className="stat-card__value">{currentStreak}일</div>
              <div className="stat-card__change positive">최고 기록: 7일</div>
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
                    <h3 className="chart-title">주간 자세 점수 추이</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="posture" stroke="#667eea" strokeWidth={2} name="자세 점수 (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">주간 경고 횟수</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
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
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={postureDistribution as any}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: any) => {
                            const { name, percent } = props;
                            return `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`;
                          }}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {postureDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
                <div className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-icon warning">⚠️</span>
                    <h4 className="rec-title">어깨 균형 개선</h4>
                  </div>
                  <p className="rec-description">
                    어깨 높이 차이가 자주 감지됩니다. 양쪽 어깨를 균등하게 사용하도록 주의하세요.
                  </p>
                  {/* TODO: 향후 InformationPage의 해당 스트레칭 카드로 스크롤/네비게이션 연결 */}
                  <button className="rec-button">
                    <span>추천 스트레칭 보기</span>
                    <span className="rec-button-icon">→</span>
                  </button>
                </div>

                <div className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-icon info">🎯</span>
                    <h4 className="rec-title">화면 거리 유지</h4>
                  </div>
                  <p className="rec-description">
                    모니터와의 거리가 가까워지는 경향이 있습니다. 최소 50cm 이상 거리를 유지하세요.
                  </p>
                  {/* TODO: 향후 InformationPage의 해당 스트레칭 카드로 스크롤/네비게이션 연결 */}
                  <button className="rec-button">
                    <span>추천 스트레칭 보기</span>
                    <span className="rec-button-icon">→</span>
                  </button>
                </div>
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

