export async function getAddressAptos(domainName: string) {
  try {
    const response = await fetch(
      `https://www.aptosnames.com/api/mainnet/v1/address/${domainName}`
    );
    const { address } = await response.json();
    return address;
  } catch (err) {
    return null;
  }
}

export async function getNameAptos(address: string) {
  try {
    const response = await fetch(
      `https://www.aptosnames.com/api/mainnet/v1/name/${address}`
    );
    const { name } = await response.json();
    return name;
  } catch (err) {
    throw err;
  }
}
