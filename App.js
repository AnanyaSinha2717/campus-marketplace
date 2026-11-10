import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import { AuthContext } from './src/context';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PostListingScreen from './src/screens/PostListingScreen';
import DetailScreen from './src/screens/DetailScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import ChatsScreen from './src/screens/ChatsScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0); // bumped after profile name is saved

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); });
    return unsub;
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ tick, bump: () => setTick((t) => t + 1) }}>
        <NavigationContainer>
          <Stack.Navigator>
            {user ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Campus Marketplace' }} />
                <Stack.Screen name="PostListing" component={PostListingScreen} options={{ title: 'New listing' }} />
                <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Item' }} />
                <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'My listings' }} />
                <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: 'Messages' }} />
                <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
              </>
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}