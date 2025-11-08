export interface User {
  id: string;
  fullName: string;
  email: string;
  registrationNumber: string;
  passwordHash: string; // In a real app, this would be a hash. Here it's stored as plain text for simplicity.
  role: 'student' | 'admin';
}

export interface Course {
  code: string;
  title: string;
  credits: number;
  instructor: string;
  syllabus: string[];
  prerequisites: string[];
  color: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  courseCode: string;
  courseTitle: string;
  location: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    image?: string; // Optional property to hold base64 image data
}

// FIX: Add Grade interface to be used by the GradesView component.
export interface Grade {
    courseCode: string;
    courseTitle: string;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}
