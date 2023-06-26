import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';


import { getDefaultWallets, connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets';
import { bitKeepWallet } from '../with-next/pages/bitKeepWallet/bitKeepWallet';


import {
  configureChains,
  createConfig,
  useDisconnect,
  WagmiConfig,
} from 'wagmi';
import {
  arbitrum,
  baseGoerli,
  bsc,
  goerli,
  mainnet,
  optimism,
  polygon,
  zora,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { AppContextProps } from '../lib/AppContextProps';




const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);


const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      rainbowWallet({ chains }),
      walletConnectWallet({ chains }),
      bitKeepWallet({ chains }),
      metaMaskWallet( { chains } )
    ],
  },
]);

// const { connectors } = getDefaultWallets({
//   appName: 'RainbowKit App',
//   chains,
// });

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
