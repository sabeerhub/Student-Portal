import { Course, Announcement, TimetableEntry, Grade } from './types';

export const MOCK_COURSES: Course[] = [
  { 
    code: 'CIT401', 
    title: 'Advanced Web Development', 
    credits: 3, 
    instructor: 'Dr. Ada Lovelace',
    syllabus: ['Modern JavaScript Frameworks (React)', 'Server-Side Rendering', 'GraphQL APIs', 'Web Performance Optimization', 'Web Security Best Practices'],
    prerequisites: ['CIT301 - Intro to Web Dev', 'CIT302 - Database Systems'],
    color: 'primary'
  },
  { 
    code: 'CIT402', 
    title: 'Artificial Intelligence', 
    credits: 3, 
    instructor: 'Prof. Alan Turing',
    syllabus: ['Introduction to AI', 'Search Algorithms', 'Machine Learning Fundamentals', 'Neural Networks', 'Natural Language Processing'],
    prerequisites: ['Data Structures & Algorithms'],
    color: 'secondary'
  },
  { 
    code: 'CIT403', 
    title: 'Network Security', 
    credits: 3, 
    instructor: 'Dr. Grace Hopper',
    syllabus: ['Cryptography Principles', 'Network Attack Vectors', 'Firewalls and VPNs', 'Intrusion Detection Systems', 'Ethical Hacking'],
    prerequisites: ['CIT303 - Computer Networks'],
    color: 'accent'
  },
  { 
    code: 'CIT404', 
    title: 'Cloud Computing', 
    credits: 3, 
    instructor: 'Prof. John McCarthy',
    syllabus: ['Cloud Service Models (IaaS, PaaS, SaaS)', 'Virtualization Technologies', 'Cloud Storage Solutions', 'Deploying to AWS/GCP/Azure', 'Serverless Architecture'],
    prerequisites: ['Operating Systems', 'Computer Networks'],
    color: 'accent-yellow'
  },
  { 
    code: 'CIT405', 
    title: 'Project Management', 
    credits: 2, 
    instructor: 'Mr. Tim Berners-Lee',
    syllabus: ['Agile vs. Waterfall Methodologies', 'Scrum Framework', 'Risk Management', 'Software Development Life Cycle', 'Team Collaboration Tools'],
    prerequisites: [],
    color: 'accent-cyan'
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Final Year Project Defense Schedule', content: 'The schedule for the final year project defense has been released. Please check the department notice board.', date: '2024-07-20' },
  { id: '2', title: 'Guest Lecture on Quantum Computing', content: 'A guest lecture on the future of Quantum Computing will be held on July 25th in the main auditorium.', date: '2024-07-18' },
  { id: '3', title: 'Semester Registration Deadline', content: 'The deadline for course registration for the next semester is July 30th. No extensions will be granted.', date: '2024-07-15' },
];

// FIX: Added 'id' property to each TimetableEntry to match the type definition.
export const MOCK_TIMETABLE: TimetableEntry[] = [
    { id: 'tt1', day: 'Monday', time: '09:00 - 11:00', courseCode: 'CIT401', courseTitle: 'Advanced Web Dev', location: 'Lab 3' },
    { id: 'tt2', day: 'Monday', time: '13:00 - 15:00', courseCode: 'CIT402', courseTitle: 'Artificial Intelligence', location: 'Hall A' },
    { id: 'tt3', day: 'Tuesday', time: '10:00 - 12:00', courseCode: 'CIT403', courseTitle: 'Network Security', location: 'Lab 1' },
    { id: 'tt4', day: 'Wednesday', time: '09:00 - 11:00', courseCode: 'CIT401', courseTitle: 'Advanced Web Dev', location: 'Lab 3' },
    { id: 'tt5', day: 'Wednesday', time: '14:00 - 15:00', courseCode: 'CIT405', courseTitle: 'Project Management', location: 'Hall B' },
    { id: 'tt6', day: 'Thursday', time: '11:00 - 13:00', courseCode: 'CIT402', courseTitle: 'Artificial Intelligence', location: 'Hall A' },
    { id: 'tt7', day: 'Friday', time: '13:00 - 15:00', courseCode: 'CIT404', courseTitle: 'Cloud Computing', location: 'Hall C' },
];

// FIX: Add MOCK_GRADES to fix import error in GradesView.tsx
export const MOCK_GRADES: { [semester: string]: Grade[] } = {
    'Spring 2024': [
        { courseCode: 'CIT401', courseTitle: 'Advanced Web Development', grade: 'A' },
        { courseCode: 'CIT402', courseTitle: 'Artificial Intelligence', grade: 'B' },
        { courseCode: 'CIT403', courseTitle: 'Network Security', grade: 'B' },
        { courseCode: 'CIT404', courseTitle: 'Cloud Computing', grade: 'A' },
        { courseCode: 'CIT405', courseTitle: 'Project Management', grade: 'C' },
    ],
    'Fall 2023': [
        { courseCode: 'CIT301', courseTitle: 'Intro to Web Dev', grade: 'A' },
        { courseCode: 'CIT302', courseTitle: 'Database Systems', grade: 'A' },
        { courseCode: 'CIT303', courseTitle: 'Computer Networks', grade: 'B' },
        { courseCode: 'GEN300', courseTitle: 'General Studies', grade: 'C' },
    ],
};
