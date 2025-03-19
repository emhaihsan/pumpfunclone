import { useEffect, useState } from "react";
import { ethers } from "ethers";

function Trade({ toggleTrade, token, provider, factory }) {
  const [target, setTarget] = useState(0);
  const [limit, setLimit] = useState(0);
  const [cost, setCost] = useState(0);

  async function buyHandler(form) {
    const amount = form.get("amount");

    const cost = await factory.getCost(token.sold);
    const totalCost = cost * BigInt(amount);

    const signer = await provider.getSigner();

    const transaction = await factory
      .connect(signer)
      .buy(token.token, ethers.parseUnits(amount, 18), { value: totalCost });

    await transaction.wait();
    toggleTrade(null);
  }

  async function getSaleDetails() {
    const target = await factory.TARGET();
    const limit = await factory.TOKEN_LIMIT();
    const cost = await factory.getCost(token.sold);
    setTarget(target);
    setCost(cost);
    setLimit(limit);
  }

  useEffect(() => {
    getSaleDetails();
  }, []);
  return (
    <div className="trade">
      <h2>trade</h2>
      <div className="token__details">
        <p className="name">{token.name}</p>
      </div>

      {token.sold >= limit || token.raised >= target ? (
        <p className="disclaimer">target reached!</p>
      ) : (
        <form action={buyHandler}>
          <input
            type="number"
            placeholder="amount"
            min={1}
            max={10000}
            defaultValue={1}
          />
          <input type="submit" value="[buy]" />
        </form>
      )}

      <button
        onClick={(toggleTrade) => toggleTrade(null)}
        className="btn--fancy"
      ></button>
    </div>
  );
}

export default Trade;
