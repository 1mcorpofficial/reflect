/**
 * Apple-inspired Bar Chart Component (Light Theme)
 * Using recharts with Apple Health styling
 */
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const APPLE_COLORS = {
  primary: '#007aff',
  secondary: '#34c759',
  accent: '#ff9500',
};

export function BarChart({ 
  data = [],
  dataKey = 'value',
  xKey = 'name',
  bars = [{ dataKey, fill: APPLE_COLORS.primary }],
  className,
  height = 300,
  showGrid = true,
  showLegend = false,
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
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              cursor={{ fill: 'rgba(0, 122, 255, 0.1)' }}
            />
          )}
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar 
              key={bar.dataKey || index}
              dataKey={bar.dataKey}
              fill={bar.fill}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

