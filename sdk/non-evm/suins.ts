import {
  Connection,
  JsonRpcProvider,
  mainnetConnection,
  normalizeSuiAddress,
  SuiAddress,
  SuiMoveObject,
  SuiObjectData,
  SuiObjectResponse,
} from "@mysten/sui.js";

const suiNsPackage = {
  PACKAGE_ADDRESS:
    "0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0",
  SUINS_ADDRESS:
    "0x6e0ddefc0ad98889c04bab9639e512c21766c5e6366f89e696956d9be6952871",
  AUCTION_HOUSE:
    "0x2588e11685b460c725e1dc6739a57c483fcd23977369af53d432605225e387f9",
  AUCTIONS:
    "0x26ae0b9d1c4cd775cb39c8817498eef23adadbe7936302cf717d77b0a61b59b7",
  REGISTRY:
    "0xe64cd9db9f829c6cc405d9790bd71567ae07259855f4fba6f02c84f52298c106",
  REVERSE_REGISTRY:
    "0x2fd099e17a292d2bc541df474f9fafa595653848cbabb2d7a4656ec786a1969f",
};

export async function getAddressSui(domainName: string, fullnode: string) {
  try {
    const connection = new Connection({
      fullnode,
    });
    // const provider = new JsonRpcProvider(connection);
    const provider = new JsonRpcProvider(mainnetConnection);

    const [, domain, topLevelDomain] =
      domainName.match(/^(.+)\.([^.]+)$/) || [];
    const registryAddress = SuiAddress.create(suiNsPackage.REGISTRY);
    const registryResponse = await getDynamicFieldObject(
      registryAddress,
      [topLevelDomain, domain],
      `${suiNsPackage.PACKAGE_ADDRESS}::domain::Domain`,
      provider
    );
    const nameObject = parseRegistryResponse(registryResponse);

    return nameObject?.targetAddress;
  } catch (err) {
    return null;
  }
}

/**
 * Returns the default name of the input address if it was set. Otherwise, it will return undefined.
 *
 * @param address a Sui address.
 */
export async function getNameSui(
  address: string,
  fullnode: string
): Promise<string | undefined> {
  const connection = new Connection({
    fullnode,
  });
  const provider = new JsonRpcProvider(connection);

  const reverseAddress = SuiAddress.create(suiNsPackage.REVERSE_REGISTRY);
  const res = await getDynamicFieldObject(
    reverseAddress,
    address,
    "address",
    provider
  );
  const data = parseObjectDataResponse(res);
  const labels = data?.value?.fields?.labels;

  return Array.isArray(labels) ? labels.reverse()?.join(".") : undefined;
}

async function getDynamicFieldObject(
  parentObjectId: SuiAddress,
  key: any,
  type = "0x1::string::String",
  suiProvider: JsonRpcProvider
) {
  const dynamicFieldObject = await suiProvider.getDynamicFieldObject({
    parentId: parentObjectId,
    name: {
      type: type,
      value: key,
    },
  });

  if (dynamicFieldObject.error?.code === "dynamicFieldNotFound") return;

  return dynamicFieldObject;
}

const camelCase = (string: string) =>
  string.replace(/(_\w)/g, (g) => g[1].toUpperCase());

const parseObjectDataResponse = (response: SuiObjectResponse | undefined) =>
  ((response?.data as SuiObjectData)?.content as SuiMoveObject)?.fields;

const parseRegistryResponse = (
  response: SuiObjectResponse | undefined
): any => {
  const fields = parseObjectDataResponse(response)?.value?.fields || {};

  const object = Object.fromEntries(
    Object.entries({ ...fields }).map(([key, val]) => [camelCase(key), val])
  );

  if (response?.data?.objectId) {
    object.id = response.data.objectId;
  }

  delete object.data;

  const data = (fields.data?.fields.contents || []).reduce(
    (acc: Record<string, any>, c: Record<string, any>) => {
      const key = c.fields.key;
      const value = c.fields.value;

      return {
        ...acc,
        [camelCase(key)]:
          c.type.includes("Address") || key === "addr"
            ? normalizeSuiAddress(value)
            : value,
      };
    },
    {}
  );

  return { ...object, ...data };
};
