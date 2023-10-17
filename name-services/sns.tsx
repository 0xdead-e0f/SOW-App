import { useWallet } from "../wallet-packages/react";
import { useState } from "react";
import { SolanaWallet } from "../wallet-packages/wallets/solana";
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  registerDomainName,
  getReverseKeySync,
} from "@bonfida/spl-name-service";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { signAndSendInstructions } from "@bonfida/utils";

// const connection = new Connection(
//   clusterApiUrl("https://rpc-public.hellomoon.io")
// );
// const connection = new Connection(clusterApiUrl("mainnet-beta"));
const connection = new Connection(clusterApiUrl("testnet"));

/**
 * Path to your private key
 */
// const WALLET_PATH = "my-wallet.json";
// const keypair = Keypair.fromSecretKey(
//   Uint8Array.from(JSON.parse(fs.readFileSync(WALLET_PATH).toString()))
// );

/**
 * We want a 1kB sized domain (max 10kB)
 */
const space = 1 * 1_000;

const ModuleSNS = ({ RentPeriod }: { RentPeriod: number }) => {
  const wallet = useWallet();
  const [name, setName] = useState("alice.sol");
  const [rentprice, setRentPrice] = useState(0);
  const [availableName, setAvailableName] = useState(false);
  const [loading, setLoading] = useState(false);

  async function getAddressSNS(domainName: string) {
    const reverseKey = await getReverseKeySync(domainName);
    console.log(reverseKey);

    const acc = await connection.getAccountInfo(reverseKey);
    if (!!acc) {
      console.log(acc);
      console.log(`Alredy registered: ${domainName}`);
      return true;
    }

    return false;
  }

  const handleNameChange = (event: any) => {
    setName(event.target.value);
    setRentPrice(0);
    setAvailableName(false);
  };

  const processENSCheckValid = async (domainName: string) => {
    try {
      if (RentPeriod < 28) {
        alert("Rent period must be larger than 28 days.");
        return;
      }

      setLoading(true);

      if (!availableName) {
        const result = await getAddressSNS(domainName);
        if (result) {
          alert(`${name} already registered with this address ${result}`);
          setRentPrice(0);
          setAvailableName(false);
          setLoading(false);
          return false;
        }
      }

      setAvailableName(true);

      return true;
    } catch (err) {
      console.log(err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const processSNSRegister = async (domainName: string) => {
    try {
      const resultSwitchChain = await (wallet as SolanaWallet).connect();
      const walletAdapter = await (wallet as SolanaWallet).getAdapter();
      const isconnected = (wallet as SolanaWallet).isConnected();
      const address = (wallet as SolanaWallet).getAddress();

      if (!walletAdapter || !resultSwitchChain || !address) return;
      if (!walletAdapter.publicKey) return;

      console.log(isconnected);
      console.log(walletAdapter.publicKey);
      console.log(address);

      setLoading(true);

      const USDC_MINT = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );

      const VAULT_OWNER = new PublicKey(address);

      // const wallet_info = {
      //   USDC_MINT: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      //   VAULT_OWNER: address,
      // };
      // const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet_info));

      const ixs: TransactionInstruction[] = [];
      console.log(name);
      const ix = await registerDomainName(
        connection,
        name,
        space,
        walletAdapter.publicKey,
        getAssociatedTokenAddressSync(USDC_MINT, VAULT_OWNER),
        USDC_MINT
      );
      ixs.push(...ix.flat());

      // const tx = await signAndSendInstructions(
      //   connection,
      //   [],
      //   Keypair.generate(),
      //   ixs
      // );
      // console.log(tx);

      return true;
    } catch (err) {
      console.log(err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckClick = () => {
    processENSCheckValid(name).then((result) => {
      if (result === true) {
        alert("Please register");
      }
    });
  };

  const handleRegisterClick = () => {
    processSNSRegister(name).then((result) => {
      console.log(result);
    });
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
        <span>{`Rent price is ${rentprice} SOL`}</span>
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

export default ModuleSNS;
