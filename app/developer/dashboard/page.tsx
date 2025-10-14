"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { JobPosting } from "@/lib/types"
import { Plus, Eye, Heart, Calendar } from "lucide-react"
import Link from "next/link"

export default function DeveloperDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
  })
  // Unified loading state
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) {
      return // Wait for auth to complete
    }

    if (!user) {
      router.push("/signin")
      return
    }

    // If auth is done, but the profile is not loaded or the role is incorrect
    if (!userProfile) {
      setIsLoading(false) // Stop loading and show empty state (or a "create profile" prompt)
      return
    }

    if (userProfile.role !== "developer") {
      router.push("/employer/dashboard")
      return
    }

    // Load data only if we have a valid developer profile
    const loadJobPostings = async () => {
      try {
        const q = query(
          collection(db, "jobPostings"),
          where("developerId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const querySnapshot = await getDocs(q)
        const posts: JobPosting[] = []
        let totalViews = 0
        let totalLikes = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data() as JobPosting
          posts.push({ ...data, id: doc.id })
          totalViews += data.views || 0
          totalLikes += data.likes || 0
        })

        setJobPostings(posts)
        setStats({
          totalPosts: posts.length,
          totalViews,
          totalLikes,
        })
      } catch (error) {
        console.error("Error loading job postings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadJobPostings()
  }, [user, userProfile, authLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Developer Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage your portfolio and job postings</p>
          </div>
          <Button asChild size="lg">
            <Link href="/developer/post-job">
              <Plus className="mr-2 h-4 w-4" />
              Post New Work
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">Active job postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Profile impressions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">Engagement score</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Postings</CardTitle>
            <CardDescription>All your work and offerings posted on DevGon</CardDescription>
          </CardHeader>
          <CardContent>
            {jobPostings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">You haven't posted any work yet</p>
                <Button asChild>
                  <Link href="/developer/post-job">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Post
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobPostings.map((post) => (
                  <div key={post.id} className="flex items-start justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-secondary px-3 py-1 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes} likes
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/developer/post/${post.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
