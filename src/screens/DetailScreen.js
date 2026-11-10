import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Btn } from '../components';
import { COLORS, imageUri, myName, priceLabel } from '../constants';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const user = auth.currentUser;
  const [l, setL] = useState(null);

  useEffect(() => {
    return onSnapshot(
      doc(db, 'listings', id),
      (snap) => {
        if (!snap.exists()) { if (navigation.canGoBack()) navigation.goBack(); return; }
        setL({ id: snap.id, ...snap.data() });
      },
      (err) => Alert.alert('Error', err.message)
    );
  }, [id]);

  if (!l) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const mine = l.sellerId === user.uid;
  const uri = imageUri(l.imageBase64);

  const openChat = () =>
    navigation.navigate('Chat', {
      chatId: `${l.id}_${user.uid}`,
      listingId: l.id, listingTitle: l.title,
      sellerId: l.sellerId, sellerName: l.sellerName,
      buyerId: user.uid, buyerName: myName(user),
    });

  const toggleSold = () =>
    updateDoc(doc(db, 'listings', id), { sold: !l.sold }).catch((e) => Alert.alert('Error', e.message));

  const remove = () =>
    Alert.alert('Delete this listing?', 'This cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive',
        onPress: () => deleteDoc(doc(db, 'listings', id)).catch((e) => Alert.alert('Error', e.message)) },
    ]);

  return (
    <ScrollView style={{ backgroundColor: '#fff' }}>
      <View style={s.photo}>
        {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
             : <Text style={{ color: COLORS.muted }}>No photo</Text>}
      </View>
      <View style={{ padding: 18 }}>
        {l.sold && <Text style={s.sold}>SOLD</Text>}
        <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 6 }}>{l.title}</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.primary }}>{priceLabel(l)}</Text>
        <Text style={{ color: COLORS.muted, marginTop: 4 }}>{l.category} · {l.condition} · {l.type}</Text>
        <Text style={{ fontSize: 15, marginTop: 12 }}>{l.description || 'No description'}</Text>
        <Text style={{ color: COLORS.muted, marginTop: 12 }}>Listed by {l.sellerName}</Text>

        {!mine && !l.sold && <Btn title="Message seller" onPress={openChat} style={{ marginTop: 16 }} />}
        {mine && (
          <View style={{ marginTop: 16 }}>
            <Btn title={l.sold ? 'Mark as available' : 'Mark as sold'} onPress={toggleSold} />
            <Btn title="Edit listing" kind="outline" onPress={() => navigation.navigate('PostListing', { id })} />
            <Btn title="Delete listing" kind="danger" onPress={remove} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  photo: { height: 260, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center' },
  sold: { alignSelf: 'flex-start', backgroundColor: COLORS.danger, color: '#fff', fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3 },
});
