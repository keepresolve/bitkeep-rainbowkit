import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import type { Connector } from 'wagmi/connectors';
import type { Chain, WindowProvider} from 'wagmi';
export type { Wallet } from  '@rainbow-me/rainbowkit';

import { InjectedConnector } from 'wagmi/connectors/injected';
import { getWalletConnectConnector, Wallet } from '@rainbow-me/rainbowkit';




type InjectedConnectorOptions = {
  name?: string | ((detectedName: string | string[]) => string);
  shimDisconnect?: boolean;
};
type WalletConnectConnectorConfig = ConstructorParameters<typeof WalletConnectConnector>[0];
interface BitKeepWalletOptions {
  projectId ?: string;
  chains: Chain[];
  shimDisconnect?: boolean;
  walletConnectVersion?: '2';
  walletConnectOptions?: WalletConnectConnectorConfig['options'];
}
interface BitKeepWalletLegacyOptions {
  projectId?: string;
  chains: Chain[];
  walletConnectVersion: '1';
  walletConnectOptions?: WalletConnectConnectorConfig['options'];
}

type BitKeepConnectorOptions = Pick< InjectedConnectorOptions, 'shimDisconnect' > 







export function isAndroid(): boolean {
  return (
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
  );
}
class BitkeepConnector extends InjectedConnector {
  id: string;
  ready: boolean;
  provider?: WindowProvider;
  constructor({ chains = [], options:options_ }: {
    chains?: Chain[]
    options?: BitKeepConnectorOptions
  } = {}) {
    const options = {
      name: 'BitKeep',
      ...options_,
    };
    super({ chains, options });


    this.id = 'Bitkeep';
    this.ready =
      typeof window != 'undefined' &&
      !!this.findProvider(window?.bitkeep?.ethereum);
  }
  async getProvider() {
    if (typeof window !== 'undefined') {
      // TODO: Fallback to `ethereum#initialized` event for async injection
      // https://github.com/BitKeep/detect-provider#synchronous-and-asynchronous-injection=
      this.provider = window.bitkeep?.ethereum;
    }
    return this.provider;
  }
  getReady(ethereum: WindowProvider) {
    if (!ethereum || !ethereum.isBitKeep ) return;
    // Brave tries to make itself look like BitKeep
    // Could also try RPC `web3_clientVersion` if following is unreliable
    if (ethereum.isBraveWallet && !ethereum._events && !ethereum._state) return;
    if (ethereum.isTokenPocket) return;
    if (ethereum.isTokenary) return;
    return ethereum;
  }
  findProvider(ethereum: WindowProvider) {
    if (ethereum?.providers) return ethereum.providers.find(this.getReady);
    return this.getReady(ethereum);
  }
}

function isBitKeep(ethereum:WindowProvider) {
  // Logic borrowed from wagmi's bitKeepConnector
  // https://github.com/tmm/wagmi/blob/main/packages/core/src/connectors/bitKeep.ts
  const isBitKeep = Boolean(ethereum.isBitKeep);

  if (!isBitKeep) {
    return false;
  }

  // Brave tries to make itself look like bitKeep
  // Could also try RPC `web3_clientVersion` if following is unreliable
  if (ethereum.isBraveWallet && !ethereum._events && !ethereum._state) {
    return false;
  }

  if (ethereum.isTokenPocket) {
    return false;
  }

  if (ethereum.isTokenary) {
    return false;
  }

  return true;
}



export async function getWalletConnectUri(
  connector: Connector,
  version: '1' | '2'
): Promise<string> {
  const provider = await connector.getProvider();
  return version === '2'
    ? new Promise<string>(resolve => provider.once('display_uri', resolve))
    : provider.connector.uri;
}


export const bitKeepWallet = ({
  chains,
  projectId,
  walletConnectOptions,
  walletConnectVersion = '2',
  ...options
}: (BitKeepWalletLegacyOptions | BitKeepWalletOptions) &
BitKeepConnectorOptions): Wallet => {
  const isBitKeepInjected =
    typeof window !== 'undefined' &&
    typeof window.bitkeep !== 'undefined' &&
    typeof window.bitkeep.ethereum !== 'undefined' &&
    isBitKeep(window.bitkeep.ethereum);

  const shouldUseWalletConnect = !isBitKeepInjected;
  return {
    createConnector: () => {
      const connector = shouldUseWalletConnect
        ? getWalletConnectConnector({ 
          chains,           
          version: walletConnectVersion,
          options: walletConnectOptions, 
          projectId
        })
        : new BitkeepConnector({
          chains,
          options
          });

      const getUri = async () => {
        const uri = await getWalletConnectUri(
          connector,
          walletConnectVersion
        );
        const r= isAndroid()  ? `bitkeep://?action=connect&connectType=wc&value=${encodeURIComponent(uri)}`: `https://bkcode.vip?value=${encodeURIComponent(uri)}` 
        console.log(r)
        
        return  r
      };
      return {
        connector,
        extension: {
          instructions: {
            learnMoreUrl: 'https://study.bitkeep.com',
            steps: [
              {
                description:
                  'We recommend pinning BitKeep to your taskbar for quicker access to your wallet.',
                step: 'install',
                title: 'Install the BitKeep extension',
              },
              {
                description:
                  'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
                step: 'create',
                title: 'Create or Import a Wallet',
              },
              {
                description:
                  'Once you set up your wallet, click below to refresh the browser and load up the extension.',
                step: 'refresh',
                title: 'Refresh your browser',
              },
            ],
          },
      
        },
        mobile: {
          getUri: shouldUseWalletConnect ? getUri : undefined,
        },
        qrCode: shouldUseWalletConnect
          ? {
              getUri,
              instructions: {
                learnMoreUrl: 'https://study.bitkeep.com',
                steps: [
                  {
                    description:
                      'We recommend putting BitKeep on your home screen for quicker access.',
                    step: 'install',
                    title: 'Open the BitKeep app',
                  },
                  {
                    description:
                      'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
                    step: 'create',
                    title: 'Create or Import a Wallet',
                  },
                  {
                    description:
                      'After you scan, a connection prompt will appear for you to connect your wallet.',
                    step: 'scan',
                    title: 'Tap the scan button',
                  },
                ],
              },
            }
          : undefined,
      };
    },
    downloadUrls: {
      android: 'https://bitkeep.com/en/download?type=2',
      browserExtension:
        'https://chrome.google.com/webstore/detail/bitkeep-crypto-nft-wallet/jiidiaalihmmhddjgbnbgdfflelocpak',
      ios: 'https://apps.apple.com/app/bitkeep/id1395301115',
      qrCode: 'https://bitkeep.com/en/download',
      mobile:"https://bitkeep.com/en/download?type=2",
      chrome:"https://chrome.google.com/webstore/detail/bitkeep-crypto-nft-wallet/jiidiaalihmmhddjgbnbgdfflelocpak"
    },
    iconAccent: '#f6851a',
    iconBackground: '#fff',
    iconUrl: "https://bitkeep.com/favicon.ico",
    id: 'bitKeep',
    installed: !shouldUseWalletConnect ? isBitKeepInjected : undefined,
    name: 'BitKeep',
  };
};

export default {}