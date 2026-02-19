package com.openadhan.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;

public final class PrayerWidgetUpdater {
    private static final String PREFS_NAME = "widget_data";
    private static final long UPDATE_INTERVAL_MS = 15 * 60 * 1000L;
    private static final int[] PRAYER_NAME_IDS = {
        R.id.widget_prayer_name_1,
        R.id.widget_prayer_name_2,
        R.id.widget_prayer_name_3,
        R.id.widget_prayer_name_4,
        R.id.widget_prayer_name_5,
    };
    private static final int[] PRAYER_TIME_IDS = {
        R.id.widget_prayer_time_1,
        R.id.widget_prayer_time_2,
        R.id.widget_prayer_time_3,
        R.id.widget_prayer_time_4,
        R.id.widget_prayer_time_5,
    };
    private static final int[] PRAYER_ROW_IDS = {
        R.id.widget_row_1,
        R.id.widget_row_2,
        R.id.widget_row_3,
        R.id.widget_row_4,
        R.id.widget_row_5,
    };

    private PrayerWidgetUpdater() {}

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        updateWidgetsForProvider(context, manager, PrayerWidgetSmallProvider.class, R.layout.widget_prayer_small);
        updateWidgetsForProvider(context, manager, PrayerWidgetLargeProvider.class, R.layout.widget_prayer_large);
        scheduleUpdates(context);
    }

    private static void updateWidgetsForProvider(
        Context context,
        AppWidgetManager manager,
        Class<?> providerClass,
        int layoutId
    ) {
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, providerClass));
        for (int appWidgetId : ids) {
            try {
                RemoteViews views = new RemoteViews(context.getPackageName(), layoutId);
                bindWidgetData(context, views, layoutId);

                Intent launchIntent = new Intent(context, MainActivity.class);
                PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    launchIntent,
                    pendingFlags()
                );
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

                manager.updateAppWidget(appWidgetId, views);
            } catch (Exception ignored) {
            }
        }
    }

    private static void bindWidgetData(Context context, RemoteViews views, int layoutId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String nextPrayerName = prefs.getString("next_prayer_name", "--");
        String nextPrayerTime = prefs.getString("next_prayer_time", "--");
        String currentTime = prefs.getString("current_time", "--");
        long nextPrayerTimestamp = prefs.getLong("next_prayer_timestamp", 0L);

        String timeLeft = computeTimeLeft(nextPrayerTimestamp);
        if (timeLeft.isEmpty()) {
            timeLeft = prefs.getString("time_left", "--");
        }

        views.setTextViewText(R.id.widget_next_prayer, nextPrayerName);
        views.setTextViewText(R.id.widget_next_time, nextPrayerTime);
        views.setTextViewText(R.id.widget_time_left, timeLeft);
        views.setTextViewText(R.id.widget_current_time, currentTime);

        if (layoutId == R.layout.widget_prayer_large) {
            String prayerList = prefs.getString("prayer_list", "[]");
            applyPrayerList(views, prayerList, nextPrayerName);
        }
    }

    private static void applyPrayerList(RemoteViews views, String prayerList, String nextPrayerName) {
        try {
            JSONArray array = new JSONArray(prayerList);
            for (int i = 0; i < 5; i++) {
                int nameId = PRAYER_NAME_IDS[i];
                int timeId = PRAYER_TIME_IDS[i];
                int rowId = PRAYER_ROW_IDS[i];

                if (i < array.length()) {
                    JSONObject item = array.getJSONObject(i);
                    String name = item.optString("name", "--");
                    String time = item.optString("time", "--");
                    boolean completed = item.optBoolean("completed", false);

                    views.setTextViewText(nameId, name);
                    views.setTextViewText(timeId, time);

                    if (name.equalsIgnoreCase(nextPrayerName)) {
                        views.setInt(rowId, "setBackgroundResource", R.drawable.widget_row_active);
                    } else {
                        views.setInt(rowId, "setBackgroundResource", 0);
                    }

                    int nameColor = completed ? 0x88F7F0E9 : 0xFFF7F0E9;
                    int timeColor = completed ? 0x77D8C8BC : 0xFFD8C8BC;
                    views.setTextColor(nameId, nameColor);
                    views.setTextColor(timeId, timeColor);
                } else {
                    views.setTextViewText(nameId, "--");
                    views.setTextViewText(timeId, "--");
                    views.setInt(rowId, "setBackgroundResource", 0);
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static String computeTimeLeft(long nextPrayerTimestamp) {
        if (nextPrayerTimestamp <= 0L) return "";
        long diffMs = nextPrayerTimestamp - System.currentTimeMillis();
        if (diffMs < 0) diffMs = 0;
        long totalMinutes = diffMs / 60000L;
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;

        if (hours > 0) {
            return String.format(Locale.getDefault(), "%dh %dm", hours, minutes);
        }
        return String.format(Locale.getDefault(), "%dm", minutes);
    }

    private static void scheduleUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, PrayerWidgetUpdateReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            42,
            intent,
            pendingFlags()
        );

        long first = System.currentTimeMillis() + UPDATE_INTERVAL_MS;
        alarmManager.setInexactRepeating(
            AlarmManager.RTC,
            first,
            UPDATE_INTERVAL_MS,
            pendingIntent
        );
    }

    private static int pendingFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.FLAG_UPDATE_CURRENT;
    }
}
