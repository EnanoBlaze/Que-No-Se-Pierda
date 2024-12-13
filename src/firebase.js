import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDgauSj1GMdDNQmNOS-MUFh28Ch24lzX58",
  authDomain: "que-no-se-pierda-959a3.firebaseapp.com",
  projectId: "que-no-se-pierda-959a3",
  storageBucket: "que-no-se-pierda-959a3.appspot.com",
  messagingSenderId: "935764194668",
  appId: "1:935764194668:web:3a52304649b1531ea52f49",
  measurementId: "G-8D0DD43MD8"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporta las instancias
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
