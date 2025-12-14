import type { CalendarStat } from '../data/selfManagementStats';
import './GoalStreakCalendar.css';

interface GoalStreakCalendarProps {
  calendarData: CalendarStat[];
  goalRate: number;
}

const GoalStreakCalendar = ({ calendarData, goalRate }: GoalStreakCalendarProps) => {
  const getDayColor = (rate: number): string => {
    if (rate <= 60) return 'red';
    if (rate <= 80) return 'orange';
    return 'green';
  };

  const getDayLabel = (index: number): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[index % 7];
  };

  // 현재 월의 날짜들 생성 (1일부터 시작)
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // 데이터를 날짜별로 매핑
  const dataMap = new Map(calendarData.map(item => [item.date, item.rate]));

  return (
    <div className="goal-streak-calendar-container">
      <div className="goal-streak-calendar-header">
        <h3 className="goal-streak-calendar-title">연속 목표 달성 체크</h3>
        <p className="goal-streak-calendar-subtitle">일별 자세 유지율</p>
      </div>

      <div className="goal-streak-calendar-content">
        {/* 요일 헤더 */}
        <div className="calendar-weekdays">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div key={index} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="calendar-grid">
          {/* 첫 주의 빈 칸 */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}

          {/* 날짜 칸들 */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
            const rate = dataMap.get(date) || 0;
            const color = getDayColor(rate);
            return (
              <div
                key={date}
                className={`calendar-day ${color}`}
                title={`${date}일: ${rate}%`}
              >
                <span className="calendar-day-number">{date}</span>
              </div>
            );
          })}
        </div>

        {/* 색상 범례 */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color red"></div>
            <span className="legend-label">60% 이하</span>
          </div>
          <div className="legend-item">
            <div className="legend-color orange"></div>
            <span className="legend-label">60-80%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color green"></div>
            <span className="legend-label">80% 이상</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalStreakCalendar;
