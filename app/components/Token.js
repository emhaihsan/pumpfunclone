import { ethers } from "ethers";

function Token({ toggleTrade, token }) {
  return (
    <button onClick={() => toggleTrade(token)} className="token">
      <div className="token__details">
        <img src={token.image} alt={token.name} />
        <p>{token.name}</p>
      </div>
    </button>
  );
}

export default Token;
