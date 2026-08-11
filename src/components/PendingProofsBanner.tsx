import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../utils/theme';

interface PendingProofsBannerProps {
  count: number;
  isSyncing?: boolean;
  onRetry: () => void;
}

export default function PendingProofsBanner({
  count,
  isSyncing = false,
  onRetry,
}: PendingProofsBannerProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colors.warning,
        borderRadius: 12,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: spacing.sm }}>📤</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#000', fontWeight: '600', fontSize: 13 }}>
          {count} proof{count === 1 ? '' : 's'} waiting to sync
        </Text>
        <Text style={{ color: '#333', fontSize: 11 }}>
          They will upload automatically when you are online
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRetry}
        disabled={isSyncing}
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 10,
          backgroundColor: '#000',
          opacity: isSyncing ? 0.6 : 1,
        }}
      >
        {isSyncing ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 12 }}>
            Retry
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
