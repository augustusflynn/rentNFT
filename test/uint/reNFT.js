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
  /////// userA
  const userA = accounts[9];
  const resolverWallet = accounts[9];
  const beneficiaryWallet = accounts[9];
  const reNFTHolderWallet = accounts[9];
  ///////
  const userB = accounts[0];

  const utils = web3.utils;

  // default values
  const MAX_RENT_DURATION = 1; // 1 day
  const DAILY_RENT_PRICE = packPrice(2);
  const NFT_PRICE = packPrice(3);
  const PAYMENT_TOKEN_MTK = 1; // default token is MTK

  const SECONDS_IN_A_DAY = 86400;
  const ERC20_SEND_AMT = utils.toWei("100000000", "ether");


  let TokenInstance, NFTInstance, ResolverInstance, ReNFTInstance;
  let lastestNFT;

  before("should set up before test", async () => {
    TokenInstance = await Token.deployed();
    NFTInstance = await NFT.deployed();
    ResolverInstance = await Resolver.deployed();
    ReNFTInstance = await ReNFT.deployed();

    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await time.advanceBlock();

    // set Token address for Resolver
    await ResolverInstance.setPaymentToken(
      PAYMENT_TOKEN_MTK,
      TokenInstance.address,
      {
        from: userA
      }
    );

    // mint Token
    await TokenInstance.mint(
      10000000,
      {
        from: userB
      });
  });

  const lendBatch = async ({
    tokenIds,
    nftAddresses = Array(tokenIds.length).fill(NFTInstance.address),
    amounts = Array(tokenIds.length).fill(1),
    maxRentDurations = Array(tokenIds.length).fill(MAX_RENT_DURATION),
    dailyRentPrices = Array(tokenIds.length).fill(DAILY_RENT_PRICE),
    nftPrices = Array(tokenIds.length).fill(NFT_PRICE)
  }) => {
    const txn = await ReNFTInstance.lend(
      nftAddresses,
      tokenIds,
      amounts,
      maxRentDurations,
      dailyRentPrices,
      nftPrices,
      Array(tokenIds.length).fill(PAYMENT_TOKEN_MTK),
      {
        from: userA
      }
    );
    // Event assertions can verify that the arguments are the expected ones
    expectEvent(txn, 'Lent', {
      from: userA
    });
  };

  beforeEach(async () => {
    // Mint NFT
    await NFTInstance.mint(1, {
      from: userA
    });
    let lastestNFTID = await NFTInstance.tokenCounter();
    lastestNFT = parseInt(lastestNFTID.toString());
  });

  it("Lending - Renting", async () => {
    await lendBatch({
      tokenIds: [lastestNFT],
      paymentTokens: [PAYMENT_TOKEN_MTK],
      maxRentDurations: [3],
    });

    // const rentDurations = [2];
    // const balancesPre = await captureBalances([renter, ReNFT], [WETH]);

    // expect(balancesPre[1]).to.be.equal(0);

    // const rentAmounts = BigNumber.from(rentDurations[0]).mul(
    //   await Utils.unpackPrice(DAILY_RENT_PRICE, DP18)
    // );
    // const pmtAmount = (await Utils.unpackPrice(NFT_PRICE, DP18)).add(
    //   rentAmounts
    // );

    // const tx = await ReNFT.rent([E721.address], [1], [1], rentDurations);

    // const balancesPost = await captureBalances([renter, ReNFT], [WETH]);
    // expect(balancesPost[1]).to.be.equal(pmtAmount);
    // expect(balancesPost[0]).to.be.equal(balancesPre[0].sub(pmtAmount));

    // const receipt = await tx.wait();

    // const rentedAt = [(await getLatestBlock()).timestamp];
    // const events = receipt.events ?? [];
    // validateRented({
    //   lendingId: [1],
    //   renterAddress: [renter.address],
    //   rentDuration: [2],
    //   rentedAt,
    //   events,
    // });
  });
})
