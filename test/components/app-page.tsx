"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// ABI for MintableERC contract
const mintableERCABI = [
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
]

// ABI for ProxyLocation contract (simplified for this example)
const proxyLocationABI = [
  "function addServer(uint8 _firstOctet, uint8 _secondOctet, _thirdOctet, _fourthOctet, uint128 _costToLoan, address _receivingAddress, string memory _countryServerIsIn) public",
  "function payServerForAccess(uint8 _firstOctet, uint8 _secondOctet, _thirdOctet, _fourthOctet, uint256 _serverRequested) public",
  "function _currServerCount() public view returns (uint256)"
]

export function Page() {
  const [account, setAccount] = useState("")
  const [balance, setBalance] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [serverCount, setServerCount] = useState(0)
  const [error, setError] = useState("")

  const mintableERCAddress = "0x1234567890123456789012345678901234567890" // Replace with actual contract address
  const proxyLocationAddress = "0x0987654321098765432109876543210987654321" // Replace with actual contract address

  useEffect(() => {
    connectWallet()
  }, [])

  async function connectWallet() {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
        updateBalance(address, provider)
        updateServerCount(provider)
      } catch (err) {
        setError("Failed to connect MetaMask")
      }
    } else {
      setError("Please install MetaMask")
    }
  }

  async function updateBalance(address: string, provider: ethers.Provider.Web3Provider) {
    const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, provider)
    const balance = await contract.balanceOf(address)
    const decimals = await contract.decimals()
    setBalance(ethers.formatUnits(balance, decimals))
  }

  async function updateServerCount(provider: ethers.providers.Web3Provider) {
    const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, provider)
    const count = await contract._currServerCount()
    setServerCount(count.toNumber())
  }

  async function mintTokens() {
    if (!account || !mintAmount) return
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, signer)
      const decimals = await contract.decimals()
      const amount = ethers.utils.parseUnits(mintAmount, decimals)
      const tx = await contract.mint(account, amount)
      await tx.wait()
      updateBalance(account, provider)
      setError("")
    } catch (err) {
      setError("Failed to mint tokens")
    }
  }

  async function addServer() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, signer)
      const tx = await contract.addServer(192, 168, 1, 1, ethers.utils.parseEther("0.1"), account, "USA")
      await tx.wait()
      updateServerCount(provider)
      setError("")
    } catch (err) {
      setError("Failed to add server")
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-4">Welcome to Web3 Interaction</h2>
        <p className="text-lg text-neutral-500 dark:text-neutral-400">
          Connect your wallet and interact with Ethereum smart contracts. Mint tokens, manage servers, and explore the world of decentralized applications.
        </p>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Address:</strong> {account || "Not connected"}</p>
          <p><strong>Balance:</strong> {balance || "0"} USDC</p>
          {!account && (
            <Button onClick={connectWallet} className="mt-2">Connect Wallet</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mint Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="mintAmount">Amount</Label>
            <Input
              id="mintAmount"
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Enter amount to mint"
            />
          </div>
          <Button className="mt-2" onClick={mintTokens} disabled={!account}>Mint</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proxy Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Server Count:</strong> {serverCount}</p>
          <Button className="mt-2" onClick={addServer} disabled={!account}>Add Server</Button>
        </CardContent>
      </Card>
    </div>
  )
}