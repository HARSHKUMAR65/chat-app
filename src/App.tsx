import React, { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import NoInternet from './screen/NoInternet';
import AppNavigator from './navigation/Route';
import { Text } from 'react-native';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {

  useEffect(() => {
    // @ts-ignore
    Text.defaultProps = Text.defaultProps || {};
    // @ts-ignore
    Text.defaultProps.allowFontScaling = false;
  });
  const [isConnected, setIsConnected] = useState<boolean>(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {isConnected ? <AuthProvider><AppNavigator /></AuthProvider> : <NoInternet />}
    </>
  );
};

export default App;
