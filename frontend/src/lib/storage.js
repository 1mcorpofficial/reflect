// localStorage helpers
export function loadReflections() {
  try {
    const raw = localStorage.getItem('reflections');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReflections(reflections) {
  localStorage.setItem('reflections', JSON.stringify(reflections));
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem('tasks');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

export function loadClasses() {
  try {
    const raw = localStorage.getItem('classes');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveClasses(classes) {
  localStorage.setItem('classes', JSON.stringify(classes));
}
