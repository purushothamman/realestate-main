import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Icon Components
const ChevronLeftIcon = () => <Text style={styles.icon}>←</Text>;
const SendIcon = () => <Text style={styles.icon}>📤</Text>;
const PaperclipIcon = () => <Text style={styles.icon}>📎</Text>;
const MicIcon = () => <Text style={styles.icon}>🎤</Text>;
const ImageIconComponent = () => <Text style={styles.iconSmall}>🖼️</Text>;
const PhoneIcon = () => <Text style={styles.icon}>📞</Text>;
const VideoIcon = () => <Text style={styles.icon}>📹</Text>;
const MoreIcon = () => <Text style={styles.icon}>⋮</Text>;


// Message Bubble Component
const MessageBubble = ({ message, isUser }) => {
  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.agentMessageContainer,
      ]}
    >
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.agentBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.agentText]}>
          {message.message}
        </Text>
      </View>
      <View style={[styles.messageFooter, isUser && styles.userMessageFooter]}>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};



export default function ChatScreen({ navigation, onBack, route, user: propUser }) {
  const { chatId, inquiryId } = route.params || {};
  const [user, setUser] = useState(propUser);

  useEffect(() => {
    if (propUser) setUser(propUser);
  }, [propUser]);

  useEffect(() => {
    const ensureUser = async () => {
      if (!user) {
        try {
          const savedUser = await AsyncStorage.getItem('user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            console.log("🟢 RESTORED USER FROM STORAGE:", parsed.id);
          }
        } catch (e) {
          console.error("Failed to restore user:", e);
        }
      }
    };
    ensureUser();
  }, [user]);

  console.log("🟢 CHAT SCREEN PARAMS:", route?.params);
  console.log("🟢 CHAT ID:", chatId);
  console.log("🟢 CURRENT USER ID:", user?.id);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatContext, setChatContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animations
  const headerGradientAnim = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // API Configuration
  const getApiUrl = () => {
    const platform = Platform.OS;
    if (platform === 'android') {
      return 'http://10.0.2.2:5000/api';
    } else {
      return 'http://localhost:5000/api';
    }
  };
  const API_BASE_URL = getApiUrl();

  // useEffect(() => {
  //   if (chatId) {
  //     fetchMessages();
  //     const interval = setInterval(fetchMessages, 5000); // Poll every 5s
  //     return () => { 
  //       clearInterval(interval); 
  //     };
  //   }
  // }, [chatId]);
  useEffect(() => {
    if (!chatId) return;

    let isMounted = true;

    const loadMessages = async () => {
      if (isMounted) await fetchMessages();
    };

    loadMessages();

    const interval = setInterval(loadMessages, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [chatId]);

  useEffect(() => {
    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      clearInterval(interval);
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [chatId]);

  const fetchMessages = async () => {
    if (!chatId) {
      console.warn("⚠️ fetchMessages called without chatId");
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success || Array.isArray(data)) {
        // Handle both formats (array or object with messages)
        const msgs = Array.isArray(data) ? data : (data.messages || []);
        if (data.chatContext) setChatContext(data.chatContext);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        setMessage('');
        fetchMessages();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleCloseDeal = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/close-deal`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Deal closed successfully! 🎉');
        fetchMessages(); // Refresh to update status if needed
      } else {
        Alert.alert('Error', data.message || 'Failed to close deal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Determine other party info
  const isBuilder = user?.role === 'builder' || user?.role === 'developer';
  const otherPartyName = chatContext ? (user?.id === chatContext.user1_id ? 'Builder' : chatContext.sender_name || 'User') : 'Chat'; // Simplified
  // Better logic: API returns sender_name for each message. Context has property info.
  // Actually, chatContext from my controller has property info.

  const showCloseDeal = isBuilder && chatContext?.inquiry_status === 'accepted';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ChevronLeftIcon />
              </TouchableOpacity>
              <View>
                <Text style={styles.agentName}>{chatContext?.property_title || 'Property Chat'}</Text>
                <Text style={styles.agentStatus}>{chatContext?.property_price || ''}</Text>
              </View>
            </View>
            {showCloseDeal && (
              <TouchableOpacity style={styles.closeDealButton} onPress={handleCloseDeal}>
                <Text style={styles.closeDealText}>Close Deal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg, index) => {
          // Identify current user ID from state or prop
          const myId = user?.id || propUser?.id;

          // Identity check: ensures sent messages are on the right
          const isUser = String(msg.sender_id) === String(myId);

          if (index === 0) {
            console.log(`🔎 Chat Identity Audit | My ID: ${myId} | First Msg Sender: ${msg.sender_id} | isUser: ${isUser}`);
          }

          return (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              isUser={isUser}
            />
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputBar, { marginBottom: keyboardHeight }]}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <SendIcon />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  icon: { fontSize: 20, color: '#FFFFFF' },
  iconSmall: { fontSize: 16 },
  header: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#2563EB' },
  headerGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: '#2563EB' },
  headerContent: { zIndex: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { padding: 4 },
  agentName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  agentStatus: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' },
  closeDealButton: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  closeDealText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  messagesArea: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  messageContainer: { marginBottom: 4 },
  userMessageContainer: { alignItems: 'flex-end' },
  agentMessageContainer: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
  agentBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFF' },
  agentText: { color: '#111827' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  userMessageFooter: { justifyContent: 'flex-end' },
  timestamp: { fontSize: 10, color: '#9CA3AF' },
  inputBar: { borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFF', padding: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputWrapper: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  input: { fontSize: 14, color: '#111827', maxHeight: 100 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
});