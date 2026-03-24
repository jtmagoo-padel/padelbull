import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBEHahWPHKHWGISjEbdclwegiK9pZJ2-YM",
  authDomain: "padelbull-live.firebaseapp.com",
  databaseURL: "https://padelbull-live-default-rtdb.firebaseio.com",
  projectId: "padelbull-live",
  storageBucket: "padelbull-live.firebasestorage.app",
  messagingSenderId: "933982331345",
  appId: "1:933982331345:web:aba5a40e8bf6ec5e8e00f0"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);