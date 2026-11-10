import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS, imageUri, priceLabel } from './constants';

export function Btn({ title, onPress, kind = 'primary', disabled, style }) {
  const bg = kind === 'primary' ? COLORS.primary : kind === 'danger' ? COLORS.danger : 'transparent';
  const color = kind === 'outline' || kind === 'ghost' ? COLORS.primary : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        kind === 'outline' && { borderWidth: 1, borderColor: COLORS.primary },
        style,
      ]}
    >
      <Text style={{ color, fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.chip, selected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
    >
      <Text style={{ color: selected ? '#fff' : '#333' }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ListingCard({ item, onPress }) {
  const uri = imageUri(item.imageBase64);
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.imgBox}>
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ color: COLORS.muted }}>No photo</Text>
        )}
        {item.sold && (
          <View style={s.sold}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>SOLD</Text></View>
        )}
      </View>
      <View style={{ padding: 8 }}>
        <Text numberOfLines={1} style={{ fontWeight: '700', fontSize: 15 }}>{item.title}</Text>
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{priceLabel(item)}</Text>
        <Text numberOfLines={1} style={{ color: COLORS.muted, fontSize: 12 }}>
          {item.category} · {item.condition}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { padding: 12, borderRadius: 8, alignItems: 'center', margin: 3 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8, marginBottom: 6, backgroundColor: '#fff',
  },
  card: {
    flex: 1, maxWidth: '50%', margin: 5, borderRadius: 10, overflow: 'hidden',
    backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border,
  },
  imgBox: { height: 130, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center' },
  sold: { position: 'absolute', top: 6, left: 6, backgroundColor: COLORS.danger, paddingHorizontal: 8, paddingVertical: 2 },
});
