import { useState } from 'react';
import { ethers } from 'ethers';

export const useBalance = (rpcUrl: string, mintableERCAddress: string, mintableERCABI: any) => {
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string>('');

  const updateBalance = async (account: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: 8008135,
        name: 'Fhenix Helium',
      });
      const contract = new ethers.Contract(mintableERCAddress, mintableERCABI, provider);
      const balanceRaw = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      setBalance(ethers.formatUnits(balanceRaw, decimals));
    } catch (err) {
      setError(`Failed to fetch balance ${err}`);
    }
  };

  return { balance, updateBalance, error };
};
