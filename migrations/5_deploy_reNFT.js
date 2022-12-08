const ReNFT = artifacts.require("ReNFT");
const Resolver = artifacts.require("Resolver");

module.exports = async function (deployer, _, accounts) {
  const ResolverInstance = await Resolver.deployed();
  deployer.deploy(ReNFT, ResolverInstance, accounts[1], accounts[0]);
};
