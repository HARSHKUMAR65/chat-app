import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import useMessageAPI from '../hooks/use-messageData';
import socket from '../utils/Socket';

type Message = {
  id: string;
  sender_id: number;
  receiver_id: number;
  text: string;
  timestamp: string;
  sender: {
    id: number;
    email: string;
    profile_image: string;
  };
  receiver: {
    id: number;
    email: string;
    profile_image: string;
  };
};

const ChatScreen = ({ route }: any) => {
  const flatListRef = useRef<FlatList<Message>>(null);
  const { user } = useAuth();
  const { getMessages, sendMessage } = useMessageAPI();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverProfile, setReceiverProfile] = useState<{ name: string; image: string } | null>(null);
  const [loader, setLoader] = useState(false);

  const receiverId = route.params?.userId;

  useEffect(() => {
    if (!user?.id || !receiverId) {return;}

    const fetchMessages = async () => {
      const res = await getMessages(user.id, receiverId);
      if (res) {
        setMessages(res);
        // Automatically extract receiver's profile from first message
        const sample = res.find((msg: { sender_id: any; receiver_id: any; }) => msg.sender_id === receiverId || msg.receiver_id === receiverId);
        const otherUser = sample?.sender_id === receiverId ? sample.sender : sample.receiver;
        setReceiverProfile({ name: otherUser.email, image: otherUser.profile_image });
      }
    };

    fetchMessages();
    socket.connect();
    socket.emit('join', String(user.id));

    socket.on('receive_message', (msg: Message) => {
      if (
        (msg.sender_id === receiverId && msg.receiver_id === user.id) ||
        (msg.sender_id === user.id && msg.receiver_id === receiverId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit('leave', String(user.id));
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [user.id, receiverId, getMessages]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoader(true);
    const msg = await sendMessage(user.id, receiverId, newMessage);
    if (msg) {
      setNewMessage('');
      setLoader(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user.id;
    const avatar = isMe ? item.sender.profile_image : item.sender.profile_image;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myWrapper : styles.otherWrapper]}>
        {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
        <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
          <Text style={[styles.messageText, !isMe && { color: '#000' }]}>{item.text}</Text>
          <Text style={[styles.timeText, !isMe && { color: 'rgba(0,0,0,0.5)' }]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {/* ✅ WhatsApp-style Header */}
      <View style={styles.header}>
        {receiverProfile?.image && (
          <Image source={{ uri: receiverProfile.image }} style={styles.headerAvatar} />
        )}
        <Text style={styles.headerTitle}>{receiverProfile?.name}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>{loader ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  messagesList: { padding: 16 },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  myWrapper: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  otherWrapper: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  myMessage: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 0,
  },
  messageText: { fontSize: 16, color: '#fff' },
  timeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});
