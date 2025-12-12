const REFLECTION_KEY = "reflectus_reflections";
const AUTH_KEY = "reflectus_auth";
const DRAFT_KEY = "reflectus_drafts";
const CLASS_KEY = "reflectus_classes";
const ASSIGN_KEY = "reflectus_assignments";

function readJSON(key, fallback) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error("storage read error", err);
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("storage write error", err);
  }
}

export function loadReflections() {
  return readJSON(REFLECTION_KEY, []);
}

export function saveReflections(list) {
  writeJSON(REFLECTION_KEY, list || []);
}

export function loadClasses() {
  return readJSON(CLASS_KEY, []);
}

export function saveClasses(list) {
  writeJSON(CLASS_KEY, list || []);
}

export function loadAssignments() {
  return readJSON(ASSIGN_KEY, []);
}

export function saveAssignments(list) {
  writeJSON(ASSIGN_KEY, list || []);
}

export function loadAuth() {
  return readJSON(AUTH_KEY, null);
}

export function saveAuth(auth) {
  writeJSON(AUTH_KEY, auth);
}

export function clearAuth() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export function loadDraft(draftKey) {
  const drafts = readJSON(DRAFT_KEY, {});
  return drafts[draftKey] || null;
}

export function saveDraft(draftKey, data) {
  const drafts = readJSON(DRAFT_KEY, {});
  drafts[draftKey] = data;
  writeJSON(DRAFT_KEY, drafts);
}

export function clearDraft(draftKey) {
  const drafts = readJSON(DRAFT_KEY, {});
  delete drafts[draftKey];
  writeJSON(DRAFT_KEY, drafts);
}
