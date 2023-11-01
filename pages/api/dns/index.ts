import { NextApiRequest, NextApiResponse } from "next";
import { getAddressDotBit } from "../../../sdk/evm/dotbit";
import { getAddressENS } from "../../../sdk/evm/ens";
import { getAddressResolution } from "../../../sdk/evm/resolution";
import { getAddressSID } from "../../../sdk/evm/sid";
import { getAddressZKns } from "../../../sdk/evm/zkns";
import { getAddressAptos } from "../../../sdk/non-evm/aptosns";
import { getAddressICNS } from "../../../sdk/non-evm/icns";
import { getAddressSolana } from "../../../sdk/non-evm/solana";
import { getAddressStargaze } from "../../../sdk/non-evm/stargaze";
import { getAddressSui } from "../../../sdk/non-evm/suins";

let ethProviderUrl: string = "https://eth.llamarpc.com";
let polygonProviderUrl: string = "https://polygon-rpc.com/";
let bnbProviderUrl: string = "https://rpc.ankr.com/bsc";
let suiProviderUrl: string =
  "https://sui.getblock.io/3b3d419a-32f2-40f0-a0fc-9a7da31a227c/mainnet/";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const { prefix, name } = _req.query;
  const domainName = name + "." + prefix;

  // Retrieve domain name information from the server
  try {
    const nameInfo = await searchNS(prefix, domainName);
    // console.log("prefix=", nameInfo);

    res.status(200).json(nameInfo);
  } catch (err: any) {
    console.log(err);

    const result = {
      name: domainName,
      status: "Unregistered",
      contractAddress: "",
      price: 0,
      canRegister: true,
    };
    res.status(200).json(result);
  }
};

// async function searchNS(prefix: string, domainName: string) {
const searchNS = async (prefix: string, domainName: string) => {
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
        ethProviderUrl,
        polygonProviderUrl
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

  return result;
};
// }

export default handler;
