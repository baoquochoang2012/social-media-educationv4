import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzywMkDqimqso7bmYXc2BVegx01yjz74A",
  authDomain: "mediasocial-education2.firebaseapp.com",
  projectId: "mediasocial-education2",
  storageBucket: "mediasocial-education2.appspot.com",
  messagingSenderId: "364774338841",
  appId: "1:364774338841:web:643630a65e46d307c35588",
  measurementId: "G-3Y1XDYX908"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { auth, db, storage, onAuthStateChanged };
