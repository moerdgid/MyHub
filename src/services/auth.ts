import { auth, db } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth'

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'

/* ---------------- REGISTER ---------------- */

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    defaultLocation: '',
    minecraftServer: '',
    minecraftEdition: 'java',
    createdAt: serverTimestamp(),
  })

  return user
}

/* ---------------- LOGIN ---------------- */

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.email,
      defaultLocation: '',
      minecraftServer: '',
      minecraftEdition: 'java',
      createdAt: serverTimestamp(),
    })
  }

  return user
}

/* ---------------- LOGOUT ---------------- */

export const logoutUser = async () => {
  await signOut(auth)
}

/* ---------------- PROFILE ---------------- */

export const getUserProfile = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  return userDoc.exists() ? userDoc.data() : null
}

/* ---------------- SETTINGS ---------------- */

export const updateUserLocation = async (uid: string, location: string) => {
  const userRef = doc(db, 'users', uid)

  await setDoc(
    userRef,
    { defaultLocation: location },
    { merge: true }
  )
}

export const updateUserMinecraftSettings = async (
  uid: string,
  minecraftServer: string,
  minecraftEdition: 'java' | 'bedrock'
) => {
  const userRef = doc(db, 'users', uid)

  await setDoc(
    userRef,
    {
      minecraftServer,
      minecraftEdition,
    },
    { merge: true }
  )
}

/* ---------------- PASSWORD ---------------- */

export const changePassword = async (newPassword: string) => {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')

  await updatePassword(user, newPassword)
}

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
}