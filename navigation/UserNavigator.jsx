{/* Fixed Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('home')}
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
          onPress={() => handleTabPress('search')}
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
          onPress={() => handleTabPress('favorites')}
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
          onPress={() => handleTabPress('messages')}
        >
          <View>
            <MessageCircle
              color={activeTab === 'messages' ? '#2D6A4F' : '#9CA3AF'}
              size={24}
              strokeWidth={2}
            />
            <View style={styles.messageBadge}>
              <Text style={styles.messageBadgeText}>2</Text>
            </View>
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

        {/* ✅ FIX 4: Corrected Profile tab with proper onPress handler */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('profile')}
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