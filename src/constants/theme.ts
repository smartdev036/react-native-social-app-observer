import DeviceInfo from 'react-native-device-info';

export const colors = {
  transparent: 'transparent',
  brandBlue: '#57A0D7',
  brandDarkBlue: '#06375E',
  white: '#ffffff',
  premium: '#F8DE54',
  brandGrey: '#7B8794',
  mediumGrey: '#CCCCCC',
  lightGrey: '#EEEEEE',
  superLightGrey: '#F1F3F6',
  tutorBrand: '#E07F36',
  brandRed: '#D75760',
  radioBg: '#153044',
  darkBg: '#18191A',
  brandBlack: '#262626',
  facebookBg: '#1877F2',
};

const themeData = () => {
  const isTablet = DeviceInfo.isTablet();
  return {
    styles: {
      articleContentHorizontalPadding: 15,
      headerScreenHeight: 50,
      containerMaxWidth: 700,
    },
    // TODO Remover
    content: {
      topics: {
        fontSize: 12,
        fontFamily: 'HalyardText-Reg',
      },
      title: {
        fontSize: 24,
        fontFamily: 'HalyardTextSemBd',
        lineHeight: 29,
      },
      lead: {
        fontSize: 20,
        fontFamily: 'HalyardTextBook',
        lineHeight: 25,
      },
      author: {
        fontSize: 14,
        fontFamily: 'HalyardText-Reg',
      },
    },
    colors: {
      brandBlue: colors.brandBlue,
      brandDarkBlue: colors.brandDarkBlue,
      white: colors.white,
      premium: colors.premium,
      brandGrey: colors.brandGrey,
      mediumGrey: colors.mediumGrey,
      lightGrey: colors.lightGrey,
      tutorBrand: colors.tutorBrand,
      brandRed: colors.brandRed,
      radioBg: colors.radioBg,
      darkBg: colors.darkBg,
      brandBlack: colors.brandBlack,
      facebookBg: colors.facebookBg,
    },
    fonts: {
      notoRegular: 'NotoSerif-Regular',
      notoBold: 'NotoSerif-Bold',
      notoItalic: 'NotoSerif-Italic',
      notoBoldItalic: 'NotoSerif-BoldItalic',
      halyardRegular: 'HalyardText-Reg',
      halyardBold: 'HalyardText-Bd',
      halyardSemBd: 'HalyardTextSemBd',
      halyardBook: 'HalyardTextBook',
    },

    portrait: {
      padding: isTablet ? 20 : 0,
      maxW: isTablet ? 700 : '100%',
      maxWLogin: isTablet ? 350 : '100%',
      maxWHome: '100%',
      imageW: isTablet ? 1200 : 800,
      numCol: isTablet ? 3 : 2,
      podcastW: isTablet ? '32%' : '48%',
    },

    landscape: {
      padding: isTablet ? 0 : 0,
      maxW: isTablet ? 700 : '100%',
      maxWLogin: isTablet ? 350 : '100%',
      maxWHome: isTablet ? 700 : '100%',
      imageW: isTablet ? 1200 : 800,
      numCol: isTablet ? 3 : 2,
      podcastW: isTablet ? '32%' : '48%',
    },

    light: {
      theme: 'light',
      barStyle: 'dark-content',
      transparent: colors.transparent,
      textColor: colors.brandBlack,
      color: colors.brandBlack,
      colorInfo: colors.brandGrey,
      background: colors.white,
      backgroudGray: '#EAEAEA',
      colorStatusbar: colors.white,
      colorMenu: colors.brandGrey,
      shadowColor: colors.brandBlack,
      closeBtnBgColor: colors.white,
      googleText: colors.brandBlack,
      noReadAlert: '#EAEAEA',
      opinionBackgroundImage: '#EAEAEA',
      boxAnswered: '#EAEAEA',
      boxAnsweredText: colors.brandBlack,
      menuOptions: colors.white,
      menuOptionsText: colors.brandBlack,
      lines: '#EAEAEA',
      boxCommentsBg: colors.white,
      boxInReplyTo: '#EAEAEA',
      boxPremiumBg: '#EAEAEA',
      boxPremiumText: colors.brandBlack,
      menuIcons: colors.brandGrey,
      tagsStyles: {
        h1: {
          color: colors.brandBlack,
        },
        p: {
          color: colors.brandBlack,
        },
        li: {
          color: colors.brandBlack,
        },
        a: {
          color: colors.brandBlue,
        },
      },
      title: {
        color: colors.brandBlack,
      },
      search: {
        input: {
          colorText: colors.brandBlack,
          bgColor: colors.white,
          iconColor: colors.brandBlack,
          shadowColor: colors.brandBlack,
        },
        results: {
          title: colors.brandGrey,
          name: colors.brandBlack,
        },
      },
      paywall: {
        border: '#EAEAEA',
        BtnBackground: colors.premium,
      },
      aboutScreen: {
        title: colors.brandGrey,
      },
      licences: {
        licenseText: {
          backgroundColor: colors.lightGrey,
          color: colors.brandBlack,
        },
      },
      onBoardingBg: {
        background: colors.superLightGrey,
      },
    },

    dark: {
      theme: 'dark',
      barStyle: 'light-content',
      transparent: colors.transparent,
      textColor: colors.white,
      color: colors.white,
      colorInfo: colors.brandGrey,
      background: colors.brandBlack,
      backgroudGray: '#363638',
      colorStatusbar: colors.brandBlack,
      colorMenu: colors.white,
      shadowColor: colors.brandGrey,
      closeBtnBgColor: colors.brandBlack,
      googleText: colors.white,
      noReadAlert: colors.brandBlack,
      opinionBackgroundImage: '#363638',
      boxAnswered: colors.brandBlack,
      boxAnsweredText: colors.white,
      menuOptions: colors.brandBlack,
      menuOptionsText: colors.white,
      lines: colors.brandBlack,
      boxCommentsBg: colors.brandBlack,
      boxInReplyTo: colors.brandBlack,
      boxPremiumBg: colors.brandBlack,
      boxPremiumText: colors.white,
      menuIcons: colors.white,
      tagsStyles: {
        h1: {
          color: colors.white,
        },
        p: {
          color: colors.white,
        },
        li: {
          color: colors.white,
        },
        a: {
          color: colors.brandBlue,
        },
      },
      title: {
        color: colors.white,
      },
      search: {
        input: {
          colorText: colors.white,
          bgColor: colors.brandBlack,
          iconColor: colors.white,
          shadowColor: '#000000',
        },
        results: {
          title: colors.brandGrey,
          name: colors.white,
        },
      },
      paywall: {
        border: colors.brandGrey,
        BtnBackground: colors.premium,
      },
      aboutScreen: {
        title: colors.brandGrey,
      },
      licences: {
        licenseText: {
          backgroundColor: colors.brandBlack,
          color: colors.white,
        },
      },
      onBoardingBg: {
        background: colors.brandBlack,
      },
    },
  };
};

export const theme = themeData();
