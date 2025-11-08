
import { MOCK_COURSES, MOCK_ANNOUNCEMENTS, MOCK_TIMETABLE } from '../constants';
import { Course, Announcement, TimetableEntry } from '../types';

const COURSES_KEY = 'portal_courses';
const ANNOUNCEMENTS_KEY = 'portal_announcements';
const TIMETABLE_KEY = 'portal_timetable';

// Initialize data in localStorage if it doesn't exist
export const initializeData = () => {
  if (!localStorage.getItem(COURSES_KEY)) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(MOCK_COURSES));
  }
  if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(MOCK_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(TIMETABLE_KEY)) {
    // Add unique IDs to mock timetable entries for editing capabilities
    const timetableWithIds = MOCK_TIMETABLE.map((entry) => ({
      ...entry,
      id: self.crypto.randomUUID(),
    }));
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetableWithIds));
  }
};

// --- Getters ---
export const getCourses = (): Course[] => {
  return JSON.parse(localStorage.getItem(COURSES_KEY) || '[]');
};

export const getAnnouncements = (): Announcement[] => {
  const announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
  // Return in reverse chronological order
  return announcements.sort((a: Announcement, b: Announcement) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTimetable = (): TimetableEntry[] => {
  return JSON.parse(localStorage.getItem(TIMETABLE_KEY) || '[]');
};


// --- Setters / Adders / Updaters ---
export const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'date'>) => {
  const announcements = getAnnouncements();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: self.crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  };
  announcements.unshift(newAnnouncement); // Add to the beginning
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  return newAnnouncement;
};

export const updateAnnouncement = (updatedAnnouncement: Announcement) => {
    let announcements = getAnnouncements();
    announcements = announcements.map(ann => ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    return updatedAnnouncement;
};

export const addCourse = (course: Course) => {
    const courses = getCourses();
    courses.push(course);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return course;
};

export const updateCourse = (updatedCourse: Course) => {
    let courses = getCourses();
    courses = courses.map(c => c.code === updatedCourse.code ? updatedCourse : c);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return updatedCourse;
};

export const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
    const timetable = getTimetable();
    const newEntry: TimetableEntry = {
        ...entry,
        id: self.crypto.randomUUID(),
    };
    timetable.push(newEntry);
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
    return newEntry;
};

export const updateTimetableEntry = (updatedEntry: TimetableEntry) => {
    let timetable = getTimetable();
    timetable = timetable.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
    return updatedEntry;
};