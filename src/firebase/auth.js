// src/firebase/auth.js
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebaseConfig'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with email + password.
 * Throws on invalid credentials.
 */
export const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

/**
 * Sign up with email + password.
 * Throws on invalid credentials or existing email.
 */
export const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

/**
 * Sign in with Google popup.
 * Throws if user cancels or on error.
 */
export const signInWithGoogle = () =>
    signInWithPopup(auth, googleProvider)

/**
 * Sign out current user.
 */
export const signOut = () => firebaseSignOut(auth)
