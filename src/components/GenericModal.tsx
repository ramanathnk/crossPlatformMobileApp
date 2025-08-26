import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface GenericModalProps {
  visible: boolean;
  title: string;
  submitting: boolean;
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

const GenericModal = ({
  visible,
  title,
  submitting,
  canSave,
  onCancel,
  onSave,
  children,
}: GenericModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            {children}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={onCancel}
                disabled={submitting}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, !canSave && { opacity: 0.5 }]}
                onPress={onSave}
                disabled={!canSave || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  btnPrimary: {
    backgroundColor: '#3B82F6',
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderColor: '#334155',
    borderWidth: 1,
  },
  btnSecondaryText: {
    color: '#E2E8F0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderColor: '#23304D',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default GenericModal;
