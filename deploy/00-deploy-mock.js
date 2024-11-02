const { network, ethers } = require("hardhat");
const { deploymentChains } = require("../helper-hardhat.config");

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

module.exports = async ({
    getNamedAccounts,
    deployments
}) => {
    console.log('-----Deploying------');
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const networkName = network.name;
    if (deploymentChains.includes(networkName)) {
        log(`Current running on local chain: ${networkName}`);
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args:[BASE_FEE, GAS_PRICE_LINK],
        });
        log('Mock deployed !!!');
    }
}

module.exports.tags = ['all', 'mocks'];
