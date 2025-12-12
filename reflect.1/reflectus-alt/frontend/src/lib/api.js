import {
  authLogin as mockAuthLogin,
  listStudentReflections as mockListStudentReflections,
  getReflection as mockGetReflection,
  createReflection as mockCreateReflection,
  listTeacherReflections as mockListTeacherReflections,
  addTeacherComment as mockAddTeacherComment,
  createClass as mockCreateClass,
  listTeacherClasses as mockListTeacherClasses,
  listStudentClasses as mockListStudentClasses,
  joinClass as mockJoinClass,
  createAssignment as mockCreateAssignment,
  listTeacherAssignments as mockListTeacherAssignments,
  listStudentAssignments as mockListStudentAssignments,
  getAssignment as mockGetAssignment
} from "./mockApi";

const BASE_URL = import.meta.env.VITE_API_URL;
const useMock = !BASE_URL;

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    let payload;
    try { payload = JSON.parse(text); } catch (_) { /* ignore */ }
    const err = new Error(payload?.error || `HTTP_${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return res.json();
}

export const api = {
  async authLogin(email, password) {
    if (useMock) return mockAuthLogin(email, password);
    return fetchJson("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },

  async listStudentReflections(studentId) {
    if (useMock) return mockListStudentReflections(studentId);
    return fetchJson(`/api/reflections/me?studentId=${encodeURIComponent(studentId)}`);
  },

  async getReflection(id) {
    if (useMock) return mockGetReflection(id);
    return fetchJson(`/api/reflections/${id}`);
  },

  async createReflection(data) {
    if (useMock) return mockCreateReflection(data);
    return fetchJson("/api/reflections", { method: "POST", body: JSON.stringify(data) });
  },

  async listTeacherReflections(classId, filters = {}) {
    if (useMock) return mockListTeacherReflections(classId, filters);
    const params = new URLSearchParams();
    if (classId) params.set("classId", classId);
    if (filters.templateId) params.set("templateId", filters.templateId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.needsComment) params.set("needsComment", "1");
    return fetchJson(`/api/teacher/reflections?${params.toString()}`);
  },

  async addTeacherComment(reflectionId, comment) {
    if (useMock) return mockAddTeacherComment(reflectionId, comment);
    return fetchJson(`/api/teacher/reflections/${reflectionId}/comment`, {
      method: "POST",
      body: JSON.stringify({ comment })
    });
  },

  async createClass(data) {
    if (useMock) return mockCreateClass(data);
    return fetchJson("/api/teacher/classes", { method: "POST", body: JSON.stringify(data) });
  },

  async listTeacherClasses(teacherId) {
    if (useMock) return mockListTeacherClasses(teacherId);
    return fetchJson(`/api/teacher/classes?teacherId=${encodeURIComponent(teacherId)}`);
  },

  async listStudentClasses(studentId) {
    if (useMock) return mockListStudentClasses(studentId);
    return fetchJson(`/api/student/classes?studentId=${encodeURIComponent(studentId)}`);
  },

  async joinClass(data) {
    if (useMock) return mockJoinClass(data);
    return fetchJson("/api/student/classes/join", { method: "POST", body: JSON.stringify(data) });
  },

  async createAssignment(data) {
    if (useMock) return mockCreateAssignment(data);
    return fetchJson("/api/teacher/assignments", { method: "POST", body: JSON.stringify(data) });
  },

  async listTeacherAssignments(teacherId) {
    if (useMock) return mockListTeacherAssignments(teacherId);
    return fetchJson(`/api/teacher/assignments?teacherId=${encodeURIComponent(teacherId)}`);
  },

  async listStudentAssignments(studentId) {
    if (useMock) return mockListStudentAssignments(studentId);
    return fetchJson(`/api/student/assignments?studentId=${encodeURIComponent(studentId)}`);
  },

  async getAssignment(id) {
    if (useMock) return mockGetAssignment(id);
    return fetchJson(`/api/assignments/${id}`);
  }
};
