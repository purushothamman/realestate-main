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
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Icon Components
const ChevronLeftIcon = () => <Text style={styles.icon}>←</Text>;
const SendIcon = () => <Text style={styles.icon}>📤</Text>;
const PaperclipIcon = () => <Text style={styles.icon}>📎</Text>;
const MicIcon = () => <Text style={styles.icon}>🎤</Text>;
const ImageIconComponent = () => <Text style={styles.iconSmall}>🖼️</Text>;
const PhoneIcon = () => <Text style={styles.icon}>📞</Text>;
const VideoIcon = () => <Text style={styles.icon}>📹</Text>;
const MoreIcon = () => <Text style={styles.icon}>⋮</Text>;

// Message Bubble Component with Animation
const MessageBubble = ({ message, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isUser = message.sender === 'user';

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.agentMessageContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {message.type === 'property' && message.propertyData ? (
        <View style={styles.propertyCard}>
          <Image
            source={{ uri: message.propertyData.image }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {message.propertyData.title}
            </Text>
            <Text style={styles.propertyPrice}>{message.propertyData.price}</Text>
            <Text style={styles.propertyLocation} numberOfLines={1}>
              {message.propertyData.location}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.agentBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.agentText]}>
            {message.text}
          </Text>
        </View>
      )}

      <View style={[styles.messageFooter, isUser && styles.userMessageFooter]}>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
        {isUser && (
          <Text style={styles.readStatus}>{message.read ? '✓✓' : '✓'}</Text>
        )}
      </View>
    </Animated.View>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -8,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

    createAnimation(dot1Anim, 0).start();
    createAnimation(dot2Anim, 200).start();
    createAnimation(dot3Anim, 400).start();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1Anim }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2Anim }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3Anim }] }]} />
      </View>
    </View>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ action, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.quickActionIcon}>{action.icon}</Text>
        <Text style={styles.quickActionText}>{action.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ChatScreen({ onBack }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  const headerGradientAnim = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const onlinePulse = useRef(new Animated.Value(1)).current;

  const agentInfo = {
    name: 'Sarah Johnson',
    role: 'Senior Real Estate Agent',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    isOnline: true,
    propertyContext: 'Luxury Downtown Apartment',
  };

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hi! I saw your listing for the Luxury Downtown Apartment. Is it still available?',
      sender: 'user',
      timestamp: '10:24 AM',
      read: true,
    },
    {
      id: '2',
      text: "Hello! Yes, it is still available. It's a beautiful 2-bedroom apartment with stunning city views. Would you like to schedule a viewing?",
      sender: 'agent',
      timestamp: '10:26 AM',
      read: true,
    },
    {
      id: '3',
      text: 'That sounds great! What amenities does it include?',
      sender: 'user',
      timestamp: '10:28 AM',
      read: true,
    },
    {
      id: '4',
      text: 'It includes modern appliances, central heating/AC, 24/7 security, gym access, rooftop pool, and covered parking. Here are some photos:',
      sender: 'agent',
      timestamp: '10:29 AM',
      read: true,
    },
    {
      id: '5',
      text: '',
      sender: 'agent',
      timestamp: '10:29 AM',
      read: true,
      type: 'property',
      propertyData: {
        image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=400',
        title: 'Luxury Downtown Apartment',
        price: '$3,200/month',
        location: 'Downtown, Manhattan',
      },
    },
    {
      id: '6',
      text: 'Wow, it looks amazing! Can we schedule a viewing for tomorrow?',
      sender: 'user',
      timestamp: '10:32 AM',
      read: true,
    },
    {
      id: '7',
      text: 'Absolutely! I have availability at 2 PM or 4 PM tomorrow. Which time works better for you?',
      sender: 'agent',
      timestamp: '10:33 AM',
      read: true,
    },
    {
      id: '8',
      text: '2 PM would be perfect!',
      sender: 'user',
      timestamp: '10:35 AM',
      read: true,
    },
    {
      id: '9',
      text: "Perfect! The viewing is confirmed for tomorrow at 2 PM. I'll meet you at the building entrance. The address is 123 Park Avenue. See you there! 🏢",
      sender: 'agent',
      timestamp: '10:36 AM',
      read: false,
    },
  ]);

  const quickActions = [
    { id: 1, label: 'Schedule Viewing', icon: '📅' },
    { id: 2, label: 'More Photos', icon: '📸' },
    { id: 3, label: 'Ask Price', icon: '💰' },
    { id: 4, label: 'Details', icon: '📋' },
  ];

  useEffect(() => {
    // Header gradient animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGradientAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(headerGradientAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Online status pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(onlinePulse, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(onlinePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = () => {
    if (message.trim()) {
      // Send button animation
      Animated.sequence([
        Animated.timing(sendButtonScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        read: false,
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate agent typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleQuickAction = (action) => {
    setMessage(action);
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      {/* Animated Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity
                onPress={onBack}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ChevronLeftIcon />
              </TouchableOpacity>

              {/* Agent Info */}
              <View style={styles.agentInfo}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: agentInfo.avatar }}
                    style={styles.avatar}
                  />
                  {agentInfo.isOnline && (
                    <Animated.View
                      style={[
                        styles.onlineIndicator,
                        { transform: [{ scale: onlinePulse }] },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.agentTextInfo}>
                  <Text style={styles.agentName} numberOfLines={1}>
                    {agentInfo.name}
                  </Text>
                  <Text style={styles.agentStatus} numberOfLines={1}>
                    {agentInfo.isOnline ? 'Online' : 'Offline'} · {agentInfo.role}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <PhoneIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <VideoIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <MoreIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Context */}
          <View style={styles.propertyContext}>
            <View style={styles.propertyContextCard}>
              <Text style={styles.propertyContextLabel}>Discussing:</Text>
              <Text style={styles.propertyContextText} numberOfLines={1}>
                {agentInfo.propertyContext}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom()}
      >
        {messages.map((msg, index) => (
          <MessageBubble key={msg.id} message={msg} index={index} />
        ))}

        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={action.id}
              action={action}
              index={index}
              onPress={() => handleQuickAction(action.label)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={[styles.inputBar, { marginBottom: keyboardHeight }]}>
        <View style={styles.inputContainer}>
          {/* Attachment Button */}
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <PaperclipIcon />
          </TouchableOpacity>

          {/* Input Field */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.imageButton} activeOpacity={0.7}>
              <ImageIconComponent />
            </TouchableOpacity>
          </View>

          {/* Send/Voice Button */}
          {message.trim() ? (
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                onPress={handleSend}
                style={styles.sendButton}
                activeOpacity={0.8}
              >
                <SendIcon />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity style={styles.voiceButton} activeOpacity={0.7}>
              <MicIcon />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  icon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  iconSmall: {
    fontSize: 16,
  },
  header: {
    position: 'relative',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
  },
  headerContent: {
    position: 'relative',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  agentTextInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  agentStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  propertyContext: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  propertyContextCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  propertyContextLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  propertyContextText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  agentMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#14B8A6',
    borderTopRightRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  agentBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  agentText: {
    color: '#111827',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  userMessageFooter: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  readStatus: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: '75%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  propertyImage: {
    width: '100%',
    height: 120,
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  quickActionsContainer: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  quickActionIcon: {
    fontSize: 14,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  inputBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  attachButton: {
    padding: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
  },
  imageButton: {
    padding: 6,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#14B8A6',
    padding: 10,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  voiceButton: {
    padding: 10,
  },
});