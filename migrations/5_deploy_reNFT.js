const ReNFT = artifacts.require("ReNFT");
const Resolver = artifacts.require("Resolver");

module.exports = async function (deployer, _, accounts) {
  const ResolverInstance = await Resolver.deployed();
  await deployer.deploy(ReNFT, await ResolverInstance.address, accounts[9], accounts[9]);
  const ReNFTInstance = await ReNFT.deployed();
  console.log(`ReNFT deployed at ${ReNFTInstance.address}`);
};
