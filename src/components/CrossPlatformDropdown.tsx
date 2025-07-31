import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface DropdownOption {
  label: string;
  value: number | null;
}

interface CrossPlatformDropdownProps {
  options: DropdownOption[];
  selectedValue: number| null;
  onSelect: (value: number | null) => void;
  placeholder: string;
  style?: any;
}

const CrossPlatformDropdown: React.FC<CrossPlatformDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  if (Platform.OS === 'web') {
    // Use native HTML select for web
    return (
      <View style={[styles.container, style]}>
        <select
          value={selectedValue ?? ""}
          onChange={(e) => onSelect(Number(e.target.value))}
          style={{
            width: '100%',
            height: 50,
            backgroundColor: '#374151',
            border: '1px solid #4B5563',
            borderRadius: 8,
            paddingLeft: 16,
            paddingRight: 16,
            fontSize: 16,
            color: '#FFFFFF',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
          }}
        >
          <option value="" disabled style={{ color: '#6B7280' }}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.label}
              style={{ 
                backgroundColor: '#374151',
                color: '#FFFFFF'
              }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  // Use custom dropdown for mobile
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setIsVisible(!isVisible)}
      >
        <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      
      {isVisible && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option.value);
                setIsVisible(false);
              }}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, selectedValue === option.value && styles.checkboxSelected]}>
                  {selectedValue === option.value && <Text style={styles.checkmark}>●</Text>}
                </View>
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#4B5563',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  placeholderText: {
    color: '#6B7280',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5, // For Android shadow
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6B7280',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
});

export default CrossPlatformDropdown;
