import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../utils/theme';
import { useTaskFeed } from '../hooks/useTaskFeed';
import TaskCard from '../components/TaskCard';
import { TaskCardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const TASK_TYPES = [
  { key: '', label: 'All', icon: '🌍' },
  { key: 'TREE_PLANTING', label: 'Trees', icon: '🌳' },
  { key: 'TRASH_COLLECTION', label: 'Trash', icon: '♻️' },
  { key: 'OCEAN_CLEANUP', label: 'Ocean', icon: '🌊' },
  { key: 'GARDENING', label: 'Garden', icon: '🌱' },
  { key: 'EDUCATION', label: 'Learn', icon: '📚' },
];

export default function TaskListScreen() {
  const navigation = useNavigation<any>();
  const [activeType, setActiveType] = useState('');
  const { tasks, isLoading, error, refresh, loadMore } = useTaskFeed(
    activeType ? { type: activeType } : {},
  );

  const handleTaskPress = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  if (isLoading && tasks.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.md,
          }}
        >
          <Text
            style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}
          >
            Tasks
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Find climate actions near you
          </Text>
        </View>
        {Array.from({ length: 5 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.error }}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: spacing.md,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
          Tasks
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Find climate actions near you
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        {TASK_TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveType(t.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: 20,
              marginRight: spacing.sm,
              backgroundColor:
                activeType === t.key ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor:
                activeType === t.key ? colors.primary : colors.border,
            }}
          >
            <Text style={{ marginRight: spacing.xs }}>{t.icon}</Text>
            <Text
              style={{
                color: activeType === t.key ? '#FFF' : colors.textSecondary,
                fontWeight: activeType === t.key ? '600' : '400',
                fontSize: 14,
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <TaskCard
              id={item.id}
              title={item.title}
              type={item.type}
              rewardAmount={item.rewardAmount}
              rewardToken={item.rewardToken || 'ECO'}
              distance={item.distance}
              onPress={handleTaskPress}
            />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={isLoading && tasks.length > 0}
        onRefresh={refresh}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="🔍"
              title="No tasks found"
              description="Check back later for new climate actions"
            />
          ) : null
        }
        ListFooterComponent={
          isLoading && tasks.length > 0 ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ padding: spacing.md }}
            />
          ) : null
        }
      />
    </View>
  );
}
