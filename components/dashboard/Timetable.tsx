import React, { useState, useEffect } from 'react';
import { TimetableEntry } from '../../types';
import { getTimetable, getCourses } from '../../services/dataService';

// Icons
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


const Timetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [courseColorMap, setCourseColorMap] = useState<{ [key: string]: string }>({});
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getToday = () => {
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    return days.includes(today) ? today : 'Monday';
  };
  
  const [selectedDay, setSelectedDay] = useState(getToday());

  useEffect(() => {
    setTimetable(getTimetable());
    const courses = getCourses();
    const colorMap = courses.reduce((acc, course) => {
      acc[course.code] = course.color;
      return acc;
    }, {} as { [key: string]: string });
    setCourseColorMap(colorMap);
  }, []);

  const getCourseColorClass = (courseCode: string) => {
    const color = courseColorMap[courseCode] || 'gray';
    switch (color) {
      case 'primary': return { border: 'border-primary', bg: 'bg-primary', text: 'text-primary' };
      case 'secondary': return { border: 'border-secondary', bg: 'bg-secondary', text: 'text-secondary' };
      case 'accent': return { border: 'border-accent', bg: 'bg-accent', text: 'text-accent' };
      case 'accent-yellow': return { border: 'border-accent-yellow', bg: 'bg-accent-yellow', text: 'text-accent-yellow' };
      case 'accent-cyan': return { border: 'border-accent-cyan', bg: 'bg-accent-cyan', text: 'text-accent-cyan' };
      default: return { border: 'border-gray-500', bg: 'bg-gray-500', text: 'text-gray-300' };
    }
  }
  
  const dailyEntries = timetable
    .filter(entry => entry.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-text-primary">Weekly Timetable</h3>
      
      {/* Day Selector Tabs */}
      <div className="flex border-b border-card-light mb-6">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 sm:flex-none sm:px-4 py-3 text-sm font-bold transition-colors duration-200 focus:outline-none ${selectedDay === day ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      <div className="relative pl-4">
        {/* The vertical line for the timeline */}
        {dailyEntries.length > 0 && <div className="absolute left-4 top-2 h-full w-0.5 bg-card-light/50"></div>}

        {dailyEntries.length > 0 ? (
          dailyEntries.map((entry) => {
            const colors = getCourseColorClass(entry.courseCode);
            return (
              <div key={entry.id} className="relative pl-8 pb-8">
                {/* Timeline Dot */}
                <div className={`absolute left-4 top-1 -ml-[7px] w-4 h-4 rounded-full ${colors.bg}`}></div>
                
                <div className={`p-4 rounded-lg bg-card-light border-l-4 ${colors.border} transition-transform transform hover:scale-[1.02] hover:shadow-lg`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-bold text-lg ${colors.text}`}>{entry.courseTitle}</p>
                      <p className="font-mono text-sm text-text-muted">{entry.courseCode}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 text-sm text-text-secondary">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <ClockIcon />
                      <span>{entry.time}</span>
                    </div>
                    <div className="flex items-center">
                      <LocationIcon />
                      <span>{entry.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-text-secondary">No classes scheduled for {selectedDay}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;