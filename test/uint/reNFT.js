// require('@openzeppelin/test-helpers/configure')({
//   provider: 'http://localhost:8080',
// });
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time
} = require('@openzeppelin/test-helpers');
const Token = artifacts.require("Token");
const NFT = artifacts.require("NFT");
const Resolver = artifacts.require("Resolver");
const ReNFT = artifacts.require("ReNFT");
const {
  decimalToPaddedHexString,
  packPrice,
  takeFee,
  getEvents
} = require("./utils");

/**
 * TODO TASKS
 * 
 * AUTO CALL AFTER EACH CASE
 * [x] Mint NFT
 * [x] Lending NFT
 * 
 * CASE 1
 * [x] user B: Renting NFT
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
  const userA = accounts[0];
  const userB = accounts[1];

  const utils = web3.utils;

  // default values
  const MAX_RENT_DURATION = 1; // 1 day
  const DAILY_RENT_PRICE = packPrice(2);
  const NFT_PRICE = packPrice(3);
  const PAYMENT_TOKEN_MTK = "MTK"; // default token is MTK
  const SECONDS_IN_A_DAY = 86400;
  const MINT_AMOUNT = 100000000;
  const MINT_AMOUNT_WEI = utils.toWei(MINT_AMOUNT.toString(), "ether");

  let TokenInstance, NFTInstance, ResolverInstance, ReNFTInstance;
  let lastestNFT, lastestLendingId;

  before("should set up before test", async () => {
    TokenInstance = await Token.deployed();
    NFTInstance = await NFT.deployed();
    ResolverInstance = await Resolver.deployed();
    ReNFTInstance = await ReNFT.deployed();

    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await time.advanceBlock();

    // mint MTK
    await TokenInstance.mint(
      MINT_AMOUNT,
      {
        from: userB
      });
  });

  const lend = async ({
    tokenId,
    nftAddress = NFTInstance.address,
    amount = 1,
    maxRentDuration = MAX_RENT_DURATION,
    dailyRentPrice = DAILY_RENT_PRICE,
    nftPrice = NFT_PRICE,
    paymentToken = PAYMENT_TOKEN_MTK
  }) => {
    const txn = await ReNFTInstance.lend(
      nftAddress,
      tokenId,
      amount,
      maxRentDuration,
      dailyRentPrice,
      nftPrice,
      paymentToken,
      {
        from: userA
      }
    );
    // Event assertions can verify that the arguments are the expected ones
    expectEvent(txn, 'Lent', {
      nftAddress: NFTInstance.address,
      tokenId: new BN(tokenId),
      lentAmount: new BN(1),
      lenderAddress: userA,
      maxRentDuration: new BN(maxRentDuration),
      dailyRentPrice: dailyRentPrice,
      nftPrice: nftPrice,
      paymentToken: paymentToken
    });
    lastestLendingId = parseInt(txn.logs[0].args.lendingId.toString());
  };

  beforeEach(async () => {
    // Mint NFT
    await NFTInstance.mint(1, {
      from: userA
    });
    let _lastestNFT = await NFTInstance.tokenCounter();
    lastestNFT = parseInt(_lastestNFT.toString()) - 1;
    await NFTInstance.approve(
      ReNFTInstance.address,
      lastestNFT,
      {
        from: userA
      }
    );
    await lend({
      tokenId: lastestNFT
    });
  });

  // it("Lending", async () => {
  //   await lend({
  //     tokenId: lastestNFT
  //   });
  // })

  it("Renting NFT", async () => {
    const rentFee = new BN(MAX_RENT_DURATION).mul(utils.toWei(new BN(2), "ether"));
    const LENT_AMOUNT = 1;
    const nftFee = new BN(LENT_AMOUNT).mul(utils.toWei(new BN(3), "ether"));
    const totalFee = rentFee.add(nftFee);

    let approveTx = await TokenInstance.approve(
      ReNFTInstance.address,
      totalFee,
      {
        from: userB
      }
    );
    expectEvent(approveTx, "Approval", {
      owner: userB,
      spender: ReNFTInstance.address,
      value: totalFee
    });

    let rentTx = await ReNFTInstance.rent(
      NFTInstance.address,
      lastestNFT,
      lastestLendingId,
      MAX_RENT_DURATION,
      {
        from: userB
      }
    );
    expectEvent(rentTx, "Rented", {
      lendingId: new BN(lastestLendingId),
      renterAddress: userB,
      rentDuration: new BN(MAX_RENT_DURATION),
    });
  });
});