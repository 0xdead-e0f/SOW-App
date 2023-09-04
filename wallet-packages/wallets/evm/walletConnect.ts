import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
import { EVMWalletConfig, EVMWalletType } from "./evm";
import { BaseWalletConnectWallet } from "./walletConnectBase";

type WalletConnectOptions = ConstructorParameters<
  typeof WalletConnectConnector
>[0]["options"];

export type WalletConnectWalletConfig = EVMWalletConfig<WalletConnectOptions>;

export class WalletConnectWallet extends BaseWalletConnectWallet<
  WalletConnectConnector,
  WalletConnectOptions
> {
  constructor(config: WalletConnectWalletConfig = {}) {
    super(config);
  }

  protected createConnector(): WalletConnectConnector {
    return new WalletConnectConnector({
      chains: this.chains,
      options: {...this.connectorOptions, projectId:"7dc983b7b13f3013ab4d8d8f819c12ea"},
    });
  }
}
