
## Table of content

- [🖼️ What is ReNFT](#🖼️-what-is-renft)
  - [🖼️🌊 Flow](#🖼️🌊-flow)
- [🤏🏻 ReNft contract spec](#🤏🏻-renft-contract-spec)
  - [🤏🏻👨🏻‍💻 Events](#🤏🏻👨🏻‍💻-events)
  - [🤏🏻👩🏽‍✈️ Functions](#🤏🏻👩🏽‍✈️-functions)
  - [🤏🏻👩🏽‍✈️ Usage](#🤏🏻👩🏽‍✈️-usage)

## 🖼️ What is ReNFT

ReNFT is an Ethereum protocol for ERC-721 and ERC-1155 lending and renting. The protocol is incredibly minimalistic.
The core contract is implemented in `src/ReNFT.sol`, you can find the interface in `src/Interface/IReNFT.sol`.


### 🖼️🌊 Flow

1. Lender specifies a number of parameters

   a. maximum number of days that his NFT can be rented out for

   **why?** we don't want renters to hold on to NFTs for too long

   b. daily rent price

   c. NFT price. In case the NFT is not returned, the lender is entitled to claim the collateral

   d. payment token. The lender receives rent payments in this token. Collateral is priced in this token, as well.

2. Lender lends NFT(s)

3. Renter agrees to the terms and pays **full collateral** and **all of the rent** up front

4. Step 5 or Step 6 below

5. Renter returns in time

   4a. Unused rent amounts + collateral gets returned to the renter

   4b. NFT(s) is/are returned to the lender and deposited back into the ReNFT contract

   **why?** so that the lender does not have to re-deposit the NFT(s) back for lending

6. Renter does no return in time

   5a. Lender claims the collateral

   5b. Collateral along with full rent payment gets sent to the lender

## 🤏🏻 **ReNFT contract spec**

### 🤏🏻👨🏻‍💻 **_Events_**

`Lent` - when an NFT(s) is/are lent.

`Rented` - when an NFT(s) is/are rented out.

`Returned` - when an NFT(s) is/are returned by the renter back into ReNFT contract.

`CollateralClaimed` - when the renter fails to return the NFT(s) in time, lender can claim collateral. Emmitted when lender claimed this collateral(s).

`LendingStopped` - lender can stop lending their NFT(s), these will be sent from the ReNFT contract back to the lender.

### 🤏🏻👩🏽‍✈️ **_Functions_**

`lend` - lend some/all of your NFTs. These get sent to ReNFT contract for escrow, until the renter is found.

`rent` - rent one/many ERC721/ERC1155 NFTs from the users that have lent them, and which reside in ReNFT for escrow.

`returnIt` - return one/all of the rented ERC721/ERC1155 NFTs before the deadline.

`claimCollateral` - called by lender if the renter missed their return date.

`stopLending` - called by lender to release their lent NFT back to them. This marks end of the interaction with ReNFT smart contract.

### 🤏🏻👩🏽‍✈️ **_Usage_**

The below is a simple example of lending an ERC721, note that the amount is ignored, you will always lend 1 unit of ERC721 token.

```javascript
import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider("API_URL", 1);
const signer = new ethers.Wallet("WALLET_PRIVATE_KEY", provider);
const abi = [ /*....*/ ];
const reNFTInstance = new ethers.Contract("address", abi, signer);

const main = async () => {
  const nftAddress = '0xCDf60B46Fa88e74DE7e1e613325E386BFe8609ad';
  const tokenId = '3';
  const lendAmount = 1; // for ERC721, this is ignored
  const maxRentDuration = 1;  // in days (can be returned earlier)
  const dailyRentPrice = 1.1; // this will automatically scale
  const nftPrice = 2.2; // this will automatically scale
  const paymentToken = "USDT"; // depending on what are tokens did admin set in contract Resolver

  const txn = await reNFTInstance.lend(
    nftAddress,
    tokenId,
    lendAmount,
    maxRentDuration,
    dailyRentPrice,
    nftPrice,
    paymentToken
  );

  const receipt = await txn.wait();
  return receipt;
};

main()
  .then(receipt => {
    console.info('receipt', receipt);
  })
  .catch(e => {
    console.error(__filename, e);
  });
```

For more usage examples, see `test/unit/reNFT.js`