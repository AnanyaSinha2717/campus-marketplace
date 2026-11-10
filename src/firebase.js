import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBUvNb5ag9Bs2nZdP5JOzAB0YCYSKDgHNE',
  authDomain: 'campus-marketplace-22060.firebaseapp.com',
  projectId: 'campus-marketplace-22060',
  storageBucket: 'campus-marketplace-22060.firebasestorage.app',
  messagingSenderId: '1072571519042',
  appId: '1:1072571519042:web:cea7eef9301f53c50f9ddb',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance;
try {
  // keeps the user logged in between app restarts
  authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
