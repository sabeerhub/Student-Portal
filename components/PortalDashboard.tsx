import React, { useState } from 'react';
import { User } from '../types';
import ProfileCard from './dashboard/ProfileCard';
import CourseList from './dashboard/CourseList';
import Announcements from './dashboard/Announcements';
import Timetable from './dashboard/Timetable';
import StudyBuddy from './dashboard/StudyBuddy';
import LiveConversation from './dashboard/LiveConversation';
import ConfirmationDialog from './ConfirmationDialog';

interface PortalDashboardProps {
  user: User;
  onLogout: () => void;
}

const LiveTutorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
    </svg>
)

const PortalDashboard: React.FC<PortalDashboardProps> = ({ user, onLogout }) => {
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background to-gray-900">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-text-secondary text-lg">Welcome back, {user.fullName.split(' ')[0]}!</p>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={() => setIsLiveChatOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-secondary rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all"
            >
                <LiveTutorIcon />
                <span>Live AI Tutor</span>
            </button>
            <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-card rounded-lg hover:bg-card-light hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all"
            >
                <span>Logout</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <CourseList />
          <Timetable />
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileCard user={user} />
          <Announcements />
          <StudyBuddy />
        </div>
      </main>

      {isLiveChatOpen && <LiveConversation onClose={() => setIsLiveChatOpen(false)} />}

      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={onLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the portal?"
        confirmButtonText="Logout"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
};

export default PortalDashboard;
