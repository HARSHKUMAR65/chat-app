import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import useMessageAPI from '../hooks/use-messageData';
import { useAuth } from '../context/AuthContext';
import useAuthAPI from '../hooks/use-auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MessagesScreen = ({ navigation }: any) => {
  const [Messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, ChangeAuth } = useAuth();
  const { getLastMessages } = useMessageAPI();
  const { logout } = useAuthAPI();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const messages = await getLastMessages();
      setMessages(messages);
      setLoading(false);
    };
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    const confirmed = await new Promise((resolve) => {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Logout', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });

    if (confirmed) {
      await logout();
      ChangeAuth(false);
    }
  };

  const renderItem = ({ item }: any) => {
    if (!user) {return null;}

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
        <Image
          source={{ uri: otherUser.profile_image || 'https://via.placeholder.com/100' }}
          style={styles.userImg}
        />
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={styles.userName}>{otherUser.email}</Text>
            <Text style={styles.time}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
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
      <View style={styles.logoutHeader}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
          <Icon name="logout" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={Messages}
          // @ts-ignore
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  logoutIcon: {
    padding: 6,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.7,
    borderColor: '#e2e2e2',
    alignItems: 'center',
  },
  userImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 14,
    color: '#555',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
