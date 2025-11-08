
import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import PortalDashboard from './components/PortalDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User } from './types';
import { initializeData } from './services/dataService';
import { getCurrentUser, logout as authLogout } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      initializeData(); 
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Failed to check auth status", error);
      authLogout(); // Ensure logout on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!currentUser) return <AuthPage onLogin={handleLogin} />;

    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case 'student':
      default:
        return <PortalDashboard user={currentUser} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      {renderDashboard()}
    </div>
  );
};

export default App;