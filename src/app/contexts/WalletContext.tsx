"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ProviderRpcError, RpcError } from "viem";
import { initializeConnector } from "@web3-react/core";
import { TrustWallet } from "@trustwallet/web3-react-trust-wallet";
import { toastError, toastInfo } from "@/utils/toast";
import {
  INetworkData,
  IWalletProp,
  TWalletsList,
  IUserMe,
  ILoginState,
} from "@/app/interfaces";
import { sleepTimer } from "@/utils/helper";
import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import {
  chainNetworkParams,
  headerRoutes,
  alchemyProviderURL,
} from "@/consts/config";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import "viem/window";
import * as authService from "@/utils/authService";
import { useRouter } from "next/navigation";

let ethereum: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

const WalletContext = createContext<ILoginState>({} as ILoginState);

export function useWalletContext() {
  return useContext(WalletContext);
}

export default function WalletProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<IWalletProp | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [currentConnector, setCurrentConnector] =
    useState<TWalletsList>("metamask");
  const [currentProvider, setCurrentProvider] = useState<any>(ethereum || null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [trustWallet] = initializeConnector<TrustWallet>(
    (actions) => new TrustWallet({ actions })
  );
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [steps, setSteps] = useState<string[]>([
    "Select a wallet",
    "Create or connect wallet",
  ]);
  const [networkData, setNetworkData] = useState<INetworkData | null>(null);
  const [crossPower, setCrossPower] = useState<number>(0.0);
  const [activeTab, setActiveTab] = useState<string>(headerRoutes[0]?.id);
  const [trigger, setTrigger] = useState<number>(0);
  const [surfStep, setSurfStep] = useState<number>(1);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [userMorphoVault, setUserMorphoVault] = useState<string | null>(null);
  const [isInitialDeposit, setIsInitialDeposit] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [twitterAccount, setTwitterAccount] = useState<string | undefined>(
    undefined
  );
  const [showTwitterSlide, setShowTwitterSlide] = useState<boolean>(false);
  const [showAccessCodeSlide, setShowAccessCodeSlide] =
    useState<boolean>(false);

  // User profile state (centralized)
  const [userProfile, setUserProfileState] = useState<Partial<IUserMe>>({});

  const triggerAPIs = () => setTrigger(trigger + 1);

  const authenticateUserWithBackend = async (
    address: string,
    provider?: any,
    client?: any
  ): Promise<string | undefined> => {
    // 1. If token exists, do nothing
    const existingToken = authService.getToken();

    try {
      // 2. Get nonce message from backend
      const nonceResponse = await authService.getNonce(address);
      const message = nonceResponse.data.message;
      // 3. Ask user to sign the message
      let signature = "";
      if (client) {
        signature = await client.signMessage({
          account: address as `0x${string}`,
          message,
        });
      } else if (provider) {
        const web3Provider = new BrowserProvider(provider);
        const signer = await web3Provider.getSigner();
        signature = await signer.signMessage(message);
      } else {
        throw new Error("No provider or client for signing");
      }
      // 4. Login to backend
      const loginResponse = await authService.login(
        address,
        message,
        signature
      );
      const token = loginResponse?.data?.token?.token;
      console.log("[Auth] Received token from backend:", token);
      if (token) {
        try {
          const user = await authService.getMe(token);

          console.log("userData", user);
          setUserProfile(user);
          setIsWhitelisted(!!user.isWhitelisted);
          setTwitterAccount(user.twitterAccount);

          // No whitelist checks - everyone goes directly to SurfSelection
          setShowTwitterSlide(false);
          setShowAccessCodeSlide(false);
          setUserMorphoVault(user?.morphoVault ? user?.morphoVault : null);
          setIsInitialDeposit(user?.isIntitialDeposit);

          if (!user?.morphoVault || !user?.isIntitialDeposit) {
            setIsOnboarded(false);
            setShowDashboard(false);
          }
          if (user?.morphoVault && user?.isIntitialDeposit) {
            setIsOnboarded(true);
            setShowDashboard(true);
            // Redirect to dashboard when user is authenticated and onboarded
            if (
              typeof window !== "undefined" &&
              window.location.pathname !== "/" &&
              window.location.pathname !== "/token"
            ) {
              router.push("/");
            }
          }
        } catch (e) {}
      }
      // 5. Save token
      authService.setToken(token);
      console.log("[Auth] Token saved to localStorage.");
      return message;
    } catch (err) {
      console.error("[Auth] Error during authentication:", err);
      toastError("Authentication failed");
      return undefined;
    }
  };

  const connectMetamask = async () => {
    await authService.removeToken();
    try {
      console.log("connect metamask");
      let justProvider =
        ethereum?.providers?.find((e: any) => e?.isMetaMask && e?._metamask) ||
        window?.ethereum;
      if (!justProvider) {
        throw new Error("MetaMask is not installed.");
      }
      console.log("justProvider", justProvider);
      const client: any = await createWalletClient({
        transport: custom(justProvider, {
          retryCount: 3,
          retryDelay: 1000,
        }),
      });
      try {
        await client.switchChain({ id: base.id });
        setChainId(base.id);
      } catch (e) {
        try {
          await client.addChain({ chain: base });
          setChainId(base.id);
        } catch (e) {
          setTimeout(
            async () => await client.switchChain({ id: base.id }),
            100
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("error", e);
        }
      }

      const [address] = await client.requestAddresses();

      await sleepTimer(1000);
      setAddress(address);
      setCurrentConnector("metamask");
      setCurrentProvider(justProvider);
      setLoading(false);
      await authenticateUserWithBackend(address, justProvider, client);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("MetaMask is not installed")
      ) {
        toastInfo("MetaMask is not installed. Please install MetaMask.");
        await sleepTimer(1500);
        window.open(`https://metamask.io/download/`);
      } else if (
        error?.toString().includes("ChainNotConfiguredForConnectorError")
      ) {
        let switched = await switchNetwork(8453);
        if (switched) await connectMetamask();
      } else if (error instanceof RpcError) {
        toastError("Wallet connection failed");
      } else if (error instanceof Error) {
        toastError("Wallet connection failed");
      } else if ((error as any)?.message) {
        toastError("Wallet connection failed");
      } else {
        toastError("Something went wrong");
      }
      console.log(error);
    } finally {
      setLoading(false);
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectTrustWallet = async () => {
    try {
      console.log("connect trust");
      await trustWallet.activate(8453);
      const currProvider = trustWallet.provider!;

      let justProvider =
        currProvider ||
        ethereum?.providers.find((e: any) => e?.isTrust) ||
        ethereum;
      let account = justProvider?.selectedAddress;

      let client: any = null;
      if (!account) {
        client = await createWalletClient({
          transport: custom(justProvider, {
            retryCount: 3,
            retryDelay: 1000,
          }),
        });
        try {
          await client.switchChain({ id: base.id });
          setChainId(base.id);
        } catch (e) {
          try {
            await client.addChain({ chain: base });
            setChainId(base.id);
          } catch (e) {
            setTimeout(
              async () => await client!.switchChain({ id: base.id }),
              100
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("error", e);
          }
        }
        const [address] = await client?.requestAddresses();
        account = address;
      }

      await sleepTimer(1000);

      setCurrentProvider(justProvider);
      setAddress(account);
      setLoading(false);
      setCurrentConnector("trust");
      if (client) {
        await authenticateUserWithBackend(account, justProvider, client);
      } else {
        await authenticateUserWithBackend(account, justProvider);
      }
    } catch (error) {
      toastError(
        (error as any)?.message
          ? `Error: ${(error as any)?.message}`
          : "Something went wrong"
      );
      console.log(error, "details");
    } finally {
      setLoading(false);
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectCoinbase = async () => {
    try {
      console.log("connect coinbase");
      // Check if Coinbase Wallet is available
      let justProvider =
        ethereum?.providers?.find((e: any) => e?.isCoinbaseWallet) || ethereum;

      if (!justProvider) {
        throw new Error("Coinbase Wallet is not installed");
      }

      // Request account access
      const accounts = await justProvider.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      await sleepTimer(1000);

      setCurrentProvider(justProvider);
      setCurrentConnector("coinbase");
      setAddress(account);
      setChainId(8453);
      setLoading(false);
      await authenticateUserWithBackend(account, justProvider);
    } catch (error) {
      toastError(
        (error as any)?.reason
          ? `Error: ${(error as any)?.reason}`
          : error instanceof Error
          ? error?.message
          : "Something went wrong"
      );
      setLoading(false);
      console.log("error", error, "reason");
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectWalletConnect = async () => {
    try {
      // For now, we'll use a simplified approach
      // In a real implementation, you would integrate with WalletConnect v2
      toastError(
        "WalletConnect integration coming soon. Please use MetaMask or Trust Wallet for now."
      );
      setLoading(false);
      setSteps(["Select a wallet", "Create or connect wallet"]);
    } catch (error) {
      toastError(
        error instanceof Error ? error?.message : "Something went wrong"
      );
      setLoading(false);
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectWallet = async (walletName: string) => {
    setLoading(true);
    setSteps(["Select a wallet", "Connecting wallet..."]);

    switch (walletName) {
      case "MetaMask":
        await connectMetamask();
        break;
      case "Trust Wallet":
        await connectTrustWallet();
        break;
      case "WalletConnect":
        await connectWalletConnect();
        break;
      case "Coinbase Wallet":
        await connectCoinbase();
        break;
      default:
        toastError("Currently not supported!");
        setLoading(false);
        break;
    }
  };

  const switchNetwork = async (chainId: number, callback?: () => void) => {
    if (!chainId) return;
    try {
      await currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
      });
      setChainId(chainId);
      return true;
    } catch (e) {
      if ((e as any)?.code === 4001) {
        toastError("User rejected switching chains.");
      } else if ((e as any)?.code === 4902) {
        toastError("Chain not added to wallet. Initiating chain setup...", {
          autoClose: 2000,
        });
        await sleepTimer(1000);
        await addChainNetwork(chainId);
      } else if (e instanceof ProviderRpcError) {
        toastError("Wallet connection failed");
      } else {
        toastError("Something went wrong!");
        console.error(e);
      }
    } finally {
      callback?.();
      return false;
    }
  };

  const addChainNetwork = async (chainId: number) => {
    if (!chainId) return;
    try {
      await currentProvider.request({
        method: "wallet_addEthereumChain",
        params: [chainNetworkParams[chainId]],
      });
      setChainId(chainId);
    } catch (e) {
      if (e instanceof ProviderRpcError && e?.code === 4001) {
        toastError("User rejected switching chains.");
      } else if (e instanceof ProviderRpcError) {
        toastError("Wallet connection failed");
      } else {
        toastError("Something went wrong!");
        console.error(e);
      }
    }
  };

  const loadWallet = async () => {
    try {
      const provider = new BrowserProvider(currentProvider);
      const accounts = await provider.send("eth_requestAccounts", []);
      const networkInfo = await provider.getNetwork();
      const chainId = Number(networkInfo.chainId);
      const walletNetwork = {
        account: accounts[0],
        provider: provider,
        chainId: chainId,
      };
      setNetworkData(walletNetwork);
      setChainId(chainId);
      return walletNetwork;
    } catch (err) {}
  };

  const fetchTokenBalance = async (
    tokenAddress: string,
    chainId: number,
    userAddress?: string
  ): Promise<string> => {
    try {
      const targetAddress = userAddress || address;
      if (!targetAddress) {
        throw new Error("No user address available");
      }

      const rpcUrl = alchemyProviderURL[chainId];
      if (!rpcUrl) {
        throw new Error(`No RPC URL found for chain ID: ${chainId}`);
      }

      const provider = new JsonRpcProvider(rpcUrl);

      const isNativeToken =
        tokenAddress.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

      if (isNativeToken) {
        const balance = await provider.getBalance(targetAddress);
        return balance.toString();
      } else {
        const erc20Abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ];

        const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
        const balance = await tokenContract.balanceOf(targetAddress);
        return balance.toString();
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return "0";
    }
  };

  const logout = async () => {
    setSelectedWallet(null);
    setAddress(null);
    setChainId(null);
    setCurrentProvider(null);
    setCurrentConnector("metamask");
    setCurrentStep(0);
    setLoading(false);
    setSteps(["Select a wallet", "Create or connect wallet"]);
    setNetworkData(null);
    setCrossPower(0.0);
    setActiveTab(headerRoutes[0]?.id);
    setSurfStep(1);
    setShowDashboard(false);
    setUserMorphoVault(null);
    setIsInitialDeposit(false);
    setIsOnboarded(false);
    setIsWhitelisted(false);
    setTwitterAccount(undefined);
    setShowTwitterSlide(false);
    setShowAccessCodeSlide(false);
    await authService.removeToken();
  };

  const setUserProfile = (user?: Partial<IUserMe>) => {
    if (!user) return;
    console.log("Setting user profile:", user);
    setUserProfileState((prev) => {
      const newProfile = { ...prev, ...user };
      console.log("New user profile:", newProfile);
      return newProfile;
    });
  };

  const getVaultApy = async (vault: string): Promise<number> => {
    try {
      const token = authService.getToken();
      if (!token) return 0;

      const response = await fetch(`/api/vaults/${vault}/apy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch APY");
      }

      const data = await response.json();
      return data.apy || 0;
    } catch (error) {
      console.error("Error fetching vault APY:", error);
      return 0;
    }
  };

  useEffect(() => {
    if (!currentProvider && !address) return;

    currentProvider?.on("chainChanged", (id: any) => {
      let chainId: any = id;
      setChainId(chainId);
      loadWallet().then((res: any) => {
        console.log("Wallet Info Loaded", res);
      });
    });

    // Check if we have a token and fetch user data
    const token = authService.getToken();
    if (token) {
      try {
        const user = await authService.getMe(token);
        console.log("Fetched user data:", user);
        setUserProfile(user);
        setIsWhitelisted(!!user.isWhitelisted);
        setTwitterAccount(user.twitterAccount);
        setUserMorphoVault(user?.morphoVault ? user?.morphoVault : null);
        setIsInitialDeposit(user?.isIntitialDeposit);

        setShowTwitterSlide(false);
        setShowAccessCodeSlide(false);

        if (!user?.morphoVault || !user?.isIntitialDeposit) {
          setIsOnboarded(false);
          setShowDashboard(false);
        }
        if (user?.morphoVault && user?.isIntitialDeposit) {
          setIsOnboarded(true);
          setShowDashboard(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  }, [address, currentProvider]);

  return (
    <WalletContext.Provider
      value={{
        selectedWallet,
        setSelectedWallet,
        connectWallet,
        currentStep,
        setCurrentStep,
        loading,
        setLoading,
        address,
        setSteps,
        steps,
        switchNetwork,
        networkData,
        setNetworkData,
        currentProvider,
        setAddress,
        crossPower,
        activeTab,
        setActiveTab,
        trigger,
        triggerAPIs,
        surfStep,
        setSurfStep,
        showDashboard,
        setShowDashboard,
        fetchTokenBalance,
        userMorphoVault,
        setUserMorphoVault,
        isInitialDeposit,
        setIsInitialDeposit,
        isOnboarded,
        setIsOnboarded,
        isWhitelisted,
        setIsWhitelisted,
        twitterAccount,
        setTwitterAccount,
        showTwitterSlide,
        setShowTwitterSlide,
        showAccessCodeSlide,
        setShowAccessCodeSlide,
        logout,
        setUserProfile,
        userProfile,
        provider: currentProvider ? new BrowserProvider(currentProvider) : null,
        getVaultApy,
        chainId,
        setChainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
