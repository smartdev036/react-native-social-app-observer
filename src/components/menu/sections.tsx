import React from 'react';
import { LayoutAnimation, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Icon from '../icon';
import { theme } from '../../constants/theme';
import { useAppSelector } from '../../hooks';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import { renderIcon } from '../../utils/renderIcon';

interface SectionsProps {
  title: string;
  iconName: string;
  sections: ArrayLike<unknown>;
  showMoreSection: boolean;
  setShowMoreSection: () => void;
}

const Sections = (props: SectionsProps) => {
  const { title, iconName, sections, showMoreSection, setShowMoreSection } = props;

  const navigation = useNavigation();
  const themeState = useAppSelector(state => state.theme);

  return (
    <>
      <View style={styles.container}>
        <Icon name={iconName} size={20} fill={themeState.themeColor.menuIcons} color={themeState.themeColor.menuIcons} disableFill={false} />
        <Text style={[styles.title, { color: themeState.themeColor.color }]}>{title}</Text>
      </View>
      <View style={styles.sectionWrapper}>
        {sections ? (
          <View>
            {Array.from(sections)
              .splice(0, showMoreSection ? sections.length : 5)
              .map((value: any, index: number) => (
                <View key={index} style={styles.itemWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      //FIXME Martelada para funcionar as secções atualizarem
                      if(navigation.canGoBack()) {
                        navigation.dispatch(StackActions.pop(1));
                        }
                      navigation.dispatch(
                        CommonActions.navigate('TopicsDetails', {
                          topic: value,
                        }),
                      );
                    }}
                  >
                    <Text style={[styles.itemTitle, { color: themeState.themeColor.color }]}>{value.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            {sections.length > 5 && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowMoreSection();
                }}
              >
                <View style={styles.moreWrapper}>
                  <Text style={styles.titleWrapper}>{showMoreSection ? 'Ver menos' : 'Ver mais'}</Text>
                  <View
                    style={{
                      transform: [{ rotate: showMoreSection ? '90deg' : '-90deg' }],
                    }}
                  >
                    {renderIcon('arrow', 20, false, themeState.themeColor.color)}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.errorWrapper}>
            <Text style={[styles.errorText, { color: themeState.themeColor.color }]}>Não foi possível carregar as secções!</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.halyardSemBd,
    marginLeft: 8,
  },
  sectionWrapper: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: theme.colors.brandGrey,
    marginBottom: 10,
  },
  itemWrapper: {
    marginLeft: 28,
    paddingVertical: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  errorWrapper: {
    marginLeft: 28,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  moreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  titleWrapper: {
    marginLeft: 28,
    flex: 1,
    color: theme.colors.brandGrey,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default Sections;
