import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBjEmykJFcs6GFv_bEnpHMjBA_W1xXWZ_E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ucb-intramurals.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ucb-intramurals',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ucb-intramurals.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '829659808568',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:829659808568:web:5b88dfd842a056ebf937cd',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-222YCM3GFD',
};

const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

export const missingFirebaseConfig = requiredConfigKeys
  .filter((key) => !firebaseConfig[key]);

export const isFirebaseConfigured = missingFirebaseConfig.length === 0;

const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;
export const analytics = app && firebaseConfig.measurementId
  ? isSupported()
    .then((supported) => supported ? getAnalytics(app) : null)
    .catch((error) => {
      console.error('Firebase Analytics could not be initialized', error);
      return null;
    })
  : Promise.resolve(null);
