import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal
} from 'react-native';
import {
  ChevronLeft,
  Bell,
  Home,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  Shield,
  Calendar,
  DollarSign,
  Filter,
  Check,
  Trash2,
  Building2
} from 'lucide-react-native';

const NotificationsScreen = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'inquiry',
      title: 'New inquiry on Luxury Apartment',
      description: 'John Smith is interested in your Downtown Manhattan listing and wants to schedule a viewing.',
      timestamp: '5m ago',
      isRead: false,
      group: 'today'
    },
    {
      id: '2',
      type: 'verification',
      title: 'Document Approved',
      description: 'Your Business License has been verified and approved by our team.',
      timestamp: '1h ago',
      isRead: false,
      group: 'today'
    },
    {
      id: '3',
      type: 'project',
      title: 'Project Status Update',
      description: 'Riverside Towers Phase 2 construction is now 75% complete and on schedule.',
      timestamp: '3h ago',
      isRead: false,
      group: 'today'
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Pending Action Required',
      description: 'Upload Address Verification document to complete your builder profile verification.',
      timestamp: '5h ago',
      isRead: true,
      isUrgent: true,
      group: 'today'
    },
    {
      id: '5',
      type: 'inquiry',
      title: 'Viewing Confirmed',
      description: 'Sarah Martinez confirmed the property viewing for Penthouse Suite tomorrow at 2 PM.',
      timestamp: '8h ago',
      isRead: true,
      group: 'today'
    },
    {
      id: '6',
      type: 'document',
      title: 'Document Rejected',
      description: 'Bank Statement was rejected. Reason: Document quality is unclear. Please re-upload.',
      timestamp: 'Yesterday',
      isRead: true,
      isUrgent: true,
      group: 'yesterday'
    },
    {
      id: '7',
      type: 'system',
      title: 'New Feature: Virtual Tours',
      description: 'Add 360° virtual tours to your listings and increase engagement by up to 40%.',
      timestamp: 'Yesterday',
      isRead: true,
      group: 'yesterday'
    },
    {
      id: '8',
      type: 'inquiry',
      title: 'Price Negotiation Request',
      description: 'A buyer has made an offer of $1,650,000 for Modern Penthouse Suite.',
      timestamp: '2 days ago',
      isRead: true,
      group: 'earlier'
    },
    {
      id: '9',
      type: 'project',
      title: 'Project Approved',
      description: 'Green Valley Residences project has been approved and is now live on the platform.',
      timestamp: '3 days ago',
      isRead: true,
      group: 'earlier'
    },
    {
      id: '10',
      type: 'system',
      title: 'Platform Maintenance',
      description: 'Scheduled maintenance on Jan 20, 2026 from 2 AM to 4 AM. Services may be temporarily unavailable.',
      timestamp: '4 days ago',
      isRead: true,
      group: 'earlier'
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'inquiry':
        return { Icon: MessageSquare, color: '#2D6A4F', bg: '#eff6ff' };
      case 'project':
        return { Icon: Building2, color: '#9333ea', bg: '#faf5ff' };
      case 'document':
        return { Icon: FileText, color: '#ea580c', bg: '#fff7ed' };
      case 'verification':
        return { Icon: Shield, color: '#16a34a', bg: '#f0fdf4' };
      case 'reminder':
        return { Icon: Clock, color: '#d97706', bg: '#fffbeb' };
      case 'system':
        return { Icon: AlertCircle, color: '#0d9488', bg: '#f0fdfa' };
    }
  };

  const filterNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'listings') return notifications.filter(n => n.type === 'inquiry');
    if (filter === 'projects') return notifications.filter(n => n.type === 'project');
    if (filter === 'system') return notifications.filter(n => n.type === 'system');
    return notifications;
  };

  const groupNotifications = (filteredNotifications) => {
    const grouped = {
      today: [],
      yesterday: [],
      earlier: []
    };

    filteredNotifications.forEach(notif => {
      grouped[notif.group].push(notif);
    });

    return grouped;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = filterNotifications();
  const groupedNotifications = groupNotifications(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: notifications.length },
    { value: 'listings', label: 'Listings & Inquiries', count: notifications.filter(n => n.type === 'inquiry').length },
    { value: 'projects', label: 'Projects', count: notifications.filter(n => n.type === 'project').length },
    { value: 'system', label: 'System Updates', count: notifications.filter(n => n.type === 'system').length }
  ];

  const renderNotificationCard = (notification, showUnreadIndicator = true) => {
    const { Icon, color, bg } = getNotificationIcon(notification.type);
    
    return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => !notification.isRead && markAsRead(notification.id)}
        style={[
          styles.notificationCard,
          !notification.isRead ? styles.notificationCardUnread : styles.notificationCardRead
        ]}
        activeOpacity={0.7}
      >
        {/* Unread Indicator */}
        {!notification.isRead && showUnreadIndicator && (
          <View style={styles.unreadIndicator} />
        )}

        <View style={styles.notificationContent}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: bg }]}>
            <Icon width={20} height={20} color={color} />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text 
                style={[
                  styles.notificationTitle,
                  !notification.isRead && styles.notificationTitleUnread
                ]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {notification.description}
            </Text>
            
            {notification.isUrgent && (
              <View style={styles.urgentBadge}>
                <AlertCircle width={12} height={12} color="#dc2626" />
                <Text style={styles.urgentText}>Action Required</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!notification.isRead && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              style={styles.actionButton}
            >
              <Check width={14} height={14} color="#6b7280" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            style={styles.actionButton}
          >
            <Trash2 width={14} height={14} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1551442150-ba8a17b9343e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />
        
        <View style={styles.headerContent}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                  <ChevronLeft width={24} height={24} color="#ffffff" />
                </TouchableOpacity>
              )}
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Bell width={24} height={24} color="#ffffff" />
                </View>
                <Text style={styles.logoText}>EstateHub</Text>
              </View>
            </View>

            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={markAllAsRead}
                disabled={unreadCount === 0}
                style={[
                  styles.markAllButton,
                  unreadCount === 0 && styles.markAllButtonDisabled
                ]}
              >
                <Text style={[
                  styles.markAllText,
                  unreadCount === 0 && styles.markAllTextDisabled
                ]}>
                  Mark all read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilterMenu(true)}
                style={styles.filterButton}
              >
                <Filter width={20} height={20} color="#ffffff" />
                {filter !== 'all' && (
                  <View style={styles.filterDot} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterMenu(false)}
        >
          <View style={styles.filterModal}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setFilter(option.value);
                  setShowFilterMenu(false);
                }}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionActive
                ]}
              >
                <Text style={[
                  styles.filterOptionText,
                  filter === option.value && styles.filterOptionTextActive
                ]}>
                  {option.label}
                </Text>
                <View style={styles.filterOptionRight}>
                  <Text style={styles.filterCount}>{option.count}</Text>
                  {filter === option.value && (
                    <Check width={16} height={16} color="#2D6A4F" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Bell width={40} height={40} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            {filter !== 'all' 
              ? 'No notifications in this category' 
              : "We'll notify you when something important happens"
            }
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Today */}
          {groupedNotifications.today.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TODAY</Text>
              </View>
              <View style={styles.notificationsList}>
                {groupedNotifications.today.map((notification) => 
                  renderNotificationCard(notification, true)
                )}
              </View>
            </View>
          )}

          {/* Yesterday */}
          {groupedNotifications.yesterday.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>YESTERDAY</Text>
              </View>
              <View style={styles.notificationsList}>
                {groupedNotifications.yesterday.map((notification) => 
                  renderNotificationCard(notification, true)
                )}
              </View>
            </View>
          )}

          {/* Earlier */}
          {groupedNotifications.earlier.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>EARLIER</Text>
              </View>
              <View style={styles.notificationsList}>
                {groupedNotifications.earlier.map((notification) => 
                  renderNotificationCard(notification, false)
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom CTA */}
      {filteredNotifications.length > 0 && (
        <View style={styles.bottomCTA}>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    height: 176,
    position: 'relative'
  },
  headerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  headerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(45, 106, 79, 0.8)'
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 106, 79, 1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  markAllButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  markAllText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  markAllTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)'
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    position: 'relative'
  },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5eead4'
  },
  titleSection: {
    gap: 4
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#e0e7ff',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 136,
    paddingRight: 20
  },
  filterModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24
  },
  filterOptionActive: {
    backgroundColor: '#eff6ff'
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1
  },
  filterOptionTextActive: {
    color: '#2D6A4F'
  },
  filterOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  filterCount: {
    fontSize: 12,
    color: '#9ca3af'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  sectionHeader: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8
  },
  notificationCard: {
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'visible'
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(239, 246, 255, 0.5)',
    borderColor: '#bfdbfe'
  },
  notificationCardRead: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb'
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2D6A4F',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    paddingLeft: 20,
    gap: 12
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContainer: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1
  },
  notificationTitleUnread: {
    fontWeight: '600',
    color: '#111827'
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af'
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b91c1c'
  },
  actionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4
  },
  actionButton: {
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  bottomCTA: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16
  },
  ctaButton: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default NotificationsScreen;