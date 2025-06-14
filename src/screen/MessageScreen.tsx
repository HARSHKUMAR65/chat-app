import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import useMessageAPI from '../hooks/use-messageData';
import { useAuth } from '../context/AuthContext';
import useAuthAPI from '../hooks/use-auth'; // Import auth API hook

const MessagesScreen = ({ navigation }) => {
  const [Messages, setMessages] = useState([]);
  const { user, ChangeAuth } = useAuth(); // Auth context
  const { getLastMessages } = useMessageAPI();
  const { logout } = useAuthAPI();

  useEffect(() => {
    console.log('Fetching messages...');
    const fetchMessages = async () => {
        console.log('Fetching messages.....');
      const messages = await getLastMessages();
      console.log('messages');
      setMessages(messages);
    };
    
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    const confirmed = await new Promise((resolve) => {
      Alert.alert("Logout", 'Are you sure you want to logout?', [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Logout", style: "destructive", onPress: () => resolve(true) },
      ]);
    });

    if (confirmed) {
      await logout();
      ChangeAuth(false);
    }
  };

  const renderItem = ({ item }) => {
    if (!user) return null;

    const isSender = item.sender?.id === user.id;
    const otherUser = isSender ? item.receiver : item.sender;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Chat', {
            userId: otherUser.id,
            userName: otherUser.email,
          })
        }
      >
        <Image source={{ uri: otherUser.profile_image }} style={styles.userImg} />
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={styles.userName}>{otherUser.email}</Text>
            <Text style={styles.time}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logout Header */}
      <View style={styles.logoutHeader}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={Messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  userImg: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
  },
});
