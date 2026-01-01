// Vieningas API layer - kol kas naudojame mockApi
import * as mockApi from './mockApi';

export const api = {
  // Reflections
  createReflection: mockApi.createReflection,
  listStudentReflections: mockApi.listStudentReflections,
  getReflection: mockApi.getReflection,
  listTeacherReflections: mockApi.listTeacherReflections,
  addTeacherComment: mockApi.addTeacherComment,
  
  // Tasks
  createTask: mockApi.createTask,
  listStudentTasks: mockApi.listStudentTasks,
  listTeacherTasks: mockApi.listTeacherTasks,
  
  // Classes
  listTeacherClasses: mockApi.listTeacherClasses,
  listStudentClasses: mockApi.listStudentClasses,
  createClass: mockApi.createClass,
};
