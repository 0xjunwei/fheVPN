const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const {
  FhenixClient,
  EncryptionTypes,
  getPermit,
  EncryptedUint8,
  EncryptedType,
} = require("fhenixjs");
describe("ProxyLocation", async function () {
  let deployer;

  before(async function () {
    // deploy Proofers
    // using hardhat-deploy
    // get accounts from ethers
    console.log("Testing deploy of ProxyLocation script");
    deployer = await getNamedAccounts();
    deployerAddress = deployer.deployer;
    await deployments.fixture(["ProxyLocation"]);
    const paymentTokenAddress = "0x5Cbe12A6fC98764a063225DF7D49a901068A0cF1";
    proxyContract = await ethers.deployContract(
      "ProxyLocation",
      [paymentTokenAddress],
      {}
    );
    proxyContractAddress = await proxyContract.getAddress();
  });
});
