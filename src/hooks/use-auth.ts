import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiBaseURL } from '../axios';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import { useState } from 'react';
const TOKEN_KEY = 'token';

const useAuthAPI = () => {
    const { ChangeAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        try {
            const data = await axios.post(`${ApiBaseURL.baseURL}login`, {
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(data.data.data);
            if (data.data.data?.accessToken) {
                console.log(data.data.data.accessToken);
                await AsyncStorage.setItem(TOKEN_KEY, data.data.data.accessToken);
                ChangeAuth(true);
                setLoading(false);
                return true;
            }
            return false;
        } catch (error: any) {
            // console.error('Login error dsasds:', error.response.data.message);
            Alert.alert('Error', error.response.data.message);
            setLoading(false);
            return false;
        }
    };

    const logout = async (): Promise<boolean> => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            ChangeAuth(false);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    };

    const getCurrentUser = async (): Promise<boolean> => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) { return false; }

            const { data } = await axios.get(
                `${ApiBaseURL.baseURL}current-user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (data?.token) {
                await AsyncStorage.setItem(TOKEN_KEY, data.token);
            }
            return data.data;
        } catch (error : any) {
            console.error('Get current user error:', error.response);
            return false;
        }
    };

    return {
        login,
        logout,
        getCurrentUser,
        loading,
    };
};

export default useAuthAPI;
