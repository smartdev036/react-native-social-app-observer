import { Alert, EmitterSubscription, Platform } from 'react-native';
import {
  initConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  purchaseUpdatedListener,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  PurchaseError,
  clearTransactionIOS,
  getAvailablePurchases,
} from 'react-native-iap';
import { apiPiano } from '../api/endpoints';
import { PIANO_API_TOKEN, PIANO_AID, OS } from '../constants';
import { logout, setLoading } from '../reducers/auth';
import { savePurchase, setCanMakePayments, setRegisteredSubscriber, setSubscribingPiano, syncPurchase } from '../reducers/piano';
import * as RootNavigation from '../rootNavigation';
import { checkIfUserIsPremiumAndDispatchIfHasPianoAccess } from '../services/auth';
import { store } from '../store';
import { LOG } from './logger';

let purchaseUpdateSubscription: EmitterSubscription | null;
let purchaseErrorSubscription: EmitterSubscription | null;

async function handlePurchaseUpdatedListener(purchase: SubscriptionPurchase) {
  store.dispatch(setLoading(false));
  console.log('IM tring to alert, purchaseToken: ', Object.keys(purchase));
  store.dispatch(savePurchase(purchase));
  await finishTransaction({ purchase });
  Alert.alert(
    'Ação necessária',
    'Para tirar melhor proveito da sua assinatura, associe-a à sua conta Observador',
    [
      {
        text: 'Associar',
        onPress: async () => {
          await store.dispatch(logout());
          if (RootNavigation.getRoutName()?.name !== 'Login') {
            RootNavigation.navigate('Login', { activateSignature: true });
          }
          subscribeUser(purchase);
        },
      },
      {
        text: 'Agora não',
        onPress: async () => {},
        style: 'cancel',
      },
    ],
    {
      cancelable: false,
    },
  );
}

export async function initSubscriptionsManager() {
  const res = await initConnection();
  if (!res) {
    store.dispatch(setCanMakePayments(false));
    // user with disabled purchases
    return;
  }
  const purchases = await getAvailablePurchases({
    onlyIncludeActiveItems: true,
  });
  store.dispatch(syncPurchase(purchases[0] ?? false));
  if (Platform.OS === OS.ios) {
    //https://github.com/dooboolab/react-native-iap/issues/801
    //Even when we finish a transaction our listener is called and the modal continue to appear, maybe it is just in sandboxmode, need some testing
    await clearTransactionIOS();
  }

  // we make sure that "ghost" pending payment are removed
  // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
  if (Platform.OS === OS.android) {
    await flushFailedPurchasesCachedAsPendingAndroid();
  }

  purchaseUpdateSubscription = purchaseUpdatedListener(handlePurchaseUpdatedListener);

  purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
    store.dispatch(setLoading(false));
    console.warn('@@@@@@@@@@@ purchaseErrorListener', error);
    if (error.code === 'E_ALREADY_OWNED') {
      Alert.alert('Atenção', 'Parece que já tem uma assinatura, faça login com o email associado', [
        {
          text: 'Login',
          onPress: async () => {
            await store.dispatch(logout());
            RootNavigation.navigate('Login', {});
          },
        },
        {
          text: 'Fechar',
        },
      ]);
    } else {
      console.log('ERROR SUBSCRIPTONS LISTeNER', error);
    }
  });
}

export function subscribeUser(purchase: SubscriptionPurchase) {
  const registeredSubscriber = store.getState().piano.registeredSubscriber;
  if (registeredSubscriber) {
    console.log('@@@@ Alredy registered subscriber');
    return;
  }

  console.log('Registered Subscriber');
  store.dispatch(setRegisteredSubscriber(true));

  //This callback will be fired when store updates any state, call unsubribe to cancel it
  const unsubscribe = store.subscribe(async () => {
    function returnWithError(message: string) {
      console.log('Error subscribing with piano: ', message);
      unsubscribe();
      store.dispatch(setRegisteredSubscriber(false));
      store.dispatch(setSubscribingPiano(false));
      alertError();
    }

    const { auth, piano } = store.getState();
    const user = auth.user;
    const subscribingPiano: boolean = piano.subscribingPiano;

    console.log('ALREADY SUBSCRIBING ??? : ', subscribingPiano);
    if (!user || subscribingPiano) {
      console.log('Piano subscribe Returning: ', 'has user: ', user !== null, subscribingPiano);
      return;
    }

    store.dispatch(setSubscribingPiano(true));
    console.log('EXECUTE SUBSCRIBER');

    //TODO Better checking... check if is valid - Android or IOS
    if (!purchase.dataAndroid && !purchase.transactionReceipt) {
      return returnWithError('Dont have receipt');
    }

    const termId = getTermIdFromPurchase(purchase);
    if (!termId) {
      return returnWithError('Need termId to sync account');
    }

    const commonData = {
      api_token: PIANO_API_TOKEN,
      aid: PIANO_AID,
      term_id: termId,
    };

    let fields;
    if (Platform.OS === OS.ios) {
      fields = { receiptData: purchase.transactionReceipt };
    } else {
      fields = {
        INAPP_SIGNATURE: purchase.signatureAndroid || '',
        INAPP_PURCHASE_DATA: purchase.dataAndroid || '',
      };
    }

    try {
      //Android
      let externalConversionData = new URLSearchParams({
        ...commonData,
        user_ref: user.user.piano_ref_token,
        fields: JSON.stringify(fields),
      });

      if (Platform.OS === OS.ios) {
        externalConversionData = new URLSearchParams({
          ...commonData,
          user_provider: 'publisher_user_ref',
          user_token: user.user.piano_ref_token,
          fields: JSON.stringify(fields),
          check_validity: 'true',
        });
      }

      const res = await apiPiano.post('/conversion/external/create', externalConversionData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (res?.data?.code === 0) {
        LOG.info('@@@@@ RES from piano: ', res.data);
        alertSuccess(user.user.email);
      } else {
        LOG.error('Error code from piano: ', res?.data);
        alertError();
      }
    } catch (err) {
      //TODO look better into this Sometimes piano gives  500 error but it creates the access, so lets check it
      const isPremium = await checkIfUserIsPremiumAndDispatchIfHasPianoAccess(user.user.sub);
      if (isPremium) {
        alertSuccess(user.user.email);
      } else {
        console.log('Error syncing with piano App.tsx 111', err);
        alertError();
      }
    }

    unsubscribe();
    store.dispatch(setRegisteredSubscriber(false));
    store.dispatch(setSubscribingPiano(false));
  });
}

function alertSuccess(email: string) {
  Alert.alert('Sucesso!', 'A sua conta: ' + email + ' foi corretamente associada com a sua subscrição');
}

function alertError() {
  Alert.alert('Erro', 'Ocorreu um erro ao associar o seu email com a sua subscrição, por favor contacte o apoio ao cliente.');
}

export function cleanSubscripitionsConfirmation() {
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
    purchaseUpdateSubscription = null;
  }

  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
    purchaseErrorSubscription = null;
  }
}
function getTermIdFromPurchase(purchase: SubscriptionPurchase) {
  switch (purchase.productId) {
    case 'app_individual_monthly_multiplatform':
      return 'TMJUF6ZO0D1O';
    case 'app_individual_yearly_multiplatform':
      return 'TMMUES5BH7Q2';
    case 'pt.observador.ios.Observador.subscriptions.monthly.multiplatform':
      return 'TM07FOM500X0';
    case 'pt.observador.ios.Observador.subscriptions.yearly.multiplatform':
      return 'TMWCO0BT9XSB';
    default:
      return false;
  }
}
