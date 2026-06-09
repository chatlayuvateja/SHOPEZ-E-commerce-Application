import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  pending: '#6B7280',
  confirmed: '#3B82F6',
  shipped: '#F59E0B',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    ctx.save();
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    const x = width / 2;
    const y = height / 2 - 8;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 24px Poppins, sans-serif';
    ctx.fillStyle = '#1A1A2E';
    ctx.fillText(total, x, y);
    ctx.font = '400 12px Inter, sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Total Orders', x, y + 24);
    ctx.restore();
  },
};

const OrdersDonutChart = ({ data = [] }) => {
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
        No order data available
      </div>
    );
  }

  const sorted = STATUS_ORDER
    .map((s) => data.find((d) => d.status === s))
    .filter(Boolean);

  const chartData = {
    labels: sorted.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1)),
    datasets: [
      {
        data: sorted.map((d) => d.count || 0),
        backgroundColor: sorted.map((d) => STATUS_COLORS[d.status] || '#E5E7EB'),
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12, family: 'Inter' },
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: 'var(--color-bg-card)',
        titleColor: 'var(--color-text-primary)',
        bodyColor: 'var(--color-text-primary)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed || 0} orders`,
        },
      },
    },
  };

  return (
    <div style={{ height: 260, position: 'relative' }}>
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default OrdersDonutChart;
