/**
 * Apple-inspired Pie Chart Component (Light Theme)
 * Using recharts with Apple Health styling
 */
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import clsx from 'clsx';

const APPLE_COLORS = [
  '#007aff', // Blue
  '#34c759', // Green
  '#ff9500', // Amber
  '#ff3b30', // Red
  '#af52de', // Purple
  '#ff2d55', // Pink
  '#5ac8fa', // Light Blue
  '#ffcc00', // Yellow
];

export function PieChart({ 
  data = [],
  colors = APPLE_COLORS,
  className,
  height = 300,
  showLegend = true,
  showTooltip = true,
}) {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-slate-500 text-sm">Nėra duomenų</p>
      </div>
    );
  }

  return (
    <div className={clsx("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={height / 3}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8ed',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#1d1d1f', fontWeight: 600 }}
            />
          )}
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: '16px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

