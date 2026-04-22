import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

export const createDashboard = async (userId: string, name: string) => {
  const docRef = await addDoc(collection(db, 'dashboards'), {
    userId,
    name,
    widgets: {
      weather: true,
      calendar: true,
      announcements: true,
      minecraft: false,
    },
    layout: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export const getUserDashboards = async (userId: string) => {
  const q = query(collection(db, 'dashboards'), where('userId', '==', userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
}

export const getDashboardById = async (dashboardId: string) => {
  const dashboardRef = doc(db, 'dashboards', dashboardId)
  const dashboardSnap = await getDoc(dashboardRef)

  if (!dashboardSnap.exists()) {
    return null
  }

  return {
    id: dashboardSnap.id,
    ...dashboardSnap.data(),
  }
}

export const updateDashboardWidgets = async (
  dashboardId: string,
  widgets: {
    weather: boolean
    calendar: boolean
    announcements: boolean
    minecraft: boolean
  }
) => {
  const dashboardRef = doc(db, 'dashboards', dashboardId)

  await updateDoc(dashboardRef, {
    widgets,
    updatedAt: serverTimestamp(),
  })
}

export const renameDashboard = async (dashboardId: string, newName: string) => {
  const dashboardRef = doc(db, 'dashboards', dashboardId)

  await updateDoc(dashboardRef, {
    name: newName,
    updatedAt: serverTimestamp(),
  })
}

export const removeDashboard = async (dashboardId: string) => {
  const dashboardRef = doc(db, 'dashboards', dashboardId)
  await deleteDoc(dashboardRef)
}