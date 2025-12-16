import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { getAllTemplates } from "../../data/templates";
import { getRoute, ROUTES } from "../../routes";

export default function StudentNewReflection() {
  const navigate = useNavigate();
  const templates = getAllTemplates();

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    slate: 'from-slate-500 to-slate-600',
  };

  return (
    <Layout>
      <PageHeader 
        title="Nauja refleksija" 
        subtitle="Pasirinkite refleksijos tipą"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card
            key={template.id}
            className={`hover:shadow-lg transition cursor-pointer bg-gradient-to-br ${colorClasses[template.color]} text-white border-0 p-6`}
            onClick={() => navigate(getRoute(ROUTES.STUDENT_NEW_TEMPLATE, { templateId: template.id }))}
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h3 className="font-semibold text-xl mb-2">{template.name}</h3>
            <p className="text-white/90 text-sm">
              {template.fields.length} klausimai
            </p>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
