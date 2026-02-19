package com.openadhan.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    private static final String PREFS_NAME = "widget_data";

    @PluginMethod
    public void setWidgetData(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("No context available");
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        editor.putString("next_prayer_name", call.getString("nextPrayerName", ""));
        editor.putString("next_prayer_time", call.getString("nextPrayerTime", ""));
        editor.putString("current_time", call.getString("currentTime", ""));
        editor.putString("time_left", call.getString("timeLeft", ""));
        editor.putLong("next_prayer_timestamp", call.getLong("nextPrayerTimestamp", 0L));

        String prayerList = call.getString("prayerList", "[]");
        editor.putString("prayer_list", prayerList);

        editor.apply();

        PrayerWidgetUpdater.updateAllWidgets(context);

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void refreshWidgets(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("No context available");
            return;
        }
        PrayerWidgetUpdater.updateAllWidgets(context);
        call.resolve();
    }
}
