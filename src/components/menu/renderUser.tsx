import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from '../icon';
import { theme } from '../../constants/theme';
import { useAppSelector } from '../../hooks';
import { UserToken } from '../../services/auth';

interface renderUserProps {
  title: string;
  iconName: string;
  onPress: () => void;
  onPressSub: () => void | null;
  user: UserToken | null;
}

const RenderUser = (props: renderUserProps) => {
  const { title, iconName, onPress, onPressSub, user } = props;
  const { themeState, piano } = useAppSelector(state => ({ themeState: state.theme, piano: state.piano }));
  return (
    <View
      style={styles.container}
      accessibilityLabel={user ? `Utilizador ${piano.isPremium ? 'Premium' : ''} ${user ? user.user.name : ''}` : 'Entrar/Registar'}
    >
      <View style={styles.flex} accessible={true}>
        <TouchableOpacity activeOpacity={0.8} style={styles.wrapper} onPress={onPress}>
          {user ? (
            <View
              style={[
                styles.premium,
                {
                  borderColor: piano.isPremium ? theme.colors.premium : themeState.themeColor.transparent,
                },
              ]}
            >
              {user.user.picture ? (
                <Image source={{ uri: user.user.picture }} style={styles.image} />
              ) : (
                <Icon name={'user-comment'} size={40} fill={themeState.themeColor.menuIcons} color={themeState.themeColor.menuIcons} disableFill={false} />
              )}
            </View>
          ) : (
            <Icon name={iconName} size={20} fill={themeState.themeColor.menuIcons} color={themeState.themeColor.menuIcons} disableFill={false} />
          )}
          <Text style={[styles.title, { color: themeState.themeColor.color }]}>{title}</Text>
        </TouchableOpacity>
      </View>
      {!piano.isPremium && (
        <TouchableOpacity activeOpacity={0.9} onPress={onPressSub} style={styles.btn}>
          <Text style={styles.btnText}>Assinar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  wrapper: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    marginLeft: 8,
  },
  btn: {
    backgroundColor: theme.colors.premium,
    height: 25,
    width: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: theme.colors.brandBlack,
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
  },
  image: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  premium: {
    borderWidth: 3,
    borderRadius: 40,
  },
});

export default RenderUser;
