import { useState, useRef } from "react";
import { ethers } from "ethers";
import {TokenDetailsInput} from "./Inputs";


const signMessage = async ( message ) => {
  try {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    }

    if (!window.ethereum)
    throw new Error("Metamask was not detected. Please install Metamask from the Chrome Web Store.");

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner(0);
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();
    

    return {
      message,
      signature,
      address
    };
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong.", err);
  }
};


export default function Sign(props) {
  const [tokenType, setTokenType] = useState("nft");
  const [tokenId, setTokenId] = useState(0);
  const [contractAddress, setContractAddress] = useState("");

  const handleSign = async (e) => {
    e.preventDefault();
    const data = { "resource": tokenType, "tokenId": tokenId, "contractAddress": contractAddress, 
                    "metadataId": props.metadataId }

    const sig = await signMessage(JSON.stringify(data));
    if (sig) {
      props.dispatch({type: "signedMessage", payload: sig });
    }
  };

  const handleMetadataIdChange = (val) => {
    props.dispatch({type: "metadataId", payload: val})
  }

  return (
    <div className="card bg-base-100 shadow-2xl">
    <div className="card-body">
      <div>
          <h1 className="p-4 card-title">      
            SIGN MESSAGE
          </h1>
          <div className="container my-5">
            <TokenDetailsInput 
              tokenType={tokenType} 
              tokenId={tokenId} onTokenIdChange={(val) => setTokenId(Number(val)) } 
              metadataId={props.metadataId} onMetadataIdChange={handleMetadataIdChange}
              contractAddress={contractAddress} onContractChange={setContractAddress}
            />
          </div>
          <button
            className="btn btn-secondary submit-button focus:ring w-full"
            onClick={handleSign}>
            Sign message
          </button>
          <div className="my-3">
            <textarea
              type="text"
              readOnly
              className="textarea label w-full h-24 textarea-bordered textarea-info focus:ring"
              placeholder="{ message: 1234, signature: 0x..., address: 0x...}"
              value={props.signedMessage ? JSON.stringify(props.signedMessage):""}
            />
          </div> 
        </div>
      </div>
    </div>
  );
}