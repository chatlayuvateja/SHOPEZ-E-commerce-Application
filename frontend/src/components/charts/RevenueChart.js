import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const RevenueChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        No revenue data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month || ''),
    datasets: [
      {
        label: 'Revenue',
        data: data.map((d) => d.revenue || 0),
        borderColor: '#FF6B35',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, 'rgba(255, 107, 53, 0.25)');
          gradient.addColorStop(1, 'rgba(255, 107, 53, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B35',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'var(--color-bg-card)',
        titleColor: 'var(--color-text-primary)',
        bodyColor: 'var(--color-text-primary)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 12, family: 'Inter' },
        bodyFont: { size: 14, family: 'Inter', weight: '600' },
        callbacks: {
          label: (ctx) => `₹${(ctx.parsed.y || 0).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'var(--color-border-light)' },
        ticks: { color: 'var(--color-text-muted)', font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'var(--color-text-muted)',
          font: { size: 11 },
          callback: (v) => `₹${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div style={{ height: 260 }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
