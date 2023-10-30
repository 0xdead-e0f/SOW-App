// import { zknsAbi } from "../abi/zkns_abi";
// import { ethers } from "ethers";
// import { Provider } from "zksync-web3";

// const c_address = "0x935442AF47F3dc1c11F006D551E13769F12eab13";

// export async function getAddressZKns(domainName: string) {
//     try{
//         const provider = new Provider("https://mainnet.era.zksync.io");
//         const contract = await new ethers.Contract(c_address, zknsAbi, provider);
//         const [, domain, topLevelDomain] = domainName.match(/^(.+)\.([^.]+)$/) || [];
//         const address = await contract.resolveAddress(domain);
//         return address;
//     } catch (err) {
//         throw err;
//     }
// }

//https://omniapi.zkns.app/domain-resolver/getReverseRecord/0x30d89290A4460E577AA8297759aBe6024A27125d
export async function getAddressZKns(domainName: string) {
  try {
    const response = await fetch(
      `https://omniapi.zkns.app/domain-resolver/getRecord/${domainName}`
    );
    const address = response.text();
    return address;
  } catch (err) {
    return null;
  }
}

export async function getNameZKns(address: string) {
  try {
    const response = await fetch(
      `https://omniapi.zkns.app/domain-resolver/getReverseRecord/${address}`
    );
    const name = response.text();
    return name;
  } catch (err) {
    throw err;
  }
}
