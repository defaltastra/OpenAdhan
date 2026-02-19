package com.openadhan.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PrayerWidgetUpdateReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PrayerWidgetUpdater.updateAllWidgets(context);
    }
}
