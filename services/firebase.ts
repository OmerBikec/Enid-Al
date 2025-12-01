import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARSI8x3a6XRuu2qzft7_RUsMjY_qiC9ek",
  authDomain: "enid-al.firebaseapp.com",
  projectId: "enid-al",
  storageBucket: "enid-al.firebasestorage.app",
  messagingSenderId: "881172916214",
  appId: "1:881172916214:web:ea385cc21e48a68b1389d7",
  measurementId: "G-E7260XSW1P"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();