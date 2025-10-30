"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
import type { Ethereumish } from "@/app/interfaces";
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
import type { Eip1193Provider } from "ethers";

let ethereum: unknown = null;
if (typeof window !== "undefined") {
  ethereum = (window as { ethereum?: Ethereumish })?.ethereum; // Create and use Ethereumish interface
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
  const [, setCurrentConnector] = useState<TWalletsList>("metamask");
  const [currentProvider, setCurrentProvider] = useState<unknown>(
    ethereum || null
  );
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
  const hasFetchedUserRef = useRef(false);

  const triggerAPIs = () => setTrigger(trigger + 1);

  const authenticateUserWithBackend = async (
    address: string,
    provider?: unknown,
    client?: unknown
  ): Promise<string | undefined> => {
    // 1. If token exists, do nothing
    void authService.getToken();

    try {
      // 2. Get nonce message from backend
      const nonceResponse = await authService.getNonce(address);
      const message = nonceResponse.data.message;
      // 3. Ask user to sign the message
      let signature = "";
      if (
        client &&
        (
          client as {
            signMessage?: (args: {
              account: `0x${string}`;
              message: string;
            }) => Promise<string>;
          }
        ).signMessage
      ) {
        const signerClient = client as {
          signMessage: (args: {
            account: `0x${string}`;
            message: string;
          }) => Promise<string>;
        };
        signature = await signerClient.signMessage({
          account: address as `0x${string}`,
          message,
        });
      } else if (provider) {
        const web3Provider = new BrowserProvider(
          provider as unknown as Eip1193Provider
        ); // define Ethereumish in interface
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
          setIsInitialDeposit(!!user?.isIntitialDeposit);

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
      const justProvider =
        (Array.isArray((ethereum as Ethereumish)?.providers) // use Ethereumish type instead of any
          ? ((ethereum as Ethereumish).providers as Ethereumish[]).find((e) => {
              const p = e as { isMetaMask?: boolean; _metamask?: unknown };
              return !!(p?.isMetaMask && p?._metamask);
            })
          : undefined) || (window as { ethereum?: Ethereumish })?.ethereum; // use Ethereumish type
      if (!justProvider) {
        throw new Error("MetaMask is not installed.");
      }
      console.log("justProvider", justProvider);
      const client = await createWalletClient({
        transport: custom(justProvider as unknown as Eip1193Provider, {
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

      const [addr] = await client.requestAddresses();

      await sleepTimer(1000);
      setAddress(addr);
      setCurrentConnector("metamask");
      setCurrentProvider(justProvider);
      setLoading(false);
      await authenticateUserWithBackend(addr, justProvider, client);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("MetaMask is not installed")
      ) {
        toastInfo("MetaMask is not installed. Please install MetaMask.");
        await sleepTimer(1500);
        window.open(`https://metamask.io/download/`);
      } else if (
        (error as { toString: () => string })
          ?.toString()
          .includes("ChainNotConfiguredForConnectorError")
      ) {
        const switched = await switchNetwork(8453);
        if (switched) await connectMetamask();
      } else if (error instanceof RpcError) {
        toastError("Wallet connection failed");
      } else if (error instanceof Error) {
        toastError("Wallet connection failed");
      } else if ((error as { message?: string })?.message) {
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

      const justProvider =
        currProvider ||
        (Array.isArray((ethereum as Ethereumish)?.providers) // use Ethereumish type
          ? ((ethereum as Ethereumish).providers as Ethereumish[]).find(
              (e) => (e as { isTrust?: boolean })?.isTrust
            )
          : undefined) ||
        (ethereum as Ethereumish); // use Ethereumish type
      let account = (justProvider as { selectedAddress?: string })
        ?.selectedAddress as string | undefined;

      let client: unknown = null;
      if (!account) {
        client = await createWalletClient({
          transport: custom(justProvider as unknown as Eip1193Provider, {
            retryCount: 3,
            retryDelay: 1000,
          }),
        });
        try {
          await (
            client as { switchChain: (args: { id: number }) => Promise<void> }
          ).switchChain({ id: base.id });
          setChainId(base.id);
        } catch (e) {
          try {
            await (
              client as {
                addChain: (args: { chain: typeof base }) => Promise<void>;
              }
            ).addChain({ chain: base });
            setChainId(base.id);
          } catch (e) {
            setTimeout(
              async () =>
                await (
                  client as {
                    switchChain: (args: { id: number }) => Promise<void>;
                  }
                ).switchChain({ id: base.id }),
              100
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("error", e);
          }
        }
        const [addr] = await (
          client as { requestAddresses: () => Promise<string[]> }
        )?.requestAddresses();
        account = addr;
      }

      await sleepTimer(1000);

      setCurrentProvider(justProvider);
      setAddress(account!);
      setLoading(false);
      setCurrentConnector("trust");
      if (client) {
        await authenticateUserWithBackend(account!, justProvider, client);
      } else {
        await authenticateUserWithBackend(account!, justProvider);
      }
    } catch (error) {
      const errObj = error as { message?: string };
      toastError(
        errObj?.message ? `Error: ${errObj.message}` : "Something went wrong"
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
      const justProvider =
        (Array.isArray((ethereum as Ethereumish)?.providers) // use Ethereumish type
          ? ((ethereum as Ethereumish).providers as Ethereumish[]).find(
              (e) => (e as { isCoinbaseWallet?: boolean })?.isCoinbaseWallet
            )
          : undefined) || (ethereum as Ethereumish); // use Ethereumish type

      if (!justProvider) {
        throw new Error("Coinbase Wallet is not installed");
      }

      const accounts = await (
        justProvider as {
          request: (args: { method: string }) => Promise<string[]>;
        }
      ).request({
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
      const e = error as { reason?: string } | Error;
      toastError(
        (e as { reason?: string })?.reason
          ? `Error: ${(e as { reason?: string })?.reason}`
          : e instanceof Error
          ? e?.message
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
      await (
        currentProvider as {
          request: (args: {
            method: string;
            params?: unknown[];
          }) => Promise<unknown>;
        }
      ).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
      });
      setChainId(chainId);
      return true;
    } catch (e) {
      const err = e as { code?: number };
      if (err?.code === 4001) {
        toastError("User rejected switching chains.");
      } else if (err?.code === 4902) {
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
      await (
        currentProvider as {
          request: (args: {
            method: string;
            params?: unknown[];
          }) => Promise<unknown>;
        }
      ).request({
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

  const loadWallet = useCallback(async () => {
    try {
      const provider = new BrowserProvider(
        currentProvider as unknown as Eip1193Provider
      );
      const accounts = await provider.send("eth_requestAccounts", []);
      const networkInfo = await provider.getNetwork();
      const currentChainId = Number(networkInfo.chainId);
      const walletNetwork: INetworkData = {
        account: accounts[0],
        provider: provider,
        chainId: currentChainId,
      };
      setNetworkData(walletNetwork);
      setChainId(currentChainId);
      return walletNetwork;
    } catch {}
  }, [currentProvider]);

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
    setUserProfileState((prev) => {
      const newProfile = { ...prev, ...user };
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

    const handler = (id: unknown) => {
      const newChainId = id as string | number;
      setChainId(newChainId as number);
      void loadWallet();
    };

    (
      currentProvider as {
        on?: (event: string, cb: (id: unknown) => void) => void;
        removeListener?: (event: string, cb: (id: unknown) => void) => void;
        off?: (event: string, cb: (id: unknown) => void) => void;
      }
    )?.on?.("chainChanged", handler);

    const token = authService.getToken();
    if (token) {
      if (!hasFetchedUserRef.current) {
        (async () => {
          try {
            const user = await authService.getMe(token);
            setUserProfile(user);
            setIsWhitelisted(!!user.isWhitelisted);
            setTwitterAccount(user.twitterAccount);
            setUserMorphoVault(user?.morphoVault ? user?.morphoVault : null);
            setIsInitialDeposit(!!user?.isIntitialDeposit);

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
            hasFetchedUserRef.current = true;
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        })();
      }
    }
    return () => {
      (
        currentProvider as {
          removeListener?: (event: string, cb: (id: unknown) => void) => void;
          off?: (event: string, cb: (id: unknown) => void) => void;
        }
      )?.removeListener?.("chainChanged", handler);
      (
        currentProvider as {
          off?: (event: string, cb: (id: unknown) => void) => void;
        }
      )?.off?.("chainChanged", handler);
    };
  }, [address, currentProvider, loadWallet]);

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
        provider: currentProvider
          ? new BrowserProvider(currentProvider as unknown as Eip1193Provider)
          : null,
        getVaultApy,
        chainId,
        setChainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
