"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { JobPosting } from "@/lib/types"
import { Search, Heart, Eye, Calendar, MessageSquare, Users, Briefcase } from "lucide-react"
import Link from "next/link"

export default function DeveloperListings() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [developerProfiles, setDeveloperProfiles] = useState<any[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  // Unified loading state
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to finish before doing anything
    if (authLoading) {
      return
    }

    // Redirect if not logged in
    if (!user) {
      router.push("/signin")
      return
    }

    // Redirect if the role is wrong (and profile is loaded)
    if (userProfile && userProfile.role !== "employer") {
      router.push("/developer/dashboard")
      return
    }

    // If we have a user and their profile, load the data
    if (user && userProfile) {
      const loadDeveloperProfiles = async () => {
        try {
          const q = query(collection(db, "developerProfiles"))
          const querySnapshot = await getDocs(q)
          const profiles: any[] = []

          querySnapshot.forEach((doc) => {
            profiles.push({ ...doc.data(), id: doc.id })
          })

          setDeveloperProfiles(profiles)
          setFilteredProfiles(profiles)
        } catch (error) {
          console.error("Error loading developer profiles:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadDeveloperProfiles()
    }
  }, [user, userProfile, authLoading, router])

  useEffect(() => {
    const filterProfiles = () => {
      let filtered = developerProfiles

      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (profile) =>
            profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      if (selectedSkills.length > 0) {
        filtered = filtered.filter((profile) => selectedSkills.some((skill) => profile.skills.includes(skill)))
      }

      setFilteredProfiles(filtered)
    }

    filterProfiles()
  }, [searchQuery, selectedSkills, developerProfiles])

  const handleViewProfile = async (profileId: string) => {
    try {
      const profileRef = doc(db, "developerProfiles", profileId)
      await updateDoc(profileRef, {
        views: increment(1),
      })

      setDeveloperProfiles((prev) =>
        prev.map((profile) => (profile.id === profileId ? { ...profile, views: profile.views + 1 } : profile)),
      )
    } catch (error) {
      console.error("Error updating views:", error)
    }
  }

  const handleLikeProfile = async (profileId: string) => {
    if (!user) return

    try {
      const profileRef = doc(db, "developerProfiles", profileId)
      await updateDoc(profileRef, {
        likes: increment(1),
      })

      setDeveloperProfiles((prev) =>
        prev.map((profile) => (profile.id === profileId ? { ...profile, likes: profile.likes + 1 } : profile)),
      )
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const allSkills = Array.from(new Set(developerProfiles.flatMap((profile) => profile.skills)))

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
              <div className="text-2xl font-bold">{developerProfiles.length}</div>
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
              Browse verified blockchain developers and their work ({filteredProfiles.length} results)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProfiles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery || selectedSkills.length > 0
                    ? "No developers match your search criteria"
                    : "No developers available yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-lg border border-border p-6 transition-colors hover:bg-accent/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{profile.title}</h3>
                          {profile.rate && (
                            <Badge variant="secondary" className="text-xs">
                              ${profile.rate}/hr
                            </Badge>
                          )}
                        </div>
                        <p className="mb-1 text-sm text-muted-foreground">by {profile.name}</p>
                        <p className="mb-4 text-sm text-foreground line-clamp-2">{profile.bio}</p>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {profile.skills.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {profile.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {profile.likes || 0} likes
                          </span>
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col gap-2">
                        <Button size="sm" asChild onClick={() => handleViewProfile(profile.id)}>
                          <Link href={`/profile/${profile.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/chat?userId=${profile.userId}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleLikeProfile(profile.id)}>
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
