import { createInstance } from "dotbit";

const dotbit = createInstance();

export async function getAddressDotBit(domainName: string) {
  try {
    const { account_id_hex } = await dotbit.accountInfo(domainName);
    return account_id_hex;
  } catch (err) {
    return null;
  }
}

export async function getNameDotBit(address: string) {
  const { account } = await dotbit.accountById(address);
  return account;
}
