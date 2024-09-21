"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  "function _currServerCount() public view returns (uint256)",
  "function _serverCountryList(uint256) public view returns (string)"
];

// Replace with actual contract addresses
const mintableERCAddress = "0x1234567890123456789012345678901234567890";
const proxyLocationAddress = "0x0987654321098765432109876543210987654321";

export function Page() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [serverCount, setServerCount] = useState(0);
  const [servers, setServers] = useState([]);  // Store servers
  const [clientIP, setClientIP] = useState({ firstOctet: 0, secondOctet: 0, thirdOctet: 0, fourthOctet: 0 });
  const [error, setError] = useState("");

  const rpcUrl = "https://api.helium.fhenix.zone"; // RPC URL

  useEffect(() => {
    connectWallet();
    getClientIP();
  }, []);

  // Connect wallet and update balance and server count
  async function connectWallet() {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: "Fhenix Helium"
      });
      const signer = provider.getSigner();
      const accountAddress = await (await signer).getAddress();
      setAccount(accountAddress);

      updateBalance(accountAddress, provider);
      updateServerCount(provider);
      fetchServers(provider);
    } catch (err) {
      setError("Failed to connect to the custom RPC URL");
    }
  }

  // Fetch client IP and convert it to octets
  async function getClientIP() {
    const ipData = await fetch('https://api.ipify.org?format=json').then((res) => res.json());
    const octets = ipData.ip.split('.').map(Number);
    setClientIP({
      firstOctet: octets[0],
      secondOctet: octets[1],
      thirdOctet: octets[2],
      fourthOctet: octets[3],
    });
  }

  async function updateBalance(address, provider) {
    const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    setBalance(ethers.formatUnits(balance, decimals));
  }

  async function updateServerCount(provider) {
    const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, provider);
    const count = await contract._currServerCount();
    setServerCount(Number(count));
  }

  // Fetch the list of servers
  async function fetchServers(provider) {
    const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, provider);
    let serversList = [];
    const count = await contract._currServerCount();

    for (let i = 0; i < count; i++) {
      const country = await contract._serverCountryList(i);
      serversList.push({ id: i, country });
    }
    setServers(serversList);
  }

  // Mint tokens
  async function mintTokens() {
    if (!account || !mintAmount) return;
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: "Fhenix Helium"
      });
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, signer);
      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(mintAmount, decimals);
      const tx = await contract.mint(account, amount);
      await tx.wait();
      updateBalance(account, provider);
      setError("");
    } catch (err) {
      setError("Failed to mint tokens");
    }
  }

  // Add a new server
  async function addServer() {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, signer);
      const tx = await contract.addServer(192, 168, 1, 1, ethers.parseEther("0.1"), account, "USA");
      await tx.wait();
      updateServerCount(provider);
      setError("");
    } catch (err) {
      setError(`Failed to add server ${err}`);
    }
  }

  // Pay for a selected server
  async function payForServerAccess(serverId: number) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, signer);
      const tx = await contract.payServerForAccess(
        clientIP.firstOctet,
        clientIP.secondOctet,
        clientIP.thirdOctet,
        clientIP.fourthOctet,
        serverId
      );
      await tx.wait();
      alert("Payment successful, you will receive the VPN access soon.");
    } catch (err) {
      setError(`Failed to pay for server access. ${err}`);
    }
  }

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <section>
        <h2 className="text-3xl font-bold mb-4">Welcome to Web3 Interaction</h2>
        <p className="text-lg text-neutral-500 dark:text-neutral-400">
          Connect your wallet and interact with Ethereum smart contracts.
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

      {/* Mint Tokens */}
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

      {/* Server Management */}
      <Card>
        <CardHeader>
          <CardTitle>Proxy Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Server Count:</strong> {serverCount}</p>
          <Button className="mt-2" onClick={addServer} disabled={!account}>Add Server</Button>
        </CardContent>
      </Card>

      {/* Server List */}
      <Card>
        <CardHeader>
          <CardTitle>Server List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {servers.map(server => (
              <li key={server.id}>
                Server ID: {server.id}, Country: {server.country} 
                <Button className="ml-4" onClick={() => payForServerAccess(server.id)}>Pay for Access</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
