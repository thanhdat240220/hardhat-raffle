const { run } = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying contract ...");
    try {
        const verify = await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already verified");
        } else {
            console.log(error);
        }
    }
}

module.exports = {
    verify
}
