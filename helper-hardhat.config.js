const networkConfigs = {
    33556: {
        name: "hardhat",
        gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
        callbackGasLimit: 500000,
    },
    11155111: {
        name: "sepolia",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
        callbackGasLimit: 2500000,
        subId: '64365438307174286687954472723470254802844915626198274951546571835152505330037',
    }
};

const deploymentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfigs,
    deploymentChains
};
