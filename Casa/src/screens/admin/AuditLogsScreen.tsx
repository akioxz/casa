import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, THEME } from '../../constants/theme';
import { ActivityLog } from '../../types/database';
import { furnitureService } from '../../services/furnitureService';
import { Ionicons } from '@expo/vector-icons';

export const AuditLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await furnitureService.fetchActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'ADD_ITEM': return 'add-circle';
      case 'EDIT_ITEM': return 'pencil';
      case 'DELETE_ITEM': return 'trash';
      default: return 'ellipse';
    }
  };
  
  const getActionColor = (action: string) => {
    switch(action) {
      case 'ADD_ITEM': return COLORS.secondary;
      case 'EDIT_ITEM': return COLORS.primary;
      case 'DELETE_ITEM': return COLORS.error;
      default: return COLORS.textMuted;
    }
  };

  const renderLogItem = ({ item }: { item: ActivityLog }) => {
    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.adminInfo}>
            <Ionicons name="person-circle" size={24} color={COLORS.textSecondary} />
            <Text style={styles.adminName}>{item.admin?.username || 'Unknown Admin'}</Text>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <View style={styles.logBody}>
          <View style={[styles.actionBadge, { backgroundColor: getActionColor(item.action) + '20' }]}>
            <Ionicons name={getActionIcon(item.action) as any} size={14} color={getActionColor(item.action)} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: getActionColor(item.action) }]}>
              {item.action.replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.details}>{item.details}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No activity logs found.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: THEME.spacing.lg,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  logCard: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...THEME.shadows.small,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminName: {
    fontSize: THEME.typography.fontSize.sm,
    fontFamily: THEME.typography.fontFamily.bold,
    color: COLORS.primary,
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  logBody: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: THEME.spacing.sm,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 10,
    fontFamily: THEME.typography.fontFamily.bold,
  },
  details: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
export default AuditLogsScreen;
