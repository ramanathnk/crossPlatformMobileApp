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

// Local color constants to avoid color literals in styles
const COLOR_PRIMARY = '#3B82F6';
const COLOR_WHITE = '#FFFFFF';
const COLOR_BORDER = '#334155';
const COLOR_SECONDARY_TEXT = '#E2E8F0';
const COLOR_BACKDROP = 'rgba(0,0,0,0.6)';
const COLOR_CARD_BG = '#0F172A';
const COLOR_CARD_BORDER = '#23304D';
const COLOR_TRANSPARENT = 'transparent';

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
                style={[styles.btn, styles.btnPrimary, !canSave && styles.btnDisabled]}
                onPress={onSave}
                disabled={!canSave || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLOR_WHITE} />
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
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimary: {
    backgroundColor: COLOR_PRIMARY,
  },
  btnPrimaryText: {
    color: COLOR_WHITE,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: COLOR_TRANSPARENT,
    borderColor: COLOR_BORDER,
    borderWidth: 1,
  },
  btnSecondaryText: {
    color: COLOR_SECONDARY_TEXT,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalBackdrop: {
    backgroundColor: COLOR_BACKDROP,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLOR_CARD_BG,
    borderColor: COLOR_CARD_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  modalTitle: {
    color: COLOR_WHITE,
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
