// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Constants } from "expo-constants";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3rmGpEP9EvXhwYI6D3oz1peEaVEjcqbQ",
  authDomain: "native-chat-app-6abf9.firebaseapp.com",
  projectId: "native-chat-app-6abf9",
  storageBucket: "native-chat-app-6abf9.appspot.com",
  messagingSenderId: "483586509108",
  appId: "1:483586509108:web:2e179a8ec371cdc0e2bd61"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();