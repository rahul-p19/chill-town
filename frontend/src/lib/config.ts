import { http, createConfig } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [metaMask()],
  transports: {
    [avalancheFuji.id]: http(),
  },
});
