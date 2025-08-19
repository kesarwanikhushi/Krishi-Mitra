import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto';
import { useRef } from 'react';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const phaseColors = {
  sow: '#ffb300',
  grow: '#388e3c',
  harvest: '#8e24aa',
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CropCalendarChart({ data, selectedCrops }) {
  const chartRef = useRef();
  const datasets = data.map((item, idx) => {
    const crop = item.crop;
    if (!selectedCrops.includes(crop)) return null;
    const phaseByMonth = {};
    item.phases.forEach(({ month, phase }) => {
      phaseByMonth[month] = phase;
    });
    return {
      label: crop,
      data: months.map(m => phaseByMonth[m] ? 1 : 0),
      backgroundColor: months.map(m => phaseByMonth[m] ? phaseColors[phaseByMonth[m]] : '#e0e0e0'),
      borderRadius: 8,
      barPercentage: 0.8,
      categoryPercentage: 0.7,
      borderSkipped: false,
    };
  }).filter(Boolean);

  const options = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const m = context.label;
            const crop = context.dataset.label;
            const phase = data.find(d => d.crop === crop)?.phases.find(p => p.month === m)?.phase;
            return `${crop}: ${phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : 'No activity'}`;
          }
        }
      },
      title: { display: false },
    },
    responsive: true,
    scales: {
      x: { display: false, stacked: true },
      y: { stacked: true, grid: { display: false } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{height: 80 * datasets.length + 40, background: '#fff', borderRadius: 16, padding: 16}}>
      <Bar ref={chartRef} data={{
        labels: months,
        datasets,
      }} options={options} />
      <div className="mt-3" aria-label="Legend">
        <span className="me-3"><span style={{background: phaseColors.sow, display:'inline-block', width:18, height:18, borderRadius:4, marginRight:4}}></span> Sow</span>
        <span className="me-3"><span style={{background: phaseColors.grow, display:'inline-block', width:18, height:18, borderRadius:4, marginRight:4}}></span> Grow</span>
        <span className="me-3"><span style={{background: phaseColors.harvest, display:'inline-block', width:18, height:18, borderRadius:4, marginRight:4}}></span> Harvest</span>
      </div>
    </div>
  );
}
