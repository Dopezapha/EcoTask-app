import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../utils/theme';
import { useWalletStore } from '../store/walletStore';
import Skeleton from './LoadingSkeleton';

interface StellarPayment {
  id: string;
  type: string;
  amount: string;
  asset_type: string;
  asset_code?: string;
  from: string;
  to: string;
  created_at: string;
}

interface TransactionHistoryProps {
  publicKey: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function TransactionHistory({
  publicKey,
}: TransactionHistoryProps) {
  const [payments, setPayments] = useState<StellarPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${publicKey}/payments?limit=10&order=desc`,
      );
      const data = await response.json();
      setPayments(data._embedded?.records || []);
      setError(null);
    } catch {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  if (loading) {
    return (
      <View style={{ marginTop: spacing.xl }}>
        <Skeleton height={18} width="40%" style={{ marginBottom: spacing.md }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={56} borderRadius={12} style={{ marginBottom: spacing.sm }} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
        <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
        <TouchableOpacity onPress={loadPayments}>
          <Text style={{ color: colors.primary, fontSize: 13, marginTop: spacing.xs }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (payments.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: spacing.md,
        }}
      >
        Recent Transactions
      </Text>
      {payments.map(payment => {
        const isSent = payment.from === publicKey;
        return (
          <View
            key={payment.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: spacing.md }}>
              {isSent ? '↗️' : '↙️'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '500', fontSize: 14 }}>
                {isSent ? 'Sent' : 'Received'} {payment.asset_code || 'XLM'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                {truncateAddress(isSent ? payment.to : payment.from)} · {timeAgo(payment.created_at)}
              </Text>
            </View>
            <Text
              style={{
                color: isSent ? colors.error : colors.primary,
                fontWeight: 'bold',
                fontSize: 14,
              }}
            >
              {isSent ? '-' : '+'}{Number(payment.amount).toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
