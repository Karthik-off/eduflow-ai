import { create } from 'zustand';

interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string;
  department_name: string;
  year: string;
  section_id: string;
  section_name: string;
  attendance_percentage?: number;
  avatar_url?: string;
  bio?: string;
  cgpa?: number;
  created_at?: string;
  current_semester_id?: string;
}

interface StudentState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  clearStudents: () => void;
  loadStudentsFromStorage: () => void;
  saveStudentsToStorage: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  
  setStudents: (students) => {
    set({ students });
    localStorage.setItem('eduflow_students', JSON.stringify(students));
  },
  
  addStudent: (student) => {
    const currentStudents = get().students;
    const updatedStudents = [...currentStudents, student];
    set({ students: updatedStudents });
  },
  
  updateStudent: (id, updatedStudent) => {
    const currentStudents = get().students;
    const updatedStudents = currentStudents.map(student =>
      student.id === id ? { ...student, ...updatedStudent } : student
    );
    set({ students: updatedStudents });
  },
  
  deleteStudent: (id) => {
    const currentStudents = get().students;
    const updatedStudents = currentStudents.filter(student => student.id !== id);
    set({ students: updatedStudents });
  },
  
  clearStudents: () => {
    set({ students: [] });
    localStorage.removeItem('eduflow_students');
  },
  
  loadStudentsFromStorage: () => {
    try {
      const stored = localStorage.getItem('eduflow_students');
      if (stored) {
        const students = JSON.parse(stored);
        set({ students });
      }
    } catch (error) {
      console.error('Error loading students from storage:', error);
    }
  },
  
  saveStudentsToStorage: () => {
    const students = get().students;
    localStorage.setItem('eduflow_students', JSON.stringify(students));
  }
}));
