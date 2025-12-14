import './SummaryCard.css';

interface SummaryCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  subtitle?: string;
}

const SummaryCard = ({ title, value, trend, icon, subtitle }: SummaryCardProps) => {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        {icon && <span className="summary-card-icon">{icon}</span>}
        <h3 className="summary-card-title">{title}</h3>
      </div>
      <div className="summary-card-content">
        <div className="summary-card-value">{value}</div>
        {trend && (
          <div className={`summary-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <span className="trend-arrow">{trend.isPositive ? '↑' : '↓'}</span>
            <span className="trend-value">
              전주 대비 {trend.isPositive ? '+' : ''}{typeof trend.value === 'number' ? trend.value.toFixed(1) : trend.value}%
            </span>
          </div>
        )}
        {subtitle && <div className="summary-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default SummaryCard;
