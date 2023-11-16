import { Resolution } from "@unstoppabledomains/resolution";

export async function getAddressResolution(
  domainName: string,
  endpointUrl: string,
  ethProviderUrl: string,
  polygonProviderUrl: string,
  apiKey: string
) {
  try {
    const query = new URLSearchParams({ $expand: "records" }).toString();
    const resp = await fetch(
      `${endpointUrl}/partner/v3/domains/${domainName}?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const results = await resp.json();

    return results;
  } catch (err) {
    console.log("unstoppable error", err);
    return null;
  }
}

export async function getNameResolution(
  address: string,
  ethProviderUrl: string,
  polygonProviderUrl: string,
  apiKey: string
) {
  try {
    // const resolution = new Resolution({
    //   sourceConfig: {
    //     uns: {
    //       locations: {
    //         Layer1: {
    //           url: ethProviderUrl,
    //           network: "mainnet",
    //         },
    //         Layer2: {
    //           url: polygonProviderUrl,
    //           network: "polygon-mainnet",
    //         },
    //       },
    //     },
    //     zns: {
    //       url: "https://api.zilliqa.com",
    //       network: "mainnet",
    //     },
    //   },
    // });

    // const name = await resolution.reverse(address);

    const query = new URLSearchParams({
      $expand: "records",
      "owner.address": address,
      $cursor: "string",
    }).toString();

    const resp = await fetch(
      `https://api.unstoppabledomains.com/partner/v3/search/owners/domains?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await resp.json();
    console.log(data);
    return data;
  } catch (err) {
    throw err;
  }
}
