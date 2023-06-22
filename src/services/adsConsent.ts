import {AdsConsent, AdsConsentStatus} from 'react-native-google-mobile-ads';

export const AdsConsentPopup = async () => {
  const consentInfo = await AdsConsent.requestInfoUpdate();

  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
    await AdsConsent.showForm();
  }
};
