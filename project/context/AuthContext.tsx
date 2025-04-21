import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, firestore } from '@/utils/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  userData: UserData | null;
}

export interface UserData {
  username: string;
  level: number;
  xp: number;
  streakDays: number;
  lastLoginDate: string;
  badges: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Get user data from Firestore
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            console.log('No user data found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update streak on login
  useEffect(() => {
    const updateStreakOnLogin = async () => {
      if (user && userData) {
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = userData.lastLoginDate;
        
        // Only update if it's a new day
        if (today !== lastLogin) {
          try {
            const userDocRef = doc(firestore, 'users', user.uid);
            
            // If last login was yesterday, increment streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            
            let newStreakDays = userData.streakDays;
            if (lastLogin === yesterdayString) {
              newStreakDays += 1;
            } else if (lastLogin !== today) {
              // Reset streak if not consecutive
              newStreakDays = 1;
            }
            
            // Update user data
            const updatedData = {
              ...userData,
              lastLoginDate: today,
              streakDays: newStreakDays
            };
            
            await setDoc(userDocRef, updatedData, { merge: true });
            setUserData(updatedData);
          } catch (error) {
            console.error('Error updating streak:', error);
          }
        }
      }
    };
    
    updateStreakOnLogin();
  }, [user, userData]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Create user profile in Firestore
      const today = new Date().toISOString().split('T')[0];
      const userDocRef = doc(firestore, 'users', newUser.uid);
      const userData: UserData = {
        username,
        level: 1,
        xp: 0,
        streakDays: 1,
        lastLoginDate: today,
        badges: ['newbie']  // Default badge for new users
      };
      
      await setDoc(userDocRef, userData);
      setUserData(userData);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    userData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};