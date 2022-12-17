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
  const symbol = await TokenInstance.symbol.call();
  const address = TokenInstance.address;
  // set Token address for Resolver
  await ResolverInstance.setPaymentToken(
    symbol,
    address,
    {
      from: accounts[9]
    }
  );
  const resolverToken = await ResolverInstance.getPaymentToken(symbol)
  console.log(`Resolver: ${resolverToken} - done!!`);
};
