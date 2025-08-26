import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from 'react-native';

interface RecordManagementListProps<T> {
  data: T[];
  loading: boolean;
  search: string;
  itemLabel: string;
  onSearchChange: (text: string) => void;
  onAdd?: () => void;
  renderItem: ListRenderItem<T>;
}

const RecordManagementList = <T,>({
  data,
  loading,
  search,
  itemLabel,
  onSearchChange,
  onAdd,
  renderItem,
}: RecordManagementListProps<T>) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={`Search ${itemLabel.toLowerCase()}`}
        value={search}
        onChangeText={onSearchChange}
        placeholderTextColor="#A3A3A3"
      />

      <View style={styles.header}>
        <Text style={styles.count}>
          {data.length} {itemLabel}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ Add {itemLabel.slice(0, -1)}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#3B82F6" style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
  count: {
    color: '#A3A3A3',
    fontSize: 15,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#19213A',
    borderRadius: 8,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

export default RecordManagementList;
