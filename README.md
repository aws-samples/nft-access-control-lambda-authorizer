
## Building NFT Metadata Access Control with Ethereum signatures and AWS Lambda Authorizers

This repository contains sample code to authorize requests to NFT metadata based on Ethereum signing capabilities and the use of Lambda authorizers. It provides a reference architecture and uses AWS SAM to provision the relevant resources in order to deploy ERC-721 smart contract as well as mint, and sign messages to access the underline metadata. By using this solution we can ensure that only authorized users (e.g. NFT owner) are able read the NFT metadata contents.

The repo is structured as follows:

```
.
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── images
└── serverless
└── client
└── truffle
```

For more details on how to use this repo please refer to the following [blog](https://amazon.awsapps.com/workdocs/index.html#/document/6dfc57bff85948bac658c802d079d26f627ada75b3dec9db667cfc3d46c203fc).

## Reference architecture

![Architecture](./images/arch.jpeg)

### Pre-requisites

1.	An AWS account with a VPC and a public subnet. Ensure you have permissions to make objects in the S3 bucket public
2.	AWS SAM CLI : Install the AWS SAM CLI.
3.	Node.js: Install Node.js 14, including the npm package management tool.
4.	Docker: Install Docker community edition.


### Deploy the AWS resources

To deploy the core components of the NFT access control architecture, you will use the AWS Serverless Application Model (AWS SAM)  command-line interface tools. To install SAM CLI, reference the [documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html). From the serverless/ directory of the respository, run the following SAM CLI command to deploy the infrastructure:


```bash
cd serverless/ 
sam build
sam deploy --guided --capabilities CAPABILITY_NAMED_IAM
```

To deploy the frontend application that will be used to produce Ethereum signatures, use the following command to deploy locally using React (localhost:3000). To run this application, you must use a modern web browser like Google Chrome with the MetaMask [browser extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) installed and configured. You will be prompted to sign a message with your Ethereum wallet via MetaMask. From the client/ directory of the repository, run:

```bash
cd ../client/
npm i
npm start
```

Please note, if you have not yet installed Node.js or NPM, do so before attempting to run the React app. Use the official documentation for details on installing Node.js/NPM using [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm). 


### Create an Ethereum wallet for deploying your NFT smart contract

To sign and pay for a transaction on the Ethereum Rinkeby network, an Etherum wallet is required. An Ethereum wallet is comprised of a private-public key pair. You can create your own Ethereum wallet programmatically using popular [Ethereum libraries Web3](https://web3js.readthedocs.io/en/v1.5.2/web3-eth-accounts.html) and [Ethers](https://docs.ethers.io/v5/api/signer/#Wallet). 

``NOTE: This method for creating and managing an Ethereum wallet private key is not suitable for production spending keys. Do not use this wallet for mainnet Ether!``

Generate the private key using one of the aforementioned libraries and upload to [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) as an encrypted string under the name ethSystemKey. Make the secure string value excludes the first two characters, 0x, of the private key.

![Ethereum wallet](./images/eth800x400.png)

Add some Ethereum test tokens for the Rinkeby network by entering the Ethereum address generated during wallet creation https://faucet.rinkeby.io/ and requesting test tokens. Special care must be taken with spending keys (private keys), and [AWS Systems Manager](https://aws.amazon.com/systems-manager/) might not be adequate for wallets holding actual funds in some cases.

```Note: If you are having trouble requesting testnet Ether from the Rinkeby faucet above, you may use the Chainlink Faucet (https://faucets.chain.link/rinkeby) to get small amounts of testnet Ether.```

## Step 1: Deploy the NFT smart contract (ERC721)

Once an Ethereum wallet has been created for the backend NFT minting service and funded with testnet Ether, the smart contract that will be used to mint and manage NFTs can be deployed to the Ethereum testnet. First, modify the JSON event deploy.json to define the NFT contract details such as the name, ticker symbol and base URI for the underlying NFT content. The base URI will refer to the endpoint where the metadata files will reside for each NFT minted via this smart contract. 

`Path: nft-access-control >> serverless >> test-events >> deploy.json
`
```
{
    "requestType": "deploy",
    "tokenName": "awsnft",
    "tokenTicker": "MZAN",
    "baseURI": "https://49drke25p0.execute-api.us-east-1.amazonaws.com/nftapi/assets/"
}
```

```bash
curl -X POST https://<api>.execute-api.<region>.amazonaws.com/nftapi -H "Content-Type: application/json" -d @deploy.json
````

Once the smart contract is deployed, you will receive a response containing the transaction hash (ID) and contract address that you will use in the next step to mint an NFT using that smart contract.

## Step 2: Mint an NFT

With the ERC721 smart contract deployed, the _safeMint function can be invoked on the smart contract to mint a new NFT with an incremented unsigned integer token ID. The first NFT created in this smart contract will have a token ID of 0, the second will have a token ID of 1, etc. 

To mint, modify the the mintAddress variable in the mint.json event file. The mintAddress is the Ethereum address that the token ownership is transferred to upon the creation of the NFT. In this case, copy the address from your MetaMask wallet and paste it in as the address to mint to. 

`Path: nft-access-control >> serverless >> test-events >> mint.json`
```
{  
    "requestType": "mint",  
    "contractAddress": "0x857f283f12C44897f24d60c8b2d9586AcbFAA06A",  
    "mintAddress": "{<your Ethereum address>}",  
    "gasLimit": 9000000,  
    "gasPrice": 99999999999,  
    "metadata": {    
        "description": "useful descriptiom",     
        "image": "https://d3i60wwbxl0tk7.cloudfront.net/download.jpeg",     
        "name": "The best nft"  
        }
}

```
![Metamask](./images/metamask.png)

This minting function will mint a new NFT and assign its owner to the Ethereum address copied from your MetaMask wallet, as well as store the metadata attributes defined in mint.json within an S3 bucket for retrieval later. This metadata will only be accessible by the owner of the NFT, and requests to retrieve this metadata will be authenticated by verifying an Ethereum signature from your Ethereum wallet in MetaMask!

## Step 3: Get Metadata URI

In order to retrieve the metadata for your new NFT, you must first retrieve the metadata URI that was set in earlier steps. This metadata URI will point to an API endpoint through which requests for token metadata stored in S3 will be handled. To request the metadata URI, modify the the tokenID variable in the details.json event file. The tokenID is the unsigned integer pertaining to the token you minted in the prior step. 

`Path: nft-access-control >> serverless >> test-events >> details.json`

```
{
    "requestType": "details",
    "contractAddress": "0x49d4336D5b7BE699eCF7f06cC9E277D4D30E384c",
    "tokenID": "0"
}

```
Copy the response, which contains the metadata URI API endpoint concatenated with the token ID provided in the request and save it in a notepad for later. 

## Step 4: Sign message

Using the Ethereum wallet via Metamask that you used to mint the NFT in an earlier step, you will sign a message that will verify that you are the owner of the NFT for which you are requesting metadata for. With the React application running from the earlier setup steps, navigate to localhost:3000 in your web browser. In the textbox, fill in the form with the token ID, metadata ID and smart contract address of your NFT and select “Sign Message”. This will trigger a popup from your MetaMask wallet that will require you to accept the signature request, which once complete, will generate a JSON signature output that can be used to verify your NFT ownership.

![Sign Message](./images/signMessage.png)


## Step 5: Call API to retrieve the metadata info

Finally, you can paste in the URL for your metadata API (defined in deploy.json) to submit a request to retrieve the token metadata for the NFT. The message that was signed with your wallet in the prior step will be used to prove ownership of the NFT and subsequently to authenticate your request for the token metadata. 

![Get Metadata](./images/getMetadata.png)

## Cleanup Steps

To avoid incurring future charges, delete the resources deployed throughout this blog:

1. Empty the S3 bucket which stores the underlying NFT metadata file(s).
2. Delete the ethSystemKey parameter from Secrets Manager Parameter Store.
3. Finally, delete the deployed SAM stack using the SAM CLI:

```bash
cd serverless 
sam delete nft-stack
```


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.