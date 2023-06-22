import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { Topic } from '../models/articleFields';
import { useAppSelector } from '../hooks';

interface TopicsProps {
  topic: Topic;
  isHeadline?: boolean;
  isArticlePage?: boolean;
  color?: string;
  onPress?: () => void;
}

// FIXME topico do artigo
const InlineTopic = (props: TopicsProps) => {
  const { topic, isHeadline, isArticlePage, color, onPress } = props;
  const themeState = useAppSelector(state => state.theme);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      {topic ? (
        <View>
          <View key={topic.term_id}>
            <View
              style={[
                styles.container,
                {
                  position: isHeadline ? 'absolute' : 'relative',
                  bottom: isHeadline ? 6 : 0,
                  left: 0,
                },
              ]}
            >
              {isHeadline ? (
                <View
                  style={[
                    styles.topicContainer,
                    {
                      backgroundColor: topic.style?.backgroundColor ? topic.style.backgroundColor : theme.colors.brandGrey,
                      paddingHorizontal: 4,
                    },
                  ]}
                >
                  {topic?.style?.iconUri && <Image style={[styles.image, { marginRight: 4 }]} source={{ uri: topic.style.iconUri }} />}
                  <View style={styles.mainTopicContainer}>
                    <Text
                      style={[
                        styles.nameTopic,
                        {
                          fontSize: themeState.fontStyles.topics.fontSize,
                          fontFamily: themeState.fontStyles.topics.fontFamily,
                          lineHeight: themeState.fontStyles.topics.lineHeight,
                          color: topic.style?.foregroundColor ? topic.style.foregroundColor : theme.colors.white,
                        },
                      ]}
                    >
                      {topic.name}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.topicContainer}>
                  <View
                    style={[
                      styles.mainTopicContainer,
                      {
                        flexDirection: 'row',
                        backgroundColor: topic.style && topic.style.backgroundColor && !isArticlePage ? topic.style.backgroundColor : '',
                        paddingLeft: topic.style && topic.style.backgroundColor && topic.style.iconUri ? 5 : 0,
                      },
                    ]}
                  >
                    {topic.style && topic.style.iconUri && (
                      <Image
                        style={[
                          styles.image,
                          {
                            marginRight: topic.style.backgroundColor ? 0 : 4,
                          },
                        ]}
                        source={{ uri: topic.style.iconUri }}
                      />
                    )}
                    <View
                      style={{
                        paddingHorizontal: topic.style && topic.style.backgroundColor ? 6 : 0,
                      }}
                    >
                      <Text
                        style={[
                          styles.nameTopic,
                          {
                            fontSize: themeState.fontStyles.topics.fontSize,
                            fontFamily: themeState.fontStyles.topics.fontFamily,
                            lineHeight: themeState.fontStyles.topics.lineHeight,
                            color:
                              topic.style && topic.style.foregroundColor && !isArticlePage
                                ? topic.style.foregroundColor
                                : color
                                ? color
                                : themeState.themeColor.color,
                            marginLeft: topic.style && topic.style.backgroundColor ? -3 : 0,
                          },
                        ]}
                      >
                        {topic.name}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <></>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  topicContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  image: {
    width: 16,
    height: 16,
  },
  mainTopicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameTopic: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default InlineTopic;
