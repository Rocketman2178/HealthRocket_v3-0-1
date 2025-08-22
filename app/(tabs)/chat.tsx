import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  MessageCircle,
  Send,
  Hash,
  Users,
  Trophy,
  Target,
  Calendar,
  Search,
  X,
  Bot,
  Zap,
  Camera,
  Plus,
} from 'lucide-react-native';

interface ChatRoom {
  id: string;
  name: string;
  type: 'community' | 'challenge' | 'contest' | 'quest' | 'ai';
  participants: number;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  icon: 'hash' | 'target' | 'trophy' | 'calendar' | 'bot';
  isActive?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'verification' | 'system';
  isCurrentUser?: boolean;
  verificationPhoto?: string;
  fpEarned?: number;
}

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');

  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: 'Cosmo AI Assistant',
      type: 'ai',
      participants: 1,
      lastMessage: 'How can I help you optimize your health today?',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 0,
      icon: 'bot',
    },
    {
      id: '2',
      name: 'General Discussion',
      type: 'community',
      participants: 1247,
      lastMessage: 'Just completed my morning workout! Feeling energized 💪',
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 3,
      icon: 'hash',
    },
    {
      id: '3',
      name: '30-Day Fitness Challenge',
      type: 'contest',
      participants: 89,
      lastMessage: 'Day 12 verification photo submitted!',
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
      unreadCount: 1,
      icon: 'trophy',
    },
    {
      id: '4',
      name: '10,000 Steps Challenge',
      type: 'challenge',
      participants: 156,
      lastMessage: 'Finally hit 12k steps today! 🎉',
      lastMessageTime: new Date(Date.now() - 45 * 60 * 1000),
      unreadCount: 0,
      icon: 'target',
    },
    {
      id: '5',
      name: 'Mindful Mornings Quest',
      type: 'quest',
      participants: 23,
      lastMessage: 'Week 3 check-in complete ✅',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 2,
      icon: 'calendar',
    },
    {
      id: '6',
      name: 'Nutrition Support',
      type: 'community',
      participants: 634,
      lastMessage: 'Anyone have healthy meal prep ideas?',
      lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      unreadCount: 0,
      icon: 'hash',
    },
    {
      id: '7',
      name: 'Meditation Challenge',
      type: 'challenge',
      participants: 89,
      lastMessage: 'Loving the 10-minute morning sessions!',
      lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unreadCount: 0,
      icon: 'target',
    },
  ]);

  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      username: 'System',
      message: 'Welcome to the 30-Day Fitness Challenge chat! 🏆',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'system',
    },
    {
      id: '2',
      userId: '1',
      username: 'FitnessGuru',
      message: 'Excited to start this challenge with everyone!',
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
      type: 'text',
    },
    {
      id: '3',
      userId: 'current',
      username: 'You',
      message: 'Looking forward to pushing my limits!',
      timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      type: 'text',
      isCurrentUser: true,
    },
    {
      id: '4',
      userId: '2',
      username: 'HealthWarrior',
      message: 'Day 5 verification photo',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'verification',
      fpEarned: 20,
    },
    {
      id: '5',
      userId: 'current',
      username: 'You',
      message: 'Just finished my workout! Feeling great 💪',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'text',
      isCurrentUser: true,
    },
  ]);

  const getIcon = (iconType: string, color: string = '#6B7280', size: number = 20) => {
    switch (iconType) {
      case 'hash': return <Hash size={size} color={color} />;
      case 'target': return <Target size={size} color={color} />;
      case 'trophy': return <Trophy size={size} color={color} />;
      case 'calendar': return <Calendar size={size} color={color} />;
      case 'bot': return <Bot size={size} color={color} />;
      default: return <MessageCircle size={size} color={color} />;
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'community': return '#6B7280';
      case 'challenge': return '#10B981';
      case 'contest': return '#8B5CF6';
      case 'quest': return '#3B82F6';
      case 'ai': return '#F97316';
      default: return '#6B7280';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRoomPress = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowChatModal(true);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      setMessageText('');
    }
  };

  const totalUnreadCount = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        {totalUnreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{totalUnreadCount} unread</Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Chat Rooms List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.roomsContainer}>
          {filteredRooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => handleRoomPress(room)}
            >
              <View style={styles.roomIcon}>
                {getIcon(room.icon, getRoomTypeColor(room.type), 24)}
              </View>
              
              <View style={styles.roomContent}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomTime}>{formatTime(room.lastMessageTime)}</Text>
                </View>
                
                <View style={styles.roomFooter}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {room.lastMessage}
                  </Text>
                  <View style={styles.roomMeta}>
                    <View style={styles.participantCount}>
                      <Users size={12} color="#9CA3AF" />
                      <Text style={styles.participantText}>{room.participants}</Text>
                    </View>
                    {room.unreadCount > 0 && (
                      <View style={styles.unreadDot}>
                        <Text style={styles.unreadCountText}>{room.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowChatModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.chatCloseButton}
              onPress={() => setShowChatModal(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            
            {selectedRoom && (
              <View style={styles.chatHeaderInfo}>
                {getIcon(selectedRoom.icon, getRoomTypeColor(selectedRoom.type), 20)}
                <View style={styles.chatHeaderText}>
                  <Text style={styles.chatHeaderTitle}>{selectedRoom.name}</Text>
                  <Text style={styles.chatHeaderSubtitle}>
                    {selectedRoom.participants} {selectedRoom.participants === 1 ? 'participant' : 'participants'}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.chatMenuButton}>
              <Users size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <KeyboardAvoidingView 
            style={styles.chatContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((message) => (
                <View key={message.id} style={styles.messageWrapper}>
                  {message.type === 'system' ? (
                    <View style={styles.systemMessage}>
                      <Text style={styles.systemMessageText}>{message.message}</Text>
                    </View>
                  ) : (
                    <View style={[
                      styles.messageContainer,
                      message.isCurrentUser && styles.currentUserMessage
                    ]}>
                      {!message.isCurrentUser && (
                        <Text style={styles.messageUsername}>{message.username}</Text>
                      )}
                      
                      {message.type === 'verification' ? (
                        <View style={styles.verificationMessage}>
                          <View style={styles.verificationHeader}>
                            <Camera size={16} color="#3B82F6" />
                            <Text style={styles.verificationText}>Verification Photo</Text>
                          </View>
                          <View style={styles.verificationPhotoPlaceholder}>
                            <Camera size={32} color="#9CA3AF" />
                            <Text style={styles.verificationPhotoText}>Photo</Text>
                          </View>
                          {message.fpEarned && (
                            <View style={styles.fpEarnedBadge}>
                              <Zap size={12} color="#F97316" />
                              <Text style={styles.fpEarnedText}>+{message.fpEarned} FP</Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={[
                          styles.messageBubble,
                          message.isCurrentUser && styles.currentUserBubble
                        ]}>
                          <Text style={[
                            styles.messageText,
                            message.isCurrentUser && styles.currentUserMessageText
                          ]}>
                            {message.message}
                          </Text>
                        </View>
                      )}
                      
                      <Text style={[
                        styles.messageTime,
                        message.isCurrentUser && styles.currentUserMessageTime
                      ]}>
                        {formatTime(message.timestamp)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Message Input */}
            <View style={styles.messageInputContainer}>
              <TouchableOpacity style={styles.attachButton}>
                <Plus size={24} color="#6B7280" />
              </TouchableOpacity>
              
              <View style={styles.messageInputWrapper}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                  placeholderTextColor="#9CA3AF"
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    messageText.trim() && styles.sendButtonActive
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send 
                    size={20} 
                    color={messageText.trim() ? '#FFFFFF' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  unreadBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  roomsContainer: {
    paddingHorizontal: 20,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomContent: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
  },
  roomTime: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  participantText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  unreadDot: {
    backgroundColor: '#FF6B35',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  chatCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderText: {
    marginLeft: 12,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  chatMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  chatContent: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  systemMessage: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  systemMessageText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'flex-start',
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  messageBubble: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentUserBubble: {
    backgroundColor: '#FF6B35',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderColor: '#FF6B35',
  },
  messageText: {
    fontSize: 16,
    color: '#F8FAFC',
    lineHeight: 20,
  },
  currentUserMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  currentUserMessageTime: {
    textAlign: 'right',
  },
  verificationMessage: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60A5FA',
    marginLeft: 6,
  },
  verificationPhotoPlaceholder: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationPhotoText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  fpEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  fpEarnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#FF6B35',
  },
  bottomPadding: {
    height: 20,
  },
});