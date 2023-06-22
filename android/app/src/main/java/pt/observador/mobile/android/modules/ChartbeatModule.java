package pt.observador.mobile.android.modules;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.chartbeat.androidsdk.Tracker;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Callback;
import java.util.Collection;
import com.facebook.react.bridge.ReadableArray;

import org.jetbrains.annotations.NotNull;

public class ChartbeatModule extends ReactContextBaseJavaModule {
    private final Context context;

    public ChartbeatModule(ReactApplicationContext context) {
        super(context);
        this.context = context.getApplicationContext();
    }

    @NotNull
    @Override
    public String getName() {
        return "ChartbeatModule";
    }

    @ReactMethod
    public void setup(Promise promise) {
        Tracker.DEBUG_MODE = true;
        Tracker.setupTracker("55094", "observador.pt", context);
        promise.resolve(String.valueOf("done"));
    }

    @ReactMethod
    public void trackView(String viewId, String viewTitle, Callback callBack) {
        try {
            Tracker.trackView(getReactApplicationContext(), viewId, viewTitle);
            Log.d("CHARTBEAT", "success");
            callBack.invoke(true);
        }  catch(Exception e) {
            Log.e("CHARTBEAT", e.getMessage());
            callBack.invoke(false);
        }
    }

    @ReactMethod
    public void trackCompleteView(String viewId, String viewTitle, ReadableArray authors, ReadableArray categories, String userType, Callback callBack) {
        try {
            Tracker.trackView(getReactApplicationContext(), viewId, viewTitle);

            Collection a = authors.toArrayList();
            Collection c = categories.toArrayList();
            Tracker.setAuthors(a);
            Tracker.setSections(c);

            switch (userType) {
            case "paid":
                Tracker.setUserPaid();
                break;
            case "lgdin":
                Tracker.setUserLoggedIn();
                break;
            default:
                Tracker.setUserAnonymous();
                break;
            }
            Log.d("CHARTBEAT", "success");
            callBack.invoke(true);
        }  catch(Exception e) {
            Log.e("CHARTBEAT", e.getMessage());
            callBack.invoke(false);
        }
    }
}
