import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, CategoryScale);

export interface PricePoint {
  date: string; // ISO date
  price: number;
}

export interface PricesChartProps {
  data: PricePoint[];
}

function toCSV(data: PricePoint[]): string {
  return 'date,price\n' + data.map(d => `${d.date},${d.price}`).join('\n');
}


export function PricesChart({ data }: PricesChartProps) {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Price',
        data: data.map(d => d.price),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.2,
        pointRadius: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `₹${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: { unit: 'day' as const, tooltipFormat: 'MMM d' },
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Price (₹)' },
        ticks: {
          callback: (tickValue: string | number) => `₹${tickValue}`,
        },
      },
    },
  };

  const handleExport = () => {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Line ref={chartRef} data={chartData} options={options} />
      <button className="btn btn-outline-primary mt-2" onClick={handleExport}>
        Export CSV
      </button>
    </div>
  );
}

export default PricesChart;
