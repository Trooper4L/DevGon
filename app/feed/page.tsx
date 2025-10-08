"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { collection, query, orderBy, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { JobPosting } from "@/lib/types"
import { Search, Heart, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function FeedPage() {
  const { user } = useAuth()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [filteredPostings, setFilteredPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadJobPostings()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPostings(jobPostings)
    } else {
      const filtered = jobPostings.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredPostings(filtered)
    }
  }, [searchQuery, jobPostings])

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

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const postRef = doc(db, "jobPostings", postId)
      await updateDoc(postRef, {
        likes: increment(1),
      })

      // Update local state
      setJobPostings((prev) => prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading feed...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Developer Feed</h1>
          <p className="mt-2 text-muted-foreground">Discover talented blockchain developers and their work</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Job Postings Grid */}
        {filteredPostings.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No results found. Try a different search." : "No postings yet. Be the first to post!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPostings.map((post) => (
              <Card key={post.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-4">
                    <h3 className="mb-2 text-lg font-semibold line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {post.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{post.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                        <Link href={`/job/${post.id}`}>View Details</Link>
                      </Button>
                      {user && (
                        <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                          <Heart className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
