import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { getCourses } from '../../services/dataService';
import CourseDetailModal from './CourseDetailModal';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  const getCourseColorStyles = (color: string) => {
    switch(color) {
        case 'primary': return { ring: 'ring-primary', tag: 'bg-primary/20 text-primary' };
        case 'secondary': return { ring: 'ring-secondary', tag: 'bg-secondary/20 text-secondary' };
        case 'accent': return { ring: 'ring-accent', tag: 'bg-accent/20 text-accent' };
        case 'accent-yellow': return { ring: 'ring-accent-yellow', tag: 'bg-accent-yellow/20 text-accent-yellow' };
        case 'accent-cyan': return { ring: 'ring-accent-cyan', tag: 'bg-accent-cyan/20 text-accent-cyan' };
        default: return { ring: 'ring-gray-500', tag: 'bg-gray-500/20 text-gray-300' };
    }
}

  return (
    <>
      <div className="bg-card rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">My Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const styles = getCourseColorStyles(course.color);
            return (
                <button 
                key={course.code} 
                onClick={() => handleCourseClick(course)}
                className={`w-full bg-card-light p-4 rounded-lg text-left transition-all transform hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card ${styles.ring}`}
                aria-label={`View details for ${course.title}`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase ${styles.tag} px-2 py-1 rounded`}>{course.code}</span>
                        <span className="text-sm font-semibold text-text-secondary">{course.credits} Credits</span>
                    </div>
                    <h4 className="font-bold text-lg text-text-primary mt-2">{course.title}</h4>
                    <p className="text-sm text-text-muted mt-1">{course.instructor}</p>
                </button>
            )
          })}
        </div>
      </div>

      {selectedCourse && (
        <CourseDetailModal course={selectedCourse} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default CourseList;