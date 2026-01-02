// Vieningas API layer - su feature flag perjungimu
import * as mockApi from './mockApi';
import * as realApi from './realApi';

// Feature flag: naudoti tikrą API arba mock
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

const apiImpl = USE_REAL_API ? realApi : mockApi;

export const api = {
  // Reflections
  createReflection: apiImpl.createReflection,
  listStudentReflections: apiImpl.listStudentReflections,
  getReflection: apiImpl.getReflection,
  listTeacherReflections: apiImpl.listTeacherReflections,
  addTeacherComment: apiImpl.addTeacherComment,
  
  // Tasks
  createTask: apiImpl.createTask,
  listStudentTasks: apiImpl.listStudentTasks,
  listTeacherTasks: apiImpl.listTeacherTasks,
  
  // Classes
  listTeacherClasses: apiImpl.listTeacherClasses,
  listStudentClasses: apiImpl.listStudentClasses,
  createClass: apiImpl.createClass,
};
