import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function StickyMiniHeader({ title, onSearchPress }) {
  const router = useRouter();

  return (
    <View style={styles.stickyHeader}>
      <TouchableOpacity onPress={() => router.replace('/home')}>
        <X size={28} color="#111" />
      </TouchableOpacity>
      <Text style={styles.stickyTitle} numberOfLines={1}>{title}</Text>
      <TouchableOpacity onPress={onSearchPress}>
        <Search size={24} color="#111" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    height: 60,
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
});
