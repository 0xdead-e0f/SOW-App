import { useState } from "react";
import {
  COMPASS_WALLET,
  getCosmWasmClient,
  getSigningCosmWasmClient,
} from "@sei-js/core";
import { GasPrice, coins } from "@cosmjs/stargate";
import { calculateFee } from "@cosmjs/stargate";
import { useWallet } from "../wallet-packages/react";
import { SeiWallet } from "../wallet-packages/wallets/sei";

const RPC_URL: string = "https://rpc.atlantic-2.seinetwork.io/";
const CONTRACT_REGISTRY: string =
  "sei1vcap3eeztjle3qy8cl50e80qy9anpr8njkasa66g9dk34l0jtrls7huhv7";
const CONTRACT_REGISTRAR: string =
  "sei1ywtz0ug9syuy9mg00ce93ake4j84f0y6lshc8cxdq2czuyav895qf0mmqy";
const CONTRACT_RESOLVER: string =
  "sei1a74yars3jdanxj2myukt9vfmrk65p2a88jj3axdl9g6pulhgf84sqqqjas";
const CONTRACT_REVERSE_REGISTRAR: string =
  "sei1cmmfxy0n97s87cfxxran2xkmfl3cmm3fq6wrj3vy8hpgxyn80d9q3d55kk";
const CONTRACT_CONTROLLER: string =
  "sei12p2mwewadmf46zmulydyuphdrsxlss6j924ef7wppylaa2g5eypsg403f3";

async function getAddressSeiNS(domainName: string) {
  try {
    const cosmWasmClient = await getCosmWasmClient(RPC_URL);

    const queryMsg = {
      get_record: {
        name: domainName,
      },
    };

    const queryResponse = await cosmWasmClient.queryContractSmart(
      CONTRACT_REGISTRY,
      queryMsg
    );

    return queryResponse.resolver;
  } catch (err) {
    return null;
  }
}

const ModuleSeiNS = ({ RentPeriod }: { RentPeriod: number }) => {
  const wallet = useWallet();
  const [name, setName] = useState("sei.sei");
  const [rentprice, setRentPrice] = useState(0);
  const [availableName, setAvailableName] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (event: any) => {
    setName(event.target.value);
    setRentPrice(0);
    setAvailableName(false);
  };

  const processSeiNSCheckValid = async (domainName: string) => {
    domainName = domainName.replace(/\.sei/g, "");
    try {
      if (RentPeriod < 365) {
        alert("Rent period must be larger than 365 days.");
        return;
      }

      setLoading(true);

      const result = await getAddressSeiNS(domainName);
      if (result) {
        alert(`${domainName} already registered with this address ${result}`);
        setRentPrice(0);
        setAvailableName(false);
        setLoading(false);
        return false;
      }

      const cosmWasmClient = await getCosmWasmClient(RPC_URL);

      // Get price
      const queryMsg = {
        rent_price: {
          name: domainName,
          duration: RentPeriod * 24 * 3600,
        },
      };

      // Query a smart contract state
      const queryResponse = await cosmWasmClient.queryContractSmart(
        CONTRACT_CONTROLLER,
        queryMsg
      );

      setRentPrice(queryResponse.price);
      setAvailableName(true);
      setLoading(false);

      return true;
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  const processSeiNSRegister = async (domainName: string) => {
    domainName = domainName.replace(/\.sei/g, "");
    try {
      const seiWallet = await (wallet as SeiWallet);
      if (!seiWallet) {
        alert("Please connect to wallet!");
        return;
      }

      setLoading(true);

      const chainId = seiWallet.getChainId();
      const senderAddress = seiWallet.getAddress();

      if (!senderAddress) {
        alert("Please connect to wallet!");
        return;
      }

      const offlineSigner = seiWallet.getOfflineSigner();

      if (!offlineSigner) {
        alert("Please connect to wallet!");
        return;
      }

      // Create a CosmWasmClient
      const signingCosmWasmClient = await getSigningCosmWasmClient(
        RPC_URL,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString("0.025usei"),
        }
      );

      // Execute a message on a smart contract
      // const fee = await calculateFee(Number(rentprice), "0.1usei");

      const msg = {
        register: {
          name: domainName,
          owner: senderAddress,
          duration: RentPeriod * 24 * 3600,
          reverse_record: true,
        },
      };

      // const gasEstimation = await signingCosmWasmClient.simulate("sei1qxx73cazru3qu6zxjrnyetqsewlvnm5n0v7dja", [{typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: msg}], "MSG");
      // const fee = await calculateFee(gasEstimation * 1.2, "0.1usei");

      const funds: any = [
        {
          denom: "usei",
          amount: rentprice,
        },
      ];

      const fee = "auto";
      // const amount = { amount: rentprice, denom: "usei" };
      const amts = coins(rentprice, "usei");
      const result = await signingCosmWasmClient.execute(
        senderAddress,
        CONTRACT_CONTROLLER,
        msg,
        fee,
        undefined, //"",
        funds, //amts
      );

      console.log(result);

      alert("Successfully registered.");

      return true;
    } catch (err) {
      console.log(err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckClick = () => {
    processSeiNSCheckValid(name).then((result) => {
      if (result === true) {
        alert("Please register");
      }
    });
  };

  const handleRegisterClick = () => {
    processSeiNSRegister(name).then((result) => {});
  };

  return (
    <div className="w-full flex flex-col gap-2 relative">
      <div className="w-full flex flex-row gap-2 items-center justify-center px-8">
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          className="min-w-[600px] h-[40px] py-1 px-2 border border-gray-300"
          placeholder={"Input name to register"}
          required={true}
        />
        <button
          id="check"
          name="check"
          className="border px-2 h-[40px] hover:bg-gray-300"
          onClick={handleCheckClick}
        >
          Check
        </button>
        <button
          id="register"
          name="register"
          disabled={!availableName}
          className="border px-2 h-[40px] hover:bg-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
          onClick={handleRegisterClick}
        >
          Register
        </button>
      </div>
      <div className="pl-[100px]">
        <span>{`Rent price is ${rentprice} SEI`}</span>
      </div>

      <div
        className={`${loading ? "visible" : "invisible"} absolute z-50 top-0
              w-full h-full flex flex-col items-center justify-center bg-black/20`}
      >
        <div className="mx-10 flex h-[100px] w-[300px] flex-col items-center justify-center rounded-3xl bg-black/20 px-4">
          <div className="loading-spinner "></div>
          <span className="pt-[5px] text-[14px] text-white">Processing...</span>
        </div>
      </div>
    </div>
  );
};

export default ModuleSeiNS;
