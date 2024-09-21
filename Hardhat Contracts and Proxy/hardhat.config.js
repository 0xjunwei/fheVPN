require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const CLIENT_PRIVATE_KEY = process.env.CLIENT_PRIVATE_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    fhenix: {
      url: "https://api.helium.fhenix.zone",
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
      blockConfirmations: 1,
    },
  },
  solidity: "0.8.24",
  etherscan: {
    apiKey: {
      fhenix: "8008135",
    },
    customChains: [
      {
        network: "fhenix",
        chainId: 8008135,
        urls: {
          browserURL: "https://explorer.helium.fhenix.zone",
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 500000,
  },
  sourcify: {
    enabled: true,
  },
};
