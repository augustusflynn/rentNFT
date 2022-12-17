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
  packPrice,
  takeFee
} = require("./utils");

/**
 * TODO TASKS
 *
 * [x] Mint NFT
 * [x] Lending NFT
 * [x] user B: Renting NFT
 * [x] user A: Can't claim collateral
 * [x] system: Moving block time
 * CASE 1: User B return NFT
 * [x] user B: Return NFT
 * [x] user A: Stop lending
 * CASE 2: User B didn't return NFT
 * [x] user A: Claiming collateral
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
  const SECONDS_IN_A_DAY = new BN(86400);
  const MINT_AMOUNT = 100000000;
  const MINT_AMOUNT_WEI = utils.toWei(MINT_AMOUNT.toString(), "ether");

  let TokenInstance, NFTInstance, ResolverInstance, ReNFTInstance;
  let lastestNFTId, lastestLendingId, rentedAt;

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
      }
    );
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

  it("Lending", async () => {
    // Mint NFT
    await NFTInstance.mint(1, {
      from: userA
    });
    let _lastestNFTId = await NFTInstance.tokenCounter();
    lastestNFTId = parseInt(_lastestNFTId.toString()) - 1;
    await NFTInstance.approve(
      ReNFTInstance.address,
      lastestNFTId,
      {
        from: userA
      }
    );
    await lend({
      tokenId: lastestNFTId
    });
  })

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

    const balanceOfUserBBefore = await TokenInstance.balanceOf(userB);

    let rentTx = await ReNFTInstance.rent(
      NFTInstance.address,
      lastestNFTId,
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
    rentedAt = await time.latest();

    const balanceOfUserBAfter = await TokenInstance.balanceOf(userB);
    const distanceAmt = balanceOfUserBAfter.sub(balanceOfUserBBefore);
    console.info("balance before: ", balanceOfUserBBefore.toString())
    console.info("balance after: ", balanceOfUserBAfter.toString())
    const isValid = totalFee.sub(distanceAmt).gte(new BN(0));
    assert(isValid, "renting nft::something went wrong with pricing");
  });

  it("Should claim collateral fail", async () => {
    try {
      await ReNFTInstance.claimCollateral(
        NFTInstance.address,
        lastestNFTId,
        lastestLendingId,
        {
          from: userA
        }
      );
      assert(false);
    } catch (error) {
      console.info("Should catch claim fail: ", error);
      assert(true);
    }
  });

  // /** CASE 1 */
  // it("System moves block time 10 hours", async () => {
  //   const latestTime = await time.latest();
  //   console.info("latestTime", latestTime.toString());

  //   const aDayAfterTime = (latestTime).add(time.duration.hours(10));
  //   await time.increaseTo(aDayAfterTime);
  //   console.info("aDayAfterTime", aDayAfterTime.toString());

  //   const isBlockMoved = aDayAfterTime.gte(latestTime);
  //   assert(isBlockMoved);
  // });

  // it("Return NFT", async () => {
  //   const balanceOfUserABefore = await TokenInstance.balanceOf(userA);
  //   const balanceOfUserBBefore = await TokenInstance.balanceOf(userB);

  //   const approveTx = await NFTInstance.approve(
  //     ReNFTInstance.address,
  //     lastestNFTId,
  //     {
  //       from: userB
  //     }
  //   );

  //   expectEvent(approveTx, "Approval", {
  //     owner: userB,
  //     approved: ReNFTInstance.address,
  //     tokenId: new BN(lastestLendingId)
  //   });

  //   const returnNFTTx = await ReNFTInstance.returnIt(
  //     NFTInstance.address,
  //     new BN(lastestNFTId),
  //     new BN(lastestLendingId),
  //     {
  //       from: userB
  //     }
  //   );

  //   expectEvent(returnNFTTx, "Returned", {
  //     lendingId: new BN(lastestLendingId)
  //   });


  //   const rentPrice = utils.toWei(new BN(2), "ether");
  //   const totalRenterPmtWoCollateral = new BN(MAX_RENT_DURATION).mul(rentPrice);
  //   const LENT_AMOUNT = 1;
  //   const nftFee = new BN(LENT_AMOUNT).mul(utils.toWei(new BN(3), "ether"));
  //   const secondsSinceRentStart = new BN(await time.latest()).sub(rentedAt);

  //   let sendLenderAmt = secondsSinceRentStart.mul(rentPrice).div(SECONDS_IN_A_DAY);
  //   let sendRenterAmt = totalRenterPmtWoCollateral.sub(sendLenderAmt);
  //   const fee = await ReNFTInstance.rentFee();
  //   const takenFee = takeFee(sendLenderAmt, fee);

  // sendRenterAmt = sendRenterAmt.add(nftFee).sub(sendLenderAmt);
  //   sendLenderAmt = sendLenderAmt.sub(takenFee);

  //   const balanceOfUserAAfter = await TokenInstance.balanceOf(userA);
  //   const balanceOfUserBAfter = await TokenInstance.balanceOf(userB);

  //   console.info("distance balance user A", balanceOfUserAAfter.sub(balanceOfUserABefore).toString());
  //   console.info("sendLenderAmt", sendLenderAmt.toString());

  //   console.info("distance balance user B", balanceOfUserBAfter.sub(balanceOfUserBBefore).toString());
  //   console.info("sendRenterAmt", sendRenterAmt.toString());
  //   assert(true);
  // });

  // it("Stop lending", async () => {
  //   const ownerOfBefore = await NFTInstance.ownerOf(lastestNFTId);
  //   assert(ownerOfBefore === ReNFTInstance.address, "owner before is invalid");
  //   const stopLendingTx = await ReNFTInstance.stopLending(
  //     NFTInstance.address,
  //     new BN(lastestNFTId),
  //     new BN(lastestLendingId),
  //     {
  //       from: userA
  //     }
  //   );

  //   expectEvent(stopLendingTx, "LendingStopped", {
  //     lendingId: new BN(lastestLendingId)
  //   });

  //   const ownerOfAfter = await NFTInstance.ownerOf(lastestNFTId);
  //   assert(ownerOfAfter === userA, "owner after is invalid");
  // });
  // /** END OF CASE 1 */


  /** CASE 2 */
  it("System moves block time 1 day", async () => {
    const latestTime = await time.latest();
    console.info("latestTime", latestTime.toString());

    const aDayAfterTime = (latestTime).add(time.duration.days(2));
    await time.increaseTo(aDayAfterTime);
    console.info("aDayAfterTime", aDayAfterTime.toString());

    const isBlockMoved = aDayAfterTime.gte(latestTime);
    assert(isBlockMoved);
  });

  it("Should claim collateral successfully", async () => {
    const balanceOfUserABefore = await TokenInstance.balanceOf(userA);

    const rentFee = new BN(MAX_RENT_DURATION).mul(utils.toWei(new BN(2), "ether"));
    const LENT_AMOUNT = 1;
    const nftFee = new BN(LENT_AMOUNT).mul(utils.toWei(new BN(3), "ether"));
    const totalRentingFee = rentFee.add(nftFee);
    const fee = await ReNFTInstance.rentFee();
    const takenFee = takeFee(totalRentingFee, fee);
    const expectingEarnedAmt = totalRentingFee.sub(takenFee);

    let claimingTx = await ReNFTInstance.claimCollateral(
      NFTInstance.address,
      lastestNFTId,
      lastestLendingId,
      {
        from: userA
      }
    );

    expectEvent(claimingTx, "CollateralClaimed", {
      lendingId: new BN(lastestLendingId)
    });

    const balanceOfUserAAfter = await TokenInstance.balanceOf(userA);
    const distanceAmt = balanceOfUserAAfter.sub(balanceOfUserABefore);
    console.info("taken fee", takenFee.toString());
    console.info("balance before: ", balanceOfUserABefore.toString());
    console.info("balance after: ", balanceOfUserAAfter.toString());
    const isValid = expectingEarnedAmt.sub(distanceAmt).gte(new BN(0));
    assert(isValid, "something went wrong with calculation earned amount");
  });
  /** END OF CASE 2 */
});