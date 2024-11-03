# RAFFLE
This Raffle is a lottery game for people can join in ethereum blockchain

# Before prepare:
- The first prepare a address with some eth on sepolia chain and faucet some LINK from faucets["https://faucets.chain.link/"]
- Create a `.env` file and setup with your variables
```
SEP_RPC_URL="https://sepolia.infura.io/v3/06bda54ee0f34a24bc30d4d24ef3d3e7"
PRIVATE_KEY=""
ETHERSCAN_API_KEY=
```

# After that:
- Run `yarn` command initialze library.
- Run `yarn hardhat deploy --network sepolia` to deploy contract on sepolia chain.
- Go to chainlink["https://vrf.chain.link/"] and register a VRF, you will get a subscriptionId. Add consumer is your deployed contract.
- You need get contract address just deployed and go to chainlink["https://automation.chain.link/"] for register a upkeeper. Add fund is LINK to your keeper.
- Makesure your keeper call to `checkUpkeep` each time you setup.
  
# Last:
- Run `yarn hardhat test --network sepolia`
- It will be add fund to join raffle and after invertal time it will choose a winner.
