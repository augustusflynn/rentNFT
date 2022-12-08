const Token = artifacts.require("Token");
const NFT = artifacts.require("NFT");
const Resolver = artifacts.require("Resolver");
const ReNFT = artifacts.require("ReNFT");
const { expect, assert } = require("chai");

/**
 * TODO TASKS
 * 
 * AUTO CALL AFTER EACH CASE
 * [] Mint NFT
 * [] Lending reNFT
 * 
 * CASE 1
 * [] user B: Renting NFT
 * [] user A: Claiming collateral
 * [] user A: Cannot take NFT back
 * 
 * CASE 2
 * [] user B: Renting NFT
 * [] user A: Claiming collateral
 * [] system: Moving block time
 * [] user A: Taking NFT back
 *
 * CASE 3
 * [] user B: Renting NFT
 * [] user A: Claiming collateral
 * [] system: Moving block time
 * [] user B: Paying for fee
 * [] user A: Cannot take NFT back
 * [] user B: Stop renting
 * [] user A: Taking NFT back
 *  
 * CASE 4
 * [] user A: Stop lending
 * [] user B: Cannot rent NFT
 *  
 */
contract("ReNFT", function (accounts) {
  const resolverWallet = accounts[9];
  const beneficiaryWallet = accounts[9];
  const reNFTHolderWallet = accounts[9];

  let TokenInstance, NFTInstance, ResolverInstance, ReNFTInstance;
  const utils = web3.utils;

  before("should set up before test", async () => {
    TokenInstance = await Token.deployed();
    NFTInstance = await NFT.deployed();
    ResolverInstance = await Resolver.deployed();
    ReNFTInstance = await ReNFT.deployed();
  });

  it("Should deploy contracts successfully", () => {
    assert.notEqual(ReNFTInstance.address, null);
    assert.notEqual(ReNFTInstance.address, undefined);
    assert.notEqual(ReNFTInstance.address, "0x0");
    assert.notEqual(ReNFTInstance.address, "");
  });
})
