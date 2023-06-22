import React, { FC, useRef } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { theme } from '../constants/theme';
import { useAppDispatch, useAppSelector } from '../hooks';
import Related from './related';
import { ScrollEndT, handleScrollEndDrag } from '../reducers/analytics';

export const ObsTopic: FC<{
  children: any;
  override?: StyleProp<ViewStyle>;
}> = ({ children, override }) => {
  const styles: ViewStyle & Record<string, any> = {
    paddingVertical: 10,
  };
  if (override) {
    for (const property in override as ViewStyle) {
      styles[property] = (override as any)[property];
    }
  }
  return <View style={styles}>{children}</View>;
};

export const ObsPostTitle: FC<{
  title: string;
  override?: StyleProp<TextStyle>;
}> = ({ title, override }) => {
  const themeState = useAppSelector(state => state.theme);
  const styles: TextStyle & Record<string, any> = {
    color: themeState.themeColor.color,
    fontFamily: themeState.fontStyles.postTitle.fontFamily,
    fontSize: themeState.fontStyles.postTitle.fontSize,
    lineHeight: themeState.fontStyles.postTitle.lineHeight,
  };
  const viewStyles: ViewStyle = {
    paddingRight: 20,
    marginBottom: 10,
  };

  if (override) {
    for (const property in override) {
      styles[property] = (override as any)[property];
    }
  }
  return (
    <View style={viewStyles}>
      <Text style={styles}>{title}</Text>
    </View>
  );
};

export const ObsLead: FC<{
  title: string;
  override?: StyleProp<TextStyle>;
}> = ({ title, override }) => {
  const themeState = useAppSelector(state => state.theme);
  const styles: TextStyle & Record<string, any> = {
    color: themeState.themeColor.color,
    fontFamily: themeState.fontStyles.lead.fontFamily,
    fontSize: themeState.fontStyles.lead.fontSize,
    lineHeight: themeState.fontStyles.lead.lineHeight,
  };
  const viewStyles: ViewStyle = {
    marginBottom: 10,
  };
  if (override) {
    for (const property in override) {
      styles[property] = (override as any)[property];
    }
  }
  return (
    <View style={viewStyles}>
      <Text style={styles}>{title}</Text>
    </View>
  );
};

export const ObsState: FC<{
  title: string;
  override?: StyleProp<TextStyle>;
}> = ({ title, override }) => {
  const themeState = useAppSelector(state => state.theme);
  const styles: TextStyle & Record<string, any> = {
    color: theme.colors.white,
    fontFamily: themeState.fontStyles.state.fontFamily,
    fontSize: themeState.fontStyles.state.fontSize,
    lineHeight: themeState.fontStyles.state.lineHeight,
    textTransform: 'uppercase',
  };
  const viewStyles: ViewStyle = {
    flexDirection: 'row',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.brandBlue,
    justifyContent: 'center',
    alignItems: 'center',
  };
  if (override) {
    for (const property in override) {
      styles[property] = (override as any)[property];
    }
  }
  return (
    <View style={viewStyles}>
      <Text style={styles}>{title}</Text>
    </View>
  );
};

export const ObsDate: FC<{
  children: any;
  override?: StyleProp<ViewStyle>;
}> = ({ children, override }) => {
  const styles: ViewStyle & Record<string, any> = {
    marginBottom: 10,
  };
  if (override) {
    for (const property in override as ViewStyle) {
      styles[property] = (override as any)[property];
    }
  }
  return <View style={styles}>{children}</View>;
};

export const ObsTitle: FC<{
  title: string;
  override?: StyleProp<TextStyle>;
}> = ({ title, override }) => {
  const themeState = useAppSelector(state => state.theme);
  const styles: TextStyle & Record<string, any> = {
    fontSize: themeState.fontStyles.title.fontSize,
    color: themeState.themeColor.color,
    fontFamily: themeState.fontStyles.title.fontFamily,
    marginBottom: 10,
  };
  if (override) {
    for (const property in override) {
      styles[property] = (override as any)[property];
    }
  }
  return <Text style={styles}>{title}</Text>;
};

export const ObsText: FC<{
  title: string;
  override?: StyleProp<TextStyle>;
}> = ({ title, override }) => {
  const themeState = useAppSelector(state => state.theme);
  const styles: TextStyle & Record<string, any> = {
    fontSize: themeState.fontStyles.text.fontSize,
    color: themeState.themeColor.color,
    fontFamily: themeState.fontStyles.text.fontFamily,
  };
  if (override) {
    for (const property in override) {
      styles[property] = (override as any)[property];
    }
  }
  return <Text style={styles}>{title}</Text>;
};

export const ObsColumnContainer: FC<{
  children: any;
  override?: StyleProp<ViewStyle>;
}> = ({ children, override }) => {
  const styles: ViewStyle & Record<string, any> = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };
  if (override) {
    for (const property in override as ViewStyle) {
      styles[property] = (override as any)[property];
    }
  }
  return <View style={styles}>{children}</View>;
};

export const ObsRowContainer: FC<{
  children: React.ReactNode[] | JSX.Element;
  override?: StyleProp<ViewStyle>;
}> = ({ children, override }) => {
  const defaultStyles: ViewStyle = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 0,
  };

  const mergedStyles = override ? StyleSheet.compose(defaultStyles, override) : defaultStyles;

  return <View style={mergedStyles}>{children}</View>;
};

export const ObsArticleWrapper: FC<{
  scrollView?: boolean;
  children: React.ReactNode[] | React.ReactNode;
  override?: StyleProp<ViewStyle>;
  related?: number | false;
}> = ({ children, override, scrollView = true, related = false }) => {
  const dispatch = useAppDispatch();
  const relatedHeightRef = useRef(0);

  function handleOnLayout(e: LayoutChangeEvent) {
    relatedHeightRef.current = e.nativeEvent.layout.height;
  }

  const styles: ViewStyle & Record<string, any> = {
    display: 'flex',
    flexDirection: 'column',
    marginHorizontal: theme.styles.articleContentHorizontalPadding,
    marginBottom: 10,
  };
  if (override) {
    for (const property in override) {
      styles[property] = (override as any)[property];
    }
  }
  if (scrollView) {
    const header = children[0];
    const body = children.filter((c, i) => i !== 0);

    return (
      <View>
        <ScrollView
          style={{ marginBottom: theme.styles.headerScreenHeight }}
          showsVerticalScrollIndicator={true}
          /* FIXME The scroll shouldn't take in the related, but scrollViews inside scrollViews doens't seem to work...
             this was the only way that i could managed to get the height of the content*/
          onScrollEndDrag={e => {
            let scrollPosition = e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height;
            const contentHeight = e.nativeEvent.contentSize.height - relatedHeightRef.current;
            scrollPosition = scrollPosition > contentHeight ? contentHeight : scrollPosition;
            dispatch(handleScrollEndDrag({ scrollPosition, contentHeight } as ScrollEndT));
          }}
        >
          <View>
            <View>{header}</View>
            <View style={styles}>{body}</View>
            {related && <Related onLayout={handleOnLayout} id={related} />}
          </View>
        </ScrollView>
      </View>
    );
  }
  return <View style={styles}>{children}</View>;
};
