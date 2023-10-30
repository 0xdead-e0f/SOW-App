import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const resolverAddress =
  "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd";

export async function getAddressICNS(domainName: string) {
  try {
    const client = await CosmWasmClient.connect("https://rpc.osmosis.zone");
    // const queryClient = new contracts.IcnsResolver.IcnsResolverQueryClient(client as any, resolverAddress);
    // const {bech32_address} = await queryClient.addressByIcns({icns: domainName});

    const { bech32_address } = await client.queryContractSmart(
      resolverAddress,
      {
        address_by_icns: {
          icns: domainName,
        },
      }
    );

    return bech32_address;
  } catch (err) {
    return null;
  }
}

export async function getNameICNS(address: string) {
  try {
    const client = await CosmWasmClient.connect("https://rpc.osmosis.zone");
    // const queryClient = new contracts.IcnsResolver.IcnsResolverQueryClient(client as any, resolverAddress);
    // const {bech32_address} = await queryClient.addressByIcns({icns: domainName});

    const { name } = await client.queryContractSmart(resolverAddress, {
      primary_name: {
        address,
      },
    });

    return name;
  } catch (err) {
    throw err;
  }
}
