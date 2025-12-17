import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { TemplateCard } from "../../components/TemplateCard";
import { getAllTemplates } from "../../data/templates";
import { getRoute, ROUTES } from "../../routes";

export default function StudentNewReflection() {
  const navigate = useNavigate();
  const templates = getAllTemplates();

  const handleSelect = (template) => {
    navigate(getRoute(ROUTES.STUDENT_NEW_TEMPLATE, { templateId: template.id }));
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title="Refleksija" 
          subtitle="Pasirinkite refleksijos tipą"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </PageContainer>
    </Layout>
  );
}
