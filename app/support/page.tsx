"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { HelpCircle, Mail, MessageSquare, CheckCircle, Clock } from "lucide-react"

interface SupportTicket {
  id: string
  userId: string
  userName: string
  email: string
  subject: string
  message: string
  status: "open" | "in-progress" | "resolved"
  createdAt: Date
}

export default function SupportPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    if (user && userProfile) {
      setEmail(user.email || "")
      loadTickets()
    }
  }, [user, userProfile])

  const loadTickets = async () => {
    if (!user) return

    try {
      const q = query(collection(db, "supportTickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const ticketList: SupportTicket[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ticketList.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          email: data.email,
          subject: data.subject,
          message: data.message,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
        })
      })

      setTickets(ticketList)
    } catch (error) {
      console.error("Error loading tickets:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const ticketData = {
        userId: user?.uid || "anonymous",
        userName: userProfile?.displayName || "Anonymous",
        email,
        subject,
        message,
        status: "open",
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "supportTickets"), ticketData)

      setSuccess(true)
      setSubject("")
      setMessage("")

      if (user) {
        loadTickets()
      }

      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || "Failed to submit ticket")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "in-progress":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "in-progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Customer Support</h1>
          <p className="mt-2 text-muted-foreground">Get help with your DevGon account and platform issues</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>Our team will respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-4 border-primary bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground">
                      Support ticket submitted successfully! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* User's Tickets */}
            {user && tickets.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Support Tickets</CardTitle>
                  <CardDescription>Track the status of your submitted tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-lg border border-border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            <span className="text-sm text-muted-foreground">{getStatusText(ticket.status)}</span>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {ticket.createdAt.toLocaleDateString()} at{" "}
                          {ticket.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* FAQ and Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@devgon.io</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">How do I post my work as a developer?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Connect your wallet, go to your developer dashboard, and click "Post New Work". You'll need to pay
                      a small fee in MATIC to post your portfolio.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">What is the posting fee?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      The posting fee is paid in MATIC on the Polygon Mumbai testnet. This fee helps maintain platform
                      quality and prevents spam. The exact amount is displayed when you create a post.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">How do I connect my wallet?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Click the "Connect Wallet" button in the navigation bar. You'll need MetaMask or another Web3
                      wallet installed. Make sure you're on the Polygon Mumbai testnet.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">How do I contact a developer?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      View a developer's profile and click the "Message" button. You'll need to be signed in to send
                      messages. All conversations are private and secure.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">Is my data secure?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Yes! We use Firebase for authentication and data storage, and all job postings are verified on the
                      Polygon blockchain. Your personal information is encrypted and never shared without your consent.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left">How do I verify my email address?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      After signing up, check your email for a verification link from Firebase. Click the link to verify
                      your account. If you didn't receive it, check your spam folder.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
