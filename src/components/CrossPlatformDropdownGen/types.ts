export interface DropdownOption<T = number | null> {
  label: string;
  value: T;
}

/**
 * CrossPlatformDropdownProps
 * - selectedValue may be a single value (T) or an array of values (T[]) when using multiSelect.
 * - onSelect will be called with either a single value or an array depending on the dropdown mode.
 */
export interface CrossPlatformDropdownProps<T = number | null> {
  options: DropdownOption<T>[];
  selectedValue: T | T[] | null;
  onSelect: (value: T | T[] | null) => void;
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

  /**
   * Enable selecting multiple items. When true, selectedValue should be an array (T[]).
   * onSelect will be called with a T[] of selected values.
   */
  multiSelect?: boolean;
}