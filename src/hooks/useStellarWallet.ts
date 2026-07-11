import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Config from 'react-native-config';
import { useWalletStore } from '../store/walletStore';
import * as stellar from '../services/stellar';

interface FreighterWindow {
  freighter?: {
    isConnected: () => Promise<boolean>;
    getPublicKey: () => Promise<string>;
    signTransaction: (xdr: string) => Promise<string>;
  };
}

export function useStellarWallet() {
  const {
    connect,
    disconnect,
    setBalance,
    setEcoBalance,
    publicKey,
    isConnected,
  } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectFreighter = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const freighter = (
        Platform.OS === 'web' ? window : ({} as FreighterWindow)
      ).freighter;
      if (!freighter) {
        throw new Error('Freighter extension not detected');
      }
      const isConnected = await freighter.isConnected();
      if (!isConnected) {
        throw new Error('Please unlock Freighter first');
      }
      const key = await freighter.getPublicKey();
      connect(key);
      const balance = await stellar.getBalance(key);
      setBalance(balance);
      await refreshEcoBalance(key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [connect, setBalance, refreshEcoBalance]);

  const connectLobstr = useCallback(async () => {
    setError('Lobstr integration coming soon');
  }, []);

  const createInAppWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { publicKey, secretKey } = await stellar.createTestnetAccount();
      connect(publicKey);
      const balance = await stellar.getBalance(publicKey);
      setBalance(balance);
      await refreshEcoBalance(publicKey);
      return { publicKey, secretKey };
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [connect, setBalance, refreshEcoBalance]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const refreshBalance = useCallback(async () => {
    if (publicKey) {
      const balance = await stellar.getBalance(publicKey);
      setBalance(balance);
    }
  }, [publicKey, setBalance]);

  const refreshEcoBalance = useCallback(
    async (pk?: string) => {
      const key = pk || publicKey;
      const ecoCode = Config.ECO_TOKEN_ASSET_CODE;
      const ecoIssuer = Config.ECO_TOKEN_ISSUER;
      if (key && ecoCode && ecoIssuer) {
        const ecoBalance = await stellar.getTokenBalance(
          key,
          ecoCode,
          ecoIssuer,
        );
        setEcoBalance(ecoBalance);
      }
    },
    [publicKey, setEcoBalance],
  );

  useEffect(() => {
    if (isConnected && publicKey) {
      refreshBalance();
      refreshEcoBalance();
    }
  }, [isConnected, publicKey, refreshBalance, refreshEcoBalance]);

  return {
    isConnecting,
    error,
    publicKey,
    isConnected,
    connectFreighter,
    connectLobstr,
    createInAppWallet,
    disconnectWallet,
    refreshBalance,
    refreshEcoBalance,
  };
}
