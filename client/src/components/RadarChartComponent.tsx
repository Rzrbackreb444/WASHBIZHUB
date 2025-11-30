import { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface RadarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointBorderWidth: number;
      pointRadius: number;
      pointHoverRadius: number;
    }>;
  };
}

export default function RadarChartComponent({ data }: RadarChartProps) {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { 
          stepSize: 2,
          color: 'rgba(255,255,255,0.5)',
          backdropColor: 'transparent',
          font: { size: 10 }
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { 
          color: 'rgba(255,255,255,0.7)',
          font: { size: 9 }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest' as const,
        intersect: false,
      }
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
      },
      line: {
        tension: 0.1,
        borderWidth: 2,
      }
    }
  }), []);

  return <Radar data={data} options={options} />;
}
