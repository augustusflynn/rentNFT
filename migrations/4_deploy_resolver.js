const Resolver = artifacts.require("Resolver");
const Token = artifacts.require("Token");

module.exports = async function (deployer, _, accounts) {
  await deployer.deploy(
    Resolver,
    accounts[9],
    {
      from: accounts[9]
    }
  );
  const ResolverInstance = await Resolver.deployed();
  console.log(`Resolver deployed at ${ResolverInstance.address}`);
  const TokenInstance = await Token.deployed();
  // set Token address for Resolver
  await ResolverInstance.setPaymentToken(
    await TokenInstance.symbol.call(),
    TokenInstance.address,
    {
      from: accounts[9]
    }
  );
  console.log(`Resolver done!!`);
};
