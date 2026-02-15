import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// registration function
export const registerUser = async (
  email: string,
  pass: string,
  fullName: string,
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    pass,
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName: fullName });

  await setDoc(doc(db, "users", user.uid), {
    fullName: fullName,
    email: user.email,
    isSubscribed: false,
    role: "client",
    createdAt: new Date(),
  });

  return user;
};

export const loginUser = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = () => {
  return signOut(auth);
};
