
export function APIInput(props) {
    
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex space-x-3" >
                <label className="label w-1/3 max-w-xs"><span className="label-text">Base API URL</span></label>
                {/* <label class="label"><span className="label-text">{api}</span></label> */}
                <input className="input w-full input-bordered input-ghost  max-w-xs" type="text" value={props.apiBaseUrl} onChange={(e) => props.onAPIChange(e.target.value)} /> 
            </div>
            {/* <div className="flex space-x-3" >
                <label class="label"><span className="label-text">Encoded Message</span></label>
                <input readOnly className="input w-full input-bordered  max-w-xs" type="text" value={props.message} /> 
            </div> */}
        </div>
    )
}

export function TokenDetailsInput(props){    
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex space-x-3" >
                <label className="label w-1/3"><span className="label-text">Token Type</span></label>
                <label className="label w-full"><span className="label-text">{props.tokenType}</span></label>
            </div>
            <div className="flex space-x-3">
                <label className="label w-1/3"><span className="label-text">Token ID</span></label>
                <input className="input w-full input-bordered  max-w-xs" type="number" value={props.tokenId} onChange={(e) => props.onTokenIdChange(e.target.value)} placeholder={"0"}/> 
            </div>
            <div className="flex space-x-3" >
                <label className="label w-1/3"><span className="label-text">Metadata Id</span></label>
                <input className="input w-full input-bordered input-primary  max-w-xs" type="text" 
                        value={props.metadataId}
                        onChange={(e) => props.onMetadataIdChange(e.target.value)} 
                        placeholder={"Example: 76497dce-9626-4cc7-b750-bd379023fc9b"} /> 
            </div>
            <div className="flex space-x-3">
                <label className="label w-1/3"><span className="label-text">Contract Address</span></label>
                <input className="input w-full input-bordered  max-w-xs" type="text" value={props.contractAddress} onChange={(e) => props.onContractChange(e.target.value)} placeholder={"0xAE...E3"}/> 
            </div>
        </div>
    )
}

