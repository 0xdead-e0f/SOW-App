import React, { useState, useEffect } from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

import { getAddressDotBit, getNameDotBit } from "../sdk/evm/dotbit";
import { getAddressENS, getNameENS } from "../sdk/evm/ens";
import { getAddressResolution, getNameResolution } from "../sdk/evm/resolution";
import { getAddressSID, getNameSID } from "../sdk/evm/sid";
import { getAddressZKns, getNameZKns } from "../sdk/evm/zkns";
import { getAddressAptos, getNameAptos } from "../sdk/non-evm/aptosns";
import { getAddressICNS, getNameICNS } from "../sdk/non-evm/icns";
import { getAddressSolana, getNameSolana } from "../sdk/non-evm/solana";
import { getAddressStargaze, getNameStargaze } from "../sdk/non-evm/stargaze";
import { getAddressSui, getNameSui } from "../sdk/non-evm/suins";
import { getAddressSeiNS, getNameSeiNS } from "../sdk/non-evm/seins";

const unsEndpointUrl: string = "https://api.unstoppabledomains.com";
const unsSandboxEndpointUrl: string = "https://api.ud-sandbox.com";
let unsEthProviderUrl: string = "https://mainnet.infura.io/v3";
let unsPolygonProviderUrl: string = "https://polygon-mainnet.infura.io/v3";
const unsApiKey: string = "jykfkgvapza5_9lrvsczxqypouvxqfw3w_ydtdzpfq7pao0d";

let bnbProviderUrl: string = "https://rpc.ankr.com/bsc";
let suiProviderUrl: string =
  "https://sui.getblock.io/3b3d419a-32f2-40f0-a0fc-9a7da31a227c/mainnet/";
let seiProviderUrl: string = "https://rpc.atlantic-2.seinetwork.io/";

interface SearchResult {
  name: string;
  status: string;
  contractAddress: string;
  price: Number;
  canRegister: boolean;
}

function SearchNS({ prefix, query }: { prefix: string; query: string }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const resolveAddress = async () => {
    const domainName = query + "." + prefix;
    let address;
    switch (prefix) {
      case "eth":
        address = await getAddressENS(domainName, ethProviderUrl);
        break;
      case "bnb":
        address = await getAddressSID(domainName);
        break;
      case "crypto":
        address = await getAddressResolution(
          domainName,
          unsEndpointUrl,
          unsEthProviderUrl,
          unsPolygonProviderUrl,
          unsApiKey
        );
        break;
      case "bit":
        address = await getAddressDotBit(domainName);
        break;
      case "zk":
        address = await getAddressZKns(domainName);
        break;
      case "osmo":
        address = await getAddressICNS(domainName);
        break;
      case "stars":
        address = await getAddressStargaze(domainName);
        break;
      case "sol":
        address = await getAddressSolana(domainName);
        break;
      case "apt":
        address = await getAddressAptos(domainName);
        break;
      case "sui":
        address = await getAddressSui(domainName, suiProviderUrl);
        break;
      case "sei":
        address = await getAddressSeiNS(domainName, seiProviderUrl);
        break;
      default:
        address = null;
    }

    const result = {
      name: domainName,
      status: address ? "Registered" : "Unregistered",
      contractAddress: address as string,
      price: 0,
      canRegister: !address,
    };

    setResults(result);
  };

  const handleSearch = async () => {
    setResults({
      name: query + "." + prefix,
      status: "",
      contractAddress: "",
      price: 0,
      canRegister: false,
    });

    setLoading(true);

    // await resolveAddress(); // for local

    const res = await fetch(`/api/dns?prefix=${prefix}&name=${query}`);
    const result = await res.json();
    setResults(result);

    setLoading(false);
  };

  useEffect(() => {
    if (query?.length > 2) {
      handleSearch();
    }
  }, [query]);

  return (
    <div
      style={{
        // display: "flex",
        // justifyContent: "center",
        marginTop: "20px",
      }}
    >
      <div>
        {results && results.name && (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <div>{results.name}</div>{" "}
            <div>
              {loading && (
                <CircularProgress style={{ width: "20px", height: "20px" }} />
              )}
              {!loading && results.status}
            </div>
          </div>
        )}
      </div>
      {/* <div
        className={`${loading ? "visible" : "invisible"} absolute z-50 top-0
              w-full h-full flex flex-col items-center justify-center bg-black/20`}
      >
        <div className="mx-10 flex h-[100px] w-[300px] flex-col items-center justify-center rounded-3xl bg-black/20 px-4">
          <div className="loading-spinner "></div>
          <span className="pt-[5px] text-[14px] text-white">Processing...</span>
        </div>
      </div> */}
    </div>
  );
}

export default SearchNS;
