// Real API implementation that calls the backend
import apiClient from '../api/client';
import { getTemplate } from '../data/templates';

// Map template field types to question types
function mapTemplateTypeToQuestionType(templateType) {
  const typeMap = {
    'text': 'text',
    'textarea': 'textarea',
    'rating': 'rating',
    'yesno': 'yesno',
    'select': 'select',
    'multi-select': 'multi-select',
  };
  return typeMap[templateType] || 'text';
}

// ===== REFLECTIONS (Responses) =====
export async function createReflection(data) {
  // Map taskId to scheduleId (tasks are ScheduledQuestionnaires)
  const scheduleId = data.scheduleId || data.taskId;
  
  if (scheduleId) {
    // Get the schedule to map template fields to questions
    const scheduleResponse = await apiClient.get(`/schedules/${scheduleId}`);
    const schedule = scheduleResponse.data;
    
    // Get questions for this schedule (populated)
    const questions = schedule.questions || [];
    
    // Get template to match field keys to question order (use schedule's templateId or data.templateId)
    const templateId = schedule.templateId || data.templateId;
    const template = templateId ? getTemplate(templateId) : null;
    const templateFields = template?.fields || [];
    
    // Convert answers object (with template field keys) to array format (with question IDs)
    const answersArray = questions.map((question, idx) => {
      const questionId = question._id || question.id;
      
      // Try to find matching answer by:
      // 1. Template field key (by index/order)
      // 2. Direct question ID match
      let value = null;
      let status = 'answered';
      let unknownFlow = undefined;
      
      if (templateFields[idx]) {
        const fieldKey = templateFields[idx].key;
        value = data.answers?.[fieldKey];
        
        // Check answerStatuses for this field
        if (data.answerStatuses?.[fieldKey]) {
          status = data.answerStatuses[fieldKey];
        } else if (value === null || value === undefined || value === '') {
          status = 'skip';
        }
        
        // Check unknownFlows for this field
        if (data.unknownFlows?.[fieldKey]) {
          unknownFlow = data.unknownFlows[fieldKey];
        }
      } else {
        // Fallback: try to find by question ID in answers
        value = data.answers?.[questionId] || data.answers?.[questionId?.toString()];
        if (value === null || value === undefined || value === '') {
          status = 'skip';
        }
      }
      
      return {
        questionId: questionId,
        status: status,
        value: value || null,
        unknownFlow: unknownFlow,
      };
    });
    
    const response = await apiClient.post(`/responses/schedule/${scheduleId}`, {
      answers: answersArray,
    });
    
    return { item: { id: response.data.response.id, ...data } };
  }
  
  // Fallback for non-scheduled reflections (legacy - use mock API)
  throw new Error('taskId/scheduleId required for real API. Use mock API for standalone reflections.');
}

export async function listStudentReflections(studentId) {
  // Map to responses endpoint filtered by student
  // Note: This requires backend changes to filter by studentId
  const response = await apiClient.get('/responses', {
    params: { studentId },
  });
  
  return { items: (response.data || []).map(transformResponse) };
}

export async function getReflection(id) {
  const response = await apiClient.get(`/responses/${id}`);
  return { item: transformResponse(response.data) };
}

export async function listTeacherReflections(filters = {}) {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.groupId) params.groupId = filters.groupId;
  
  const response = await apiClient.get('/responses', { params });
  return { items: (response.data || []).map(transformResponse) };
}

export async function addTeacherComment(reflectionId, comment) {
  const response = await apiClient.post(`/responses/${reflectionId}/comment`, {
    text: comment.text,
  });
  
  // Get updated response
  const updated = await apiClient.get(`/responses/${reflectionId}`);
  return { item: transformResponse(updated.data) };
}

// Helper to transform backend response format to frontend format
function transformResponse(r) {
  // Backend returns answers as object keyed by question ID (string)
  // Frontend expects answers keyed by template field keys
  // We need to map question IDs to field keys using template and order
  
  let answersByFieldKey = {};
  
  if (r.templateId && r.answersArray) {
    // We have answers array with question order - map to template field keys by order
    const template = getTemplate(r.templateId);
    if (template && template.fields) {
      r.answersArray.forEach((answer, idx) => {
        if (template.fields[idx]) {
          const fieldKey = template.fields[idx].key;
          answersByFieldKey[fieldKey] = answer.value;
        }
      });
    }
  } else if (r.answers) {
    // Fallback: use answers object as-is (might be keyed by questionId or fieldKey)
    answersByFieldKey = r.answers;
  }
  
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    classId: r.groupId || r.classId,
    templateId: r.templateId || null,
    createdAt: r.createdAt,
    status: r.status,
    answers: answersByFieldKey, // Object keyed by template field keys
    teacherComment: r.teacherComment ? {
      text: r.teacherComment.text,
      teacherId: r.teacherComment.teacherId,
      teacherName: r.teacherComment.teacherName,
      createdAt: r.teacherComment.createdAt,
    } : null,
    taskId: r.scheduledQuestionnaireId,
    scheduleTitle: r.scheduleTitle,
  };
}

// ===== TASKS (ScheduledQuestionnaires) =====
export async function createTask(data) {
  // Generate questions from template if templateId provided
  let questions = data.questions || [];
  
  if (data.templateId && !questions.length) {
    // Get template to generate questions
    const template = getTemplate(data.templateId);
    
    if (template && template.fields) {
      questions = template.fields.map(field => ({
        questionText: field.label,
        type: mapTemplateTypeToQuestionType(field.type),
        options: field.options || null,
        required: field.required ?? false,
      }));
    }
  }
  
  // Use startsAt/endsAt if provided, otherwise fall back to dueAt (for backward compatibility)
  let startTime, endTime;
  if (data.startsAt && data.endsAt) {
    startTime = new Date(data.startsAt);
    endTime = new Date(data.endsAt);
  } else if (data.dueAt) {
    // Backward compatibility: use dueAt as end time, start 1 hour before
    endTime = new Date(data.dueAt);
    startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
  } else {
    // Default: start now, end in 7 days
    startTime = new Date();
    endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  // Map to schedules endpoint
  const response = await apiClient.post('/schedules', {
    title: data.title,
    description: data.description,
    groupId: data.classId,
    templateId: data.templateId,
    startsAt: startTime.toISOString(),
    endsAt: endTime.toISOString(),
    privacyMode: data.privacyMode || 'named',
    questions: questions,
  });
  
  return { 
    task: {
      id: response.data._id || response.data.id,
      title: response.data.title,
      description: response.data.description,
      classId: response.data.groupId,
      templateId: response.data.templateId,
      dueAt: response.data.endsAt,
      createdAt: response.data.createdAt,
      teacherId: response.data.teacherId,
    }
  };
}

export async function listStudentTasks(studentId, classId) {
  // Map to schedules filtered by groupId
  const response = await apiClient.get('/schedules', {
    params: { groupId: classId },
  });
  
  return { items: (response.data || []).map(s => ({
    id: s._id || s.id,
    title: s.title,
    description: s.description,
    classId: s.groupId,
    templateId: s.templateId,
    dueAt: s.endsAt,
    createdAt: s.createdAt,
  })) };
}

export async function listTeacherTasks(teacherId) {
  const response = await apiClient.get('/schedules');
  return { items: (response.data || []).map(s => ({
    id: s._id || s.id,
    title: s.title,
    description: s.description,
    classId: s.groupId,
    templateId: s.templateId,
    dueAt: s.endsAt,
    createdAt: s.createdAt,
    teacherId: s.teacherId,
  })) };
}

// ===== CLASSES (Groups) =====
export async function listTeacherClasses(teacherId) {
  const response = await apiClient.get('/groups');
  return { items: (response.data || []).map(g => ({
    id: g.id || g._id,
    name: g.name,
    code: g.code,
    teacherId: g.teacherId,
    studentIds: g.studentIds || [],
  })) };
}

export async function listStudentClasses(studentId) {
  const response = await apiClient.get('/groups');
  return { items: (response.data || []).map(g => ({
    id: g.id || g._id,
    name: g.name,
    code: g.code,
    teacherId: g.teacherId,
    studentIds: g.studentIds || [],
  })) };
}

export async function createClass(data) {
  const response = await apiClient.post('/groups', {
    name: data.name,
  });
  
  return { cls: {
    id: response.data.id || response.data._id,
    name: response.data.name,
    code: response.data.code,
    teacherId: response.data.teacherId,
    studentIds: response.data.studentIds || [],
  } };
}
