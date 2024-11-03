const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { deploymentChains } = require("../helper-hardhat.config");
const chai = require("chai")
const { assert, expect } = require("chai");
const { beforeEach, it } = require("mocha");
const { solidity } = require("ethereum-waffle")
chai.use(solidity);


deploymentChains.includes(network.name) ?
    describe.skip :
    describe("Raffle unit test", function () {
        let raffle, deployer;
        let raffleEntranceFee = ethers.utils.parseEther("0.02");

        beforeEach(async () => {
            const { deployer } = await getNamedAccounts();
            raffle = await ethers.getContract("Raffle", deployer);
            raffleEntranceFee = raffle.getEntranceFee();
        });

        describe("fulfillRandomWords", () => {
            it("works with chainlink keepers", async () => {
                const startingTimeStamp = await raffle.getLastTimeStamp();
                const accounts = await ethers.getSigners();
                await raffle.enterRaffle({ value: raffleEntranceFee });
                const winnerStartingBalance = accounts[0].getBalance();
                
                await new Promise(async (resolve, reject) => {
                    raffle.once("WinnerChoose", async () => {
                        try {
                            const recentWinner = await raffle.getRecentWinner();
                            const raffleState = await raffle.getRaffleState();
                            const winnerBalance = await accounts[0].getBalance();   
                            const endingTimeStamp = await raffle.getLastTimeStamp();

                            await expect(raffle.getPlayer(0)).to.be.reverted;
                            assert.equal(recentWinner.toString(), accounts[0].address);
                            assert.equal(raffleState, 0);
                            assert.equal(
                                winnerBalance.toString(),
                                winnerStartingBalance + raffleEntranceFee
                            );
                            assert(endingTimeStamp > startingTimeStamp);

                            resolve();
                        } catch (e) {
                            console.log("Exception: ", e);
                            reject(e);
                        }
                    });
                });
                // 
            })
        });
    });