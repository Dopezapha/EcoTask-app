import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStellarWallet } from '../hooks/useStellarWallet';
import { useAuth } from '../hooks/useAuth';
import { useWalletStore } from '../store/walletStore';
import { colors, spacing } from '../utils/theme';

export default function OnboardingScreen() {
  const {
    connectFreighter,
    createInAppWallet,
    isConnecting,
    error: walletError,
  } = useStellarWallet();
  const { authenticate, isAuthenticating, error: authError } = useAuth();
  const { publicKey, isConnected } = useWalletStore();

  useEffect(() => {
    if (isConnected && publicKey) {
      authenticate(publicKey).catch(() => {});
    }
  }, [isConnected, publicKey, authenticate]);

  const error = walletError || authError;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      <View style={{ alignItems: 'center', marginBottom: spacing.xl * 2 }}>
        <Text style={{ fontSize: 48, color: colors.primary }}>🌱</Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: spacing.sm,
          }}
        >
          EcoTask
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.sm,
          }}
        >
          Earn rewards for climate action
        </Text>
      </View>

      {error && (
        <Text
          style={{
            color: colors.error,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}
        >
          {error}
        </Text>
      )}

      <TouchableOpacity
        onPress={connectFreighter}
        disabled={isConnecting || isAuthenticating}
        style={{
          padding: spacing.md,
          backgroundColor: colors.primary,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: isConnecting || isAuthenticating ? 0.5 : 1,
        }}
      >
        {isConnecting || isAuthenticating ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>
            Connect Freighter
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={createInAppWallet}
        disabled={isConnecting || isAuthenticating}
        style={{
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderRadius: 12,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
          Create Test Wallet
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: colors.textSecondary,
          textAlign: 'center',
          fontSize: 12,
          marginTop: spacing.xl,
        }}
      >
        Testnet only • No real funds required
      </Text>
    </View>
  );
}
