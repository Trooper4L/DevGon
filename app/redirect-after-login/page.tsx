"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function RedirectAfterLoginPage() {
  const { userProfile, loading, user } = useAuth()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    if (!loading) {
      if (userProfile) {
        const dashboardPath = userProfile.role === "developer" ? "/developer/dashboard" : "/employer/dashboard"
        router.push(dashboardPath)
      } else if (user && retryCount < maxRetries) {
        // User is authenticated but profile hasn't loaded yet, retry
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else if (!user) {
        // No user, redirect to signin
        router.push("/signin")
      } else if (retryCount >= maxRetries) {
        // Max retries reached, redirect to home with error
        console.error("Failed to load user profile after multiple attempts")
        router.push("/")
      }
    }
  }, [userProfile, loading, user, router, retryCount])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg text-muted-foreground">
          {retryCount > 0 ? "Loading your profile..." : "Redirecting to your dashboard..."}
        </div>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        {retryCount > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">Attempt {retryCount} of {maxRetries}</div>
        )}
      </div>
    </div>
  )
}
