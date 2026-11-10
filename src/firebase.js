import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paste YOUR config here: Firebase console > Project settings > Your apps > Web app (</>)
const firebaseConfig = {
  apiKey: 'PASTE_HERE',
  authDomain: 'PASTE_HERE',
  projectId: 'PASTE_HERE',
  storageBucket: 'PASTE_HERE',
  messagingSenderId: 'PASTE_HERE',
  appId: 'PASTE_HERE',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance;
try {
  // keeps the user logged in between app restarts
  authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  authInstance = getAuth(app); // already initialised (happens on fast refresh)
}

export const auth = authInstance;
export const db = getFirestore(app);
