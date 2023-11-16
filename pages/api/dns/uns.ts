import { NextApiRequest, NextApiResponse } from "next";
import { getAddressResolution } from "../../../sdk/evm/resolution";

const unsEndpointUrl: string = "https://api.unstoppabledomains.com";
const unsSandboxEndpointUrl: string = "https://api.ud-sandbox.com";
let unsEthProviderUrl: string = "https://mainnet.infura.io/v3";
let unsPolygonProviderUrl: string = "https://polygon-mainnet.infura.io/v3";
const unsApiKey: string = "jykfkgvapza5_9lrvsczxqypouvxqfw3w_ydtdzpfq7pao0d";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const requestMethod = _req.method;

  let results;
  switch (requestMethod) {
    case "GET":
      let { name } = _req.query;
      const index = name?.lastIndexOf(".");
      if (index === -1) {
        name = `${name}.crypto`;
      }

      results = await lookupNS(name);
      break;
    case "POST":
      const body = _req.body;
      const domainName = body.name;
      const address = body.address;

      results = await registerNS(address, domainName);
      break;
    default:
      results = { message: "Welcome to Unstoppable!" };
  }

  res.status(200).json(results);
};

const lookupNS = async (domainName: string) => {
  const index = domainName.lastIndexOf(".");
  if (index === -1) {
    domainName = `${domainName}.crypto`;
  }

  const results = await getAddressResolution(
    domainName,
    unsSandboxEndpointUrl,
    unsEthProviderUrl,
    unsPolygonProviderUrl,
    unsApiKey
  );

  console.log("Lookup", results);

  let resp = {
    registered: true,
    address: {},
    price: 0,
  };

  if (results && results.availability.status === "AVAILABLE") {
    resp.registered = false;
    resp.price = results.availability.price.listPrice.usdCents;
  } else {
    resp.address = results.records;
  }

  return resp;
};

const registerNS = async (owner: string, domainName: string) => {
  const index = domainName.lastIndexOf(".");
  if (index === -1) {
    domainName = `${domainName}.crypto`;
  }

  const resp = await fetch(`${unsSandboxEndpointUrl}/partner/v3/domains`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${unsApiKey}`,
    },
    body: JSON.stringify({
      name: domainName,
      records: {
        "crypto.ETH.address": "0xb4783AeF93923a2d4eEA29C84f347F26E62e4321",
        "crypto.MATIC.version.MATIC.address":
          "0xb4783AeF93923a2d4eEA29C84f347F26E62e5678",
        "crypto.MATIC.version.ERC20.address":
          "0xb4783AeF93923a2d4eEA29C84f347F26E62e0921",
      },
      owner: {
        type: "EXTERNAL",
        address: owner,
      },
    }),
  });

  const results = await resp.json();
  console.log("Resister", results);

  return results;
};

export default handler;
