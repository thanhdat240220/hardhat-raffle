
/** @type import('hardhat/config').HardhatUserConfig */
require("hardhat-gas-reporter");
require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers");
require('hardhat-contract-sizer');
require('@nomicfoundation/hardhat-verify');
require('dotenv').config();

const sepolia_RPC_URL = process.env.SEP_RPC_URL;
const account_1_private_key = process.env.PRIVATE_KEY;
const etherscan_api_key = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.27",
      },
      {
        version: "0.8.19",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 33556,
      blockConfirmations: 1
    },
    sepolia: {
      url: sepolia_RPC_URL,
      accounts: [
        account_1_private_key
      ],
      chainId: 11155111,
      blockConfirmations: 1
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  },
  etherscan: {
    apiKey: etherscan_api_key,
  },
  gasReporter: {
    enabled: false
  },
  mocha: {
    timeout: 100000000
  },
};
