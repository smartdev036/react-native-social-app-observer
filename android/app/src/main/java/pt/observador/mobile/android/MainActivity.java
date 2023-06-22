package pt.observador.mobile.android;
import expo.modules.ReactActivityDelegateWrapper;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.Nullable;

import android.content.res.Configuration;
import android.content.pm.ActivityInfo;


public class MainActivity extends ReactActivity {
  private static MainActivity mainActivity;
  BroadcastReceiverService broadcastReceiverService = new BroadcastReceiverService();


  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Observador";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, new MainActivityDelegate(this, getMainComponentName()));
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);

     // Obtém as informações sobre a configuração do dispositivo
     Configuration config = getResources().getConfiguration();

     // Verifica se é um tablet (tamanho xlarge) ou não
     boolean isTablet = (config.screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK) == Configuration.SCREENLAYOUT_SIZE_XLARGE;

     // Se for um tablet, permite todas as orientações
     if (isTablet) {
       setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR);
     } else {
       // Se for um telefone, restringe a orientação a retrato
       setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
     }
  }

  @Override
  protected void onStart() {
    super.onStart();
    IntentFilter filter = new IntentFilter("android.widget.onclick");
    registerReceiver(broadcastReceiverService, filter);
    mainActivity = this;

  }

  public static MainActivity  getInstace(){
    return mainActivity;
  }

  public void sendEvent(String eventName, String data) {
    WritableMap params = Arguments.createMap();
    params.putString("data", data);
    getReactNativeHost().getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }
}
