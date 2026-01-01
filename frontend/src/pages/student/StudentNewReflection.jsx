import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { getAllTemplates } from "../../data/templates";
import { getRoute, ROUTES } from "../../routes";

export default function StudentNewReflection() {
  const navigate = useNavigate();
  const templates = getAllTemplates();

  const handleSelect = (template) => {
    navigate(getRoute(ROUTES.STUDENT_NEW_TEMPLATE, { templateId: template.id }));
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', accent: 'bg-blue-500', text: 'text-blue-600' },
      green: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', accent: 'bg-emerald-500', text: 'text-emerald-600' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', accent: 'bg-amber-500', text: 'text-amber-600' },
      rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600', accent: 'bg-rose-500', text: 'text-rose-600' },
      slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'bg-slate-100 text-slate-600', accent: 'bg-slate-500', text: 'text-slate-600' },
    };
    return colors[color] || colors.slate;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <button 
            onClick={() => navigate(ROUTES.STUDENT_HOME)}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3 transition"
          >
            ← Grįžti
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Nauja refleksija</h1>
          <p className="text-sm text-slate-500 mt-1">Pasirinkite tipą</p>
        </div>

        {/* Templates List - Compact Cards */}
        <div className="space-y-3">
          {templates.map(template => {
            const c = getColorClasses(template.color);
            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 ${c.border} ${c.bg} hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 text-left`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {template.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full">
                      {template.fields.length} kl.
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">{template.description}</p>
                </div>

                {/* Arrow */}
                <div className={`${c.text} text-lg flex-shrink-0`}>
                  →
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick tip */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">💡 Galite bet kada išsaugoti ir tęsti vėliau</p>
        </div>
      </div>
    </Layout>
  );
}
