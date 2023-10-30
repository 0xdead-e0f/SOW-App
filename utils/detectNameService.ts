import { SupportedChains } from "./types";
import extensionData from "./extensionData.json";
import { extensionAbi } from "../abi/extension_abi";
import { ethers } from "ethers";

const extensionDataUrl =
  "https://sow-sdk-support-9gw2zt6e4-0xdead-e0f.vercel.app/api/extension";
const extensionContractAddr = "0x52DC661530B710F932285b288cdA8F29BF781eb6";
const providerUrl = "https://rpc-mumbai.maticvigil.com"; //just for test

function getExtensionFromDomain(domainName: String): String {
  const extension = domainName.split(".").pop();
  if (!extension) return "";
  return extension.toLowerCase();
}

export async function fetchNSindexFromContract(extension: String) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const contract = await new ethers.Contract(
      extensionContractAddr,
      extensionAbi,
      provider
    );
    const result = contract.getNameServiceIndex(extension);
    return result;
  } catch (err) {
    return 0;
  }
}

export async function detectNameService(
  domainName: String
): Promise<SupportedChains> {
  const extension = getExtensionFromDomain(domainName).toLowerCase();
  if (extension === "") {
    return SupportedChains.None;
  }
  const nsIndex = await fetchNSindexFromContract(extension);

  if (nsIndex < 1 || nsIndex > 10) {
    return SupportedChains.None;
  }

  return nsIndex as SupportedChains;
}

// async function fetchExtensionData() {
//     try {
//         const response = await fetch(extensionDataUrl);
//         if(response.status !== 200) {
//             return extensionData;
//         }
//         return await response.json();
//     } catch(err) {
//         return extensionData;
//     }
// }

// export async function detectNameService(domainName: String) : Promise<SupportedChains> {
//     const extension = getExtensionFromDomain(domainName).toLowerCase();
//     if (extension === "") {
//         return SupportedChains.None;
//     }

//     const extensionMap = await fetchExtensionData();
//     const domainServiceName = extensionMap.hasOwnProperty(extension) ? extensionMap[extension] : null;

//     switch (domainServiceName) {
//         case "ENS":
//             return SupportedChains.ENS;
//         case "SpaceId":
//             return SupportedChains.SpaceId;
//         case "UnstoppableDomains":
//             return SupportedChains.UnstoppableDomains;
//         case "DotBit":
//             return SupportedChains.DotBit;
//         case "Zkns":
//             return SupportedChains.Zkns;
//         case "ICNS":
//             return SupportedChains.ICNS;
//         case "StargazeDomains":
//             return SupportedChains.StargazeDomains;
//         case "Bonfida":
//             return SupportedChains.Bonfida;
//         case "SuiNs":
//             return SupportedChains.SuiNs;
//         case "AptosNs":
//             return SupportedChains.AptosNs;
//         default:
//             return SupportedChains.ICNS;

//     }
// }
