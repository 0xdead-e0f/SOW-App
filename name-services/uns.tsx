import { useState } from "react";
import axios from "axios";
import { useWallet } from "../wallet-packages/react";
import { BigNumber, ethers } from "ethers";
import ensABI from "../utils/contract-abi/ens/controller.json";
import { EVMWallet } from "../wallet-packages/wallets/evm";
import { formatBytes32String } from "ethers/lib/utils.js";
const { default: Resolution } = require("@unstoppabledomains/resolution");

const chainid = 5;
const UNS_API_KEY: string = "jykfkgvapza5_9lrvsczxqypouvxqfw3w_ydtdzpfq7pao0d";

async function getAddressUNS(domainName: string) {
  const result = await axios.get(`/api/dns/uns?&name=${domainName}`);

  return result.data;
}

const ModuleUNS = ({ RentPeriod }: { RentPeriod: number }) => {
  const wallet = useWallet();
  const [name, setName] = useState("alice.crypto");
  const [rentprice, setRentPrice] = useState(0);
  const [availableName, setAvailableName] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleNameChange = (event: any) => {
    setName(event.target.value);
    setRentPrice(0);
    setAvailableName(false);
  };

  const processUNSCheckValid = async (domainName: string) => {
    try {
      if (RentPeriod < 28) {
        alert("Rent period must be larger than 28 days.");
        return;
      }

      setLoading(true);

      if (!availableName) {
        const index = domainName.lastIndexOf(".");
        if (index !== -1) {
          domainName = domainName.substring(0, index);
        }

        const result = await getAddressUNS(domainName);
        console.log(result);

        let records = "";
        if (result.registered) {
          for (const key in result.address) {
            if (result.address.hasOwnProperty(key)) {
              records += key + ": " + result.address[key] + "\r\n";
            }
          }

          alert(`${name} already registered with this address ${records}`);

          setRentPrice(0);
          setAvailableName(false);
          setLoading(false);
          return false;
        }

        setRentPrice(result.price);
      }

      setAvailableName(true);
      setLoading(false);

      return true;
    } catch (err) {
      console.log(err);
      alert(err);
      setLoading(false);
    }
  };
  const processENSRegister = async (domainName: string) => {
    try {
      const resultSwitchChain = await (wallet as EVMWallet)
        .switchChain(chainid)
        .then(() => {
          return true;
        })
        .catch((err) => {
          alert(
            `Something went error for switch to Ethereum mannet. Error: ${err}`
          );
          return false;
        });

      if (!resultSwitchChain) return;

      const walletAddress = wallet?.getAddress();
      if (!walletAddress) {
        alert("Please connect to wallet.");
        return;
      }

      const index = domainName.lastIndexOf(".");
      if (index !== -1) {
        domainName = domainName.substring(0, index);
      }

      setLoading(true);

      const data = {
        name: domainName,
        address: walletAddress,
      };

      let result = await axios.post(`/api/dns/uns?&name=${domainName}`, data);

      result = await result.data;
      console.log(result);

      if (result.code) {
        alert(`ERROR : ${result.code}\r\n${result.message}`);
      } else {
        const status = result.operation.status;
        switch (status) {
          case "QUEUED":
            alert("Registered successfully.");
            break;
          case "SIGNATURE_REQUIRED":
            alert("Registered successfully.");
            break;
          case "PROCESSING":
            alert("Registered successfully.");
            break;
          case "COMPLETED":
            alert("Registered successfully.");
            break;
          case "FAILED":
            alert("Registration failed.");
            break;
          case "CANCELLED":
            alert("Registration canceled.");
            break;
          default:
            alert("Unknown results");
            break;
        }
      }

      return true;
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckClick = () => {
    processUNSCheckValid(name).then((result) => {
      if (result === true) {
        alert("Please register");
      }
    });
  };

  const handleRegisterClick = () => {
    processENSRegister(name).then((result) => {
      setAvailableName(false);
    });
  };

  return (
    <div className="relative flex flex-col w-full gap-2">
      <div className="flex flex-row items-center justify-center w-full gap-2 px-8">
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
        <span>{`Rent price is ${rentprice} cents`}</span>
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

export default ModuleUNS;
