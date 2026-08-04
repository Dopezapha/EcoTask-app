import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../utils/theme';
import ImpactStats from '../components/ImpactStats';
import { useUserStore } from '../store/userStore';
import { useActivityStore } from '../store/activityStore';
import { TASK_TYPE_CONFIG } from '../types';
import { TaskType } from '../types';

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

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useUserStore();
  const activities = useActivityStore(s => s.activities);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl * 2,
          paddingBottom: spacing.lg,
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text
            style={{ color: colors.text, fontSize: 28, fontWeight: 'bold' }}
          >
            Hello, {profile?.name || 'Eco Warrior'}!
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            marginTop: spacing.xs,
          }}
        >
          Your climate impact summary
        </Text>

        <View
          style={{
            marginTop: spacing.xl,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ImpactStats
            trees={profile?.stats?.treesPlanted || 0}
            plastic={profile?.stats?.plasticCollected || 0}
            co2={profile?.stats?.co2Reduced || 0}
          />
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: spacing.md,
            }}
          >
            Get Started
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Tasks')}
            style={{
              padding: spacing.lg,
              backgroundColor: colors.primary,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>
              Browse Tasks
            </Text>
            <Text style={{ marginLeft: spacing.sm, fontSize: 20 }}>🌿</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: spacing.md,
            }}
          >
            Recent Activity
          </Text>

          {activities.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: spacing.lg,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: 'dashed',
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                No recent activity yet.
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: spacing.xs,
                }}
              >
                Complete your first task to see it here!
              </Text>
            </View>
          ) : (
            activities.slice(0, 5).map(a => (
              <View
                key={a.id}
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
                <Text style={{ fontSize: 24, marginRight: spacing.md }}>
                  {TASK_TYPE_CONFIG[a.taskType as TaskType]?.icon || '📍'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: colors.text, fontWeight: '600' }}
                    numberOfLines={1}
                  >
                    {a.taskTitle}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {timeAgo(a.completedAt)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      color:
                        a.status === 'confirmed'
                          ? colors.primary
                          : a.status === 'pending'
                            ? colors.warning
                            : colors.error,
                      fontWeight: 'bold',
                    }}
                  >
                    +{a.rewardAmount}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {a.rewardToken}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
