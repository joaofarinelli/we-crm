
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AppointmentsReportChartProps {
  data: { period: string; count: number; scheduled: number; completed: number; cancelled: number }[];
}

const chartConfig = {
  completed: {
    label: 'Realizados',
    color: '#10b981',
  },
  scheduled: {
    label: 'Agendados',
    color: '#3b82f6',
  },
  cancelled: {
    label: 'Cancelados',
    color: '#ef4444',
  },
};

export const AppointmentsReportChart = ({ data }: AppointmentsReportChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" />
          <Bar dataKey="scheduled" stackId="a" fill="var(--color-scheduled)" />
          <Bar dataKey="cancelled" stackId="a" fill="var(--color-cancelled)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
