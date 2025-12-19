import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbvlNh0zpmV28Rm-6_eHDVZn1z1b6AYJk",
  authDomain: "aahaas-bb222.firebaseapp.com",
  databaseURL: "https://aahaas-bb222.firebaseio.com",
  projectId: "aahaas-bb222",
  storageBucket: "aahaas-bb222.appspot.com",
  messagingSenderId: "410570906249",
  appId: "1:410570906249:web:7011de846e1545b41fc458",
  measurementId: "G-NBE9YJNDGZ"
};

const appFirebase = initializeApp(firebaseConfig)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// auth.settings.appVerificationDisabledForTesting = false;
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const authentication = getAuth(appFirebase);

export { auth, db, authentication };