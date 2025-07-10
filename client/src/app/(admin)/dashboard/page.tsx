import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import type { ChartData, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axiosInstance from '~/config/axiosConfig';
import { AxiosError } from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

type Timeframe = 'daily' | 'monthly';

interface RevenueRecord {
  date: string;
  totalRevenue: number;
  orderCount: number;
}

interface KpiData {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

const formatVND = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B ₫`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ₫`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K ₫`;
  }
  return `${value} ₫`;
};

// API fetching utility
async function fetchRevenueData<T>(endpoint: string): Promise<T> {
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data.data;
  } catch (error: AxiosError | unknown) {
    if (error instanceof AxiosError && error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch data');
    }
    throw new Error('Failed to fetch data');
  }
}

// Main Dashboard Component
const DashboardPage = () => {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [chartData, setChartData] = useState<RevenueRecord[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getKpiData = async () => {
      try {
        const data = await fetchRevenueData<KpiData>('/revenue');
        setKpiData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };
    getKpiData();
  }, []);

  useEffect(() => {
    const getChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchRevenueData<{ records: RevenueRecord[] }>(
          `/revenue/${timeframe}`
        );
        setChartData(result.records);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    getChartData();
  }, [timeframe]);

  const processedChartData = useMemo(() => {
    return chartData;
  }, [chartData]);

  const lineChartData: ChartData<'line'> = {
    labels: processedChartData.map(d => d.date),
    datasets: [
      {
        label: 'Total Revenue',
        data: processedChartData.map(d => d.totalRevenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: `Revenue Analysis - ${
          timeframe.charAt(0).toUpperCase() + timeframe.slice(1)
        }`
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === 'number') {
              return formatVND(value);
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>
        Revenue Dashboard
      </h1>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <KpiCard
          title='Total Revenue'
          value={kpiData ? formatVND(kpiData.totalRevenue) : 'Loading...'}
        />
        <KpiCard
          title='Total Orders'
          value={kpiData ? kpiData.orderCount.toLocaleString() : 'Loading...'}
        />
        <KpiCard
          title='Average Order Value'
          value={kpiData ? formatVND(kpiData.averageOrderValue) : 'Loading...'}
        />
      </div>

      {/* Chart Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex justify-center gap-2 mb-4'>
          {(['daily', 'monthly'] as Timeframe[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeframe === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading && <div className='text-center p-10'>Loading chart...</div>}
        {error && (
          <div className='text-center p-10 text-red-500'>Error: {error}</div>
        )}
        {!loading && !error && processedChartData.length > 0 && (
          <Line options={chartOptions} data={lineChartData} />
        )}
        {!loading && !error && processedChartData.length === 0 && (
          <div className='text-center p-10 text-gray-500'>
            No data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};

// A simple component for KPI cards
const KpiCard = ({ title, value }: { title: string; value: string }) => (
  <div className='bg-white p-6 rounded-lg shadow-md'>
    <h3 className='text-gray-500 text-sm font-medium mb-2'>{title}</h3>
    <p className='text-3xl font-semibold text-gray-800'>{value}</p>
  </div>
);

export default DashboardPage;
