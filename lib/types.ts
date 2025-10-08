export type UserRole = "developer" | "employer"

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  displayName: string
  bio?: string
  skills?: string[]
  company?: string
  location?: string
  walletAddress?: string
  createdAt: Date
  emailVerified: boolean
}

export interface JobPosting {
  id: string
  developerId: string
  developerName: string
  title: string
  description: string
  skills: string[]
  images?: string[]
  price?: string
  transactionHash: string
  createdAt: Date
  likes: number
  views: number
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  read: boolean
}

export interface Chat {
  id: string
  participants: string[]
  participantNames: { [key: string]: string }
  lastMessage: string
  lastMessageTime: Date
  unreadCount: { [key: string]: number }
}
