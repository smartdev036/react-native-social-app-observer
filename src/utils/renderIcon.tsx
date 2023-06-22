import React from 'react';
import Icon from '../components/icon';

export const getIconByType = (type: string): string | undefined => {
  let iconName: string | null = '';
  switch (type) {
    case 'obs_episode':
      iconName = 'volume';
      break;
    case 'obs_opinion':
      iconName = 'quote';
      break;
    default:
      return;
  }
  return iconName;
};

export const renderIcon = (
  name: string,
  size: number,
  disableFill: boolean,
  fill?: string,
  color?: string,
  onPress?: () => void,
  style?: { transform?: { rotate: string }[], marginTop?: number },
) => {
  return (
    <Icon
      name={name}
      size={size}
      color={color}
      fill={fill}
      disableFill={disableFill}
      onPress={onPress}
      style={style}
    />
  );
};
