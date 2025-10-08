"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { collection, query, orderBy, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { JobPosting } from "@/lib/types"
import { Search, Heart, Eye, Calendar, MessageSquare, Users, Briefcase } from "lucide-react"
import Link from "next/link"

export default function EmployerDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [filteredPostings, setFilteredPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
    if (userProfile?.role !== "employer") {
      router.push("/developer/dashboard")
    }
  }, [user, userProfile, authLoading, router])

  useEffect(() => {
    loadJobPostings()
  }, [])

  useEffect(() => {
    filterPostings()
  }, [searchQuery, selectedSkills, jobPostings])

  const loadJobPostings = async () => {
    try {
      const q = query(collection(db, "jobPostings"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const posts: JobPosting[] = []

      querySnapshot.forEach((doc) => {
        posts.push({ ...doc.data(), id: doc.id } as JobPosting)
      })

      setJobPostings(posts)
      setFilteredPostings(posts)
    } catch (error) {
      console.error("Error loading job postings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPostings = () => {
    let filtered = jobPostings

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.developerName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((post) => selectedSkills.some((skill) => post.skills.includes(skill)))
    }

    setFilteredPostings(filtered)
  }

  const handleViewPost = async (postId: string) => {
    try {
      const postRef = doc(db, "jobPostings", postId)
      await updateDoc(postRef, {
        views: increment(1),
      })

      setJobPostings((prev) => prev.map((post) => (post.id === postId ? { ...post, views: post.views + 1 } : post)))
    } catch (error) {
      console.error("Error updating views:", error)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const postRef = doc(db, "jobPostings", postId)
      await updateDoc(postRef, {
        likes: increment(1),
      })

      setJobPostings((prev) => prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const allSkills = Array.from(new Set(jobPostings.flatMap((post) => post.skills)))

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Find and connect with talented blockchain developers</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Developers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobPostings.length}</div>
              <p className="text-xs text-muted-foreground">Active portfolios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Available</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSkills.length}</div>
              <p className="text-xs text-muted-foreground">Unique technologies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Unread conversations</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search developers by name, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {allSkills.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Filter by skills:</p>
              <div className="flex flex-wrap gap-2">
                {allSkills.slice(0, 15).map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter((s) => s !== skill))
                      } else {
                        setSelectedSkills([...selectedSkills, skill])
                      }
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Developer Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Portfolios</CardTitle>
            <CardDescription>
              Browse verified blockchain developers and their work ({filteredPostings.length} results)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPostings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery || selectedSkills.length > 0
                    ? "No developers match your search criteria"
                    : "No developers available yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPostings.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-lg border border-border p-6 transition-colors hover:bg-accent/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          {post.price && (
                            <Badge variant="secondary" className="text-xs">
                              {post.price}
                            </Badge>
                          )}
                        </div>
                        <p className="mb-1 text-sm text-muted-foreground">by {post.developerName}</p>
                        <p className="mb-4 text-sm text-foreground line-clamp-2">{post.description}</p>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {post.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

                      <div className="ml-6 flex flex-col gap-2">
                        <Button size="sm" asChild onClick={() => handleViewPost(post.id)}>
                          <Link href={`/job/${post.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/chat?userId=${post.developerId}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleLike(post.id)}>
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
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
