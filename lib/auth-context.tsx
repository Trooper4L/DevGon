"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { UserProfile, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, "users", user.uid))
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile)
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error)
          // If offline, try to get cached data
          if (error.code === "unavailable") {
            console.warn("Firebase is offline, will retry when online")
          }
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Set a timeout to prevent infinite loading state
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false)
        console.warn("Auth state check timed out. Assuming user is not logged in.")
      }
    }, 5000) // 5 seconds timeout

    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [loading])

  const signUp = async (email: string, password: string, role: UserRole, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    await sendEmailVerification(userCredential.user)

    const profile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      role,
      displayName,
      createdAt: new Date(),
      emailVerified: false,
    }

    await setDoc(doc(db, "users", userCredential.user.uid), profile)
    setUserProfile(profile)
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUserProfile(null)
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return

    const updatedProfile = { ...userProfile, ...data } as UserProfile
    await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true })
    setUserProfile(updatedProfile)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
