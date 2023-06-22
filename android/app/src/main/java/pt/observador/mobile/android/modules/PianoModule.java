package pt.observador.mobile.android.modules;

import java.util.Collection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.text.TextUtils;
import android.util.Log;
import androidx.fragment.app.FragmentActivity;
import android.text.TextUtils;

import com.chartbeat.androidsdk.Tracker;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import io.piano.android.composer.Composer;
import io.piano.android.composer.listeners.EventTypeListener;
import io.piano.android.composer.listeners.ShowTemplateListener;
import io.piano.android.composer.listeners.ExperienceExecuteListener;
import io.piano.android.composer.model.ExperienceRequest;
import io.piano.android.composer.model.events.EventType;
import io.piano.android.composer.model.events.ShowTemplate;
import io.piano.android.composer.model.Event;
import io.piano.android.composer.showtemplate.ShowTemplateController;



import com.google.gson.Gson;
import org.jetbrains.annotations.NotNull;

public class PianoModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext context;

    public PianoModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    private void sendEvent(String eventName, WritableMap params) {
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

/*
    @ReactMethod
    public void addListener(String eventName) {
    // Set up any upstream listeners or background tasks as necessary
    }

    @ReactMethod
    public void removeListeners(Integer count) {
    // Remove upstream listeners, stop unnecessary background tasks
    } */

    @NotNull
    @Override
    public String getName() {
        return "PianoModule";
    }

    @NotNull
    @ReactMethod
    public void getModuleName(Callback callBack) {
        callBack.invoke("eventId");
    }

    @ReactMethod
    public void initComposer(Promise promise) {
        Composer.init(this.context,"zK27EIf8Uk", Composer.Endpoint.PRODUCTION);
        promise.resolve("");
    }

    @ReactMethod
    public void seeList(String premium, String date, String mainTopic, String author, Boolean isPremium) {

        List<String> tags = new ArrayList<>();
        tags.add(premium);
        if(isPremium) {
            //FIXME Not sure about how todo this definitly not right, for now we dont show the paywall e this is set
            tags.add("iap_subscription_active");
        }
        ExperienceRequest request = new ExperienceRequest.Builder()
            .tags(tags)
            .debug(true)
            .zone("piano_exp_version_2")
            .contentSection(mainTopic)
            .contentCreated(date)
            .contentAuthor(author)
            .build();

        FragmentActivity activity;
        Collection<EventTypeListener<? extends EventType>> listeners = Arrays.asList(
        (ShowTemplateListener) event -> {
            //Log.d("PIANO","ShowTemplateListener @@@@@@@@@@@@@@@@@@@@@@@" + event.eventData);
            final Map<String, String> map = new HashMap<String, String>();
            WritableMap params = Arguments.createMap();
            params.putString("type", "showTemplate");
            if (TextUtils.isEmpty(event.eventData.containerSelector)) {
                return;
            }
            params.putString("container", event.eventData.containerSelector);
            if (!TextUtils.isEmpty(event.eventData.url)) {
                params.putString("url", event.eventData.url);
            }

            sendEvent("pianoEvent", params);
        },
        (ExperienceExecuteListener) event-> {
            //Log.d("PIANO","ExperienceExecuteListener" + event);
            WritableMap params = Arguments.createMap();
            params.putString("type", "ExperienceExecuted");
            sendEvent("pianoEvent", params);
        });

        Composer.getInstance().userToken("").getExperience(request, listeners, exception -> {
            //Log.d("PIANO","DEU MERDA @@@@@@@@@@@@@@@@@@@@@@@");
            WritableMap params = Arguments.createMap();
            params.putString("type", "error");
            params.putString("message", "error");
            sendEvent("pianoEvent", params);
        });
    }

}
