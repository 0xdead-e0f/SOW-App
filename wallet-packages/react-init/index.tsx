import {
  AptosSnapAdapter,
  AptosWalletAdapter,
  BaseWalletAdapter,
  BitkeepWalletAdapter,
  FewchaWalletAdapter,
  FletchWalletAdapter,
  MartianWalletAdapter,
  NightlyWalletAdapter as AptosNightlyWalletAdapter,
  PontemWalletAdapter,
  RiseWalletAdapter,
  SpikaWalletAdapter,
  TokenPocketWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";
import {
  BackpackWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  ExodusWalletAdapter,
  NightlyWalletAdapter as SolanaNightlyWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  SolongWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl, Connection } from "@solana/web3.js";

import { AptosWallet } from "../wallets/aptos";
import { CHAINS } from "../wallets/core";
import { WalletConnectWallet, MetamaskWallet } from "../wallets/evm";
import { Chain } from "../wallets/evm";
import { AvailableWalletsMap } from "../react";
import { SolanaAdapter, SolanaWallet } from "../wallets/solana";
import { CosmosWallet, WALLETS } from "../wallets/cosmos";
import { SeiWalletType, WALLETS as SEIWALLETS } from "../wallets/sei/wallets";
import { SeiChainId, SeiWallet } from "../wallets/sei/index";
import { SuiWallet } from "../wallets/sui/sui";
import { getReadyWallets } from "../wallets/sui";
interface InitWalletsConfig {
  solana?: {
    host?: string;
  };
  evm?: {
    chains?: Chain[];
  };
}

export const initWallets = (
  config?: InitWalletsConfig
): AvailableWalletsMap => {
  const solanaAdapters: SolanaAdapter[] = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
    new SolanaNightlyWalletAdapter(),
    new SolletWalletAdapter(),
    new SolletExtensionWalletAdapter(),
    new CloverWalletAdapter(),
    new Coin98WalletAdapter(),
    new SlopeWalletAdapter(),
    new SolongWalletAdapter(),
    new TorusWalletAdapter(),
    new ExodusWalletAdapter(),
  ];

  const aptosAdapters: BaseWalletAdapter[] = [
    new AptosWalletAdapter(),
    new MartianWalletAdapter(),
    new RiseWalletAdapter(),
    new AptosNightlyWalletAdapter(),
    new PontemWalletAdapter(),
    new FletchWalletAdapter(),
    new FewchaWalletAdapter(),
    new SpikaWalletAdapter(),
    new AptosSnapAdapter(),
    new BitkeepWalletAdapter(),
    new TokenPocketWalletAdapter(),
    // new BloctoWalletAdapter({ bloctoAppId: '' })
  ];

  const cosmosOsmosisConfig = {
    chainId: "osmosis-1",
    rpcs: { "osmosis-1": "https://rpc.osmosis.zone" },
    walletInfo: WALLETS["keplr"],
  };
  const cosmosStargazeConfig_keplr = {
    chainId: "stargaze-1",
    rpcs: { "stargaze-1": "https://rpc.stargaze-apis.com/" },
    walletInfo: WALLETS["keplr"],
  };
  const cosmosStargazeConfig_leap = {
    chainId: "stargaze-1",
    rpcs: { "stargaze-1": "https://rpc.stargaze-apis.com/" },
    walletInfo: WALLETS["leap"],
  };
  const cosmosSeiConfig = {
    chainId: "pacific-1" as SeiChainId,
    type: "keplr" as SeiWalletType,
    rpcUrl: "https://sei-rpc.polkachu.com/",
    // rpcUrl: "https://rpc.wallet.pacific-1.sei.io"
  };
  const cosmosSeiTestConfig = {
    chainId: "atlantic-2",
    rpcs: { "atlantic-2": "https://rpc.atlantic-2.seinetwork.io/" },
    walletInfo: SEIWALLETS["keplr"],
  };
  return {
    [CHAINS["ethereum"]]: [
      new MetamaskWallet(config?.evm),
      new WalletConnectWallet(config?.evm),
    ],
    [CHAINS["solana"]]: solanaAdapters.map(
      (adapter) =>
        new SolanaWallet(
          adapter,
          new Connection(config?.solana?.host || clusterApiUrl("devnet"))
        )
    ),
    [CHAINS["aptos"]]: aptosAdapters.map((adapter) => new AptosWallet(adapter)),
    [CHAINS["sui"]]: getReadyWallets(),
    [CHAINS["osmosis"]]: [new CosmosWallet(cosmosOsmosisConfig)],
    [CHAINS["stargaze"]]: [
      new CosmosWallet(cosmosStargazeConfig_keplr),
      new CosmosWallet(cosmosStargazeConfig_leap),
    ],
    [CHAINS["sei"]]: [new SeiWallet(cosmosSeiConfig)],
  };
};
