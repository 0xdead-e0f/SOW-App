

import React, { useEffect, useState } from 'react';
import '../styles/globals.css'
import { AppProps } from "next/app";
import { WalletContextProvider } from '../wallet-packages/react';
import { initWallets } from '../wallet-packages/react-init';

const wallets = initWallets();

export default function App({ Component, pageProps } : AppProps) {
      return (
            <WalletContextProvider wallets={wallets}>
                  <Component {...pageProps} />
            </WalletContextProvider>
      );
}