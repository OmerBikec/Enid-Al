import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARSI8x3a6XRuu2qzft7_RUsMjY_qiC9ek",
  authDomain: "enid-al.firebaseapp.com",
  projectId: "enid-al",
  storageBucket: "enid-al.firebasestorage.app",
  messagingSenderId: "881172916214",
  appId: "1:881172916214:web:ea385cc21e48a68b1389d7",
  measurementId: "G-E7260XSW1P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);