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

function SelfCarePage() {
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'distribution'>('weekly');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 샘플 데이터
  const weeklyData = [
    { day: '월', posture: 75, warnings: 19 },
    { day: '화', posture: 85, warnings: 12 },
    { day: '수', posture: 80, warnings: 16 },
    { day: '목', posture: 90, warnings: 10 },
    { day: '금', posture: 95, warnings: 8 },
    { day: '토', posture: 95, warnings: 6 },
    { day: '일', posture: 85, warnings: 14 },
  ];

  // 자세 분포 데이터 (파이 차트용)
  const postureDistributionData = [
    { name: '거북목', value: 35, color: 'rgba(255, 120, 120, 0.7)' },
    { name: '어깨 기울어짐', value: 25, color: 'rgba(255, 190, 110, 0.7)' },
    { name: '화면 거리', value: 20, color: 'rgba(255, 235, 100, 0.7)' },
    { name: '등 굽음', value: 15, color: 'rgba(120, 255, 180, 0.7)' },
    { name: '기타', value: 5, color: 'rgba(140, 210, 255, 0.7)' },
  ];

  // 캘린더 데이터 생성 (현재 월 기준, 30일까지)
  const getCalendarData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // 이번 달 1일이 무슨 요일인지 계산 (0=일요일, 1=월요일, ...)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // 샘플 데이터 (실제로는 API에서 가져올 데이터)
    const sampleRates: { [key: number]: number } = {
      1: 65, 2: 85, 3: 70, 4: 90, 5: 88, 6: 92, 7: 75,
      8: 68, 9: 87, 10: 72, 11: 89, 12: 91, 13: 93, 14: 88,
      15: 70, 16: 86, 17: 82, 18: 79, 19: 91, 20: 88,
      21: 85, 22: 90, 23: 75, 24: 88, 25: 92, 26: 87,
      27: 83, 28: 89, 29: 86, 30: 91,
    };
    
    const calendarData: Array<{ date: number | null; rate: number | null }> = [];
    
    // 첫 주의 빈 셀 추가
    for (let i = 0; i < firstDay; i++) {
      calendarData.push({ date: null, rate: null });
    }
    
    // 1일부터 30일까지 추가
    for (let day = 1; day <= 30; day++) {
      calendarData.push({ 
        date: day, 
        rate: sampleRates[day] || Math.floor(Math.random() * 40) + 60 // 샘플 데이터가 없으면 랜덤
      });
    }
    
    return calendarData;
  };

  const calendarDays = getCalendarData();

  const getCalendarColor = (rate: number): string => {
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            minHeight: '180px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
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
              82.8%
            </span>
            </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
            <span style={{ color: '#4ade80', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
              전주 대비 +5.2%
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
              오늘 23회
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
              이번 주 82회
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
              거북목
      </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontFamily: "'Pretendard', sans-serif" }}>
              35회 발생
            </div>
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
              7일
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
              </div>

              {/* 일별 경고 횟수 */}
              <div>
                <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '0 0 16px 0', fontFamily: "'Pretendard', sans-serif" }}>
                  일별 경고 횟수
                </h4>
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
              </div>
            </>
          )}

          {selectedTab === 'distribution' && (
            <div>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '0 0 16px 0', fontFamily: "'Pretendard', sans-serif" }}>
                문제 유형 비율
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={postureDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
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
                    backgroundColor: item.date && item.rate !== null ? getCalendarColor(item.rate) : 'transparent',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.date ? 'white' : 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: "'Pretendard', sans-serif",
                    border: item.date ? 'none' : '1px solid transparent',
                    margin: '0 auto',
                  }}
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

      {/* 맞춤 개선 추천 섹션 */}
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
          {/* 카드 1: 거북목 개선 필요 */}
          <div
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
                backgroundColor: '#fce7f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>▲</span>
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
              거북목 개선 필요
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
              가장 많이 발생하는 문제입니다. 모니터 높이를 조정하고 목 스트레칭을 실시하세요.
            </p>
            <button
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

          {/* 카드 2: 어깨 불균형 */}
          <div
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
                backgroundColor: '#fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fb923c', fontSize: '24px', fontWeight: 'bold' }}>▲</span>
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
              어깨 불균형
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
              어깨 높이 차이가 자주 감지됩니다. 양쪽 어깨를 균등하게 사용하도록 주의하세요.
            </p>
            <button
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

<<<<<<< Updated upstream
          {/* 오른쪽: 연속 목표 달성 캘린더 */}
          <div className="selfcare-calendar-section">
            <GoalStreakCalendar
              calendarData={calendarData}
            />
=======
          {/* 카드 3: 화면 거리 유지 */}
          <div
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
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>◎</span>
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
              화면 거리 유지
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
              모니터와의 거리가 가까워지는 경향이 있습니다. 최소 50cm 이상 거리를 유지하세요.
            </p>
            <button
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
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default SelfCarePage;
