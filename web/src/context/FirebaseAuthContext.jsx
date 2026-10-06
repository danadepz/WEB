import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from '../modules/firebase';

const FirebaseAuthContext = createContext(null);

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!firebaseAuth) return undefined;

    return onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase authentication state failed', error);
        setUser(null);
        setLoading(false);
      }
    );
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isFirebaseConfigured,
    signIn: (email, password) => {
      if (!firebaseAuth) {
        throw new Error('Firebase is not configured. Add the Firebase web app values to .env.local.');
      }
      return signInWithEmailAndPassword(firebaseAuth, email, password);
    },
    signOut: () => {
      if (!firebaseAuth) {
        throw new Error('Firebase is not configured.');
      }
      return signOut(firebaseAuth);
    },
  }), [user, loading]);

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
