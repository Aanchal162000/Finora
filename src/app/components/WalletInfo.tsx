import React from "react";
import { useWallet } from "@/hooks/useWallet";

const WalletInfo: React.FC = () => {
  const {
    address,
    chainId,
    isConnected,
    loading,
    disconnect,
    userProfile,
    isOnboarded,
  } = useWallet();

  if (!isConnected) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No wallet connected</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>

      <div className="space-y-2">
        <div>
          <span className="font-medium">Address:</span>
          <span className="ml-2 font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>

        <div>
          <span className="font-medium">Chain ID:</span>
          <span className="ml-2">{chainId}</span>
        </div>

        <div>
          <span className="font-medium">Onboarded:</span>
          <span
            className={`ml-2 ${
              isOnboarded ? "text-green-600" : "text-red-600"
            }`}
          >
            {isOnboarded ? "Yes" : "No"}
          </span>
        </div>

        {userProfile && (
          <div>
            <span className="font-medium">User Profile:</span>
            <pre className="ml-2 text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <button
        onClick={disconnect}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        disabled={loading}
      >
        {loading ? "Disconnecting..." : "Disconnect Wallet"}
      </button>
    </div>
  );
};

export default WalletInfo;

