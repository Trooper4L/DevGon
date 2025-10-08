"use client"

import { useWeb3 } from "@/lib/web3-context"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function WalletConnect() {
  const { address, connecting, connect, disconnect } = useWeb3()

  if (address) {
    return (
      <Button variant="outline" onClick={disconnect} className="gap-2 bg-transparent">
        <Wallet className="h-4 w-4" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button onClick={connect} disabled={connecting} className="gap-2">
      <Wallet className="h-4 w-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
