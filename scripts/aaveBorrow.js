const { ethers, network } = require("hardhat");
const { getWeth, AMOUNT } = require("./getWETH");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
  await getWeth();
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const chainId = network.config.chainId;
  const poolAddressProviderAddress =
    networkConfig[chainId].poolAddressProviderAddress;
  const wethContractAddress = networkConfig[chainId].wethContractAddress;
  const daiTokenAddress = networkConfig[chainId].DAI_Token_Address;

  // Pool Address Provider : 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e

  const lendingPool = await getLendingPool(signer, poolAddressProviderAddress);

  console.log(`Lending pool address ${lendingPool.target}`);

  console.log(`Requesting Approval...`);
  await approveERC20(wethContractAddress, lendingPool.target, AMOUNT, signer);

  // depositing
  console.log(`depositing...`);
  await lendingPool.deposit(wethContractAddress, AMOUNT, signer, 0);
  console.log("Deposited!");

  // borrow
  let {
    totalCollateralBase,
    totalDebtBase,
    availableBorrowsBase,
    currentLiquidationThreshold,
    ltv,
    healthFactor,
  } = await getBorrowUserData(lendingPool, signer);

  const daiPrice = await getPriceFeed();

  const ammountDaiToBorrow =
    daiPrice.toString() * 0.95 * (1 / Number(daiPrice));
  console.log(`Ammount of DAI Which Can Be borrowed ${ammountDaiToBorrow}`);
  const ammountDaiToBorrowWEi = ethers.parseEther(
    ammountDaiToBorrow.toString()
  );

  await borrowDai(daiTokenAddress, lendingPool, ammountDaiToBorrowWEi, signer);
  await getBorrowUserData(lendingPool, signer);
  await repay(daiTokenAddress, ammountDaiToBorrowWEi, lendingPool, signer);
  await getBorrowUserData(lendingPool, signer);
}

async function repay(daiAddress, ammount, lendingPool, account) {
  await approveERC20(daiAddress, lendingPool.target, ammount, account);
  const repayTx = await lendingPool.repay(daiAddress, ammount, 2, account);
  await repayTx.wait(1);
  console.log("Repay Successfull!");
}

async function borrowDai(
  daiAddress,
  lendingPool,
  ammountDaiToBorrowWEi,
  account
) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    ammountDaiToBorrowWEi,
    2,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("Borrow Transaction SuccessFull!!");
}

async function getPriceFeed() {
  const chainId = network.config.chainId;
  const DAI_ETH_Price_Feed = networkConfig[chainId].DAI_ETH_Price_Feed;

  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    DAI_ETH_Price_Feed
  );
  const priceFeed = await daiEthPriceFeed.latestRoundData();
  const price = priceFeed[1];
  console.log(`DAI Price Feed DAI/ETH ${price.toString()}`);
  return price;
}

async function getBorrowUserData(lendingPool, account) {
  const {
    totalCollateralBase,
    totalDebtBase,
    availableBorrowsBase,
    currentLiquidationThreshold,
    ltv,
    healthFactor,
  } = await lendingPool.getUserAccountData(account.address);

  console.log(`The Ammount of collateral deposited ${totalCollateralBase}`);
  console.log(`The Ammount  borrowed ${totalDebtBase}`);
  console.log(`The Ammount that can be borrowed ${availableBorrowsBase}`);

  return {
    totalCollateralBase,
    totalDebtBase,
    availableBorrowsBase,
    currentLiquidationThreshold,
    ltv,
    healthFactor,
  };
}

async function getLendingPool(account, poolAddressProviderAddress) {
  const LendingPoolAddressProvider = await ethers.getContractAt(
    "IPoolAddressesProvider",
    poolAddressProviderAddress,
    account
  );

  const lendingPoolAddress = await LendingPoolAddressProvider.getPool();

  const lendingPool = await ethers.getContractAt(
    "IPool",
    lendingPoolAddress,
    account
  );

  return lendingPool;
}

async function approveERC20(
  contratAddress,
  spenderAddress,
  ammountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    contratAddress,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, ammountToSpend);
  await tx.wait(1);
  console.log("Approved!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
