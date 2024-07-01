const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const AMOUNT = ethers.parseEther("0.5");

async function getWeth() {
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  // call the deposit function on the weth contract
  // abi through compiling, contract address
  // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 -- MAINNET ADDRESS

  const chainId = network.config.chainId;
  const wethContractAddress = networkConfig[chainId].wethContractAddress;

  console.log(`Connecting the signer to the Wrapped ETH contract...`);
  const iWeth = await ethers.getContractAt(
    "IWeth",
    wethContractAddress,
    signer
  );

  // console.log(iWeth);

  console.log(`Converting ETH to WETH...`);
  const tx = await iWeth.deposit({ value: AMOUNT });
  //   const tx = await iWeth.deposit.value(AMOUNT)();
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(signer.address);
  console.log(`Got Weth balance ${wethBalance.toString()} `);
}

module.exports = { getWeth, AMOUNT };
