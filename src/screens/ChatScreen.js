import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLORS } from '../constants';

// One thread per (listing, buyer). Thread id = listingId_buyerId
export default function ChatScreen({ route, navigation }) {
  const { chatId, listingId, listingTitle, sellerId, sellerName, buyerId, buyerName } = route.params;
  const me = auth.currentUser;
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: me.uid === sellerId ? buyerName : sellerName });
  }, [navigation]);

  useEffect(() => {
    const qy = query(collection(db, 'chats', chatId, 'messages'), orderBy('time'));
    return onSnapshot(
      qy,
      (snap) => setMsgs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => Alert.alert('Error', err.message)
    );
  }, [chatId]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    const now = Date.now();
    try {
      // 1) create/update the thread, 2) then add the message (security rules check the thread exists)
      await setDoc(
        doc(db, 'chats', chatId),
        { listingId, listingTitle, sellerId, sellerName, buyerId, buyerName,
          participants: [sellerId, buyerId], lastMessage: t, lastTime: now },
        { merge: true }
      );
      await addDoc(collection(db, 'chats', chatId, 'messages'), { senderId: me.uid, text: t, time: now });
    } catch (e) {
      Alert.alert('Could not send', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff', paddingBottom: insets.bottom }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Text style={s.about}>About: {listingTitle}</Text>
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.senderId === me.uid;
          return (
            <View style={[s.bubble, mine ? s.mine : s.theirs]}>
              <Text style={{ color: mine ? '#fff' : '#000', fontSize: 15 }}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={s.inputRow}>
        <TextInput style={s.input} placeholder="Type a message" value={text} onChangeText={setText} multiline />
        <TouchableOpacity onPress={send} style={s.send}><Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  about: { backgroundColor: '#F5F5F5', padding: 10, color: COLORS.primary, fontSize: 13 },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginVertical: 3 },
  mine: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#E0E0E0' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100 },
  send: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginLeft: 8 },
});
