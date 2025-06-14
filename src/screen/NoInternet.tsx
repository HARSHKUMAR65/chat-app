import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoInternet: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.noConnectionText}>
          Sorry, no internet connection.
        </Text>
        <Text style={styles.reconnectText}>
          Please make sure your device is connected to the internet.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  noConnectionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  reconnectText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NoInternet;
