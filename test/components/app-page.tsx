"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JsonRpcProvider } from "ethers";
import { AddressLike } from "ethers";

// ABI for MintableERC contract
const mintableERCABI = [
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

// ABI for ProxyLocation contract (simplified for this example)
const proxyLocationABI = [
  "function addServer(uint8 _firstOctet, uint8 _secondOctet, uint8 _thirdOctet, uint8 _fourthOctet, uint128 _costToLoan, address _receivingAddress, string memory _countryServerIsIn) public",
  "function payServerForAccess(uint8 _firstOctet, uint8 _secondOctet, uint8 _thirdOctet, uint8 _fourthOctet, uint256 _serverRequested) public",
  "function _currServerCount() public view returns (uint256)"
];

// Replace with actual contract addresses
const mintableERCAddress = "0x1234567890123456789012345678901234567890";
const proxyLocationAddress = "0x0987654321098765432109876543210987654321";

export function Page() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [serverCount, setServerCount] = useState(0);
  const [error, setError] = useState("");

  // RPC URL for the Helium network
  const rpcUrl = "https://api.helium.fhenix.zone"; // Your custom RPC URL

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    try {
      // Use JsonRpcProvider with your custom RPC URL
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: "Fhenix Helium"
      });
      
      // Manually specify the account address or get it from a signer
      const signer = provider.getSigner(); // Only if you have access to signer
      const accountAddress = await (await signer).getAddress(); // Get address from wallet
      setAccount(accountAddress);

      // Use the provider to interact with contracts or check the balance, etc.
      const balance = await provider.getBalance(accountAddress);
      console.log("Balance:", ethers.formatUnits(balance, 18)); // assuming 18 decimals

      // Update balance and server count
      updateBalance(accountAddress, provider);
      updateServerCount(provider);
    } catch ( err ) {
      setError("Failed to connect to the custom RPC URL");
    }
  }

  async function updateBalance(address: AddressLike, provider: JsonRpcProvider) {
    const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    setBalance(ethers.formatUnits(balance, decimals)); // Format balance correctly
  }

  async function updateServerCount(provider: JsonRpcProvider) {
    const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, provider);
    const count = await contract._currServerCount();
    setServerCount(Number(count)); // Convert to number
  }

  async function mintTokens() {
    if (!account || !mintAmount) return;
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      // Assuming you're using a signer, if you need it, you'll have to get it manually
      const signer = provider.getSigner(account); // This assumes you have access to the private key
      
      const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, signer);
      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(mintAmount, decimals); // Parse mint amount correctly
      const tx = await contract.mint(account, amount);
      await tx.wait();
      updateBalance(account, provider);
      setError("");
    } catch (err) {
      setError("Failed to mint tokens");
    }
  }

  async function addServer() {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = provider.getSigner(account); // Assuming you have access to the private key

      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, signer);
      const tx = await contract.addServer(192, 168, 1, 1, ethers.parseEther("0.1"), account, "USA");
      await tx.wait();
      updateServerCount(provider);
      setError("");
    } catch (err) {
      setError("Failed to add server");
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
          <p><strong>Balance:</strong> {balance || "0"} TFHE</p>
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
  );
}
