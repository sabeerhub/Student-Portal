
import React, { useState } from 'react';
import { User } from '../types';
import { login, signup, saveCurrentUser } from '../services/authService';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'student' | 'admin'>('student');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // RegNum for student, Username for admin
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup State
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRegNum, setSignupRegNum] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const resetForms = () => {
    setError(null);
    setLoginIdentifier('');
    setLoginPassword('');
    setSignupFullName('');
    setSignupEmail('');
    setSignupRegNum('');
    setSignupPassword('');
    setSignupConfirmPassword('');
  };

  const handleModeChange = (mode: 'student' | 'admin') => {
    setAuthMode(mode);
    setIsLogin(true); // Always default to login screen on mode change
    resetForms();
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginIdentifier || !loginPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (authMode === 'admin') {
      if (loginIdentifier === 'Admin' && loginPassword === '@Admin100%') {
        const adminUser: User = {
          id: 'admin-user',
          fullName: 'Portal Administrator',
          email: 'admin@portal.edu',
          registrationNumber: 'ADMIN',
          passwordHash: '',
          role: 'admin',
        };
        saveCurrentUser(adminUser);
        onLogin(adminUser);
      } else {
        setError('Invalid admin username or password.');
      }
    } else {
      const result = login(loginIdentifier, loginPassword);
      if (result.success && result.user) {
        saveCurrentUser(result.user);
        onLogin(result.user);
      } else {
        setError(result.error || 'Login failed.');
      }
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupFullName || !signupEmail || !signupRegNum || !signupPassword || !signupConfirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    const regNumRegex = /^FCP\/CIT\/\d{2}\/\d{4}$/i;
    if (!regNumRegex.test(signupRegNum)) {
      setError('Invalid registration number format. Expected: FCP/CIT/YY/SSSS');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    const result = signup({
      fullName: signupFullName,
      email: signupEmail,
      registrationNumber: signupRegNum,
      passwordHash: signupPassword,
    });
    
    if (result.success && result.user) {
      saveCurrentUser(result.user);
      onLogin(result.user);
    } else {
      setError(result.error || 'Signup failed.');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-gray-400";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">
            Faculty of Computing
          </h1>
          <p className="text-text-secondary">IT Department Student Portal</p>
        </div>
        
        <div className="flex bg-card-light rounded-lg p-1">
          <button onClick={() => handleModeChange('student')} className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${authMode === 'student' ? 'bg-primary text-white' : 'text-gray-300'}`}>Student</button>
          <button onClick={() => handleModeChange('admin')} className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${authMode === 'admin' ? 'bg-primary text-white' : 'text-gray-300'}`}>Admin</button>
        </div>
        
        {authMode === 'student' && (
          <div className="flex border-b border-gray-600">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block mb-2 text-sm font-medium text-text-secondary">{authMode === 'student' ? 'Registration Number' : 'Username'}</label>
              <input id="identifier" type="text" placeholder={authMode === 'student' ? "FCP/CIT/XX/XXXX" : "Admin"} value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-text-secondary">Password</label>
              <input id="password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={inputClasses} />
            </div>
            <button type="submit" className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform transform hover:scale-105">
              Login
            </button>
          </form>
        ) : (
          authMode === 'student' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-text-secondary">Full Name</label>
                <input id="fullName" type="text" placeholder="John Doe" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-text-secondary">Email</label>
                <input id="email" type="email" placeholder="john.doe@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="signupRegNum" className="block mb-2 text-sm font-medium text-text-secondary">Registration Number</label>
                <input id="signupRegNum" type="text" placeholder="FCP/CIT/24/0001" value={signupRegNum} onChange={e => setSignupRegNum(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="signupPassword" className="block mb-2 text-sm font-medium text-text-secondary">Password</label>
                <input id="signupPassword" type="password" placeholder="••••••••" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-text-secondary">Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="••••••••" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} className={inputClasses} />
              </div>
              <button type="submit" className="w-full py-3 font-semibold text-white bg-secondary rounded-lg hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-transform transform hover:scale-105">
                Create Account
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
};

export default AuthPage;