const { network } = require("hardhat");
const { FhenixClient, EncryptionTypes, getPermit } = require("fhenixjs");

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
require("dotenv").config();
//const { verify } = require("../utils/verify");
const { ethers, deployments } = hre;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // Initialize FhenixClient
  const client = new FhenixClient({ provider: ethers.provider });
  // when going for localhost or hardhat network we want to use a mock
  const tester = await deploy("MintableERC", {
    from: deployer,
    args: [],
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

  console.log("Contract deployed to address: " + tester.address);};

  module.exports.tags = ["ERC20Token"];