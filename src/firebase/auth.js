import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider } from './firebaseConfig'

export const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

export const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

export const signInWithGoogle = () =>
    signInWithPopup(auth, googleProvider)

export const signOut = () => firebaseSignOut(auth)

export const updateUserProfile = (displayName, photoURL) =>
    updateProfile(auth.currentUser, { displayName, photoURL })

export const resetPassword = (email) =>
    sendPasswordResetEmail(auth, email)
