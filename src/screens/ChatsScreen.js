import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLORS } from '../constants';

export default function ChatsScreen({ navigation }) {
  const uid = auth.currentUser.uid;
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // array-contains only (no orderBy) so no index is needed; sorted in the app
    const qy = query(collection(db, 'chats'), where('participants', 'array-contains', uid));
    return onSnapshot(
      qy,
      (snap) =>
        setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0))),
      (err) => Alert.alert('Error', err.message)
    );
  }, [uid]);

  return (
    <FlatList
      style={{ backgroundColor: '#fff' }}
      data={chats}
      keyExtractor={(c) => c.id}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', padding: 32, color: COLORS.muted }}>
          No conversations yet. Open an item and tap Message seller.
        </Text>
      }
      renderItem={({ item: c }) => (
        <TouchableOpacity
          style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#EEE' }}
          onPress={() => navigation.navigate('Chat', {
            chatId: c.id, listingId: c.listingId, listingTitle: c.listingTitle,
            sellerId: c.sellerId, sellerName: c.sellerName, buyerId: c.buyerId, buyerName: c.buyerName,
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: '700' }}>{uid === c.sellerId ? c.buyerName : c.sellerName}</Text>
          <Text style={{ color: COLORS.primary, fontSize: 12 }}>About: {c.listingTitle}</Text>
          <Text numberOfLines={1} style={{ color: COLORS.muted }}>{c.lastMessage}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
