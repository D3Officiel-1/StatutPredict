// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3AP0lZpB9yLBtEyJynDNU2kX25y5sc_8",
  authDomain: "predict-ci.firebaseapp.com",
  projectId: "predict-ci",
  storageBucket: "predict-ci.appspot.com",
  messagingSenderId: "1052292566909",
  appId: "1:1052292566909:web:d0121f760c367c9f144614",
  measurementId: "G-JQ9LTL47TK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}


export { app, analytics };
