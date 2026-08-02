import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyAG-FLs94I1LRNQ0Gwnyey-Dwjia8NVdn0',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'nitroxxin-web.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'nitroxxin-web',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'nitroxxin-web.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '640362602132',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:640362602132:web:6e6cd1fd13ba1d21545e81'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
