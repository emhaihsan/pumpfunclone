"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Header from "./components/Header";
import List from "./components/List";
import Token from "./components/Token";
import Trade from "./components/Trade";

// ABIs & Config
import Factory from "./abis/Factory.json";
import config from "./config.json";
import images from "./images.json";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  function toggleCreate() {
    setShowCreate(!showCreate);
  }

  async function loadBlockchainData() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    console.log("network", network);
    const factoryAddress = config[network.chainId].factory.address;
    const factory = new ethers.Contract(factoryAddress, Factory, provider);
    setFactory(factory);
    // Fetch the fee
    const fee = await factory.fee();
    setFee(fee);

    const totalTokens = await factory.totalTokens();

    const tokens = [];
    for (let i = 0; i < totalTokens; i++) {
      if (i == 6) break;
      const tokenSale = await factory.getTokenSale(i);
      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: images[i],
      };
      tokens.push(token);
    }
    setTokens(tokens);
  }

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />
      <main>
        <div className="create">
          <button
            onClick={factory && account && toggleCreate}
            className="btn--fancy"
          >
            {!factory
              ? "[ contract not deployed ]"
              : !account
              ? "[please connect]"
              : "[ start a new token]"}
          </button>
        </div>
        <div className="listings">
          <h1>new listings</h1>
          <div className="tokens">
            {!account ? (
              <p>please connect wallet</p>
            ) : tokens.length === 0 ? (
              <p>No tokens listed</p>
            ) : (
              tokens.map((token, index) => (
                <Token toggleTrade={() => {}} token={token} key={index} />
              ))
            )}
          </div>
        </div>
      </main>
      {showCreate && (
        <List
          toggleCreate={toggleCreate}
          fee={fee}
          provider={provider}
          factory={factory}
        />
      )}

      {showTrade && (
        <Trade
          toggleTrade={toggleTrade}
          provider={provider}
          factory={factory}
        />
      )}
    </div>
  );
}

// 3:44:24
