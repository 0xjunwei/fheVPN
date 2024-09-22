'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  VStack,
  HStack,
  Text,
  Box,
  ChakraProvider,
} from "@chakra-ui/react"

const contractABI = [
  "function _currServerCount() public view returns (uint256)",
  "function _serverCountryList(uint256) public view returns (string)"
]

const contractAddress = "0x289cE92A4350D84e9106ba426A2A12C28d75Abe1"
const rpcUrls = [
  "https://api.helium.fhenix.zone",
  "https://rpc.fhenix.zone",
  "https://fhenix-rpc.publicnode.com",
]

function FhenixContractUI() {
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [serverCount, setServerCount] = useState<number>(0)
  const [serverLocations, setServerLocations] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const initProvider = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    for (const rpcUrl of rpcUrls) {
      try {
        let web3Provider: ethers.providers.Provider

        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
          web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        } else {
          web3Provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        }

        // Test the provider by making a simple call
        await web3Provider.getNetwork()

        setProvider(web3Provider)
        const contract = new ethers.Contract(contractAddress, contractABI, web3Provider)
        setContract(contract)

        await fetchContractData(contract)
        setIsLoading(false)
        return // Exit the loop if successful
      } catch (error) {
        console.error(`Failed to initialize provider with RPC ${rpcUrl}:`, error)
      }
    }

    setIsLoading(false)
    setError("Failed to initialize provider. Please check your network connection and try again.")
  }, [])

  useEffect(() => {
    initProvider()
  }, [initProvider])

  const connectWallet = async () => {
    if (!provider) {
      setError("Provider is not initialized. Please refresh the page and try again.")
      return
    }

    try {
      if (provider instanceof ethers.providers.Web3Provider) {
        await (provider as ethers.providers.Web3Provider).send("eth_requestAccounts", [])
        const signer = (provider as ethers.providers.Web3Provider).getSigner()
        const connectedContract = contract?.connect(signer) || null
        setContract(connectedContract)
        setIsConnected(true)
        setError(null)
        if (connectedContract) {
          await fetchContractData(connectedContract)
        }
      } else {
        setError("MetaMask is not available. Using read-only mode with RPC provider.")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setError("Failed to connect wallet. Please try again.")
    }
  }

  const fetchContractData = async (contractToUse: ethers.Contract) => {
    try {
      const count = await contractToUse._currServerCount()
      setServerCount(count.toNumber())

      const locations = []
      for (let i = 0; i < count; i++) {
        const location = await contractToUse._serverCountryList(i)
        locations.push(location)
      }
      setServerLocations(locations)
    } catch (error) {
      console.error("Failed to fetch contract data:", error)
      setError("Failed to fetch contract data. Please check your network connection and try again.")
    }
  }

  const retryConnection = () => {
    setIsLoading(true)
    setError(null)
    initProvider()
  }

  return (
    <Card maxW="4xl" mx="auto">
      <CardHeader>
        <Heading size="lg">Fhenix Network Smart Contract UI</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <HStack justify="center">
              <Spinner />
              <Text>Initializing...</Text>
            </HStack>
          ) : (
            <>
              <HStack justify="space-between">
                <Button onClick={connectWallet} isDisabled={!provider || isConnected}>
                  {isConnected ? "Wallet Connected" : "Connect Wallet"}
                </Button>
                <Button onClick={retryConnection} variant="outline">
                  Retry Connection
                </Button>
              </HStack>
              <Box>
                <Text fontWeight="bold">Total Servers: {serverCount}</Text>
              </Box>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Server ID</Th>
                    <Th>Location</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {serverLocations.map((location, index) => (
                    <Tr key={index}>
                      <Td>{index}</Td>
                      <Td>{location}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function Home() {
  return (
    <ChakraProvider>
      <FhenixContractUI />
    </ChakraProvider>
  )
}
