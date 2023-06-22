import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Linking } from 'react-native';
import Icon from '../icon';
import { theme } from '../../constants/theme';
import { useAppSelector } from '../../hooks';
import { renderIcon } from '../../utils/renderIcon';

interface GamesProps {
  title: string;
  iconName: string;
  isSubMenuOpen: boolean;
  setIsSubMenuOpen: (b: boolean) => void;
}

interface listGameProps {
  name: string;
  id: number;
  url: string;
}

const Games = (props: GamesProps) => {
  const { title, iconName, isSubMenuOpen, setIsSubMenuOpen } = props;
  const themeState = useAppSelector(state => state.theme);

  const listGames: listGameProps[] = [
    {
      id: 1,
      name: 'Abrapalavra',
      url: 'https://observador.pt/interativo/abrapalavra-wordle-portugues/',
    },
  ];

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const containerStyle = [styles.container, isSubMenuOpen && styles.containerOpen];

  return (
    <TouchableOpacity activeOpacity={0.9} style={containerStyle} onPress={toggleSubMenu}>
      <View style={styles.titleWrapper}>
        <Icon name={iconName} size={20} fill={themeState.themeColor.menuIcons} color={themeState.themeColor.menuIcons} disableFill={false} />
        <Text style={[styles.title, { color: themeState.themeColor.color }]}>{title}</Text>
        <View style={styles.arrowWrapper}>
          <View style={[styles.arrow, { transform: [{ rotate: isSubMenuOpen ? '90deg' : '-90deg' }] }]}>
            {renderIcon('arrow', 20, false, themeState.themeColor.color)}
          </View>
        </View>
      </View>
      {isSubMenuOpen && (
        <View style={styles.itemWrapper}>
          {listGames.map(game => {
            return (
              <TouchableOpacity key={game.id} activeOpacity={0.9} onPress={() => Linking.openURL(game.url)}>
                <Text style={[styles.item, { color: themeState.themeColor.color }]}>{game.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: theme.colors.brandGrey,
    paddingBottom: 10,
  },
  containerOpen: {
    paddingBottom: 10,
  },
  titleWrapper: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.halyardSemBd,
    marginLeft: 8,
  },
  arrowWrapper: {
    marginRight: 8,
  },
  arrow: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemWrapper: {
    paddingVertical: 10,
    marginLeft: 28,
  },
  item: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default Games;
