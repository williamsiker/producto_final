import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCvITLz2_NRx_KoZGnL-0eMdJ8ZXydLLQM",
  authDomain: "biblioteca-personal-da281.firebaseapp.com",
  projectId: "biblioteca-personal-da281",
  storageBucket: "biblioteca-personal-da281.appspot.com",
  messagingSenderId: "779409660387",
  appId: "1:779409660387:web:428207b62338e2825fa8d6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); 

export { db, storage, auth }; 
