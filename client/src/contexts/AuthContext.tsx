import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveUserToFirestore = async (user: User) => {
    try {
      console.log('🔍 Attempting to save user to Firestore:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      // Check if user already exists to handle createdAt properly
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // New user - set both createdAt and updatedAt
        await setDoc(userRef, {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log('✅ New user created in Firestore:', user.uid);
      } else {
        // Existing user - only update updatedAt and other fields
        await updateDoc(userRef, {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Existing user updated in Firestore:', user.uid);
      }
    } catch (error) {
      console.error('❌ Error saving user to Firestore:', error);
    }
  };

  useEffect(() => {
    // Handle redirect result on page load
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          console.log('✅ User signed in via redirect:', result.user.email);
          saveUserToFirestore(result.user);
        }
      })
      .catch((error) => {
        console.error('❌ Error handling redirect result:', error);
        setError(error.message);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Only save authenticated users to Firestore
      if (user) {
        saveUserToFirestore(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      // Use redirect instead of popup to avoid Cross-Origin-Opener-Policy issues
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      console.error('Error signing in with Google:', authError);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      console.error('Error signing out:', authError);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};