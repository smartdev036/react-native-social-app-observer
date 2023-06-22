export type RadioButtonProps = {
  borderColor?: string;
  color?: string;
  containerStyle?: object;
  disabled?: boolean;
  id: number;
  label: string;
  labelStyle?: object;
  layout?: "row" | "column";
  onPress?: (id: number) => void;
  selected: boolean;
  size?: number;
  value?: string;
  borderSize?: number;
};

export type RadioGroupProps = {
  containerStyle?: object;
  layout?: "row" | "column";
  onPress?: (radioButtons: number) => void;
  radioButtons: RadioButtonProps[];
};
