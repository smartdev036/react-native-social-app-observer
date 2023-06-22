import React from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { theme } from '../../constants/theme';

interface PaginatorProps {
  data: Array<{
    descr: string;
    icon: string;
    id: number;
    title: string;
  }>;
  scrollX: Animated.Value;
}

const Paginator = (props: PaginatorProps) => {
  const { data, scrollX } = props;
  const { width } = useWindowDimensions();

  return (
    <View style={styles.constainer}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotColor = scrollX.interpolate({
          inputRange,
          outputRange: [theme.colors.mediumGrey, theme.colors.brandBlue, theme.colors.mediumGrey],
          extrapolate: 'clamp',
        });
        return <Animated.View key={i.toString()} style={[styles.dot, { backgroundColor: dotColor }]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.brandBlue,
    marginHorizontal: 8,
  },
});

export default Paginator;
