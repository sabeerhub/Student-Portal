
import React, { useState, FormEvent } from 'react';
import { User, Course, TimetableEntry, Announcement } from '../types';
import { 
  addAnnouncement, updateAnnouncement,
  addCourse, updateCourse,
  addTimetableEntry, updateTimetableEntry,
  getAnnouncements, getCourses, getTimetable 
} from '../services/dataService';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const inputClasses = "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-text-primary placeholder-gray-400";
const buttonClasses = "w-full py-2 font-semibold text-white bg-secondary rounded-lg hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-secondary transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:transform-none";

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => getAnnouncements());
    const [courses, setCourses] = useState<Course[]>(() => getCourses());
    const [timetable, setTimetable] = useState<TimetableEntry[]>(() => getTimetable());
  
    // Editing States
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editingTimetable, setEditingTimetable] = useState<TimetableEntry | null>(null);

    // Form States
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');

    const [courseCode, setCourseCode] = useState('');
    const [courseTitle, setCourseTitle] = useState('');
    const [courseCredits, setCourseCredits] = useState('');
    const [courseInstructor, setCourseInstructor] = useState('');

    const [ttDay, setTtDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
    const [ttTime, setTtTime] = useState('');
    const [ttCourseCode, setTtCourseCode] = useState('');
    const [ttCourseTitle, setTtCourseTitle] = useState('');
    const [ttLocation, setTtLocation] = useState('');

    const resetAllForms = () => {
      setAnnTitle(''); setAnnContent('');
      setCourseCode(''); setCourseTitle(''); setCourseCredits(''); setCourseInstructor('');
      setTtDay('Monday'); setTtTime(''); setTtCourseCode(''); setTtCourseTitle(''); setTtLocation('');
    }

    const handleCancelEdit = () => {
      setEditingAnnouncement(null);
      setEditingCourse(null);
      setEditingTimetable(null);
      resetAllForms();
    }
  
    const handleAnnouncementSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!annTitle || !annContent) return;
      if (editingAnnouncement) {
        updateAnnouncement({ ...editingAnnouncement, title: annTitle, content: annContent });
      } else {
        addAnnouncement({ title: annTitle, content: annContent });
      }
      setAnnouncements(getAnnouncements());
      handleCancelEdit();
    };

    const handleEditAnnouncement = (ann: Announcement) => {
      handleCancelEdit();
      setEditingAnnouncement(ann);
      setAnnTitle(ann.title);
      setAnnContent(ann.content);
    }

    const handleCourseSubmit = (e: FormEvent) => {
        e.preventDefault();
        const creditsNum = Number(courseCredits);
        if (!courseCode || !courseTitle || !creditsNum || !courseInstructor) return;

        const availableColors = ['primary', 'secondary', 'accent', 'accent-yellow', 'accent-cyan'];
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];

        // FIX: Add missing 'color' property to satisfy the Course type.
        // A random color is assigned to new courses, while existing courses retain their color.
        const courseData: Course = { 
            code: courseCode, 
            title: courseTitle, 
            credits: creditsNum, 
            instructor: courseInstructor, 
            syllabus: editingCourse?.syllabus || [], 
            prerequisites: editingCourse?.prerequisites || [],
            color: editingCourse?.color || randomColor
        };
        
        if (editingCourse) {
          updateCourse(courseData);
        } else {
          addCourse(courseData);
        }
        setCourses(getCourses());
        handleCancelEdit();
    };

    const handleEditCourse = (course: Course) => {
      handleCancelEdit();
      setEditingCourse(course);
      setCourseCode(course.code);
      setCourseTitle(course.title);
      setCourseCredits(String(course.credits));
      setCourseInstructor(course.instructor);
    }

    const handleTimetableSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!ttDay || !ttTime || !ttCourseCode || !ttCourseTitle || !ttLocation) return;
        const entryData = { day: ttDay, time: ttTime, courseCode: ttCourseCode, courseTitle: ttCourseTitle, location: ttLocation };
        
        if (editingTimetable) {
          updateTimetableEntry({ ...entryData, id: editingTimetable.id });
        } else {
          addTimetableEntry(entryData);
        }
        setTimetable(getTimetable());
        handleCancelEdit();
    };
    
    const handleEditTimetable = (entry: TimetableEntry) => {
      handleCancelEdit();
      setEditingTimetable(entry);
      setTtDay(entry.day);
      setTtTime(entry.time);
      setTtCourseCode(entry.courseCode);
      setTtCourseTitle(entry.courseTitle);
      setTtLocation(entry.location);
    }

    const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary">Welcome, {user.fullName}!</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-red-500 transition-all"
        >
          Logout
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Announcement Form */}
        <div className="bg-card rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-text-primary border-b border-gray-600 pb-2">{editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}</h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={annTitle} onChange={e => setAnnTitle(e.target.value)} className={inputClasses} />
                <textarea placeholder="Content" value={annContent} onChange={e => setAnnContent(e.target.value)} className={`${inputClasses} h-24`}></textarea>
                <div className="flex items-center gap-2">
                  <button type="submit" className={buttonClasses}>{editingAnnouncement ? 'Update' : 'Post'}</button>
                  {editingAnnouncement && <button type="button" onClick={handleCancelEdit} className="w-full py-2 bg-gray-600 rounded-lg">Cancel</button>}
                </div>
            </form>
        </div>

        {/* Course Form */}
        <div className="bg-card rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-text-primary border-b border-gray-600 pb-2">{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
                <input type="text" placeholder="Course Code (e.g., CIT501)" value={courseCode} onChange={e => setCourseCode(e.target.value)} className={`${inputClasses} ${editingCourse ? 'bg-gray-800 cursor-not-allowed' : ''}`} readOnly={!!editingCourse}/>
                <input type="text" placeholder="Course Title" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className={inputClasses} />
                <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className={inputClasses} />
                <input type="text" placeholder="Instructor" value={courseInstructor} onChange={e => setCourseInstructor(e.target.value)} className={inputClasses} />
                <div className="flex items-center gap-2">
                  <button type="submit" className={buttonClasses}>{editingCourse ? 'Update' : 'Add Course'}</button>
                  {editingCourse && <button type="button" onClick={handleCancelEdit} className="w-full py-2 bg-gray-600 rounded-lg">Cancel</button>}
                </div>
            </form>
        </div>

        {/* Timetable Form */}
        <div className="bg-card rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-text-primary border-b border-gray-600 pb-2">{editingTimetable ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</h3>
            <form onSubmit={handleTimetableSubmit} className="space-y-4">
                <select value={ttDay} onChange={e => setTtDay(e.target.value as any)} className={inputClasses}>
                    <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option>
                </select>
                <input type="text" placeholder="Time (e.g., 10:00 - 12:00)" value={ttTime} onChange={e => setTtTime(e.target.value)} className={inputClasses} />
                <input type="text" placeholder="Course Code" value={ttCourseCode} onChange={e => setTtCourseCode(e.target.value)} className={inputClasses} />
                <input type="text" placeholder="Course Title" value={ttCourseTitle} onChange={e => setTtCourseTitle(e.target.value)} className={inputClasses} />
                <input type="text" placeholder="Location" value={ttLocation} onChange={e => setTtLocation(e.target.value)} className={inputClasses} />
                <div className="flex items-center gap-2">
                  <button type="submit" className={buttonClasses}>{editingTimetable ? 'Update' : 'Add to Timetable'}</button>
                  {editingTimetable && <button type="button" onClick={handleCancelEdit} className="w-full py-2 bg-gray-600 rounded-lg">Cancel</button>}
                </div>
            </form>
        </div>

        {/* Data Management Lists */}
        <div className="bg-card rounded-2xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
             <h3 className="text-xl font-bold text-text-primary border-b border-gray-600 pb-2 mb-4">Manage Data</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[40rem] overflow-y-auto p-2">
                <div>
                    <h4 className="font-semibold mb-2 text-secondary">Announcements ({announcements.length})</h4>
                    <ul className="text-sm space-y-2">{announcements.map(a => <li key={a.id} className="flex justify-between items-center p-2 rounded-md hover:bg-card-light"><span className="truncate pr-2" title={a.title}>{a.title}</span><button onClick={() => handleEditAnnouncement(a)} className="p-1.5 bg-primary/50 text-white rounded-md hover:bg-primary"><EditIcon /></button></li>)}</ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-secondary">Courses ({courses.length})</h4>
                    <ul className="text-sm space-y-2">{courses.map(c => <li key={c.code} className="flex justify-between items-center p-2 rounded-md hover:bg-card-light"><span className="truncate pr-2" title={c.title}>{c.code} - {c.title}</span><button onClick={() => handleEditCourse(c)} className="p-1.5 bg-primary/50 text-white rounded-md hover:bg-primary"><EditIcon /></button></li>)}</ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-secondary">Timetable Entries ({timetable.length})</h4>
                    <ul className="text-sm space-y-2">{timetable.map((t) => <li key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-card-light"><span className="truncate pr-2" title={`${t.courseTitle} at ${t.time}`}>{t.day.substring(0,3)} - {t.courseCode}</span><button onClick={() => handleEditTimetable(t)} className="p-1.5 bg-primary/50 text-white rounded-md hover:bg-primary"><EditIcon /></button></li>)}</ul>
                </div>
             </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
