import { loadReflections, saveReflections, loadClasses, saveClasses, loadAssignments, saveAssignments } from "./storage.js";

const mockUsers = [
  {
    id: "stu-1",
    email: "mokinys@pastas.lt",
    password: "test123",
    role: "student",
    name: "Pirmas Mokinys",
    classId: "8A"
  },
  {
    id: "teach-1",
    email: "mokytojas@pastas.lt",
    password: "test123",
    role: "teacher",
    name: "Mokytojas Ona",
    classId: null
  }
];

function seedClasses() {
  const classes = loadClasses();
  if (classes.length) return classes;
  const seeded = [
    { id: "class-8a", name: "8A", code: "8A-XYZ", teacherId: "teach-1", studentIds: ["stu-1"] },
    { id: "class-7b", name: "7B", code: "7B-ABC", teacherId: "teach-1", studentIds: [] }
  ];
  saveClasses(seeded);
  return seeded;
}

function seedAssignments() {
  const assignments = loadAssignments();
  if (assignments.length) return assignments;
  const seeded = [
    {
      id: "as-1",
      title: "Savaitės refleksija (8A)",
      description: "Apmąstykite praėjusią savaitę",
      templateId: "week",
      classIds: ["class-8a"],
      teacherId: "teach-1",
      dueAt: null,
      createdAt: new Date().toISOString()
    }
  ];
  saveAssignments(seeded);
  return seeded;
}

function delay(ms = 200) {
  return new Promise(res => setTimeout(res, ms));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function authLogin(email, password) {
  await delay();
  const user = mockUsers.find(
    u => u.email.toLowerCase() === String(email || "").toLowerCase().trim() && u.password === password
  );
  if (!user) {
    const err = new Error("INVALID_CREDENTIALS");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  const token = `mock-token-${user.id}`;
  const { password: _, ...publicUser } = user;
  return { token, user: publicUser };
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
    const err = new Error("NOT_FOUND");
    err.code = "NOT_FOUND";
    throw err;
  }
  return { item };
}

export async function createReflection(data) {
  await delay();
  const all = loadReflections();
  const now = new Date().toISOString();
  const item = {
    id: makeId(),
    templateId: data.templateId,
    studentId: data.studentId,
    classId: data.classId || null,
    createdAt: now,
    answers: data.answers || {},
    status: data.status || "submitted",
    teacherComment: null
  };
  if (data.mood != null) item.mood = data.mood;
  if (data.assignmentId) item.assignmentId = data.assignmentId;
  if (data.teacherId) item.teacherId = data.teacherId;
  const list = [item, ...all];
  saveReflections(list);
  return { item };
}

export async function listTeacherReflections(classId, filters = {}) {
  await delay();
  const all = loadReflections();
  const { templateId, from, to, needsComment } = filters;
  const items = all.filter(item => {
    if (classId && item.classId && item.classId !== classId) return false;
    if (templateId && item.templateId !== templateId) return false;
    if (from && new Date(item.createdAt) < new Date(from)) return false;
    if (to && new Date(item.createdAt) > new Date(to)) return false;
    if (needsComment && item.teacherComment) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { items };
}

// Classes
export async function createClass({ name, teacherId }) {
  await delay();
  const classes = seedClasses();
  const code = `${name.replace(/\s+/g, "").toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const cls = { id: `class-${Date.now()}`, name, code, teacherId, studentIds: [] };
  const list = [cls, ...classes];
  saveClasses(list);
  return { cls };
}

export async function listTeacherClasses(teacherId) {
  await delay();
  const classes = seedClasses();
  return { items: classes.filter(c => c.teacherId === teacherId) };
}

export async function listStudentClasses(studentId) {
  await delay();
  const classes = seedClasses();
  return { items: classes.filter(c => c.studentIds?.includes(studentId)) };
}

export async function joinClass({ code, studentId }) {
  await delay();
  const classes = seedClasses();
  const idx = classes.findIndex(c => c.code.toUpperCase() === String(code).toUpperCase());
  if (idx === -1) {
    const err = new Error("CLASS_NOT_FOUND");
    err.code = "CLASS_NOT_FOUND";
    throw err;
  }
  const cls = classes[idx];
  if (!cls.studentIds.includes(studentId)) cls.studentIds.push(studentId);
  saveClasses(classes);
  return { cls };
}

// Assignments
export async function createAssignment(data) {
  await delay();
  const assignments = seedAssignments();
  const item = {
    id: `as-${Date.now()}`,
    title: data.title,
    description: data.description || "",
    templateId: data.templateId || null,
    fields: data.fields || null,
    classIds: data.classIds || [],
    teacherId: data.teacherId,
    dueAt: data.dueAt || null,
    createdAt: new Date().toISOString()
  };
  const list = [item, ...assignments];
  saveAssignments(list);
  return { item };
}

export async function listTeacherAssignments(teacherId) {
  await delay();
  const assignments = seedAssignments();
  return { items: assignments.filter(a => a.teacherId === teacherId) };
}

export async function listStudentAssignments(studentId) {
  await delay();
  const classes = seedClasses();
  const assignments = seedAssignments();
  const myClassIds = classes.filter(c => c.studentIds.includes(studentId)).map(c => c.id);
  const items = assignments.filter(a => a.classIds.some(id => myClassIds.includes(id)));
  return { items };
}

export async function getAssignment(id) {
  await delay();
  const assignments = seedAssignments();
  const item = assignments.find(a => a.id === id);
  if (!item) {
    const err = new Error("ASSIGNMENT_NOT_FOUND");
    err.code = "ASSIGNMENT_NOT_FOUND";
    throw err;
  }
  return { item };
}

export async function addTeacherComment(reflectionId, comment) {
  await delay();
  const all = loadReflections();
  const idx = all.findIndex(x => x.id === reflectionId);
  if (idx === -1) {
    const err = new Error("NOT_FOUND");
    err.code = "NOT_FOUND";
    throw err;
  }
  all[idx] = { ...all[idx], teacherComment: comment };
  saveReflections(all);
  return { item: all[idx] };
}
