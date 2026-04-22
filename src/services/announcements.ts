import { db } from '../firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
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

export const subscribeToAnnouncements = (
  callback: (announcements: Announcement[]) => void
) => {
  const q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Announcement[]

    callback(announcements)
  })
}