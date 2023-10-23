import { Button } from "@material-ui/core";
import Link from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";
import ChainSelector from "../components/wallet/ChainSelector";
import WalletSelector from "../components/wallet/WalletSelector";
import ModuleENS from "../name-services/ens";
import { useWallet } from "../wallet-packages/react";
import { ChainId } from "../wallet-packages/wallets/core";
import ModuleSID from "../name-services/sid";
import ModuleDAS from "../name-services/dotbit";
import ModuleZKNS from "../name-services/zkns";
import ModuleSUINS from "../name-services/suins";

import ModuleUNS from "../name-services/uns";
import ModuleSNS from "../name-services/sns";

const IndexPage = () => {
  const wallet = useWallet();

  const [chainId, setChainId] = useState<ChainId | undefined>();
  const [pubKey, setPubKey] = useState<string | undefined>();
  const [result, setResult] = useState<any>();
  const [error, setError] = useState<any>();
  const [period, setPeriod] = useState(365);

  const onClickConnect = async () => {
    if (!wallet) {
      return;
    }

    await wallet.connect().catch((err) => {
      alert(err);
      return;
    });

    const pubKey = wallet.getAddress();
    setPubKey(pubKey);
  };

  const onClickDisconnect = async () => {
    if (!wallet) {
      return;
    }

    await wallet.disconnect();
    setPubKey(undefined);
  };

  const onChangeChain = (ev: any) => {
    const chainId: ChainId = ev.target.value;
    setChainId(chainId);
    setPubKey(undefined);
  };

  return (
    <Layout title="Dotlab Aggregator">
      <div className="w-full flex flex-col h-[90vh] bg-white gap-2">
        <div className="w-full flex flex-row bg-gray-300 gap-2">
          <div>
            <ChainSelector onChange={onChangeChain} />
          </div>

          <div>{chainId && <WalletSelector chainId={chainId} />}</div>
          <div>
            {wallet && (
              <button
                className="bg-gray-200 w-[90px] h-[40px] rounded-lg border border-[#000000]"
                onClick={onClickConnect}
              >
                Connect
              </button>
            )}
            {pubKey && (
              <span className="text-blue-400 font-bold">{pubKey}</span>
            )}
          </div>
          <div>
            {pubKey && (
              <button
                className="bg-gray-200 w-[90px] h-[40px] rounded-lg border border-[#000000]"
                onClick={onClickDisconnect}
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
        <div className="w-full flex flex-row py-4 gap-2">
          <p>Rent period</p>
          <input
            type="number"
            className="border text-right"
            value={period}
            onChange={(e) => {
              setPeriod(Number(e.target.value));
            }}
          />
          <p>days(years)</p>
        </div>
        <div className="w-full flex flex-col pt-2">
          <p>ENS name service</p>
          <ModuleENS RentPeriod={period} />
        </div>
        <div className="w-full flex flex-col pt-2">
          <p>SpaceID name service</p>
          <ModuleSID RentPeriod={period} />
        </div>
        <div className="w-full flex flex-col pt-2">
          <p>Sui name service</p>
          <ModuleSUINS RentPeriod={period} />
        </div>
        {/* <div className="w-full flex flex-col pt-2">
          <p>Unstoppable name service</p>
          <ModuleUNS RentPeriod={period} />
        </div>
        <div className='w-full flex flex-col pt-2'>
          <p>DotBit name service</p>
          <ModuleDAS />
        </div>
        <div className='w-full flex flex-col pt-2'>
          <p>ZKSync name service</p>
          <ModuleZKNS />
        </div> */}
        {/* <div className="w-full flex flex-col pt-2">
          <p>Solana name service</p>
          <ModuleSNS />
        </div> */}
      </div>
    </Layout>
  );
};

export default IndexPage;
