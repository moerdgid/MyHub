import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

export type Announcement = {
  id: string
  title: string
  body: string
  authorEmail: string
  createdAt?: unknown
}

export const createAnnouncement = async (
  title: string,
  body: string,
  authorEmail: string
) => {
  await addDoc(collection(db, 'announcements'), {
    title,
    body,
    authorEmail,
    createdAt: serverTimestamp(),
  })
}

export const getAnnouncements = async () => {
  const q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Announcement[]
}