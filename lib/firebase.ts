// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFSO_TBKcy2x2BIkhFt0sH1za_1-IcOHI",
  authDomain: "ambisius-5b956.firebaseapp.com",
  projectId: "ambisius-5b956",
  storageBucket: "ambisius-5b956.appspot.com",
  messagingSenderId: "763186091917",
  appId: "1:763186091917:web:486815431ad57025f14fc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
