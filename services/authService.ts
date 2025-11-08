import { User } from '../types';

const USERS_KEY = 'portal_users';
const CURRENT_USER_KEY = 'portal_currentUser';

// Initialize with an empty array if not present. This ensures the key exists before any operation.
const initializeUsers = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
};

// Call initialization immediately on module load to guarantee the users list exists.
initializeUsers();

const getUsers = (): User[] => {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (e) {
        // In case of corrupted data, return an empty array to prevent crashes.
        return [];
    }
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signup = (newUserData: Omit<User, 'id' | 'role'>): { success: boolean; user?: User; error?: string } => {
    const users = getUsers();
    
    if (users.some(u => u.registrationNumber.toUpperCase() === newUserData.registrationNumber.toUpperCase())) {
        return { success: false, error: 'An account with this registration number already exists.' };
    }
    if (users.some(u => u.email === newUserData.email)) {
        return { success: false, error: 'An account with this email already exists.' };
    }

    const userToSave: User = {
        ...newUserData,
        registrationNumber: newUserData.registrationNumber.toUpperCase(),
        id: self.crypto.randomUUID(),
        role: 'student'
    };
    
    users.push(userToSave);
    saveUsers(users);
    
    return { success: true, user: userToSave };
};

export const login = (registrationNumber: string, passwordHash: string): { success: boolean; user?: User; error?: string } => {
    const users = getUsers();
    const foundUser = users.find(u => u.registrationNumber.toUpperCase() === registrationNumber.toUpperCase() && u.passwordHash === passwordHash);

    if (foundUser) {
        return { success: true, user: foundUser };
    }
    return { success: false, error: 'Invalid registration number or password.' };
};

export const saveCurrentUser = (user: User) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
        try {
            return JSON.parse(storedUser);
        } catch (e) {
            // If parsing fails, remove the corrupted item
            localStorage.removeItem(CURRENT_USER_KEY);
            return null;
        }
    }
    return null;
};

export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};
