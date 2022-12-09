const NFT = artifacts.require("NFT")

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(
    NFT,
    "My NFT",
    "MNFT",
    {
      from: accounts[9]
    }
  );
  const NFTInstance = await NFT.deployed();
  console.log(`NFT deployed at ${NFTInstance.address}`);
}
