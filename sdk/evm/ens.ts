import { ENS } from "@ensdomains/ensjs";
import { ethers } from "ethers";

export async function getAddressENS(domainName: string, providerUrl: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const address = await provider.resolveName(domainName);
    return address;
  } catch (err) {
    return null;
  }
}

export async function getNameENS(address: string, providerUrl: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const name = await provider.lookupAddress(address);
    return name!;
  } catch (err) {
    throw err;
  }
}
