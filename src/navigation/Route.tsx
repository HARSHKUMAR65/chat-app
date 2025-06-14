import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screen/Login';
import ChatScreen from '../screen/ChatScreen';
import Loading from '../screen/Loading';
import { useAuth } from '../context/AuthContext';
import MessageScreen from '../screen/MessageScreen';
export type RootStackParamList = {
    login: undefined;
    Chat: undefined;
    Message: undefined
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const { isAuthenticated } = useAuth();
    // const isAuthenticated = true;
    if (isAuthenticated === null) {
        return <Loading />;
    }
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Message" component={MessageScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
