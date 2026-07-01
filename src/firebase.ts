import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnhhg9CYG9TIWFIRNIXVFviXuTXqCGrGw",
  authDomain: "seraphic-chimera-c5jvd.firebaseapp.com",
  projectId: "seraphic-chimera-c5jvd",
  storageBucket: "seraphic-chimera-c5jvd.firebasestorage.app",
  messagingSenderId: "906956296418",
  appId: "1:906956296418:web:68ae650f5aac21c46ecebb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from the config
export const db = getFirestore(app, "ai-studio-torneiobeachtenn-bc16da6b-ff62-4d1e-900d-2e55169e4337");
