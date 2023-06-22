package pt.observador.mobile.android;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BroadcastReceiverService extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.v("BroadcastReceiverAction", action);
        Intent intent1 = new Intent();
        intent1.setClassName(context.getPackageName(), MainActivity.class.getName());
        intent1.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent1);
        MainActivity.getInstace().sendEvent("post_widget_click", action);
    }
}
