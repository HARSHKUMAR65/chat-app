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
};

const ChatScreen = ({ route } : any) => {
  const flatListRef = useRef<FlatList<Message>>(null);
  const { user } = useAuth();
  const { getMessages, sendMessage } = useMessageAPI();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
const [loader, setLoader] = useState(false);
  const receiverId = route.params?.userId;

  useEffect(() => {
    if (!user?.id || !receiverId) {return;}

    const fetchMessages = async () => {
      const res = await getMessages(user.id, receiverId);
      if (res) {setMessages(res);}
    };

    fetchMessages();
    socket.connect();
    socket.emit('join', String(user.id));
    socket.on('receive_message', (msg: Message) => {
      if (
        (msg.sender_id === receiverId && msg.receiver_id === user.id) ||
        (msg.sender_id === user.id && msg.receiver_id === receiverId)
      ) {
        setMessages(prev => [...prev, msg]);
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
    setLoader(true);
    if (!newMessage.trim()) {return setLoader(false);}

    const msg = await sendMessage(user.id, receiverId, newMessage);
    if (msg) {
      setNewMessage('');
      setLoader(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user.id;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, !isMe && { color: '#000' }]}>{item.text}</Text>
        <Text style={[styles.timeText, !isMe && { color: 'rgba(0,0,0,0.5)' }]}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
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
          <Text style={styles.sendButtonText}>{loader ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messagesList: { padding: 16 },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    alignSelf: 'flex-start',
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
