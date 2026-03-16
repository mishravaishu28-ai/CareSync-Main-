// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7kMrHF7AXCqxP4b6e3_PNZs-TAy7966I",
  authDomain: "caresync-ea38a.firebaseapp.com",
  projectId: "caresync-ea38a",
  storageBucket: "caresync-ea38a.firebasestorage.app",
  messagingSenderId: "289270613259",
  appId: "1:289270613259:web:91e471863e4b9e76adce0e",
  measurementId: "G-NV05RET9JZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);