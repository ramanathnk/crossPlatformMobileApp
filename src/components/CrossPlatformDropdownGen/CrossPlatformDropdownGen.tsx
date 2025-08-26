import React, { useState, useRef, useEffect } from 'react';
import { Keyboard } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Portal } from 'react-native-paper';
import type { DropdownOption, CrossPlatformDropdownProps } from './types';
import type { LayoutChangeEvent } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');

const CrossPlatformDropdownGen = <T,>({
  options,
  onSelect,
  placeholder,
  selectedValue,
  style,
  onOpen,
  visible,
  setVisible,
  onMeasureAllItemsHeight,
  onMeasureDropdownItem,
  containerStyle,
  dropdownStyle,
  textStyle,
  placeholderStyle,
  itemTextStyle,
  showsVerticalScrollIndicator = true,
  maxHeight = 300,
  minWidth = 100,
  disabled = false,
  testID,
  multiSelect = false,
}: CrossPlatformDropdownProps<T>) => {
  // Support parent-controlled open/close, fallback to internal state
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = typeof visible === 'boolean' && setVisible ? visible : internalOpen;
  const setOpen = setVisible || setInternalOpen;

  const [dropdownWidth, setDropdownWidth] = useState<number>(0);
  const [dropdownHeight, setDropdownHeight] = useState<number>(0);
  const [dropdownCoords, setDropdownCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Only measure button position after visible becomes true (after parent scrolls)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Defer to next frame to ensure layout is settled after scroll
      setTimeout(() => {
        containerRef.current?.measureInWindow((x, y, width, height) => {
          setDropdownCoords({ x, y, width, height });
        });
        // Scroll selected into view
        if (scrollViewRef.current && selectedValue !== null && selectedValue !== undefined) {
          if (multiSelect && Array.isArray(selectedValue)) {
            const firstSelected = selectedValue[0];
            const selectedIdx = options.findIndex((opt) => opt.value === firstSelected);
            if (selectedIdx >= 0) {
              scrollViewRef.current.scrollTo({ y: selectedIdx * 48, animated: true });
            }
          } else {
            const selectedIdx = options.findIndex((opt) => opt.value === selectedValue);
            if (selectedIdx >= 0) {
              scrollViewRef.current.scrollTo({ y: selectedIdx * 48, animated: true });
            }
          }
        }
      }, 0);
    } else if (!isOpen) {
      setDropdownCoords(null);
    }
  }, [isOpen]);

  // Web support: use native <select>
  if (Platform.OS === 'web') {
    if (multiSelect) {
      return (
        <select
          style={{ minWidth, ...style }}
          value={Array.isArray(selectedValue) ? (selectedValue as any[]).map(String) : []}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map((opt: any) => opt.value);
            // Map back to original value types using options list
            const vals = selectedOptions
              .map((v) => options.find((opt) => String(opt.value) === v)?.value)
              .filter((v) => v !== undefined) as T[];
            onSelect(vals);
          }}
          disabled={disabled}
          multiple
          data-testid={testID}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <select
        style={{ minWidth, ...style }}
        value={selectedValue as any}
        onChange={(e) => {
          const val = options.find((opt) => String(opt.value) === e.target.value)?.value;
          if (val !== undefined) onSelect(val);
        }}
        disabled={disabled}
        data-testid={testID}
      >
        <option value="" disabled selected={selectedValue === null || selectedValue === undefined}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  const handleSelectSingle = (option: DropdownOption<T>) => {
    onSelect(option.value);
    setOpen(false);
  };

  const handleToggleMulti = (option: DropdownOption<T>) => {
    const current = Array.isArray(selectedValue) ? [...(selectedValue as T[])] : [];
    const idx = current.findIndex((v) => v === option.value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(option.value);
    }
    onSelect(current.length > 0 ? (current as unknown as T[]) : ([] as unknown as T[]));
    // keep dropdown open for multi-select so user can pick multiple items
  };

  // Only trigger onOpen (parent scroll) on press, do not open dropdown immediately
  const toggleDropdown = () => {
    if (disabled) return;
    if (onOpen) {
      onOpen(); // parent will scroll and open dropdown after scroll
    } else {
      setOpen(!isOpen);
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setDropdownWidth(width);
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    setDropdownHeight(contentHeight);
    if (onMeasureAllItemsHeight) {
      onMeasureAllItemsHeight(contentHeight);
    }
  };

  const isOptionSelected = (value: T) => {
    if (multiSelect) {
      return Array.isArray(selectedValue) && (selectedValue as T[]).some((v) => v === value);
    }
    return selectedValue === value;
  };

  const renderOption = (option: DropdownOption<T>, index: number) => {
    const isSelected = isOptionSelected(option.value);

    // conditional checkbox appearance:
    // - multiSelect: square checkbox with checkmark
    // - singleSelect: round radio-like indicator with dot
    const checkboxInner = multiSelect ? (isSelected ? '✓' : '') : (isSelected ? '●' : '');

    const checkboxStyle = [
      styles.checkbox,
      multiSelect ? styles.checkboxMulti : styles.checkboxRound,
      isSelected && (multiSelect ? styles.checkboxSelectedMulti : styles.checkboxSelected),
    ];

    return (
      <TouchableOpacity
        key={String(option.value)}
        onPress={() => (multiSelect ? handleToggleMulti(option) : handleSelectSingle(option))}
        style={styles.dropdownItem}
        testID={`${testID}.option.${option.value}`}
      >
        <View style={styles.checkboxContainer}>
          <View style={checkboxStyle}>
            {checkboxInner !== '' && <Text style={multiSelect ? styles.checkmarkMulti : styles.checkmark}>{checkboxInner}</Text>}
          </View>
          <Text style={[styles.dropdownItemText, itemTextStyle]}>{option.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDropdown = () => {
    if (!isOpen || !dropdownCoords) return null;
    // Calculate dropdown position and maxHeight
    const windowHeight = Dimensions.get('window').height;
    const dropdownTop = dropdownCoords.y + dropdownCoords.height;
    const dropdownLeft = dropdownCoords.x;
    const availableHeightBelow = windowHeight - dropdownTop - 16;
    const dropdownMaxHeight = Math.max(100, Math.min(maxHeight, availableHeightBelow));
    return (
      <Portal>
        {/* Overlay/backdrop to close dropdown on outside press */}
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.dropdown,
            dropdownStyle,
            {
              position: 'absolute',
              top: dropdownTop,
              left: dropdownLeft,
              maxHeight: dropdownMaxHeight,
              width: Math.max(dropdownCoords.width, minWidth),
            },
          ]}
          onLayout={handleLayout}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            onContentSizeChange={handleContentSizeChange}
            nestedScrollEnabled
          >
            {options.map((option, index) => renderOption(option, index))}
          </ScrollView>
        </View>
      </Portal>
    );
  };

  const renderSelectedText = () => {
    if (multiSelect) {
      const arr = Array.isArray(selectedValue) ? (selectedValue as T[]) : [];
      if (!arr || arr.length === 0) return placeholder;
      const labels = arr
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(', ');
      return labels || placeholder;
    } else {
      return selectedValue !== null && selectedValue !== undefined
        ? options.find((opt) => opt.value === selectedValue)?.label || placeholder
        : placeholder;
    }
  };

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={handleLayout}
      ref={containerRef}
    >
      <TouchableOpacity
        onPress={toggleDropdown}
        style={[styles.touchable, disabled && styles.disabledTouchable, style]}
        disabled={disabled}
        testID={testID}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Text
            style={[
              styles.selectedText,
              textStyle,
              (!selectedValue || (Array.isArray(selectedValue) && selectedValue.length === 0)) && styles.placeholderText,
              placeholderStyle,
            ]}
            numberOfLines={1}
          >
            {renderSelectedText()}
          </Text>
          {/* Dropdown arrow */}
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>
      {renderDropdown()}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  touchable: {
    alignItems: 'flex-start',
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  disabledTouchable: {
    backgroundColor: '#23272f',
    borderColor: '#222',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  selectedText: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  arrow: {
    color: '#9CA3AF',
    fontSize: 16,
    marginLeft: 8,
  },
  dropdown: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 4,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,41,55,0.8)', // match old dropdown overlay
    zIndex: 8,
  },
  dropdownItem: {
    borderBottomColor: '#4B5563',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // Base checkbox (shared)
  checkbox: {
    alignItems: 'center',
    borderColor: '#6B7280',
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    marginRight: 12,
    width: 18,
  },

  // round style for single-select radio-like indicator
  checkboxRound: {
    borderRadius: 10,
  },

  // square style for multi-select checkboxes
  checkboxMulti: {
    borderRadius: 4,
  },

  // selected styles
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxSelectedMulti: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },

  // checkmark/dot styles
  checkmark: {
    color: '#FFFFFF',
    fontSize: 8,
  },
  checkmarkMulti: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
  },

  dropdownItemText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
  },
  scrollViewContent: {
    paddingBottom: 8,
  },
});

export default CrossPlatformDropdownGen;