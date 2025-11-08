import React from 'react';
import { User } from '../../types';

interface ProfileCardProps {
  user: User;
}

const IdCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4m-9 5h2m-2 4h4" />
    </svg>
);
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-secondary/20 rounded-full opacity-50"></div>
        <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
                <img
                src={`https://i.pravatar.cc/150?u=${user.id}`}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-secondary mb-4 shadow-md"
                />
                <h2 className="text-xl font-bold text-text-primary">{user.fullName}</h2>
                <p className="text-sm text-text-secondary">Information Technology Student</p>
            </div>
            <div className="mt-6 border-t border-card-light pt-4 space-y-4">
                <div className="flex items-center text-text-secondary">
                    <IdCardIcon />
                    <span className="ml-3 font-mono text-sm">{user.registrationNumber}</span>
                </div>
                <div className="flex items-center text-text-secondary">
                    <MailIcon />
                    <span className="ml-3 text-sm">{user.email}</span>
                </div>
            </div>
      </div>
    </div>
  );
};

export default ProfileCard;