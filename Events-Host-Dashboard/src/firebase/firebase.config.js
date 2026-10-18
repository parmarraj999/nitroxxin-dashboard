import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAG-FLs94I1LRNQ0Gwnyey-Dwjia8NVdn0",
  authDomain: "nitroxxin-web.firebaseapp.com",
  projectId: "nitroxxin-web",
  storageBucket: "nitroxxin-web.firebasestorage.app",
  messagingSenderId: "640362602132",
  appId: "1:640362602132:web:6e6cd1fd13ba1d21545e81"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);

export default app;
