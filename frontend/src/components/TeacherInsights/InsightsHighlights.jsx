/**
 * Apple Health-inspired Insights Highlights
 * Shows key metrics and insights for teachers
 */
import { Card } from '../ui';
import clsx from 'clsx';

export function InsightCard({ title, value, subtitle, trend, icon, color = 'blue' }) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', value: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', value: 'text-green-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', value: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', value: 'text-rose-600' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={clsx(colors.bg, colors.border, 'border-l-4')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-xl">{icon}</span>}
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          <div className={clsx('text-2xl font-bold mb-1', colors.value)}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-600">{subtitle}</p>
          )}
          {trend && (
            <div className={clsx('text-xs mt-2', trend > 0 ? 'text-green-600' : trend < 0 ? 'text-rose-600' : 'text-slate-600')}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% per savaitę
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function InsightsHighlights({ insights }) {
  if (!insights || Object.keys(insights).length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-slate-600">Dar nėra duomenų analizei</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.topDontKnowRate && (
        <InsightCard
          title="Nežinau pasirinkimas"
          value={`${insights.topDontKnowRate.percentage}%`}
          subtitle={`Tema: ${insights.topDontKnowRate.topic || 'N/A'}`}
          icon="❓"
          color="amber"
        />
      )}
      
      {insights.topFactors && insights.topFactors.length > 0 && (
        <InsightCard
          title="Dažniausi faktoriai"
          value={insights.topFactors[0]?.count || 0}
          subtitle={insights.topFactors[0]?.name || ''}
          icon="📊"
          color="blue"
        />
      )}
      
      {insights.averageScore !== undefined && (
        <InsightCard
          title="Vidutinis įvertinimas"
          value={insights.averageScore.toFixed(1)}
          subtitle={`Iš 5`}
          icon="⭐"
          color="green"
        />
      )}
      
      {insights.responseRate !== undefined && (
        <InsightCard
          title="Atsakymo procentas"
          value={`${insights.responseRate}%`}
          subtitle={`${insights.respondedCount || 0} iš ${insights.totalCount || 0} mokinių`}
          icon="✓"
          color="green"
        />
      )}
    </div>
  );
}
