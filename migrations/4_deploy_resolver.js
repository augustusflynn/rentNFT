const Resolver = artifacts.require("Resolver");

module.exports = async function (deployer, _, accounts) {
  await deployer.deploy(Resolver, accounts[9]);
  const ResolverInstance = await Resolver.deployed();
  console.log(`Resolver deployed at ${ResolverInstance.address}`);
};
