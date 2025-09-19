import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBX0ddGQP2NeeqvOK4LTPILVo0_ouIk0NQ",
  authDomain: "training-center-75be6.firebaseapp.com",
  projectId: "training-center-75be6",
  storageBucket: "training-center-75be6.firebasestorage.app",
  messagingSenderId: "135516192153",
  appId: "1:135516192153:web:aa7ec5ae0a817b93b4e708"
};
// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor service authentication agar bisa dipakai di komponen lain
export const auth = getAuth(app);