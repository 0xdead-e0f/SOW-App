import { useWallet } from "../wallet-packages/react";
import { useState, useEffect } from "react";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SUI_CLOCK_OBJECT_ID,
  JsonRpcProvider,
  mainnetConnection,
} from "@mysten/sui.js";
import { SuinsClient } from "@suins/toolkit";
import { SuiWallet } from "../wallet-packages/wallets/sui/sui";

const suiNsPackage = {
  PACKAGE_ADDRESS:
    "0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0",
  SUINS_ADDRESS:
    "0x6e0ddefc0ad98889c04bab9639e512c21766c5e6366f89e696956d9be6952871",
  AUCTION_HOUSE:
    "0x2588e11685b460c725e1dc6739a57c483fcd23977369af53d432605225e387f9",
  AUCTIONS:
    "0x26ae0b9d1c4cd775cb39c8817498eef23adadbe7936302cf717d77b0a61b59b7",
  REGISTRY:
    "0xe64cd9db9f829c6cc405d9790bd71567ae07259855f4fba6f02c84f52298c106",
  REVERSE_REGISTRY:
    "0x2fd099e17a292d2bc541df474f9fafa595653848cbabb2d7a4656ec786a1969f",
};

async function getAddressSUINS(domainName: string) {
  try {
    const provider = new JsonRpcProvider(mainnetConnection);
    const suinsClient = new SuinsClient(provider, {
      networkType: "mainnet",
      contractObjects: {
        packageId: suiNsPackage.PACKAGE_ADDRESS,
        registry: suiNsPackage.REGISTRY,
        reverseRegistry: suiNsPackage.REVERSE_REGISTRY,
        suins: suiNsPackage.SUINS_ADDRESS,
      },
    });

    const address = await suinsClient.getNameObject(domainName);

    if (address && address.id) {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
  }

  return false;
}

const ModuleSUINS = ({ RentPeriod }: { RentPeriod: number }) => {
  const wallet = useWallet();
  const [name, setName] = useState("suins.sui");
  const [rentprice, setRentPrice] = useState(0);
  const [availableName, setAvailableName] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAvailableName(false);
  }, [RentPeriod]);

  const handleNameChange = (event: any) => {
    setName(event.target.value);
    setRentPrice(0);
    setAvailableName(false);
  };

  const processCheckValid = async (domainName: string) => {
    try {
      if (RentPeriod < 1) {
        alert("Rent period must be larger than 1 year.");
        return;
      }

      if (RentPeriod > 5) {
        alert("Rent period must be less than 5 years.");
        return;
      }

      setLoading(true);

      if (!availableName) {
        const result = await getAddressSUINS(domainName);
        if (result) {
          alert(`${name} already registered with this address ${result}`);

          setRentPrice(0);
          setAvailableName(false);
          return false;
        } else {
        }
      }

      let price = 20;

      const realDomainname = domainName.replace(".sui", "");
      if (realDomainname.length < 3) {
        alert("Domain name must be at least 3 characters.");
        return false;
      }
      if (realDomainname.length === 3) {
        price = 500;
      } else if (realDomainname.length === 4) {
        price = 100;
      }

      setRentPrice(price * RentPeriod);
      setAvailableName(true);
      return true;
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const processRegister = async (domainName: string) => {
    try {
      setLoading(true);

      // const numberOfYears = 1;

      const rpcUrl = getFullnodeUrl("mainnet");
      const client = new SuiClient({ url: rpcUrl });

      const tx = new TransactionBlock();
      const registration = tx.moveCall({
        target:
          "0x9d451fa0139fef8f7c1f0bd5d7e45b7fa9dbb84c2e63c2819c7abd0a7f7d749d::register::register",
        arguments: [
          tx.object(
            "0x6e0ddefc0ad98889c04bab9639e512c21766c5e6366f89e696956d9be6952871"
          ), // SUINS_ADDRESS
          tx.pure(domainName, "string"), // domain could be `my_name.sui`
          tx.pure(RentPeriod, "u8"), // amount of years to register for. (1,2,3,4,5)
          tx.splitCoins(tx.gas, [tx.pure(rentprice * 1000000000)]), // price for 3 digits = 500 SUI (500*1_000_000_000) MIST, 4 digits = 100 SUI, 5 digits+ = 20SUI
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
      const walletAddress = wallet?.getAddress();
      if (!walletAddress) {
        alert("Please connect to wallet.");
        return;
      }

      tx.transferObjects(
        [registration],
        tx.object((wallet as SuiWallet).getAddress()!)
      ); // transfer the name to the user
      // tx.transferObjects([registration], tx.pure(account, 'address')); // transfer the name to the user

      // sign and execute transaction
      await (wallet as SuiWallet).signAndSendTransaction({
        transactionBlock: tx,
      });

      return true;
    } catch (err) {
      console.log(err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckClick = () => {
    processCheckValid(name).then((result) => {
      if (result === true) {
        alert("Please register");
      }
    });
  };

  const handleRegisterClick = () => {
    processRegister(name).then((result) => {
      if (result === true) alert("finished");
    });
  };

  return (
    <div className="w-full flex flex-col gap-2">
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
        <span>{`Rent price is ${rentprice}`} SUI</span>
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

export default ModuleSUINS;
