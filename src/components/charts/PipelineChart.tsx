
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';

interface PipelineChartProps {
  data: { status: string; value: number; count: number }[];
}

const chartConfig = {
  value: {
    label: "Valor",
  },
};

export const PipelineChart = ({ data }: PipelineChartProps) => {
  const { columns } = usePipelineColumns();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Mapear cores das colunas customizadas
  const getColumnColor = (status: string) => {
    const column = columns.find(col => col.name === status);
    return column?.color || '#6B7280';
  };

  const dataWithColors = data.map((item) => ({
    ...item,
    fill: getColumnColor(item.status)
  }));

  return (
    <ChartContainer config={chartConfig} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, value }) => `${status}: ${formatCurrency(value)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
