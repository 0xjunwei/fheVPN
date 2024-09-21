import { ethers } from 'ethers';
import { setVpnProxy, removeVpnProxy } from './background';

// Connect to MetaMask
const provider = new ethers.providers.Web3Provider((window as any).ethereum);

document.getElementById("connectButton")?.addEventListener("click", async () => {
  try {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("Connected to MetaMask", await signer.getAddress());
  } catch (error) {
    console.error("MetaMask connection error", error);
  }
});

// Handle VPN payment
document.getElementById("payButton")?.addEventListener("click", async () => {
  try {
    const signer = provider.getSigner();
    const transaction = await signer.sendTransaction({
      to: "0xYourRecipientWalletAddress",  // Replace with your address
      value: ethers.utils.parseEther("0.01")  // Amount to pay for VPN
    });

    console.log("Transaction successful", transaction);

    // Once payment is done, connect to VPN
    setVpnProxy("vpn_server_ip", 8080);  // Replace with your VPN server IP and port
  } catch (error) {
    console.error("Payment failed", error);
  }
});

// Toggle VPN connection
document.getElementById("vpnToggleButton")?.addEventListener("click", () => {
  // Toggle between setting and removing VPN proxy
  const vpnConnected = false; // You can track connection state in storage
  if (vpnConnected) {
    removeVpnProxy();
  } else {
    setVpnProxy("vpn_server_ip", 8080);
  }
});
