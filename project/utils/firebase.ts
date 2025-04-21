import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLdGp2tR2rFjGoi-9uBO_iwjEXLuCZ-d0",
  authDomain: "zennify-6ff53.firebaseapp.com",
  projectId: "zennify-6ff53",
  storageBucket: "zennify-6ff53.firebasestorage.app",
  messagingSenderId: "22261808224",
  appId: "1:22261808224:web:d514339384625607845705",
  measurementId: "G-TF9REG8988"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };