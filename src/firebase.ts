import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBmOfgFnALr69pNXXS7qaE0ZcDtomuATKE",
  authDomain: "myhub-vibetek.firebaseapp.com",
  projectId: "myhub-vibetek",
  storageBucket: "myhub-vibetek.firebasestorage.app",
  messagingSenderId: "285092069635",
  appId: "1:285092069635:web:394b1f1638b636fc09a936"
};

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }