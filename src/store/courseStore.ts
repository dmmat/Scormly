import { create } from 'zustand'
import type { Course } from '../types/course'

const initialCourse: Course = {
  id: 'course-1',
  title: 'Новий курс',
  description: 'Демонстраційний курс Scormly',
  lessons: [
    { id: 'lesson-1', title: 'Вступ', status: 'draft', blocks: [] },
    { id: 'lesson-2', title: 'Основні поняття', status: 'draft', blocks: [] },
    { id: 'lesson-3', title: 'Підсумковий тест', status: 'draft', blocks: [] },
  ],
}

interface CourseState {
  course: Course
  activeLessonId: string | null
  setActiveLesson: (lessonId: string) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  course: initialCourse,
  activeLessonId: initialCourse.lessons[0]?.id ?? null,
  setActiveLesson: (lessonId) => set({ activeLessonId: lessonId }),
}))
