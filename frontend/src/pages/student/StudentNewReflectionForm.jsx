/**
 * Apple-inspired Reflection Form
 * Uses ReflectionFlow component with progressive disclosure
 */
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { getReflectionSchema } from "../../data/reflectionSchemas";
import { ROUTES } from "../../routes";
import ReflectionFlow from "../../components/ReflectionFlow/ReflectionFlow";

export default function StudentNewReflectionForm() {
  const { templateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const taskId = new URLSearchParams(location.search).get('taskId');
  const template = getTemplate(templateId);
  const schema = getReflectionSchema(templateId);

  if (!template || !schema) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">Refleksijos tipas nerastas</p>
            <button
              onClick={() => navigate(ROUTES.STUDENT_NEW)}
              className="text-blue-600 hover:text-blue-700"
            >
              Grįžti atgal
            </button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  const handleSubmit = async (submissionData) => {
    // Transform to API format matching realApi.js createReflection expectations
    const apiData = {
      studentId: user.id,
      studentName: user.name || user.email,
      classId: user.classId,
      templateId: template.id,
      scheduleId: taskId, // API expects scheduleId, not taskId
      answers: {},
      answerStatuses: {},
      unknownFlows: {},
    };

    // Map step IDs to template field keys for backward compatibility
    const templateFields = template.fields || [];
    schema.steps.forEach((step, index) => {
      const stepId = step.id;
      const stepValue = submissionData.answers[stepId];
      const status = submissionData.answerStatuses[stepId] || 'answered';
      
      // Find matching field by index or try to match by step ID
      const field = templateFields[index];
      
      if (field) {
        // For chips, join array to string
        if (step.type === 'chips' && Array.isArray(stepValue)) {
          apiData.answers[field.key] = stepValue.join(', ');
        } else {
          apiData.answers[field.key] = stepValue;
        }
        apiData.answerStatuses[field.key] = status;
      } else {
        // Fallback: use step ID as key
        apiData.answers[stepId] = Array.isArray(stepValue) ? stepValue.join(', ') : stepValue;
        apiData.answerStatuses[stepId] = status;
      }
      
      if (submissionData.unknownFlows[stepId]) {
        apiData.unknownFlows[field?.key || stepId] = submissionData.unknownFlows[stepId];
      }
    });

    await api.createReflection(apiData);
    
    // Navigate after successful submission
    setTimeout(() => {
      navigate(ROUTES.STUDENT_HISTORY);
    }, 2000);
  };

  const handleCancel = () => {
    navigate(ROUTES.STUDENT_NEW);
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title={template.name}
          subtitle={template.description || template.summary}
          action={
            <button
              onClick={handleCancel}
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              ← Grįžti
            </button>
          }
        />

        <ReflectionFlow
          schemaId={templateId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          taskId={taskId}
        />
      </PageContainer>
    </Layout>
  );
}