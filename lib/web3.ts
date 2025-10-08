import { ethers } from "ethers"

// Contract ABI - only the functions we need
export const CONTRACT_ABI = [
  "function postJob(string memory jobId) public payable",
  "function getPostingFee() public view returns (uint256)",
  "function getJobPosting(string memory jobId) public view returns (address, uint256, uint256, bool)",
  "event JobPosted(address indexed developer, string jobId, uint256 amount, uint256 timestamp)",
]

// Polygon Mumbai Testnet
export const POLYGON_TESTNET_CHAIN_ID = 80001
export const POLYGON_TESTNET_RPC = "https://rpc-mumbai.maticvigil.com"

// Contract address - will be set after deployment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed")
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()

    // Check if on correct network
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== POLYGON_TESTNET_CHAIN_ID) {
      await switchToPolygonTestnet()
    }

    return { provider, signer, address: accounts[0] }
  } catch (error) {
    console.error("Error connecting wallet:", error)
    throw error
  }
}

export async function switchToPolygonTestnet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${POLYGON_TESTNET_CHAIN_ID.toString(16)}` }],
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${POLYGON_TESTNET_CHAIN_ID.toString(16)}`,
              chainName: "Polygon Mumbai Testnet",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: [POLYGON_TESTNET_RPC],
              blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            },
          ],
        })
      } catch (addError) {
        throw addError
      }
    } else {
      throw switchError
    }
  }
}

export async function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not set")
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider)
}

export async function postJobToBlockchain(jobId: string, signer: ethers.Signer) {
  const contract = await getContract(signer)
  const fee = await contract.getPostingFee()

  const tx = await contract.postJob(jobId, { value: fee })
  const receipt = await tx.wait()

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  }
}

export async function getPostingFee() {
  const provider = new ethers.JsonRpcProvider(POLYGON_TESTNET_RPC)
  const contract = await getContract(provider)
  const fee = await contract.getPostingFee()
  return ethers.formatEther(fee)
}

export async function verifyJobPosting(jobId: string) {
  const provider = new ethers.JsonRpcProvider(POLYGON_TESTNET_RPC)
  const contract = await getContract(provider)
  const [developer, amount, timestamp, active] = await contract.getJobPosting(jobId)

  return {
    developer,
    amount: ethers.formatEther(amount),
    timestamp: Number(timestamp),
    active,
  }
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
