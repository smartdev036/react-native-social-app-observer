import React, {useEffect, useRef, useState} from 'react';
import {Text, View, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback, Platform} from 'react-native';
import {theme} from '../../../constants/theme';
import {apiPodcasts} from '../../../api/endpoints';
import Icon from '../../../components/icon';
import {renderIcon} from '../../../utils/renderIcon';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Loading from '../../../components/loading';
import {useAppSelector} from '../../../hooks';
import Modal from 'react-native-modal';
import {OS} from '../../../constants';
import {AlertError} from '../../../error/errorAlert';
import crashlytics from '@react-native-firebase/crashlytics';
import {Skeleton} from '@rneui/themed';
import {Image} from '@rneui/themed';
import {Analytics, Screens} from "../../../services/analytics";

interface renderItemProps {
  name: string;
  image_16x9: {
    src: string;
  };
}

const Podcasts = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [podcasts, setPodcasts] = useState<any>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [order, setOrder] = useState({order: 'date', pre: '-'});
  const themeState = useAppSelector((state) => state.theme);
  const [isModalVisible, setModalVisible] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.trackPageView({screen: Screens.PODCAST_HOME});
    });

    return  unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadPodcasts();
  }, [order]);

  const loadPodcasts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const resp = await apiPodcasts.get('programs', {
        params: {
          media: 1,
          limit: 25,
          offset: podcasts?.offset,
          order: order.pre + order.order,
        },
      });
      if (resp.status === 500 || resp.status === 502) {
        return AlertError('Errro', 'Por favor tente mais tarde!', false);
      }
      if (!resp?.data?.data) {
        return;
      }
      resp.data.data = [...(podcasts?.data ?? []), ...resp.data.data].filter(
        (x) => {
          return !x.archived;
        },
      );
      setPodcasts(resp.data);
    } catch (e: any) {
      crashlytics().recordError(new Error(e));
      crashlytics().log('Error: loadPodcasts');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };


  const renderItem: ({item, index}: { item: renderItemProps; index: number }) => JSX.Element = ({item, index}) => {
    return (
      <TouchableWithoutFeedback
        key={index}
        onPress={() => navigation.dispatch(CommonActions.navigate('Program', item))}
      >
        <View style={[styles.podcastContainer, {width: themeState.themeOrientation.podcastW}]}>
          <Image
            source={{uri: item.image_16x9.src}}
            resizeMode="cover"
            containerStyle={styles.image}
            PlaceholderContent={<Skeleton width={400} style={{aspectRatio: 16 / 9, height: 96}}/>}
          />
          <Text style={[styles.podcastTitle, {color: themeState.themeColor.color}]} numberOfLines={2} lineBreakMode="clip">
            {item.name}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const toggleModal = () => {
    if (!loading) {
      setModalVisible(!isModalVisible);
    }
  };

  const renderOrderModalValues = [
    {
      code: 'date',
      title: 'Mais recentes',
      onPress: null,
    },
    {
      code: 'alphabetical',
      title: 'Ordem alfabética',
      onPress: null,
    },
  ];

  const handleOrderModalValue = (index: number) => {
    switch (index) {
      case 0: {
        setOrder({pre: '-', order: 'date'});
        setPodcasts(null);
        toggleModal();
      }
        break;
      case 1: {
        setOrder({pre: '', order: 'alphabetical'});
        setPodcasts(null);
        toggleModal();
      }
        break;
    }
  };

  const renderModalIcon = (code: string) => {
    if (order.order === code) {
      return renderIcon('check', 14, false, themeState.themeColor.color, themeState.themeColor.color);
    }
  };

  const RenderOrderModal = () => {
    return (
      <View style={[styles.modalContainer, {backgroundColor: themeState.themeColor.background}]}>
        <View style={styles.center}>
          <View style={styles.barIcon}/>
        </View>
        <View style={styles.modalContent}>
          <View style={styles.marginBottom}>
            <Text style={styles.title}>Ordenar por</Text>
          </View>
          {renderOrderModalValues.map((v, index: number) => {
            return (
              <View style={{flexDirection: 'row'}} key={index}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    handleOrderModalValue(index);
                  }}
                  style={styles.btn}
                >
                  <Text style={[styles.text, {color: themeState.themeColor.color}]}>{v.title}</Text>
                </TouchableOpacity>
                <View style={styles.icon}>{renderModalIcon(v.code)}</View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const LoadingComp = () => {
    return loadingMore ? (
      <View style={[styles.loading, {marginVertical: 10}]}>
        <Loading color={themeState.themeColor.color} size={'small'}/>
      </View>
    ) : null;
  };

  return (
    <SafeAreaView style={[styles.safeAreaView, {backgroundColor: themeState.themeColor.background}]}>
      <Modal
        ref={sheetRef}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        isVisible={isModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating={true}
        swipeDirection="down"
        onSwipeComplete={toggleModal}
        style={styles.modal}
      >
        <RenderOrderModal/>
      </Modal>
      <View style={[styles.topBar, {maxWidth: themeState.themeOrientation.maxW}]}>
        <Text style={[styles.titleScreen, {color: themeState.themeColor.color}]}>Podcasts</Text>
        <TouchableOpacity onPress={toggleModal}>
          <Icon name="mais" size={20} fill={theme.colors.brandGrey}/>
        </TouchableOpacity>
      </View>
      {loading &&
        <View style={styles.loading}>
          <Loading color={themeState.themeColor.color} size={'small'}/>
        </View>
      }
      {!loading &&
        <View style={[styles.podcastWrapper, {maxWidth: themeState.themeOrientation.maxW}]}>
          {podcasts && podcasts.data && podcasts.data.length > 0 && (
            <FlatList
              style={{paddingHorizontal: 15}}
              data={podcasts.data}
              keyExtractor={(item, index) => index.toString()}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              numColumns={themeState.themeOrientation.numCol}
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={true}
              decelerationRate={"fast"}
              disableVirtualization={true}
              onEndReached={async () => {
                if (loadingMore || !podcasts.offset) {
                  return;
                }
                setLoadingMore(true);
                await loadPodcasts(false);
                setLoadingMore(false);
              }}
              renderItem={renderItem}
              ListFooterComponent={<LoadingComp/>}
            />
          )}
        </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  topBar: {
    marginVertical: 20,
    flexDirection: 'row',
    paddingHorizontal: 15,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  titleScreen: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fonts.halyardRegular,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    paddingTop: 12,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: Platform.OS === OS.android ? 0 : 20,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barIcon: {
    width: 60,
    height: 5,
    backgroundColor: '#bbb',
    borderRadius: 3,
    marginBottom: 10,
  },
  modalContent: {
    marginHorizontal: 15,
    paddingVertical: Platform.OS === OS.android ? 0 : 8,
  },
  marginBottom: {
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontFamily: theme.fonts.halyardRegular,
    color: theme.colors.brandGrey,
  },
  btn: {
    paddingVertical: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fonts.halyardRegular,
  },
  icon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  podcastWrapper: {
    flex: 1,
    justifyContent: 'center',

    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'

  },
  podcastContainer: {
    marginBottom: 14,
    overflow: 'hidden',
  },
  image: {
    aspectRatio: 16 / 9,
    width: '100%',
    marginBottom: 4,
  },
  podcastTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.halyardRegular,
  },
});

export default Podcasts;
