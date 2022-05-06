import {useState, useReducer} from "react"
import Sign from "./Sign";
import TokenMetadata from "./TokenMetadata";

const initialState = {
  metadataId: null,
  signedMessage: null,
  tokenMetadata: null
}

const reducer = (state, action) => {
  switch(action.type) {
    case "metadataId": 
      return {...state, metadataId: action.payload}
    case "signedMessage": 
      return {...state, signedMessage: action.payload}
    case "tokenMetadata": 
      return {...state, tokenMetadata: action.payload}
    default:
      break;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="bg-white flex flex-col">
      <div className="container pt-24 mx-auto padding- w-full lg:w-1/3">
        <Sign signedMessage={state.signedMessage} metadataId={state.metadataId} dispatch={dispatch} />
      </div>
      <div class="divider"></div> 
      <div className="container pb-24 mx-auto padding- w-full lg:w-1/3">
        <TokenMetadata message={state.signedMessage} metadataId={state.metadataId} tokenMetadata={state.tokenMetadata} dispatch={dispatch} />
      </div>
    </div>
  );
}