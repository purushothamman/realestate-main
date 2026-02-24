import React, { useEffect, useState } from 'react';
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
  ArrowLeft,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../../utils/api';
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
      source={{ uri: src || DEFAULT_PROFILE_IMAGE }}
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

// Main ChatListScreen Component
export default function ChatListScreen({ navigation, onBack, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);


  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const res = await fetch(`${API_BASE_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Chats:", data);

        // 🔥 MAP backend → UI format & Safety check for unique IDs
        const seenIds = new Set();
        const formatted = data
          .map(chat => ({
            id: chat.chat_id,
            name: chat.other_user_name || "User",
            property: chat.property_title || "Property",
            lastMessage: chat.last_message || "",
            timestamp: chat.timestamp || "",
            unreadCount: chat.unread || 0,
            avatar: getImageUrl(chat.other_user_image || chat.image),
            online: false
          }))
          .filter(chat => {
            if (seenIds.has(chat.id)) return false;
            seenIds.add(chat.id);
            return true;
          });

        setChats(formatted);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();

    if (route?.params?.chatId) {
      const chatId = route.params.chatId;

      setTimeout(() => {
        navigation.navigate('chat', {
          chatId: chatId
        });
      }, 100);
    }
  }, []);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chatId) => {
    console.log('Chat pressed:', chatId);
    // Navigate to chat details screen
    // if (navigation) {
    navigation.navigate('chat', { chatId });
    // }
  };

  const handleNewMessage = () => {
    console.log('Start new conversation');
    // Navigate to new conversation screen
    // if (navigation) {
    //   navigation.navigate('NewConversation');
    // }
  };

  const handleBackPress = () => {
    // Use onBack callback first, then fallback to navigation.goBack
    if (onBack) {
      onBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    // Add navigation logic here based on the tab
    if (tab === 'home' && navigation) {
      navigation.goBack();
    } else if (navigation) {
      // Add navigation for other tabs if needed
      switch (tab) {
        case 'search':
          // navigation.navigate('Search');
          break;
        case 'favorites':
          // navigation.navigate('Favorites');
          break;
        case 'profile':
          // navigation.navigate('Profile');
          break;
        default:
          break;
      }
    }
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2.5} />
          </TouchableOpacity>

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
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    bottom: 2,
    right: 2,
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
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});