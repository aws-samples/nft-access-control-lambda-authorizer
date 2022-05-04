import { useState, useEffect } from "react";
import {APIInput} from "./Inputs"


const getMetadata = async ( url, authToken ) => {
  try {
    if (!authToken) {
        throw Error("Message cannot be empty, please make sure you signed a message before submiting")
    }
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        }
    })
    
    return response.json()

  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong.", err);
  }
};


export default function TokenMetadata(props) {
    
    const [apiBaseUrl, setApiBaseUrl] = useState(process.env["REACT_APP_VERSION_ASSETS_API"] || "")
    const [encodedMessage, setEncodedMessage] = useState()
    
    useEffect(() =>{
        if (props.message){
            const encoded = btoa(JSON.stringify(props.message))
            setEncodedMessage(encoded)
        }
    }, [props.message])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = `${apiBaseUrl}/${props.metadataId}`
        const result = await getMetadata(url, encodedMessage)
        console.log(result)
        if (result) {
            props.dispatch({type: "tokenMetadata", payload: result})
        }
    }

    return (
        <div className="card bg-base-100 shadow-2xl">
        <div className="card-body">
        <div>
            <h1 className="p-4 card-title">      
                GET METADATA
            </h1>
            <div className="container my-6">
                <APIInput apiBaseUrl={apiBaseUrl} onAPIChange={setApiBaseUrl} message={encodedMessage}  />
            </div>
            <button
                className="btn btn-secondary submit-button focus:ring w-full"
                onClick={handleSubmit}>
                Get Metadata
            </button>
            <div className="my-3">
                <textarea
                type="text"
                readOnly
                className="textarea label w-full h-24 textarea-bordered textarea-info focus:ring"
                placeholder="{ message: 1234, signature: 0x..., address: 0x...}"
                value={props.tokenMetadata ? JSON.stringify(props.tokenMetadata): ""}
                />
            </div> 
            </div>
        </div>
        </div>
    );
}