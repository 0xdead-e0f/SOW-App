import { Resolution } from "@unstoppabledomains/resolution";

export async function getAddressResolution(
  domainName: string,
  ethProviderUrl: string,
  polygonProviderUrl: string
) {
  try {
    const resolution = new Resolution({
      sourceConfig: {
        uns: {
          locations: {
            Layer1: {
              url: ethProviderUrl,
              network: "mainnet",
            },
            Layer2: {
              url: polygonProviderUrl,
              network: "polygon-mainnet",
            },
          },
        },
        zns: {
          url: "https://api.zilliqa.com",
          network: "mainnet",
        },
      },
    });

    const address = await resolution.addr(domainName, "ETH");
    return address;
  } catch (err) {
    return null;
  }
}

export async function getNameResolution(
  address: string,
  ethProviderUrl: string,
  polygonProviderUrl: string
) {
  try {
    const resolution = new Resolution({
      sourceConfig: {
        uns: {
          locations: {
            Layer1: {
              url: ethProviderUrl,
              network: "mainnet",
            },
            Layer2: {
              url: polygonProviderUrl,
              network: "polygon-mainnet",
            },
          },
        },
        zns: {
          url: "https://api.zilliqa.com",
          network: "mainnet",
        },
      },
    });

    const name = await resolution.reverse(address);
    return name;
  } catch (err) {
    throw err;
  }
}
