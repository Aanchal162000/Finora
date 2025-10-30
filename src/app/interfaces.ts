export interface LandingPageProps {
  className?: string;
  children?: React.ReactNode;
  onGetStarted?: () => void;
}

export interface LandingSectionProps {
  className?: string;
  children?: React.ReactNode;
}

export interface WalletSignupProps {
  onBack?: () => void;
}

// Wallet Connection Interfaces
export interface IWalletProp {
  name: string;
  icon: string;
  connector: string;
}

export interface INetworkData {
  account: string;
  provider: unknown;
  chainId: number;
}

export interface IUserMe {
  address?: string;
  isWhitelisted?: boolean;
  twitterAccount?: string;
  morphoVault?: string | null;
  isIntitialDeposit?: boolean;
  [key: string]: unknown;
}

export type TWalletsList = "metamask" | "trust" | "coinbase" | "walletConnect";

export interface ILoginState {
  selectedWallet: IWalletProp | null;
  setSelectedWallet: (prop: IWalletProp | null) => void;
  connectWallet: (walletName: string) => Promise<void>;
  currentStep: number;
  setCurrentStep: (prop: number) => void;
  loading: boolean;
  setLoading: (prop: boolean) => void;
  address: string | null;
  steps: string[];
  setSteps: React.Dispatch<React.SetStateAction<string[]>>;
  switchNetwork: (
    prop: number,
    callback?: () => void
  ) => Promise<boolean | undefined>;
  currentProvider: unknown;
  networkData: INetworkData | null;
  setNetworkData: React.Dispatch<React.SetStateAction<INetworkData | null>>;
  setAddress: (prop: string | null) => void;
  crossPower: number;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  trigger: number;
  triggerAPIs: () => void;
  surfStep: number;
  setSurfStep: React.Dispatch<React.SetStateAction<number>>;
  showDashboard: boolean;
  setShowDashboard: React.Dispatch<React.SetStateAction<boolean>>;
  fetchTokenBalance: (
    tokenAddress: string,
    chainId: number,
    userAddress?: string
  ) => Promise<string>;
  userMorphoVault: string | null;
  setUserMorphoVault: React.Dispatch<React.SetStateAction<string | null>>;
  isInitialDeposit: boolean;
  setIsInitialDeposit: React.Dispatch<React.SetStateAction<boolean>>;
  isOnboarded: boolean;
  setIsOnboarded: React.Dispatch<React.SetStateAction<boolean>>;
  isWhitelisted: boolean;
  setIsWhitelisted: React.Dispatch<React.SetStateAction<boolean>>;
  twitterAccount: string | undefined;
  setTwitterAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  showTwitterSlide: boolean;
  setShowTwitterSlide: React.Dispatch<React.SetStateAction<boolean>>;
  showAccessCodeSlide: boolean;
  setShowAccessCodeSlide: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => Promise<void>;
  setUserProfile: (user: Partial<IUserMe>) => void;
  userProfile: Partial<IUserMe>;
  provider: unknown;
  getVaultApy: (vault: string) => Promise<number>;
  chainId: number | null;
  setChainId: (chainId: number | null) => void;
}

// General ethereum provider type (minimal, extensible as needed)
export interface Ethereumish {
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: Ethereumish[];
  selectedAddress?: string;
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  on?: (event: string, cb: (id: unknown) => void) => void;
  [key: string]: unknown;
}
