import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiBaseURL } from '../axios';
import { Alert } from 'react-native';
import socket from '../utils/Socket';
const TOKEN_KEY = 'token';

const useMessageAPI = () => {
    const getToken = async (): Promise<string | null> => {
        return await AsyncStorage.getItem(TOKEN_KEY);
    };
    const sendMessage = async (sender_id: number, receiver_id: number, text: string) => {
        try {
            const token = await getToken();
            if (!token) { throw new Error('Not authenticated'); }

            const { data } = await axios.post(
                `${ApiBaseURL.baseURL}message`,
                { sender_id, receiver_id, text },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            socket.emit('message', {
                sender_id: sender_id,
                receiver_id,
                text,
                timestamp: new Date().toISOString(),
            });
            return data;
        } catch (error: any) {
            console.error('Send message error:', error);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to send message');
            return null;
        }
    };
    const getMessages = async (sender_id: number, receiver_id: number) => {
        try {
            const token = await getToken();
            if (!token) { throw new Error('Not authenticated'); }

            const { data } = await axios.get(
                `${ApiBaseURL.baseURL}messages`,
                {
                    params: { sender_id, receiver_id },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return data?.data || [];
        } catch (error: any) {
            console.error('Fetch messages error:', error);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to fetch messages');
            return [];
        }
    };
    const getLastMessages = async () => {
        try {
            const token = await getToken();
            if (!token) { throw new Error('Not authenticated'); }

            const { data } = await axios.get(`${ApiBaseURL.baseURL}last-messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(data);
            return data?.data || [];
        } catch (error: any) {
            console.error('Fetch last messages error:', error);
            return [];
        }
    };

    return {
        sendMessage,
        getMessages,
        getLastMessages,
    };
};

export default useMessageAPI;
