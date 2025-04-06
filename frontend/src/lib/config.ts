import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [injected(), coinbaseWallet(), metaMask()],
  transports: {
    [avalancheFuji.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
