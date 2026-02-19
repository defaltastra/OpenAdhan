package com.openadhan.app;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Surface;
import android.view.WindowManager;
import android.hardware.GeomagneticField;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CompassBridge")
public class CompassBridgePlugin extends Plugin implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private boolean isRunning = false;
    private Float declination = null;

    @Override
    public void load() {
        super.load();
        Context context = getContext();
        if (context != null) {
            sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
            if (sensorManager != null) {
                rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
            }
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (sensorManager == null || rotationSensor == null || isRunning) {
            call.resolve();
            return;
        }
        sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_GAME);
        isRunning = true;
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (sensorManager == null || !isRunning) {
            call.resolve();
            return;
        }
        sensorManager.unregisterListener(this);
        isRunning = false;
        call.resolve();
    }

    @PluginMethod
    public void setLocation(PluginCall call) {
        Double latitude = call.getDouble("latitude");
        Double longitude = call.getDouble("longitude");
        Double altitude = call.getDouble("altitude");

        if (latitude == null || longitude == null) {
            call.resolve();
            return;
        }

        float alt = altitude == null ? 0f : altitude.floatValue();
        GeomagneticField field = new GeomagneticField(
            latitude.floatValue(),
            longitude.floatValue(),
            alt,
            System.currentTimeMillis()
        );
        declination = field.getDeclination();
        call.resolve();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() != Sensor.TYPE_ROTATION_VECTOR) return;

        float[] rotationMatrix = new float[9];
        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);

        float[] remapped = new float[9];
        int axisX = SensorManager.AXIS_X;
        int axisY = SensorManager.AXIS_Y;

        WindowManager windowManager = (WindowManager) getContext().getSystemService(Context.WINDOW_SERVICE);
        if (windowManager != null) {
            int rotation = windowManager.getDefaultDisplay().getRotation();
            if (rotation == Surface.ROTATION_90) {
                axisX = SensorManager.AXIS_Y;
                axisY = SensorManager.AXIS_MINUS_X;
            } else if (rotation == Surface.ROTATION_180) {
                axisX = SensorManager.AXIS_MINUS_X;
                axisY = SensorManager.AXIS_MINUS_Y;
            } else if (rotation == Surface.ROTATION_270) {
                axisX = SensorManager.AXIS_MINUS_Y;
                axisY = SensorManager.AXIS_X;
            }
        }

        SensorManager.remapCoordinateSystem(rotationMatrix, axisX, axisY, remapped);

        float[] orientation = new float[3];
        SensorManager.getOrientation(remapped, orientation);

        float azimuthRad = orientation[0];
        float azimuthDeg = (float) Math.toDegrees(azimuthRad);
        azimuthDeg = (azimuthDeg + 360) % 360;

        if (declination != null) {
            azimuthDeg = (azimuthDeg + declination + 360) % 360;
        }

        JSObject payload = new JSObject();
        payload.put("heading", azimuthDeg);
        notifyListeners("heading", payload);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // No-op
    }
}
