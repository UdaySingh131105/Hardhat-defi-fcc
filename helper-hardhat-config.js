const { ethers } = require("hardhat");

const networkConfig = {
  11155111: {
    name: "Sepolia",
    ETH_USD_PriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    vrfCoordinatorAddress: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    keyHash:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId:
      "105752341827482583864337633755448387871087161753199591116132016548161125172134",
    entranceFee: ethers.parseEther("0.01"),
    callBackGasLimit: "300000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.parseEther("100"),
    vrfCoordinatorAddress: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    keyHash:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId: "",
    callBackGasLimit: "500000",
    interval: "30",
    wethContractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    poolAddressProviderAddress: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
    DAI_ETH_Price_Feed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
    DAI_Token_Address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
