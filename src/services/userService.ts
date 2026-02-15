import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  isSubscribed: boolean;
  createdAt?: any;
}

const USERS_COL = "users";

export const getUsers = async (): Promise<UserProfile[]> => {
  const querySnapshot = await getDocs(collection(db, USERS_COL));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UserProfile[];
};

export const updateUserSubscription = async ({
  userId,
  isSubscribed,
}: {
  userId: string;
  isSubscribed: boolean;
}) => {
  const userRef = doc(db, USERS_COL, userId);
  await updateDoc(userRef, { isSubscribed });
};
