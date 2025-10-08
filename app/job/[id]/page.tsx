"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { JobPosting, UserProfile } from "@/lib/types"
import { Calendar, Eye, Heart, MessageSquare, ExternalLink, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [developerProfile, setDeveloperProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadJobPosting(params.id as string)
    }
  }, [params.id])

  const loadJobPosting = async (id: string) => {
    try {
      const jobDoc = await getDoc(doc(db, "jobPostings", id))
      if (jobDoc.exists()) {
        const jobData = { ...jobDoc.data(), id: jobDoc.id } as JobPosting
        setJobPosting(jobData)

        // Increment view count
        await updateDoc(doc(db, "jobPostings", id), {
          views: increment(1),
        })

        // Load developer profile
        const profileDoc = await getDoc(doc(db, "users", jobData.developerId))
        if (profileDoc.exists()) {
          setDeveloperProfile(profileDoc.data() as UserProfile)
        }
      } else {
        router.push("/feed")
      }
    } catch (error) {
      console.error("Error loading job posting:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || !jobPosting) return

    try {
      const postRef = doc(db, "jobPostings", jobPosting.id)
      await updateDoc(postRef, {
        likes: increment(1),
      })

      setJobPosting({ ...jobPosting, likes: jobPosting.likes + 1 })
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!jobPosting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Job posting not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h1 className="mb-3 text-3xl font-bold">{jobPosting.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Posted {new Date(jobPosting.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {jobPosting.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {jobPosting.likes} likes
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold">Description</h2>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">{jobPosting.description}</p>
                </div>

                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold">Skills & Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {jobPosting.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {jobPosting.price && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Price Range</h2>
                    <p className="text-foreground">{jobPosting.price}</p>
                  </div>
                )}

                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <h3 className="mb-2 text-sm font-semibold">Blockchain Verification</h3>
                  <p className="mb-2 text-xs text-muted-foreground">This posting is verified on Polygon blockchain</p>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-background px-2 py-1 text-xs font-mono">
                      {jobPosting.transactionHash.slice(0, 10)}...{jobPosting.transactionHash.slice(-8)}
                    </code>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${jobPosting.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Developer</h2>
                <div className="mb-4">
                  <h3 className="font-semibold">{jobPosting.developerName}</h3>
                  {developerProfile?.location && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {developerProfile.location}
                    </p>
                  )}
                </div>

                {developerProfile?.bio && (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{developerProfile.bio}</p>
                )}

                {developerProfile?.skills && developerProfile.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium">All Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {developerProfile.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {user && (
                    <>
                      <Button className="w-full" asChild>
                        <Link href={`/chat?userId=${jobPosting.developerId}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" onClick={handleLike}>
                        <Heart className="mr-2 h-4 w-4" />
                        Like
                      </Button>
                    </>
                  )}
                  {!user && (
                    <Button className="w-full" asChild>
                      <Link href="/signin">Sign in to contact</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {jobPosting.price && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">Price Range</span>
                  </div>
                  <p className="mt-2 text-xl font-bold">{jobPosting.price}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
