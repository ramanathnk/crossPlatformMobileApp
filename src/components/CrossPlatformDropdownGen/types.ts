export interface DropdownOption<T = number | null> {
  label: string;
  value: T;
}

export interface CrossPlatformDropdownProps<T = number | null> {
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  placeholder: string;
  style?: any;
  onOpen?: () => void;
  visible?: boolean;
  setVisible?: (v: boolean) => void;
  onMeasureAllItemsHeight?: (height: number) => void;
  /**
   * Called with the dimensions of a single dropdown item (width, height) when measured.
   */
  onMeasureDropdownItem?: (size: { width: number; height: number }) => void;
  containerStyle?: any;
  dropdownStyle?: any;
  textStyle?: any;
  placeholderStyle?: any;
  itemTextStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  maxHeight?: number;
  minWidth?: number;
  disabled?: boolean;
  testID?: string;
}
