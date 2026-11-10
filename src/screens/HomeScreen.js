import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { AuthContext } from '../context';
import { Btn, Chip, ListingCard } from '../components';
import { CATEGORIES, COLORS, myName } from '../constants';

export default function HomeScreen({ navigation }) {
  useContext(AuthContext); // re-render when the profile name changes
  const [all, setAll] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null); // null = All

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Log out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // live updates
  useEffect(() => {
    const qy = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(200));
    return onSnapshot(
      qy,
      (snap) => setAll(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => Alert.alert('Could not load listings', err.message)
    );
  }, []);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter(
      (l) =>
        !l.sold &&
        (cat === null || l.category === cat) &&
        (t === '' || (l.title || '').toLowerCase().includes(t) || (l.description || '').toLowerCase().includes(t))
    );
  }, [all, q, cat]);

  return (
    <View style={s.container}>
      <Text style={s.hello}>Hi, {myName(auth.currentUser)}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Btn title="My listings" kind="outline" style={{ flex: 1 }} onPress={() => navigation.navigate('MyListings')} />
        <Btn title="Messages" kind="outline" style={{ flex: 1 }} onPress={() => navigation.navigate('Chats')} />
      </View>
      <TextInput style={s.input} placeholder="Search item..." value={q} onChangeText={setQ} />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
          {[null, ...CATEGORIES].map((c) => (
            <Chip key={c || 'all'} label={c || 'All'} selected={cat === c} onPress={() => setCat(c)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={list}
        numColumns={2}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('Detail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text style={s.empty}>No items found. Tap + to list something.</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('PostListing')}>
        <Text style={{ color: '#fff', fontSize: 30, marginTop: -2 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  hello: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginTop: 6 },
  empty: { textAlign: 'center', padding: 32, color: COLORS.muted },
  fab: {
    position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 5,
  },
});
