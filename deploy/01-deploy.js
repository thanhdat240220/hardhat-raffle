const { network, ethers } = require("hardhat");
const { deploymentChains, networkConfigs } = require("../helper-hardhat.config");
const { verify } = require("../utils/verify");

const SUBSCRIPTION_FUND = ethers.utils.parseEther('1');

module.exports = async ({
    getNamedAccounts,
    deployments,
}) => {
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let coordinatorV2Address, 
    subscriptionId,
    interval = 30;

    if (deploymentChains.includes(network.name)) {
        const coordinatorV2Contract = await ethers.getContract('VRFCoordinatorV2Mock');
        coordinatorV2Address = coordinatorV2Contract.address;
        const transactionResponse = await coordinatorV2Contract.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId;
        await coordinatorV2Contract.fundSubscription(subscriptionId, SUBSCRIPTION_FUND);
    } else {
        subscriptionId = networkConfigs[network.config.chainId]['subId'];
        coordinatorV2Address = networkConfigs[network.config.chainId]['vrfCoordinator'];
    }
    
    const entranceFee = ethers.utils.parseEther('0.01');
    const gasLane = networkConfigs[chainId]["gasLane"];
    const callbackGasLimit = networkConfigs[network.config.chainId]['callbackGasLimit'];
    const raffleState = 0;

    const args = [
        coordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        raffleState,
        interval
    ];

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !deploymentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(raffle.address, args);
    }
};

module.exports.tags = ['all', 'raffle'];
