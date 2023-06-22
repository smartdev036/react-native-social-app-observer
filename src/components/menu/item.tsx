import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../../components/icon';
import { useAppSelector } from '../../hooks';
import { theme } from '../../constants/theme';
import { apiSininho } from '../../api/endpoints';

interface ItemProps {
  title: string;
  iconName?: string;
  iconColor?: string;
  onPress: () => void;
  unreadAlert?: number;
  show: boolean;
  showIconLeft?: boolean;
}

const Item = (props: ItemProps) => {
  const { title, iconName, iconColor, onPress, show, showIconLeft } = props;
  const themeState = useAppSelector(state => state.theme);
  const user = useAppSelector(state => state.auth.user);
  const [unreadAlert, setUnreadAlert] = useState<number>(0);

  const accessibilityLabel = (unreadAlert: number | undefined) => {
    if (unreadAlert === undefined) {
      return 'Não tem alertas';
    }
    if (unreadAlert === 1) {
      return `Tem ${unreadAlert} alerta.`;
    }
    return `Tem ${unreadAlert} alertas.`;
  };

  useEffect(() => {
    if (!user) {
      setUnreadAlert(0);
      return;
    }
    if (title === 'Alertas') {
      apiSininho
        .get(`rest/notifications/user/${user.id}/viewed`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        })
        .then(r => {
          setUnreadAlert(r.data.unviewedNotifications);
        })
        .catch(e => console.log('apiSininho error item: ', e));
    }
  }, [user]);

  return (
    <>
      {show && (
        <TouchableOpacity activeOpacity={0.8} style={styles.container} onPress={onPress}>
          {iconName && (
            <Icon
              name={iconName}
              size={20}
              fill={iconColor ? iconColor : themeState.themeColor.menuIcons}
              color={iconColor ? iconColor : themeState.themeColor.menuIcons}
              disableFill={false}
            />
          )}
          <Text accessibilityLabel={title} style={[styles.title, { color: themeState.themeColor.color, marginLeft: iconName ? 8 : 0 }]}>
            {title}
          </Text>
          {unreadAlert != null && unreadAlert > 0 && (
            <View style={styles.ballon}>
              <Text accessibilityLabel={accessibilityLabel(unreadAlert)} style={styles.baloonValue}>
                {unreadAlert}
              </Text>
            </View>
          )}
          {showIconLeft && (
            <Icon name={'arrow'} size={18} fill={theme.colors.brandGrey} color={theme.colors.brandGrey} style={{ transform: [{ rotate: '180deg' }] }} />
          )}
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  ballon: {
    minWidth: 22,
    marginRight: 10,
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 100,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baloonValue: {
    fontSize: 10,
    color: theme.colors.white,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default Item;
