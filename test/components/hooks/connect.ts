import { JsonRpcApiProvider } from "ethers";
import { ethers } from "ethers";

  function getProvider() {
    const rpcUrl = "https://api.helium.fhenix.zone"; // RPC URL

    return new ethers.JsonRpcProvider(rpcUrl, {
      chainId: 8008135,
      name: "Fhenix Helium"
    });
  }

  // Connect wallet and update balance and server count
  async function connectWallet() {
    try {
      const provider = getProvider();
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

  async function updateBalance(
    address: string, 
    provider: JsonRpcApiProvider,
    mintableERCAddress: string,
    mintableERCABI: string
  ) {
    const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    setBalance(ethers.formatUnits(balance, decimals));
  }

  async function updateServerCount(
    provider: JsonRpcApiProvider,
    proxyLocationAddress: string,
    proxyLocationABI: string
  ) {
    const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, provider);
    const count = await contract._currServerCount();
    setServerCount(Number(count));
  }

  // Fetch the list of servers
  async function fetchServers(
    provider: JsonRpcApiProvider,
    proxyLocationAddress: string,
    proxyLocationABI: string
  ) {
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
      const provider = getProvider();

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
  async function addServer(
    rpcUrl: string,
    account: string,
    proxyLocationAddress: string,
    proxyLocationABI: string,
  ) {
    try {
      const provider = getProvider();
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
  async function payForServerAccess(
    serverId: number,
    rpcUrl: string,
    account: string,
    proxyLocationAddress: string,
    proxyLocationABI: string,
    clientIP: { firstOctet: number, secondOctet: number, thirdOctet: number, fourthOctet: number }
  ) {
    try {
      const provider = getProvider();
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


export {
    connectWallet,
    getClientIP,
    updateBalance,
    updateServerCount,
    fetchServers,
    mintTokens,
    addServer,
    payForServerAccess
}