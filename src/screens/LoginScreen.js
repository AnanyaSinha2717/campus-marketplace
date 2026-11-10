import React, { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../context';
import { Btn } from '../components';
import { COLORS } from '../constants';

export default function LoginScreen() {
  const { bump } = useContext(AuthContext);
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      return Alert.alert('Check details', 'Enter a valid email and a password of at least 6 characters.');
    }
    if (register && !name.trim()) return Alert.alert('Check details', 'Enter your name.');
    setBusy(true);
    try {
      if (register) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        bump(); // refresh screens so the name shows up
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e) {
      Alert.alert(register ? 'Sign up failed' : 'Login failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.title}>Campus Marketplace</Text>
      <Text style={{ marginBottom: 24 }}>Buy, sell and exchange college stuff</Text>
      {register && <TextInput style={s.input} placeholder="Your name" value={name} onChangeText={setName} />}
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Password (min 6 characters)" secureTextEntry
        value={password} onChangeText={setPassword} />
      <Btn title={register ? 'Create account' : 'Log in'} onPress={submit} disabled={busy} style={{ marginTop: 12 }} />
      <TouchableOpacity onPress={() => setRegister(!register)} style={{ padding: 14 }}>
        <Text style={{ textAlign: 'center', color: COLORS.primary }}>
          {register ? 'Already have an account? Log in' : 'New here? Create an account'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10 },
});
