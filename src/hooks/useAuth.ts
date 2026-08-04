import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import {
  getAuthChallenge,
  loginWithWallet,
  fetchUserProfile,
} from '../services/api';
import { UserStats } from '../types';

interface FreighterWindow {
  freighter?: {
    signTransaction: (xdr: string) => Promise<string>;
  };
}

export function useAuth() {
  const { setProfile, setToken, logout } = useUserStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(
    async (publicKey: string) => {
      setIsAuthenticating(true);
      setError(null);
      try {
        const { challenge } = await getAuthChallenge(publicKey);

        const freighter = (
          Platform.OS === 'web' ? window : ({} as FreighterWindow)
        ).freighter;

        let signature: string;
        if (freighter?.signTransaction) {
          signature = await freighter.signTransaction(challenge);
        } else {
          signature = await signWithKeypair(challenge);
        }

        const { token, user } = await loginWithWallet(
          publicKey,
          signature,
          challenge,
        );

        const defaultStats: UserStats = {
          treesPlanted: 0,
          plasticCollected: 0,
          co2Reduced: 0,
        };

        setProfile({
          id: user.id,
          wallet: publicKey,
          name: user.name,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          stats: defaultStats,
        });
        setToken(token);

        return { token, user };
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [setProfile, setToken],
  );

  const syncProfile = useCallback(async () => {
    try {
      const profile = await fetchUserProfile();
      const currentStats = useUserStore.getState().profile?.stats;
      setProfile({
        id: profile.id,
        wallet: profile.wallet,
        name: profile.name,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        stats: currentStats || {
          treesPlanted: 0,
          plasticCollected: 0,
          co2Reduced: 0,
        },
      });
    } catch {
      // Silently fail - profile sync is best-effort
    }
  }, [setProfile]);

  return { authenticate, syncProfile, isAuthenticating, error, logout };
}

async function signWithKeypair(_challenge: string): Promise<string> {
  // For in-app testnet wallets, store the secret key in secure storage
  // and sign the challenge server-side. This is a simplified fallback.
  throw new Error(
    'In-app wallet signing not yet supported. Please use Freighter.',
  );
}
