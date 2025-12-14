import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { WeeklyStat, PostureDistributionItem } from '../data/selfManagementStats';
import './PostureChart.css';

interface PostureChartProps {
  weeklyData: WeeklyStat[];
  postureDistribution: PostureDistributionItem[];
}

const PostureChart = ({ weeklyData, postureDistribution }: PostureChartProps) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'distribution'>('weekly');

  return (
    <div className="posture-chart-container">
      <div className="posture-chart-header">
        <h3 className="posture-chart-title">자세 분석 그래프</h3>
        <div className="posture-chart-tabs">
          <button
            className={`posture-chart-tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            주간 추이
          </button>
          <button
            className={`posture-chart-tab ${activeTab === 'distribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            자세 분포
          </button>
        </div>
      </div>

      <div className="posture-chart-content">
        {activeTab === 'weekly' ? (
          <>
            <div className="chart-section">
              <h4 className="chart-section-title">일별 바른 자세 유지율 (%)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis domain={[0, 100]} stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="posture"
                    stroke="#4a9eff"
                    strokeWidth={2}
                    dot={{ fill: '#4a9eff', r: 5 }}
                    name="유지율 (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-section">
              <h4 className="chart-section-title">일별 경고 횟수</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="warnings" fill="#f59e0b" name="경고 횟수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="chart-section">
            <h4 className="chart-section-title">자세 분포</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={postureDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="name" type="category" stroke="#666" width={100} />
                <Tooltip />
                <Bar dataKey="value">
                  {postureDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostureChart;
