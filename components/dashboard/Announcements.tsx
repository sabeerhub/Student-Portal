import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { getAnnouncements } from '../../services/dataService';

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    setAnnouncements(getAnnouncements());
  }, []);

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center text-text-primary">
        <BellIcon />
        <span className="ml-3">Announcements</span>
      </h3>
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-card-light p-4 rounded-lg transform transition-transform hover:scale-[1.02]">
             <div className="flex justify-between items-start">
              <p className="font-semibold text-text-primary text-md">{ann.title}</p>
              <span className="text-xs text-text-muted font-mono flex-shrink-0 ml-2">{ann.date}</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">{ann.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-text-muted text-center py-4">No new announcements.</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;