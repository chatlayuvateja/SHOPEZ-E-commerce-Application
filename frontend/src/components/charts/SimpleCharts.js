import React from 'react';

export const RevenueTable = ({ data = [], title = 'Revenue' }) => (
  <div className="chart-card">
    <h3>{title}</h3>
    <table className="simple-chart-table">
      <thead><tr><th>Label</th><th>Revenue (₹)</th><th>Orders</th></tr></thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.label}</td>
            <td>{row.revenue?.toLocaleString('en-IN') || 0}</td>
            <td>{row.orders || 0}</td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr><td colSpan="3" style={{ textAlign: 'center', color: '#888' }}>No data available</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

export const OrdersDonutTable = ({ data = [], title = 'Orders by Status' }) => {
  const total = data.reduce((s, r) => s + (r.value || 0), 0);
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <table className="simple-chart-table">
        <thead><tr><th>Status</th><th>Count</th><th>%</th></tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td><span className="status-dot" style={{ background: row.color || '#6366f1' }} />{row.label}</td>
              <td>{row.value || 0}</td>
              <td>{total > 0 ? ((row.value / total) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan="3" style={{ textAlign: 'center', color: '#888' }}>No data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
