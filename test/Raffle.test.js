const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { deploymentChains } = require("../helper-hardhat.config");
const chai = require("chai")
const { assert, expect } = require("chai");
const { beforeEach, it } = require("mocha");
const { solidity } = require("ethereum-waffle")
chai.use(solidity);


!deploymentChains.includes(network.name) ?
    describe.skip :
    describe("Raffle uint test", async () => {
        let raffle, vrfCoordinatorV2Mock;
        let raffleEntranceFee = ethers.utils.parseEther("0.02");
        const interval = 30;

        beforeEach(async () => {
            const { deployer } = await getNamedAccounts();
            await deployments.fixture('all');

            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock", deployer);
            raffle = await ethers.getContract("Raffle", deployer);
        });

        describe("constructor", async () => {
            it("Initialize the raffle correctly", async () => {
                const raffleState = await raffle.getRaffleState();
                const intervalState = await raffle.getInterval();
                assert.equal(intervalState, interval);
                assert.equal(raffleState, 0);
            });
        });

        describe("enterRaffle", () => {
            it("Revert when don't enough ETH", async () => {
                await expect(
                    raffle.enterRaffle({ value: 0 })
                ).to.be.reverted
            });

            it("emit events on enter", async () => {
                await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                    raffle,
                    "RaffleEnter"
                );
            });
        });

        describe("fulfillRandomWords", function () {
            beforeEach(async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval + 1]);
                await network.provider.send("evm_mine", []);
            });

            it("can only be called after performUpkeep", async () => {
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                ).to.be.revertedWith("InvalidRequest");
            });
        });

        describe("checkUpkeep", function () {
            it("returns false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval - 5]);
                await network.provider.request({ method: "evm_mine", params: [] });
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
                assert(!upkeepNeeded);
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval + 1]);
                await network.provider.request({ method: "evm_mine", params: [] });
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
                assert(upkeepNeeded);
            })
        })

        describe("performUpkeep", function () {
            it("can only run if checkupkeep is true", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval + 1]);
                await network.provider.request({ method: "evm_mine", params: [] });
                const tx = await raffle.performUpkeep("0x");
                assert(tx);
            })
            it("reverts if checkup is false", async () => {
                await expect(raffle.performUpkeep("0x")).to.be.revertedWith(
                    "Raffle_NoNeededUpgrade"
                );
            })
            it("updates the raffle state and emits a requestId", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval + 1]);
                await network.provider.request({ method: "evm_mine", params: [] });
                const txResponse = await raffle.performUpkeep("0x");
                const txReceipt = await txResponse.wait(1);
                const requestId = txReceipt.events[1].args.requestId;
                console.log(requestId);
                assert(requestId > 0);
            })
        })
    });