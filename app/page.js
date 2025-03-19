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
    console.log(factory);
    const fee = await factory.fee();
    setFee(fee);
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
        {showCreate && (
          <List
            toggleCreate={toggleCreate}
            fee={fee}
            provider={provider}
            factory={factory}
          />
        )}
      </main>
    </div>
  );
}

// 3:44:24
