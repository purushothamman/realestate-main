import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Home,
  Search,
  Heart,
  MessageCircle,
  User,
} from 'lucide-react-native';

export default function UserNavigator({ 
  activeTab, 
  onTabPress, 
  messageCount = 0 
}) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress('home')}
      >
        <Home
          color={activeTab === 'home' ? '#2D6A4F' : '#9CA3AF'}
          size={24}
          strokeWidth={2}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'home' && styles.navLabelActive,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress('search')}
      >
        <Search
          color={activeTab === 'search' ? '#2D6A4F' : '#9CA3AF'}
          size={24}
          strokeWidth={2}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'search' && styles.navLabelActive,
          ]}
        >
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress('favorites')}
      >
        <Heart
          color={activeTab === 'favorites' ? '#2D6A4F' : '#9CA3AF'}
          size={24}
          strokeWidth={2}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'favorites' && styles.navLabelActive,
          ]}
        >
          Favorites
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress('messages')}
      >
        <View>
          <MessageCircle
            color={activeTab === 'messages' ? '#2D6A4F' : '#9CA3AF'}
            size={24}
            strokeWidth={2}
          />
          {messageCount > 0 && (
            <View style={styles.messageBadge}>
              <Text style={styles.messageBadgeText}>{messageCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'messages' && styles.navLabelActive,
          ]}
        >
          Messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress('profile')}
      >
        <User
          color={activeTab === 'profile' ? '#2D6A4F' : '#9CA3AF'}
          size={24}
          strokeWidth={2}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'profile' && styles.navLabelActive,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  navLabelActive: {
    color: '#2D6A4F',
  },
  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});