'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { EncryptionTypes, FhenixClient } from 'fhenixjs';

export const useServers = (rpcUrl: string, proxyLocationAddress: string, proxyLocationABI: any) => {
  const [serverCount, setServerCount] = useState<number>(0);
  const [servers, setServers] = useState<{ id: number; country: string }[]>([]);
  const [error, setError] = useState<string>('');

  const fetchServers = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: 'Fhenix Helium',
      });
      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, provider);
      const count = await contract._currServerCount();
      setServerCount(Number(count));

      const serverList: { id: number; country: string }[] = [];
      for (let i = 0; i < count; i++) {
        const country = await contract._serverCountryList(i);
        serverList.push({ id: i, country });
      }
      setServers(serverList);
    } catch (err) {
      setError(`Failed to fetch servers ${err}`);
    }
  };

  return { serverCount, servers, fetchServers, error };
};

export const useServerOperations = (rpcUrl: string, proxyLocationAddress: string, proxyLocationABI: any) => {
  const [error, setError] = useState<string>('');

  const addServer = async (account: string, costToLoan: string, country: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: 'Fhenix Helium',
      });
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, signer);
      const tx = await contract.addServer(192, 168, 1, 1, ethers.parseEther(costToLoan), account, country);
      await tx.wait();
      setError('');
    } catch (err) {
      setError(`Failed to add server ${err}`);
    }
  };

  return { addServer, error };
};


export const usePayForServerAccess = (
  rpcUrl: string,
  proxyLocationAddress: string,
  proxyLocationABI: any,
) => {
  const [error, setError] = useState<string>('');

  const payForServerAccess = async (
    account: string,
    serverId: number,
    clientIP: { firstOctet: number; secondOctet: number; thirdOctet: number; fourthOctet: number },
  ) => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: 'Fhenix Helium',
      });
      const client = new FhenixClient({ provider });
      const signer = await provider.getSigner(account);
      const contract = new ethers.Contract(proxyLocationAddress, proxyLocationABI, signer);

      // Encrypt each octet of the client IP address
      const encryptedFirstOctet = await client.encrypt(clientIP.firstOctet, EncryptionTypes.uint8);
      const encryptedSecondOctet = await client.encrypt(clientIP.secondOctet, EncryptionTypes.uint8);
      const encryptedThirdOctet = await client.encrypt(clientIP.thirdOctet, EncryptionTypes.uint8);
      const encryptedFourthOctet = await client.encrypt(clientIP.fourthOctet, EncryptionTypes.uint8);

      // Call the contract method with encrypted IP address
      const tx = await contract.payServerForAccess(
        encryptedFirstOctet,
        encryptedSecondOctet,
        encryptedThirdOctet,
        encryptedFourthOctet,
        serverId,
      );
      await tx.wait();
      alert('Payment successful, you will receive the VPN access soon.');
    } catch (err) {
      setError(`Failed to pay for server access. ${err}`);
    }
  };

  return { payForServerAccess, error };
};
