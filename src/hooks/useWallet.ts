import { useWalletContext } from "@/app/contexts/WalletContext";

export const useWallet = () => {
  const context = useWalletContext();

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return {
    // Connection state
    address: context.address,
    chainId: context.chainId,
    isConnected: !!context.address,
    loading: context.loading,

    // Wallet functions
    connectWallet: context.connectWallet,
    disconnect: context.logout,
    switchNetwork: context.switchNetwork,

    // User data
    userProfile: context.userProfile,
    isOnboarded: context.isOnboarded,
    isWhitelisted: context.isWhitelisted,

    // Utility functions
    fetchTokenBalance: context.fetchTokenBalance,
    getVaultApy: context.getVaultApy,
  };
};

