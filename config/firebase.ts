import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAuv0yagim5IiVdbA6thHu_fDcHug9MLU0",
  authDomain: "bsggtutorial-24bd5.firebaseapp.com",
  databaseURL:
    "https://bsggtutorial-24bd5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bsggtutorial-24bd5",
  storageBucket: "bsggtutorial-24bd5.firebasestorage.app",
  messagingSenderId: "308234361080",
  appId: "1:308234361080:web:77e2424f0cf0152a70c30d",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
