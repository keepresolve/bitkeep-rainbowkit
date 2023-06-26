import { WindowProvider } from 'wagmi';
import 'wagmi/window';

declare global {
    interface Window {
      bitkeep: {
        ethereum: WindowProvider
      };
    }
}