package pt.observador.mobile.android;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONException;

public class SharedStorage extends ReactContextBaseJavaModule {
    ReactApplicationContext context;

    public SharedStorage(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getName() {
        return "SharedStorage";
    }

    @ReactMethod
    public void set(String id, String title, String pubdate, String id1, String title1, String pubdate1, String id2, String title2, String pubdate2, String id3, String title3, String pubdate3 ) throws JSONException {
        SharedPreferences myPrefs = context.getSharedPreferences("Data", Context.MODE_PRIVATE);
        SharedPreferences.Editor prefsEditor;
        prefsEditor = myPrefs.edit();
        prefsEditor.putString("id", id);
        prefsEditor.putString("title", title);
        prefsEditor.putString("pubdate", pubdate);
        prefsEditor.putString("id1", id1);
        prefsEditor.putString("title1", title1);
        prefsEditor.putString("pubdate1", pubdate1);
        prefsEditor.putString("id2", id2);
        prefsEditor.putString("title2", title2);
        prefsEditor.putString("pubdate2", pubdate3);
        prefsEditor.putString("id3", id3);
        prefsEditor.putString("title3", title3);
        prefsEditor.putString("pubdate3", pubdate3);
        prefsEditor.commit();

        Activity currentActivity = getCurrentActivity();
        if (currentActivity != null) {
            Context context = currentActivity.getApplicationContext();
            if(context != null) {
                Intent intent = new Intent(context, Widget.class);
                intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, Widget.class));
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
                context.sendBroadcast(intent);
            }
        }
    }
}
