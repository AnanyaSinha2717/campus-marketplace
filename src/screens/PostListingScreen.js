import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Btn, Chip } from '../components';
import { CATEGORIES, COLORS, CONDITIONS, imageUri, myName } from '../constants';
import { shrinkToBase64 } from '../imageUtil';

// Creates a listing, or edits one when route.params.id is set
export default function PostListingScreen({ route, navigation }) {
  const editingId = route.params?.id;
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('Sell');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[2]);
  const [imageB64, setImageB64] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    navigation.setOptions({ title: 'Edit listing' });
    getDoc(doc(db, 'listings', editingId)).then((snap) => {
      if (!snap.exists()) return;
      const l = snap.data();
      setTitle(l.title || '');
      setDesc(l.description || '');
      setType(l.type || 'Sell');
      setPrice(l.type === 'Sell' ? String(l.price ?? '') : '');
      setCategory(l.category || CATEGORIES[0]);
      setCondition(l.condition || CONDITIONS[2]);
      setImageB64(l.imageBase64 || '');
    });
  }, [editingId]);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (res.canceled) return;
    setBusy(true);
    try {
      setImageB64(await shrinkToBase64(res.assets[0].uri));
    } catch (e) {
      Alert.alert('Photo problem', e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const user = auth.currentUser;
    const t = title.trim();
    const p = type === 'Sell' ? parseInt(price, 10) : 0;
    if (!t) return Alert.alert('Missing title', 'Enter a title.');
    if (type === 'Sell' && (isNaN(p) || p < 0)) return Alert.alert('Missing price', 'Enter a price.');

    setBusy(true);
    try {
      const data = {
        title: t, description: desc.trim(), category, type, condition,
        price: p, imageBase64: imageB64,
      };
      if (editingId) {
        await updateDoc(doc(db, 'listings', editingId), data);
      } else {
        await addDoc(collection(db, 'listings'), {
          ...data, sellerId: user.uid, sellerName: myName(user), sold: false, createdAt: Date.now(),
        });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message);
      setBusy(false);
    }
  };

  const uri = imageUri(imageB64);
  return (
    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <View style={s.photo}>
        {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
             : <Text style={{ color: COLORS.muted }}>No photo yet</Text>}
      </View>
      <Btn title={uri ? 'Change photo' : 'Choose photo (optional)'} kind="outline" onPress={pickPhoto} disabled={busy} />

      <TextInput style={s.input} placeholder="Title (e.g. Engineering Maths book)" value={title} onChangeText={setTitle} />
      <TextInput style={[s.input, { height: 90, textAlignVertical: 'top' }]} multiline
        placeholder="Description (edition, what you want in exchange...)" value={desc} onChangeText={setDesc} />

      <Text style={s.label}>Type</Text>
      <View style={s.row}>
        <Chip label="Sell" selected={type === 'Sell'} onPress={() => setType('Sell')} />
        <Chip label="Exchange" selected={type === 'Exchange'} onPress={() => setType('Exchange')} />
      </View>
      {type === 'Sell' && (
        <TextInput style={s.input} placeholder="Price (₹)" keyboardType="number-pad" value={price} onChangeText={setPrice} />
      )}

      <Text style={s.label}>Category</Text>
      <View style={s.row}>
        {CATEGORIES.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />)}
      </View>

      <Text style={s.label}>Condition</Text>
      <View style={s.row}>
        {CONDITIONS.map((c) => <Chip key={c} label={c} selected={condition === c} onPress={() => setCondition(c)} />)}
      </View>

      {busy ? <ActivityIndicator style={{ marginTop: 16 }} /> :
        <Btn title={editingId ? 'Save changes' : 'Post listing'} onPress={save} style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  photo: { height: 180, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginTop: 10 },
  label: { marginTop: 14, marginBottom: 6, fontSize: 12, color: COLORS.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
