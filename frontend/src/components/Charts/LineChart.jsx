/**
 * Apple-inspired Line Chart Component (Light Theme)
 * Using recharts with Apple Health styling
 */
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const APPLE_COLORS = {
  primary: '#007aff',
  secondary: '#34c759',
  accent: '#ff9500',
  danger: '#ff3b30',
};

export function LineChart({ 
  data = [],
  lines = [{ dataKey: 'value', stroke: APPLE_COLORS.primary, name: 'Reikšmė' }],
  xKey = 'date',
  className,
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  smooth = true,
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
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" opacity={0.5} />
          )}
          <XAxis 
            dataKey={xKey}
            stroke="#6e6e73"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6e6e73"
            fontSize={12}
            tickLine={false}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8ed',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#1d1d1f', fontWeight: 600 }}
              cursor={{ stroke: APPLE_COLORS.primary, strokeWidth: 1, strokeDasharray: '5 5' }}
            />
          )}
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line 
              key={line.dataKey || index}
              type={smooth ? "monotone" : "linear"}
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={2}
              dot={{ fill: line.stroke, r: 4 }}
              activeDot={{ r: 6 }}
              name={line.name}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

