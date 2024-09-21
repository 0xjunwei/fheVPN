const { network } = require("hardhat");
const { FhenixClient, EncryptionTypes, getPermit } = require("fhenixjs");

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
require("dotenv").config();
//const { verify } = require("../utils/verify");
const { ethers, deployments } = hre;
const ERC20_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) external returns (bool)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool)", // Added transferFrom
];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let signerDeployer = (await ethers.getSigners())[0];
  let admin = (await ethers.getSigners())[1];
  let clientAcc = (await ethers.getSigners())[2];
  const chainId = network.config.chainId;

  // Define the address that you need to pass as a constructor argument
  const paymentTokenAddress = "0x5Cbe12A6fC98764a063225DF7D49a901068A0cF1";
  // Initialize FhenixClient
  const client = new FhenixClient({ provider: ethers.provider });
  // when going for localhost or hardhat network we want to use a mock
  const tester = await deploy("ProxyLocation", {
    from: deployer,
    args: [paymentTokenAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    network.name !== "hardhat" &&
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API
  ) {
    // Not verifying the contract as fhenix network does not support api verification rn
    //console.log("Verifying...");
    // dont
    //await verify(tester.address, []);
  } else {
    console.log(
      "Hardhat network detected or not verifying required, skipping verification."
    );
  }

  console.log("Contract deployed to address: " + tester.address);

  // Interact with the contract
  const contractInstance = await ethers.getContractAt(
    "ProxyLocation",
    tester.address
  );
  // Connect to the payment token (ERC20) contract at paymentTokenAddress
  const paymentTokenContract = await ethers.getContractAt(
    ERC20_ABI,
    paymentTokenAddress
  );
  // Send ETH to the admin account to cover gas fees
  const tx = await signerDeployer.sendTransaction({
    to: admin.getAddress(),
    value: ethers.parseEther("0.1"), // Sending 0.1 ETH for gas fees
  });
  await tx.wait();
  console.log(
    `Sent 0.1 ETH to admin at address ${admin.getAddress()} for gas fees`
  );

  const eFirstOctet = await client.encrypt(172, EncryptionTypes.uint8);
  const eSecondOctet = await client.encrypt(172, EncryptionTypes.uint8);
  const eThirdOctet = await client.encrypt(172, EncryptionTypes.uint8);
  const eFourthOctet = await client.encrypt(172, EncryptionTypes.uint8);
  response0 = await contractInstance.addServer(
    eFirstOctet,
    eSecondOctet,
    eThirdOctet,
    eFourthOctet,
    ethers.parseUnits("100", 6),
    "New York"
  );

  console.log("Added Server to contract");
  // Mint tokens to the admin
  let mintAmount = ethers.parseUnits("10000", 18); // Adjust token amount and decimals accordingly
  let responseMint = await paymentTokenContract.mint(
    admin.getAddress(),
    mintAmount
  );
  console.log("Minted tokens to admin");

  // Approve the ProxyLocation contract to spend tokens on behalf of admin
  let approveAmount = ethers.parseUnits("1000", 18); // Adjust token amount and decimals accordingly
  let responseApprove = await paymentTokenContract
    .connect(admin)
    .approve(tester.address, approveAmount);
  console.log("Admin approved token transfer");

  // Admin pays for server access
  const adminContractInstance = contractInstance.connect(admin);
  let e1FirstOctet = await client.encrypt(172, EncryptionTypes.uint8);
  let e1SecondOctet = await client.encrypt(172, EncryptionTypes.uint8);
  let e1ThirdOctet = await client.encrypt(172, EncryptionTypes.uint8);
  let e1FourthOctet = await client.encrypt(172, EncryptionTypes.uint8);
  response0 = await adminContractInstance.connect(admin).payServerForAccess(
    e1FirstOctet,
    e1SecondOctet,
    e1ThirdOctet,
    e1FourthOctet,
    0 // Server ID
  );
  console.log("Paid server");

  // Getting the permit
  // trying to get a permit and pull out details for privacy as the decryption of data will only happen on frontend not through the SC
  // this ensure only the requester gets the data
  const permit = await getPermit(tester.address, ethers.provider);
  client.storePermit(permit);
  const permission = client.extractPermitPermission(permit);
  response0 = await contractInstance.retrieveClientInfoFirstOctet(
    0,
    admin.getAddress(),
    permission
  );
  const plaintext = client.unseal(tester.address, response0);
  console.log("here:", plaintext.toString());
  // Grant client access
  let response1 = await contractInstance.approveClientToViewServer(
    0,
    admin.getAddress()
  );
};

module.exports.tags = ["ProxyLocation"];
