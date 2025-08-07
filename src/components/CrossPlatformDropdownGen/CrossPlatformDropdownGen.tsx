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
          const selectedIdx = options.findIndex((opt) => opt.value === selectedValue);
          if (selectedIdx >= 0) {
            scrollViewRef.current.scrollTo({ y: selectedIdx * 48, animated: true });
          }
        }
      }, 0);
    } else if (!isOpen) {
      setDropdownCoords(null);
    }
  }, [isOpen]);

  // Web support: use native <select>
  if (Platform.OS === 'web') {
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

  const handleSelect = (option: DropdownOption<T>) => {
    onSelect(option.value);
    setOpen(false);
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

  const renderOption = (option: DropdownOption<T>, index: number) => {
    const isSelected = selectedValue === option.value;
    return (
      <TouchableOpacity
        key={String(option.value)}
        onPress={() => handleSelect(option)}
        style={styles.dropdownItem}
        testID={`${testID}.option.${option.value}`}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>●</Text>}
          </View>
          <Text style={styles.dropdownItemText}>{option.label}</Text>
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
              (!selectedValue || selectedValue === null) && styles.placeholderText,
              placeholderStyle,
            ]}
            numberOfLines={1}
          >
            {selectedValue !== null && selectedValue !== undefined
              ? options.find((opt) => opt.value === selectedValue)?.label || placeholder
              : placeholder}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    backgroundColor: '#374151',
    zIndex: 10,
    flexDirection: 'row',
    minHeight: 48,
  },
  disabledTouchable: {
    backgroundColor: '#23272f',
    borderColor: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  selectedText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  arrow: {
    marginLeft: 8,
    fontSize: 16,
    color: '#9CA3AF',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    elevation: 4,
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,41,55,0.8)', // match old dropdown overlay
    zIndex: 8,
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
  scrollViewContent: {
    paddingBottom: 8,
  },
});

export default CrossPlatformDropdownGen;
