import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { theme } from '../../constants/theme';
import InlineTopic from '../../components/InlineTopic';
import { imageURL } from '../../utils/image';
import PhotoGallery from '../../components/photoGallery';
import { LinearGradient } from 'expo-linear-gradient';
import { renderIcon } from '../../utils/renderIcon';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Topic } from '../../models/articleFields';
import { Post } from '../../models/articles';
import Author from '../../components/author';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ObsArticleWrapper, ObsTitle } from '../../components/global';
import { RenderPostHtml } from '../../components/htmlRenders/RenderPost';
import { RenderHTMLSource } from 'react-native-render-html';
import { TutorPropsT, setArticleProps, setMaxQuestionsReached } from '../../reducers/analytics';
import { Skeleton } from '@rneui/themed';
import { Image } from '@rneui/themed';
import Icon from '../../components/icon';
import ImageViewer from 'react-native-image-zoom-viewer';

interface TutorTypeProps {
  post: Post;
}

const TutorType = (props: TutorTypeProps) => {
  const { themeState, analyticsState } = useAppSelector(state => ({ themeState: state.theme, analyticsState: state.analytics }));
  const { post } = props;
  const [valid, setValid] = useState(true);
  const questions = post.tutor.data;
  const [question, setQuestion] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(questions.length);
  const navigation = useNavigation();
  const mainTopic = post.topics.find((t: Topic) => t.mainTopic) as Topic;
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const [visible, setIsVisible] = useState(false);

  const handlerInlineTopic = () => {
    navigation.dispatch(CommonActions.navigate('TopicsDetails', { topic: mainTopic }));
  };

  useEffect(() => {
    const uF = navigation.addListener('focus', () => {
      dispatch(setArticleProps({ type: 'obs_tutor', maxQuestions: totalQuestions, maxQuestionsReached: question + 1 } as TutorPropsT));
    });
    return uF;
  }, []);

  const RenderHeader = () => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(!visible)} style={styles.closeContainer}>
        <Icon name={'close'} size={20} disableFill={false} fill={theme.colors.white} color={theme.colors.white} />
      </TouchableOpacity>
    );
  };

  const imageUrl = imageURL(post.image, themeState.themeOrientation.imageW);
  const imageUrls = imageUrl ? [{ url: imageUrl }] : [];

  return (
    <ObsArticleWrapper related={post.id}>
      {post.image ? (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setIsVisible(true);
            }}
          >
            <View>
              <Image
                source={{ uri: imageUrl }}
                resizeMode="cover"
                style={styles.image}
                PlaceholderContent={<Skeleton width={themeState.themeOrientation.imageW} style={{ height: '100%' }} />}
              />
              <LinearGradient
                colors={[
                  themeState.themeColor.transparent,
                  valid && post.image ? 'rgba(0,0,0,0.7)' : themeState.themeColor.transparent,
                  valid && post.image ? 'rgba(0,0,0,0.7)' : themeState.themeColor.transparent,
                ]}
                style={styles.linearGradient}
              >
                <InlineTopic topic={mainTopic} color={theme.colors.white} onPress={handlerInlineTopic} />
                <ObsTitle
                  title={post.title}
                  override={{
                    fontFamily: themeState.fontStyles.tutorPostTitle.fontFamily,
                    color: theme.colors.white,
                    marginTop: 10,
                  }}
                />
                <Author post={post} />
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <Modal visible={visible} statusBarTranslucent={true}>
            <ImageViewer
              enableSwipeDown={true}
              onSwipeDown={() => setIsVisible(false)}
              swipeDownThreshold={40}
              renderIndicator={() => <></>}
              imageUrls={imageUrls}
              renderHeader={() => <RenderHeader />}
            />
          </Modal>
        </>
      ) : (
        <PhotoGallery data={post.mainGallery} />
      )}
      <View style={styles.questionsNumberContainer}>
        <Text
          style={[
            styles.questionsNumberText,
            { fontSize: themeState.fontStyles.tutorQuestions.fontSize, fontFamily: themeState.fontStyles.tutorQuestions.fontFamily },
          ]}
        >{`Pergunta ${question + 1} de ${totalQuestions}`}</Text>
      </View>

      <RenderPostHtml post={post}>
        <View>
          {questions.map((item, index) => {
            return (
              <View key={index}>
                {index === question && (
                  <View>
                    <Text
                      style={{
                        color: themeState.themeColor.color,
                        fontSize: themeState.fontStyles.tutorQuestion.fontSize,
                        fontFamily: themeState.fontStyles.tutorQuestion.fontFamily,
                      }}
                    >
                      {item.question}
                    </Text>
                    <RenderHTMLSource contentWidth={width} source={{ html: item.body }} />
                  </View>
                )}
              </View>
            );
          })}
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (question === 0) {
                  return;
                } else {
                  setQuestion(question - 1);
                  post.hasScroll();
                }
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: question === 0 ? theme.colors.brandGrey : theme.colors.brandBlue,
              }}
            >
              <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      marginVertical: 3,
                      marginRight: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {renderIcon(
                      'arrow',
                      16 * themeState.fontScaleFactor,
                      false,
                      question === 0 ? theme.colors.brandBlack : theme.colors.white,
                      question === 0 ? theme.colors.brandBlack : theme.colors.white,
                      () => {},
                      { transform: [{ rotate: '360deg' }] },
                    )}
                  </View>
                  <Text
                    style={{
                      color: question === 0 ? theme.colors.brandBlack : theme.colors.white,
                      fontSize: themeState.fontStyles.tutorBtns.fontSize,
                      fontFamily: themeState.fontStyles.tutorBtns.fontFamily,
                    }}
                  >
                    Anterior
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (question === totalQuestions - 1) {
                  dispatch(setMaxQuestionsReached(totalQuestions));
                  return;
                } else {
                  setQuestion(currQ => {
                    const updatedQ = currQ + 1;
                    if (updatedQ > (analyticsState.articleProps as TutorPropsT).maxQuestionsReached) {
                      dispatch(setMaxQuestionsReached(updatedQ));
                    }
                    return updatedQ;
                  });
                  post.hasScroll();
                }
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                marginLeft: 20,
                backgroundColor: question === totalQuestions - 1 ? theme.colors.lightGrey : theme.colors.brandBlue,
              }}
            >
              <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}
                >
                  <Text
                    style={{
                      color: question === 0 ? theme.colors.white : question === totalQuestions - 1 ? theme.colors.brandBlack : theme.colors.white,
                      fontSize: themeState.fontStyles.tutorBtns.fontSize,
                      fontFamily: themeState.fontStyles.tutorBtns.fontFamily,
                    }}
                  >
                    Próxima
                  </Text>
                  <View
                    style={{
                      marginVertical: 3,
                      marginLeft: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {renderIcon(
                      'arrow',
                      16 * themeState.fontScaleFactor,
                      false,
                      question === 0 ? theme.colors.white : question === totalQuestions - 1 ? theme.colors.brandBlack : theme.colors.white,
                      question === 0 ? theme.colors.white : question === totalQuestions - 1 ? theme.colors.brandBlack : theme.colors.white,
                      () => {},
                      { transform: [{ rotate: '180deg' }] },
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </RenderPostHtml>
    </ObsArticleWrapper>
  );
};

const styles = StyleSheet.create({
  topic: {
    paddingVertical: 10,
  },
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  linearGradient: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 30,
  },
  questionsNumberContainer: {
    marginTop: 10,
  },
  questionsNumberText: {
    color: theme.colors.brandGrey,
  },
  closeContainer: {
    padding: 10,
    position: 'absolute',
    zIndex: 1,
    right: 14,
    top: 50,
  },
});

export default TutorType;
