import { Image, type ImageProps } from "react-native";

const DEFAULT_MARK =
  "https://raw.githubusercontent.com/Zunia-Lab/zunia-brand/v1.0.0/png/icons/zunia-icon-cobalt-128.png";

export interface MarkProps extends Omit<ImageProps, "source"> {
  size?: number;
  uri?: string;
}

export function Mark({ size = 32, uri, style, ...rest }: MarkProps) {
  return (
    <Image
      source={{ uri: uri ?? DEFAULT_MARK }}
      style={[{ width: size, height: size, borderRadius: 8 }, style]}
      {...rest}
    />
  );
}
