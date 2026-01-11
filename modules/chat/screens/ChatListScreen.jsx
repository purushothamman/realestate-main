import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Home,
  Search,
  MessageCircle,
  Heart,
  User,
  Plus,
  House,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// ImageWithFallback Component
const ImageWithFallback = ({ src, alt, style }) => {
  const [imgError, setImgError] = useState(false);
  
  if (imgError || !src) {
    return (
      <View style={[style, styles.fallbackAvatar]}>
        <Text style={styles.fallbackText}>
          {alt ? alt.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri: src }}
      style={style}
      onError={() => setImgError(true)}
    />
  );
};

// ChatListItem Component
const ChatListItem = ({ chat, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.chatContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <ImageWithFallback
            src={chat.avatar}
            alt={chat.name}
            style={styles.avatar}
          />
          {chat.online && <View style={styles.onlineIndicator} />}
        </View>
        
        {/* Content */}
        <View style={styles.chatTextContainer}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <Text style={styles.chatName} numberOfLines={1}>
                {chat.name}
              </Text>
              <Text style={styles.chatProperty} numberOfLines={1}>
                {chat.property}
              </Text>
            </View>
            <View style={styles.chatHeaderRight}>
              <Text style={styles.timestamp}>{chat.timestamp}</Text>
              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Last Message */}
          <Text style={styles.lastMessage} numberOfLines={2}>
            {chat.lastMessage}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// NavItem Component
const NavItem = ({ icon: Icon, label, active = false, onPress, badge = 0 }) => {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.navIconContainer}>
        <Icon 
          color={active ? '#2D6A4F' : '#6B7280'} 
          size={24}
          strokeWidth={active ? 2.5 : 2}
        />
        {badge > 0 && (
          <View style={styles.navBadge}>
            <Text style={styles.navBadgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// BottomNav Component
const BottomNav = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.bottomNav}>
      <NavItem
        icon={Home}
        label="Home"
        active={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      />
      <NavItem
        icon={Search}
        label="Search"
        active={activeTab === 'search'}
        onPress={() => onTabChange('search')}
      />
      <NavItem
        icon={MessageCircle}
        label="Messages"
        active={activeTab === 'messages'}
        onPress={() => onTabChange('messages')}
        badge={7}
      />
      <NavItem
        icon={Heart}
        label="Saved"
        active={activeTab === 'saved'}
        onPress={() => onTabChange('saved')}
      />
      <NavItem
        icon={User}
        label="Profile"
        active={activeTab === 'profile'}
        onPress={() => onTabChange('profile')}
      />
    </View>
  );
};

// Main MessagesScreen Component
export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  
  // Mock chat data
  const chatData = [
    {
      id: '1',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
      name: 'Sarah Johnson',
      role: 'Agent',
      property: 'Luxury Penthouse Downtown',
      lastMessage: 'The viewing is scheduled for tomorrow at 3 PM. Looking forward to showing you around!',
      timestamp: '2m ago',
      unreadCount: 2,
      online: true,
    },
    {
      id: '2',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
      name: 'Michael Chen',
      role: 'Buyer',
      property: 'Inquiry about Modern Villa',
      lastMessage: 'Thanks for the information. Can we discuss the financing options?',
      timestamp: '1h ago',
      unreadCount: 0,
      online: false,
    },
    {
      id: '3',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop',
      name: 'Emma Williams',
      role: 'Buyer',
      property: 'Suburban Family Home',
      lastMessage: "I'm interested in making an offer. What's the next step?",
      timestamp: '3h ago',
      unreadCount: 5,
      online: true,
    },
    {
      id: '4',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      name: 'James Rodriguez',
      role: 'Agent',
      property: 'Waterfront Condo',
      lastMessage: 'Just sent you the updated listing photos. Take a look!',
      timestamp: '5h ago',
      unreadCount: 0,
      online: false,
    },
    {
      id: '5',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      name: 'Lisa Anderson',
      role: 'Seller',
      property: 'Downtown Apartment',
      lastMessage: 'The price looks good. When can we schedule a visit?',
      timestamp: 'Yesterday',
      unreadCount: 1,
      online: false,
    },
    {
      id: '6',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      name: 'David Park',
      role: 'Seller',
      property: 'Colonial Style House',
      lastMessage: 'Thank you for handling the sale. Everything went smoothly!',
      timestamp: 'Yesterday',
      unreadCount: 0,
      online: true,
    },
    {
      id: '7',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      name: 'Rachel Green',
      role: 'Buyer',
      property: 'Garden Apartment',
      lastMessage: 'Could you send me the property inspection report?',
      timestamp: '2 days ago',
      unreadCount: 0,
      online: false,
    },
    {
      id: '8',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      name: 'Tom Wilson',
      role: 'Agent',
      property: 'Beachfront Property',
      lastMessage: 'Great news! The seller accepted your offer.',
      timestamp: '3 days ago',
      unreadCount: 3,
      online: false,
    },
  ];

  // Filter chats based on search query
  const filteredChats = chatData.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chatId) => {
    console.log('Chat pressed:', chatId);
    // Navigate to chat details screen
  };

  const handleNewMessage = () => {
    console.log('Start new conversation');
    // Navigate to new conversation screen
  };

  const totalUnread = chatData.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Background Image with Overlay */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
          }}
          style={styles.backgroundImage}
        />
        <View style={styles.backgroundOverlay} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <House color="#FFFFFF" size={28} strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>EstateHub</Text>
            <Text style={styles.headerSubtitle}>Your property companion</Text>
          </View>
        </View>

        <View style={styles.headerBottom}>
          <View style={styles.messagesTitleRow}>
            <Text style={styles.messagesTitle}>Your Messages</Text>
            {totalUnread > 0 && (
              <View style={styles.totalUnreadBadge}>
                <Text style={styles.totalUnreadText}>{totalUnread}</Text>
              </View>
            )}
          </View>
          <Text style={styles.messagesSubtitle}>
            Connect with agents, sellers, and buyers directly
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#9CA3AF" size={20} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      <ScrollView
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onPress={() => handleChatPress(chat.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle color="#9CA3AF" size={64} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No conversations found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewMessage}
        activeOpacity={0.8}
      >
        <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31, 41, 55, 0.75)',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerBottom: {
    marginTop: 8,
  },
  messagesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  messagesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalUnreadBadge: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  totalUnreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messagesSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    fontSize: 20,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  chatList: {
    flex: 1,
    zIndex: 10,
  },
  chatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  chatContent: {
    flexDirection: 'row',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 14,
    right: 4,
    width: 14,
    height: 14,
    backgroundColor: '#10B981',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fallbackAvatar: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  chatTextContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chatHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  chatProperty: {
    fontSize: 13,
    color: '#2D6A4F',
    fontWeight: '600',
  },
  chatHeaderRight: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    boxShadow: '0px 4px 16px rgba(45, 106, 79, 0.4)',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 8,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.05)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navIconContainer: {
    position: 'relative',
  },
  navBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#2D6A4F',
  },
});