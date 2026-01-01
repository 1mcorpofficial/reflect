import { loadReflections, saveReflections, loadTasks, saveTasks, loadClasses, saveClasses } from './storage';

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function delay(ms = 200) {
  return new Promise(res => setTimeout(res, ms));
}

// ===== REFLECTIONS =====
export async function createReflection(data) {
  await delay();
  const all = loadReflections();
  const now = new Date().toISOString();
  
  const item = {
    id: makeId(),
    studentId: data.studentId,
    studentName: data.studentName || 'Unknown',
    classId: data.classId || null,
    templateId: data.templateId,
    createdAt: now,
    status: 'submitted',
    answers: data.answers || {},
    teacherComment: null,
    taskId: data.taskId || null,
  };
  
  const list = [item, ...all];
  saveReflections(list);
  return { item };
}

export async function listStudentReflections(studentId) {
  await delay();
  const all = loadReflections();
  const items = all
    .filter(x => x.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { items };
}

export async function getReflection(id) {
  await delay();
  const all = loadReflections();
  const item = all.find(x => x.id === id);
  if (!item) {
    const err = new Error('NOT_FOUND');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return { item };
}

export async function listTeacherReflections(filters = {}) {
  await delay();
  const all = loadReflections();
  const { classId, templateId, status, needsComment } = filters;
  
  const items = all.filter(item => {
    if (classId && item.classId !== classId) return false;
    if (templateId && item.templateId !== templateId) return false;
    if (status && item.status !== status) return false;
    if (needsComment && item.teacherComment) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return { items };
}

export async function addTeacherComment(reflectionId, comment) {
  await delay();
  const all = loadReflections();
  const index = all.findIndex(x => x.id === reflectionId);
  
  if (index === -1) {
    const err = new Error('NOT_FOUND');
    err.code = 'NOT_FOUND';
    throw err;
  }
  
  all[index].teacherComment = {
    text: comment.text,
    teacherId: comment.teacherId,
    teacherName: comment.teacherName,
    createdAt: new Date().toISOString(),
  };
  all[index].status = 'reviewed';
  
  saveReflections(all);
  return { item: all[index] };
}

// ===== TASKS =====
export async function createTask(data) {
  await delay();
  const all = loadTasks();
  const task = {
    id: makeId(),
    classId: data.classId,
    templateId: data.templateId,
    title: data.title,
    description: data.description || '',
    dueAt: data.dueAt || null,
    createdAt: new Date().toISOString(),
    teacherId: data.teacherId,
  };
  
  const list = [task, ...all];
  saveTasks(list);
  return { task };
}

export async function listStudentTasks(studentId, classId) {
  await delay();
  const all = loadTasks();
  const items = all.filter(t => t.classId === classId);
  return { items };
}

export async function listTeacherTasks(teacherId) {
  await delay();
  const all = loadTasks();
  const items = all.filter(t => t.teacherId === teacherId);
  return { items };
}

// ===== CLASSES =====
function seedClasses() {
  const classes = loadClasses();
  if (classes.length) return classes;
  
  const seeded = [
    { id: 'class-8a', name: '8A', code: '8A-XYZ', teacherId: 'teach-1', studentIds: ['stu-1', 'stu-2'] },
    { id: 'class-7b', name: '7B', code: '7B-ABC', teacherId: 'teach-1', studentIds: [] }
  ];
  saveClasses(seeded);
  return seeded;
}

export async function listTeacherClasses(teacherId) {
  await delay();
  const classes = seedClasses();
  return { items: classes.filter(c => c.teacherId === teacherId) };
}

export async function listStudentClasses(studentId) {
  await delay();
  const classes = seedClasses();
  return { items: classes.filter(c => c.studentIds.includes(studentId)) };
}

export async function createClass(data) {
  await delay();
  const classes = seedClasses();
  const code = `${data.name.replace(/\s+/g, '').toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const cls = {
    id: `class-${Date.now()}`,
    name: data.name,
    code,
    teacherId: data.teacherId,
    studentIds: []
  };
  
  const list = [cls, ...classes];
  saveClasses(list);
  return { cls };
}
