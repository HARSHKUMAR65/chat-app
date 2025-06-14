import React, { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import NoInternet from './screen/NoInternet';
import AppNavigator from './navigation/Route';
import { Text } from 'react-native';
import { AuthProvider } from './context/AuthContext';
// import axios from 'axios';

const App: React.FC = () => {
  // const fetchData = () => {
  //   axios.get('https://assignment-backend-1u7v.onrender.com/api/testing', {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //     },
  //     withCredentials: true,
  //   })
  //     .then(response => console.log(response))
  //     .catch(error => console.error(error));
  // };
  // useEffect(() => {
  //   fetchData();
  // }, []);
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
