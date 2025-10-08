"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useWeb3 } from "@/lib/web3-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Wallet } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { postJobToBlockchain, getPostingFee } from "@/lib/web3"
import type { JobPosting } from "@/lib/types"

export default function PostJobPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { address, signer, connect } = useWeb3()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [postingFee, setPostingFee] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"form" | "payment" | "success">("form")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
    if (userProfile?.role !== "developer") {
      router.push("/employer/dashboard")
    }
  }, [user, userProfile, authLoading, router])

  useEffect(() => {
    loadPostingFee()
  }, [])

  const loadPostingFee = async () => {
    try {
      const fee = await getPostingFee()
      setPostingFee(fee)
    } catch (error) {
      console.error("Error loading posting fee:", error)
      setPostingFee("0.01") // Default fallback
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    if (skills.length === 0) {
      setError("Please add at least one skill")
      return
    }

    setStep("payment")
  }

  const handlePayment = async () => {
    if (!signer || !user || !userProfile) {
      setError("Please connect your wallet and sign in")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create temporary job ID
      const tempJobId = `job_${Date.now()}_${user.uid}`

      // Post to blockchain
      const { transactionHash } = await postJobToBlockchain(tempJobId, signer)

      // Save to Firestore
      const jobData: Omit<JobPosting, "id"> = {
        developerId: user.uid,
        developerName: userProfile.displayName,
        title,
        description,
        skills,
        price,
        transactionHash,
        createdAt: new Date(),
        likes: 0,
        views: 0,
      }

      await addDoc(collection(db, "jobPostings"), {
        ...jobData,
        createdAt: serverTimestamp(),
      })

      setStep("success")
      setTimeout(() => {
        router.push("/developer/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Error posting job:", err)
      setError(err.message || "Failed to post job. Please try again.")
      setStep("form")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post Your Work</CardTitle>
            <CardDescription>
              Showcase your projects and offerings to potential employers. Requires {postingFee} MATIC payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., DeFi Dashboard Development"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your work, experience, and what you offer..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (Optional)</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., $5000 - $10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills & Technologies</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {!address && (
                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertDescription>
                      You need to connect your wallet to post. Click the "Connect Wallet" button in the navigation bar.
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={!address}>
                  Continue to Payment
                </Button>
              </form>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Payment Required</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posting Fee:</span>
                      <span className="font-semibold">{postingFee} MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-semibold">Polygon Mumbai Testnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Wallet:</span>
                      <span className="font-mono text-sm">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    By clicking "Pay & Post", you'll be prompted to confirm the transaction in your wallet. The posting
                    fee ensures quality content and prevents spam.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("form")} disabled={loading} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handlePayment} disabled={loading} className="flex-1">
                    {loading ? "Processing..." : "Pay & Post"}
                  </Button>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Post Created Successfully!</h3>
                <p className="text-muted-foreground">Your work is now visible to employers. Redirecting...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
