package pt.observador.mobile.android;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import pt.observador.mobile.android.modules.ChartbeatModule;
import pt.observador.mobile.android.modules.PianoModule;
import pt.observador.mobile.android.modules.GemiusModule;

public class MyAppPackage implements ReactPackage {
    @NotNull
    @Override
    public List<NativeModule> createNativeModules(@NotNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ChartbeatModule(reactContext));
        modules.add(new PianoModule(reactContext));
        modules.add(new GemiusModule(reactContext));
        modules.add(new SharedStorage(reactContext));
        return modules;
    }

    @NotNull
    @Override
    public List<ViewManager> createViewManagers(@NotNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
