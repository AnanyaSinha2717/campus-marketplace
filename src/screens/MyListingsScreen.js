import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ListingCard } from '../components';
import { COLORS } from '../constants';

export default function MyListingsScreen({ navigation }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    // single equality filter: no Firestore index needed; sorted in the app
    const qy = query(collection(db, 'listings'), where('sellerId', '==', auth.currentUser.uid));
    return onSnapshot(
      qy,
      (snap) =>
        setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))),
      (err) => Alert.alert('Error', err.message)
    );
  }, []);

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#fff' }}>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>
        Tap an item to edit, mark as sold, or delete
      </Text>
      <FlatList
        data={list}
        numColumns={2}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ListingCard item={item} onPress={() => navigation.navigate('Detail', { id: item.id })} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 32, color: COLORS.muted }}>You haven't listed anything yet.</Text>}
      />
    </View>
  );
}
