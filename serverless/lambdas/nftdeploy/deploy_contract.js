const ethers = require('ethers');
const {providers, wallets, samples} = require('onchain-utils')

const deployContract = async (tokenName,tokenTicker, s3URI) => {
//  retrieve the pvt key from ssm and generate a wallet address
    const provider = await providers.getProvider()
    const myWallet = await wallets.getAWSWallet(provider)

    //create an instance of the contract
    const {abi, bytecode} = samples.baseWithMetadata;
    
    //deploy smart contract
    console.log(tokenName, tokenTicker, s3URI)
    try {
        const factory = new ethers.ContractFactory(abi, bytecode, myWallet);
        const contract = await factory.deploy(tokenName, tokenTicker, s3URI);
        const txid = contract.deployTransaction.hash;

        return { "Transaction id" : txid, "ContractAddress": contract.address}
    } catch (error) {
     return {"Error": error};
    }
}    

module.exports = { deployContract:deployContract }
