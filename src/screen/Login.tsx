import React, { useState } from 'react';
import useAuthAPI from '../hooks/use-auth';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Errors {
  email?: string;
  password?: string;
}
const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secureText, setSecureText] = useState<boolean>(true);
  const [errors, setErrors] = useState<Errors>({});
  const { login , loading } = useAuthAPI();

  const validateEmail = (value: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.toLowerCase());
  };

  const validateInputs = (): boolean => {
    let valid = true;
    const tempErrors: Errors = {};

    if (!email.trim()) {
      tempErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      tempErrors.email = 'Enter a valid email';
      valid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {return;}

    const isLoggedIn = await login(email, password);
    console.log(isLoggedIn);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text: string) => setEmail(text)}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          secureTextEntry={secureText}
          onChangeText={(text: string) => setPassword(text)}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Text style={styles.toggleText}>{secureText ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  toggleText: {
    position: 'absolute',
    right: 10,
    top: 14,
    fontSize: 14,
    color: '#007AFF',
  },
});
