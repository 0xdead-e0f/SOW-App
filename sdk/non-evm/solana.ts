// import { resolve } from "@bonfida/spl-name-service";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
const bonfida = require("@bonfida/spl-name-service");
export async function getAddressSolana(domainName: string) {
  try {
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const address = await bonfida.resolve(connection, domainName);
    return address.toBase58();
  } catch (err) {
    return null;
  }
}

export async function getNameSolana(address: string) {
  try {
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const name = await bonfida.performReverseLookup(
      connection,
      new PublicKey(address)
    );
    return name;
  } catch (err) {
    throw err;
  }
}
