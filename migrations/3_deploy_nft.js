const NFT = artifacts.require("NFT")

module.exports = async (deployer) => {
  await deployer.deploy(NFT, "My NFT", "MNFT");
  const NFTInstance = await NFT.deployed();
  console.log(`Token deployed at ${NFTInstance.address}`);
}
