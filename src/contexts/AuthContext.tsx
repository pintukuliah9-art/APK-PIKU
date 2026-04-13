import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'super_admin' | 'admin' | 'finance_admin' | 'hr_admin' | 'marketing_admin' | 'academic_admin' | 'guest';

interface UserData {
  role: UserRole;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: UserRole = 'guest';
          const email = firebaseUser.email || '';
          
          // Auto-assign roles based on email for default accounts
          if (email === 'kampus2stitbu@gmail.com') role = 'super_admin';
          else if (email === 'admin@timpiku.com') role = 'admin';
          else if (email === 'marketing@timpiku.com') role = 'marketing_admin';
          else if (email === 'sdm@timpiku.com') role = 'hr_admin';
          else if (email === 'keuangan@timpiku.com') role = 'finance_admin';
          else if (email === 'akademik@timpiku.com') role = 'academic_admin';
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            // If it's a default account but role is wrong (e.g. guest), update it
            if (role !== 'guest' && data.role !== role) {
              const updatedData = { ...data, role };
              await setDoc(userDocRef, updatedData, { merge: true });
              setUserData(updatedData);
            } else {
              setUserData(data);
            }
          } else {
            // Create new user document
            const newUserData: UserData = {
              role,
              email: email,
              name: firebaseUser.displayName || email.split('@')[0] || '',
            };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
