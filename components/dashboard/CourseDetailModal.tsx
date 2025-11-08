import React from 'react';
import { Course } from '../../types';

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose }) => {
  // Effect to handle Escape key press for closing the modal
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-card rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-primary">{course.title}</h2>
                <p className="text-sm text-text-secondary font-mono">{course.code} - {course.credits} Credits</p>
                <p className="text-md text-text-secondary mt-1">Instructor: {course.instructor}</p>
            </div>
            <button 
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:bg-card-light hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close course details"
            >
                <CloseIcon />
            </button>
        </div>
        
        <div>
            <h3 className="text-lg font-semibold text-text-primary border-b border-gray-600 pb-2 mb-3">Syllabus Overview</h3>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {course.syllabus.map((topic, index) => (
                    <li key={index}>{topic}</li>
                ))}
            </ul>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-text-primary border-b border-gray-600 pb-2 mb-3">Prerequisites</h3>
            {course.prerequisites.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                    {course.prerequisites.map((req, index) => (
                        <li key={index}>{req}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-text-secondary">None</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
