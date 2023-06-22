import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants/theme';
import { getDate } from '../../utils/date';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import Icon from '../icon';
import Loading from '../loading';
import { Comments } from '../../models/comments';
import { strings } from '../../constants/strings';
import { useAppSelector } from '../../hooks';

const UserComment = (props: Comments) => {
  const { index, item, user, onSelectReport, onSelectDelete, expandText, textNumberLines, vote, voteLoading, reply, replyTo } = props;
  const themeState = useAppSelector(state => state.theme);

  return (
    <View
      key={index}
      style={[
        styles.container,
        {
          backgroundColor: themeState.themeColor.background,
        },
      ]}
    >
      <View style={[styles.boxCommentWrapper, { borderBottomColor: themeState.themeColor.lines }]}>
        {item.created_by.picture ? (
          <Image source={{ uri: item.created_by.picture }} resizeMode="cover" resizeMethod="auto" borderRadius={200} style={styles.image} />
        ) : (
          <Icon
            name={'user-comment'}
            size={40}
            fill={themeState.themeColor.menuIcons}
            color={themeState.themeColor.menuIcons}
            disableFill={false}
            style={{ marginRight: 10, opacity: 0.6 }}
          />
        )}
        <View style={styles.userCommentWrapper}>
          <View style={styles.userCommentHeader}>
            <View style={styles.nameContainer}>
              <Text numberOfLines={1} style={[styles.name, { color: themeState.themeColor.color }]}>
                {item.created_by.name}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={[styles.date, { color: themeState.themeColor.color }]}>{getDate(item.created_at)}</Text>
            </View>
            <View style={styles.moreContainer}>
              <Menu>
                <MenuTrigger
                  children={
                    <Icon name="mais" size={14} color={themeState.themeColor.color} fill={themeState.themeColor.color} disableFill style={styles.moreIcon} />
                  }
                />
                <MenuOptions
                  customStyles={{
                    optionWrapper: { padding: 10 },
                    optionText: { color: themeState.themeColor.menuOptionsText },
                  }}
                  optionsContainerStyle={[styles.optionsMenu, { backgroundColor: themeState.themeColor.menuOptions }]}
                >
                  <MenuOption onSelect={onSelectReport} text={strings.comments.report} />
                  {user?.id == item.created_by.id && !item.deleted && <MenuOption onSelect={onSelectDelete} text={strings.comments.delete} />}
                </MenuOptions>
              </Menu>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.9} onPress={expandText}>
            <Text numberOfLines={textNumberLines} ellipsizeMode="tail" style={[styles.comment, { color: themeState.themeColor.color }]}>
              {item.text.trim('\n', '')}
            </Text>
          </TouchableOpacity>
          <View style={styles.menuWrapper}>
            {voteLoading == item.id ? (
              <Loading color={themeState.themeColor.color} size={'small'} />
            ) : (
              <TouchableOpacity activeOpacity={0.9} style={styles.vote} onPress={vote}>
                <Icon name="arrow" size={14} fill={themeState.themeColor.color} color={themeState.themeColor.color} disableFill style={styles.arrowIcon} />
                <Text
                  style={[
                    styles.voteText,
                    {
                      color: item.user_score > 0 ? theme.colors.brandBlue : themeState.themeColor.color,
                    },
                  ]}
                >
                  {item.upvotes}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.bull, { color: themeState.themeColor.color }]}>&bull;</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={reply}>
              <Text style={[styles.replyText, { color: themeState.themeColor.color }]}>{strings.comments.reply}</Text>
            </TouchableOpacity>
          </View>
          {item.replies?.length > 0 && (
            <TouchableOpacity activeOpacity={0.9} onPress={replyTo}>
              <View style={[styles.boxAnswered, { backgroundColor: themeState.themeColor.boxAnswered }]}>
                <Text style={[styles.boxAnsweredText, { color: themeState.themeColor.boxAnsweredText }]}>
                  {item.replies[0].created_by.name} {strings.comments.answered}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  boxCommentWrapper: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  userCommentWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  userCommentHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  nameContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  moreContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  moreIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  optionsMenu: {
    flex: 1,
    padding: 2,
  },
  comment: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
    paddingTop: 6,
    paddingBottom: 12,
  },
  menuWrapper: {
    flexDirection: 'row',
  },
  vote: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  arrowIcon: {
    marginRight: 2,
    transform: [{ rotate: '90deg' }],
  },
  bull: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  replyText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
  boxAnswered: {
    marginTop: 10,
    padding: 8,
  },
  boxAnsweredText: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default UserComment;
