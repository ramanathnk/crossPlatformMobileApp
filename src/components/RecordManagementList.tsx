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

// Color constants to avoid inline color literals
const COLOR_PRIMARY = '#3B82F6';
const COLOR_WHITE = '#FFFFFF';
const COLOR_MUTED = '#A3A3A3';
const COLOR_INPUT_BG = '#19213A';

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
        placeholderTextColor={COLOR_MUTED}
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
        <ActivityIndicator color={COLOR_PRIMARY} style={styles.activityIndicator} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(_item, index) => String(index)}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: COLOR_PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: COLOR_WHITE,
    fontSize: 15,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
  count: {
    color: COLOR_MUTED,
    fontSize: 15,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  searchInput: {
    backgroundColor: COLOR_INPUT_BG,
    borderRadius: 8,
    color: COLOR_WHITE,
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

export default RecordManagementList;
