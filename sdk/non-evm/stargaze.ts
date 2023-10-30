const SGNames = require("sgnames.js");
// import SGNames from "sgnames.js";

export async function getAddressStargaze(domainName: string) {
  try {
    const [, domain, topLevelDomain] =
      domainName.match(/^(.+)\.([^.]+)$/) || [];
    const { stargazeAddress } = await SGNames.fetchNameInfo(domain);
    return stargazeAddress;
  } catch (err) {
    return null;
  }
}

export async function getNameStargaze(address: string) {
  try {
    const name = await SGNames.fetchNameOfAddress(address);
    return name;
  } catch (err) {
    throw err;
  }
}
