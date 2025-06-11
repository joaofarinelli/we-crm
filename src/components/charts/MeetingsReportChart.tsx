
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface MeetingsReportChartProps {
  data: { period: string; count: number; completed: number; scheduled: number; inProgress: number }[];
}

const chartConfig = {
  completed: {
    label: 'Finalizadas',
    color: '#10b981',
  },
  scheduled: {
    label: 'Agendadas',
    color: '#3b82f6',
  },
  inProgress: {
    label: 'Em Andamento',
    color: '#f59e0b',
  },
};

export const MeetingsReportChart = ({ data }: MeetingsReportChartProps) => {
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
          <Bar dataKey="inProgress" stackId="a" fill="var(--color-inProgress)" />
          <Bar dataKey="scheduled" stackId="a" fill="var(--color-scheduled)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
