package pt.observador.mobile.android.modules;

import com.gemius.sdk.Config;
import com.gemius.sdk.audience.BaseEvent;
import com.gemius.sdk.audience.AudienceEvent;
import com.gemius.sdk.audience.AudienceConfig;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import org.jetbrains.annotations.NotNull;

public class GemiusModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext context;
    private static final String serverHost = "https://gapt.hit.gemius.pl";
    private static final String scriptIdentifier = "bDs1XZv5FaFvpe2MiPrCt3Z331kBW280Vo6VSxqS.Pj.47";

    public GemiusModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        //Config.setLoggingEnabled(true);
        //Config.setAppInfo("Observadorv4", "1.0");
        AudienceConfig.getSingleton().setHitCollectorHost(serverHost);
        //AudienceConfig.getSingleton().setScriptIdentifier(scriptIdentifier);
    }

    @NotNull
    @Override
    public String getName() {
        return "GemiusModule";
    }

    @ReactMethod
    public void sendEvent(String data,String type) {
        BaseEvent.EventType eventType = BaseEvent.EventType.FULL_PAGEVIEW;
        if (type == "partial") {
            eventType = BaseEvent.EventType.PARTIAL_PAGEVIEW;
        }
        AudienceEvent event = new AudienceEvent(this.context);
        event.setScriptIdentifier(scriptIdentifier);
        event.setEventType(eventType);
        event.addExtraParameter("gA",data);
        event.sendEvent();
    }
}