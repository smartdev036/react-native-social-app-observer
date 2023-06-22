package pt.observador.mobile.android;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;

public class Widget extends AppWidgetProvider {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.v("MyWidgetAction", "Action received = " + action);
        Intent i = new Intent(Intent.ACTION_VIEW);
        if(action != null && !action.equals("android.appwidget.action.APPWIDGET_UPDATE")) {
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            i.setData(Uri.parse(action));
            try {
                context.startActivity(i);
            } catch (ActivityNotFoundException e) {
                Log.e("MyWidget", "Error occurred: " + e.getMessage(), e);
            }
        }
        super.onReceive(context, intent);
    }

    protected PendingIntent getPendingSelfIntent(Context context, String action) {
        Intent intent = new Intent(context, Widget.class);
        intent.setAction(action);
        Log.v("MyWidgetData", action);
        return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
    }

    void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            SharedPreferences sharedPref = context.getSharedPreferences("Data", Context.MODE_PRIVATE);

            String title = sharedPref.getString("title", "{\"text\":'no data'}");
            String date = sharedPref.getString("pubdate", "{\"text\":'no data'}");
            JSONObject titleData = new JSONObject(title);
            JSONObject pubdateData = new JSONObject(date);

            String title1 = sharedPref.getString("title1", "{\"text\":'no data'}");
            String date1 = sharedPref.getString("pubdate1", "{\"text\":'no data'}");
            JSONObject titleData1 = new JSONObject(title1);
            JSONObject pubdateData1 = new JSONObject(date1);

            String title2 = sharedPref.getString("title2", "{\"text\":'no data'}");
            String date2 = sharedPref.getString("pubdate2", "{\"text\":'no data'}");
            JSONObject titleData2 = new JSONObject(title2);
            JSONObject pubdateData2 = new JSONObject(date2);

            String title3 = sharedPref.getString("title3", "{\"text\":'no data'}");
            String date3 = sharedPref.getString("pubdate3", "{\"text\":'no data'}");
            JSONObject titleData3 = new JSONObject(title3);
            JSONObject pubdateData3 = new JSONObject(date3);

            String id = sharedPref.getString("id", "{\"text\":'no data'}");
            JSONObject idData = new JSONObject(id);
            String id1 = sharedPref.getString("id1", "{\"text\":'no data'}");
            JSONObject id1Data = new JSONObject(id1);
            String id2 = sharedPref.getString("id2", "{\"text\":'no data'}");
            JSONObject id2Data = new JSONObject(id2);
            String id3 = sharedPref.getString("id3", "{\"text\":'no data'}");
            JSONObject id3Data = new JSONObject(id3);

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget);

            // Show/Hide if no data
            if(titleData.getString("text").equals("no data")) {
                views.setViewVisibility(R.id.content, View.GONE);
            } else {
                views.setViewVisibility(R.id.content, View.VISIBLE);
                views.setViewVisibility(R.id.info, View.GONE);
                views.setViewVisibility(R.id.infoText, View.GONE);
            }

            // Load the content
            views.setTextViewText(R.id.title, titleData.getString("text"));
            views.setTextViewText(R.id.pubdate, pubdateData.getString("text"));
            views.setTextViewText(R.id.title1, titleData1.getString("text"));
            views.setTextViewText(R.id.pubdate1, pubdateData1.getString("text"));
            views.setTextViewText(R.id.title2, titleData2.getString("text"));
            views.setTextViewText(R.id.pubdate2, pubdateData2.getString("text"));
            views.setTextViewText(R.id.title3, titleData3.getString("text"));
            views.setTextViewText(R.id.pubdate3, pubdateData3.getString("text"));


            Intent intent = new Intent(context, MainActivity.class);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.openApp, pendingIntent);
            String url = "obsapp://observador.pt/";

            try {
                views.setOnClickPendingIntent(R.id.post1, this.getPendingSelfIntent(context, url + idData.getString("text")));
                views.setOnClickPendingIntent(R.id.post2, this.getPendingSelfIntent(context, url + id1Data.getString("text")));
                views.setOnClickPendingIntent(R.id.post3, this.getPendingSelfIntent(context, url + id2Data.getString("text")));
                views.setOnClickPendingIntent(R.id.post4, this.getPendingSelfIntent(context, url + id3Data.getString("text")));
            } catch (Exception e) {
                Log.e("ErrorWidget", e.toString());
            }

            appWidgetManager.updateAppWidget(new ComponentName(context, Widget.class), views);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}
