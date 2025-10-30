// Configuration constants
export const headerRoutes = [
  { id: "dashboard", name: "Dashboard" },
  { id: "vaults", name: "Vaults" },
  { id: "portfolio", name: "Portfolio" },
];

export interface ChainNetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const chainNetworkParams: Record<number, ChainNetworkConfig> = {
  8453: {
    chainId: "0x20ED",
    chainName: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/YOUR_PROJECT_ID"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
};

export const alchemyProviderURL: Record<number, string> = {
  1: "https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY",
  8453: "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
};

export const transactionProviderURL: Record<number, string> = {
  1: "https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY",
  8453: "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
};
