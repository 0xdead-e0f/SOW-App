import { ethers } from "ethers";
const SID = require("@siddomains/sidjs").default;
const SIDfunctions = require("@siddomains/sidjs");
const rpc = require("@siddomains/sidjs/dist/constants/rpc");

export async function getAddressSID(domainName: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpc.apis.bsc_mainnet);
    const sid = new SID({
      provider,
      sidAddress: SIDfunctions.getSidAddress("56"),
    });
    const address = await sid.name(domainName).getAddress();
    return address;
  } catch (err) {
    return null;
  }
}

export async function getNameSID(address: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpc.apis.bsc_mainnet);
    const sid = new SID({
      provider,
      sidAddress: SIDfunctions.getSidAddress("56"),
    });
    const { name } = await sid.getName(address);
    return name;
  } catch (err) {
    throw err;
  }
}
