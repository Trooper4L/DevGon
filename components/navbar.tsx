"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"

export function Navbar() {
  const { user, userProfile, signOut } = useAuth()

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/devgon-logo.png" 
                alt="DevGon Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-primary">DevGon</span>
            </Link>
            {user && (
              <div className="hidden gap-4 md:flex">
                <Link href="/feed" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Feed
                </Link>
                <Link
                  href={userProfile?.role === "developer" ? "/developer/dashboard" : "/employer/dashboard"}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link href="/chat" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Messages
                </Link>
                <Link href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Support
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && <WalletConnect />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
