import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWAJonl-dj6YpMo6f8eXhWL_GTy1OxfEY",
  authDomain: "eshop-2156a.firebaseapp.com",
  projectId: "eshop-2156a",
  storageBucket: "eshop-2156a.appspot.com",
  messagingSenderId: "262054322108",
  appId: "1:262054322108:web:cf360fa03370a52a94d5b9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
