import { useState, useRef } from "react";
import { ethers } from "ethers";


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

export default function Sign() {
  const resultBox = useRef();
  const [signedMessage, setSignedMessage] = useState();

  const handleSign = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const sig = await signMessage(data.get("message"));
    console.log(sig)
    if (sig) {
      setSignedMessage(sig);
     
    }
  };

  return (
    <div className="card bg-base-100 shadow-2xl">
    <div className="card-body">
    <form className="m-4" onSubmit={handleSign}>
        <main className="">
          <h1 className="p-4 card-title text-white">
            SIGN MESSAGE
          </h1>
          <div className="">
            <div className="my-3">
              <textarea
                required
                type="text"
                name="message"
                className="textarea w-full h-24 textarea-bordered focus:ring"
                placeholder="Message"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-secondary submit-button focus:ring w-full"
          >
            Sign message
          </button>
        </main>
        <footer className="pt-2">
        <div className="my-3">
                <textarea
                  type="text"
                  readOnly
                  ref={resultBox}
                  className="textarea w-full h-24 textarea-bordered focus:ring"
                  placeholder="{ message: 1234, signature: 0x..., address: 0x...}"
                  value={JSON.stringify(signedMessage)}
                />
              </div> 
          </footer>    
        </form>
      </div>
    </div>
  );
}