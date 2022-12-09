const { BN, ether, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');

contract('Test Simulation Block', function (accounts) {
  // before(async function () {
  //   // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
  //   await time.advanceBlock();
  // });

  // it("Simulate block time", async () => {
  //   this.latestTime = await time.latest();
  //   console.info("latestTime", this.latestTime.toString());

  //   const aWeekAfter = (this.latestTime).add(time.duration.weeks(1));
  //   await time.increaseTo(aWeekAfter);
  //   this.latestTime = await time.latest();
  //   console.info("latestTime", this.latestTime.toString());

  //   assert.equal(1, 1);
  // });

  // it("Simulate block number", async () => {
  //   this.latestBlock = await time.latestBlock();
  //   console.info("latestBlock", this.latestBlock.toString());

  //   const nextBlock = (this.latestBlock).add(new BN(1));
  //   console.info("nextBlock", nextBlock.toString());

  //   await time.advanceBlockTo(nextBlock);
  //   this.latestBlock = await time.latestBlock();
  //   console.info("latestBlock", this.latestBlock.toString());

  //   assert.equal(1, 1);
  // });
});