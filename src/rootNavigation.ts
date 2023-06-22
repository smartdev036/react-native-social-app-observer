import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigationRefPromise = new Promise<void>(resolve => {
  let id = setInterval(() => {
    if (navigationRef.isReady()) {
      clearInterval(id);
      resolve();
    }
  }, 100);
});

export function navigate(name: string, params: any) {
  navigationRefPromise.then(() => {
    console.log('Navigate from external');
    navigationRef.navigate(name, params);
  });
}

export function getRoutName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
}
