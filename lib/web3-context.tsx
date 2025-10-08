"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { ethers } from "ethers"
import { connectWallet } from "./web3"

interface Web3ContextType {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== "undefined") {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connect()
          }
        })
        .catch(console.error)
    }

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAddress(accounts[0])
        }
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }
  }, [])

  const connect = async () => {
    setConnecting(true)
    try {
      const { provider, signer, address } = await connectWallet()
      setProvider(provider)
      setSigner(signer)
      setAddress(address)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
  }

  return (
    <Web3Context.Provider value={{ address, provider, signer, connecting, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
