"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Chat, ChatMessage, UserProfile } from "@/lib/types"
import { Send, MessageSquare } from "lucide-react"

export default function ChatPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadChats()
    }
  }, [user])

  useEffect(() => {
    const userId = searchParams.get("userId")
    if (userId && user && chats.length > 0) {
      const existingChat = chats.find((chat) => chat.participants.includes(userId))
      if (existingChat) {
        setSelectedChat(existingChat)
      } else {
        createNewChat(userId)
      }
    }
  }, [searchParams, user, chats])

  useEffect(() => {
    if (selectedChat) {
      const unsubscribe = subscribeToMessages(selectedChat.id)
      return () => unsubscribe()
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChats = async () => {
    if (!user) return

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid))

      const querySnapshot = await getDocs(q)
      const chatList: Chat[] = []

      for (const docSnap of querySnapshot.docs) {
        const chatData = docSnap.data()
        chatList.push({
          id: docSnap.id,
          participants: chatData.participants,
          participantNames: chatData.participantNames,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
          unreadCount: chatData.unreadCount || {},
        })
      }

      chatList.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
      setChats(chatList)
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const createNewChat = async (otherUserId: string) => {
    if (!user || !userProfile) return

    try {
      // Check if chat already exists
      const existingChat = chats.find((chat) => chat.participants.includes(otherUserId))
      if (existingChat) {
        setSelectedChat(existingChat)
        return
      }

      // Get other user's profile
      const otherUserDoc = await getDoc(doc(db, "users", otherUserId))
      if (!otherUserDoc.exists()) return

      const otherUserProfile = otherUserDoc.data() as UserProfile

      // Create new chat
      const chatData = {
        participants: [user.uid, otherUserId],
        participantNames: {
          [user.uid]: userProfile.displayName,
          [otherUserId]: otherUserProfile.displayName,
        },
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [user.uid]: 0,
          [otherUserId]: 0,
        },
      }

      const chatRef = await addDoc(collection(db, "chats"), chatData)

      const newChat: Chat = {
        id: chatRef.id,
        ...chatData,
        lastMessageTime: new Date(),
      }

      setChats([newChat, ...chats])
      setSelectedChat(newChat)
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  const subscribeToMessages = (chatId: string) => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"))

    return onSnapshot(q, (snapshot) => {
      const messageList: ChatMessage[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        messageList.push({
          id: doc.id,
          chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read,
        })
      })
      setMessages(messageList)
    })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || !userProfile) return

    try {
      const messageData = {
        senderId: user.uid,
        senderName: userProfile.displayName,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
      }

      await addDoc(collection(db, "chats", selectedChat.id, "messages"), messageData)

      // Update chat's last message
      const otherUserId = selectedChat.participants.find((id) => id !== user.uid)
      await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherUserId}`]: (selectedChat.unreadCount[otherUserId!] || 0) + 1,
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const getOtherUserName = (chat: Chat) => {
    if (!user) return ""
    const otherUserId = chat.participants.find((id) => id !== user.uid)
    return otherUserId ? chat.participantNames[otherUserId] : ""
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="mt-2 text-muted-foreground">Connect with developers and employers</p>
        </div>

        <div className="grid h-[calc(100vh-16rem)] gap-4 lg:grid-cols-3">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {chats.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Start a conversation by clicking "Message" on a developer's profile
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50 ${
                          selectedChat?.id === chat.id ? "bg-accent" : ""
                        }`}
                      >
                        <Avatar>
                          <AvatarFallback>{getInitials(getOtherUserName(chat))}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{getOtherUserName(chat)}</h3>
                            {chat.unreadCount[user!.uid] > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {chat.unreadCount[user!.uid]}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {chat.lastMessageTime.toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            <CardContent className="flex h-[calc(100vh-16rem)] flex-col p-0">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <Avatar>
                      <AvatarFallback>{getInitials(getOtherUserName(selectedChat))}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{getOtherUserName(selectedChat)}</h3>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.senderId === user?.uid
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`mt-1 text-xs ${
                                message.senderId === user?.uid ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-border p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">Choose a chat from the list to start messaging</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
