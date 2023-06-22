import React, { useState, useEffect, useRef, useCallback, useMemo, cloneElement } from 'react';
import { Animated, Easing, LayoutChangeEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native';

interface AnimatedTextProps {
  children: React.ReactElement<any>;
  style?: StyleProp<ViewStyle>;
  endPaddingWidth?: number;
  duration?: number;
  delay?: number;
  isLTR?: boolean;
}

const AnimatedText = (props: AnimatedTextProps) => {
  const { children, style, endPaddingWidth = 100, duration, delay = 0, isLTR = false } = props;

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [dividerWidth, setDividerWidth] = useState(endPaddingWidth);
  const containerWidth = useRef(0);
  const contentWidth = useRef(0);
  const offsetX = useRef(new Animated.Value(0));
  const contentRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      contentRef.current = null;
    };
  });

  const measureContainerView = useCallback(
    ({
      nativeEvent: {
        layout: { width },
      },
    }: LayoutChangeEvent) => {
      if (containerWidth.current === width) {
        return;
      }
      containerWidth.current = width;
      if (!contentRef.current) {
        return;
      }
      contentRef.current.measure((fx: number, _fy: number, width: number) => {
        checkContent(width, fx);
      });
    },
    [],
  );

  const checkContent = useCallback((newContentWidth: number, fx: number) => {
    if (!newContentWidth) {
      setIsAutoScrollEnabled(false);
      return;
    }

    if (contentWidth.current === newContentWidth) {
      return;
    }
    contentWidth.current = newContentWidth;
    let newDividerWidth = endPaddingWidth;
    if (contentWidth.current < containerWidth.current) {
      if (endPaddingWidth < containerWidth.current - contentWidth.current) {
        newDividerWidth = containerWidth.current - contentWidth.current;
      }
    }
    setDividerWidth(newDividerWidth);
    setIsAutoScrollEnabled(true);

    if (isLTR) {
      offsetX.current.setValue(-(newContentWidth + newDividerWidth));
    }
    Animated.loop(
      Animated.timing(offsetX.current, {
        toValue: isLTR ? fx : -(contentWidth.current + fx + newDividerWidth),
        duration: duration || 50 * contentWidth.current,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const childrenCloned = useMemo(
    () =>
      cloneElement(children, {
        ...children.props,
        onLayout: ({
          nativeEvent: {
            layout: { width, x },
          },
        }: LayoutChangeEvent) => {
          if (!containerWidth.current || width === contentWidth.current) {
            return;
          }
          offsetX.current.stopAnimation();
          offsetX.current.setValue(0);
          offsetX.current.setOffset(0);
          checkContent(width, x);
        },
        ref: (ref: any) => (contentRef.current = ref),
      }),
    [children],
  );

  return (
    <View key={Math.random().toString()} onLayout={measureContainerView} style={style}>
      <ScrollView horizontal={true} bounces={false} scrollEnabled={false} showsHorizontalScrollIndicator={false}>
        <Animated.View style={[{ flexDirection: 'row' }, { transform: [{ translateX: offsetX.current }] }]}>
          {childrenCloned}
          {isAutoScrollEnabled && (
            <>
              <View style={{ width: dividerWidth }} />
              {children}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default React.memo(AnimatedText);
