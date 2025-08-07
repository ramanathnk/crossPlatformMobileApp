export interface DropdownOption {
  label: string;
  value: number | null;
}

export interface CrossPlatformDropdownProps {
  options: DropdownOption[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
  placeholder: string;
  style?: any;
  onOpen?: () => void;
  visible?: boolean;
  setVisible?: (v: boolean) => void;
}
