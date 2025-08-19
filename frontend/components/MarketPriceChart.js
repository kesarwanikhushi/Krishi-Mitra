import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MarketPriceChart({ data, crop, market }) {
  if (!data || data.length === 0) return <div className="alert alert-info">No data available.</div>;
  const labels = data.map(d => d.date);
  const prices = data.map(d => d.price);
  return (
    <div style={{background:'#fff', borderRadius:16, padding:16}}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: `${crop} - ${market}`,
              data: prices,
              borderColor: '#388e3c',
              backgroundColor: 'rgba(56,142,60,0.1)',
              tension: 0.2,
              pointRadius: 3,
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Price (₹)' } },
          },
        }}
      />
    </div>
  );
}
