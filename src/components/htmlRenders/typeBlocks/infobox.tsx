import React, { useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { RenderHTMLSource } from 'react-native-render-html';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { theme } from '../../../constants/theme';
import { InfoBoxBlock } from '../../../models/articleFields';
import Icon from '../../icon';
import { useAppSelector } from '../../../hooks';

export const InfoBox: React.FC<{ postBlock: InfoBoxBlock }> = ({ postBlock }) => {
  const themeState = useAppSelector(state => state.theme);
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeState.themeColor.backgroudGray,
          },
        ]}
      >
        <TouchableOpacity onPress={() => setIsOpen(o => !o)}>
          <View
            style={[
              styles.svg,
              {
                transform: [{ rotateZ: isOpen ? '180deg' : '90deg' }],
              },
            ]}
          >
            <Icon
              name="arrow"
              size={14}
              fill={themeState.themeColor.color}
              color={themeState.themeColor.color}
              disableFill={false}
              style={{ marginRight: 2, transform: [{ rotate: '90deg' }] }}
            />
          </View>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: themeState.fontStyles.infoBoxTitle.fontSize,
            fontFamily: themeState.fontStyles.infoBoxTitle.fontFamily,
            color: themeState.themeColor.color,
          }}
        >
          {postBlock.title}
        </Text>
        <View style={{ display: isOpen ? 'flex' : 'none' }}>
          <RenderHTMLSource source={{ html: postBlock.text as string }} contentWidth={width} />
        </View>
      </View>
      <TouchableOpacity style={[styles.btn, {width: 100 * themeState.fontScaleFactor}]} onPress={() => setIsOpen(o => !o)}>
        <Text style={[styles.arrow, { fontSize: themeState.fontStyles.infoBoxArrow.fontSize }]}>{isOpen ? '\u2191' : '\u2193'}</Text>
        <Text style={{ color: theme.colors.white, fontSize: (themeState.fontStyles.infoBoxShowHideText.fontSize * themeState.fontScaleFactor) }}>{isOpen ? 'Esconder' : 'Mostrar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  btn: {
    marginTop: -10,
    marginLeft: 20,
    backgroundColor: theme.colors.brandBlue,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: 15,
  },
  arrow: {
    color: theme.colors.white,
  },
});
