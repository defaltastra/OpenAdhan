/**
 * Network Connectivity Monitor
 * Monitors network status and triggers widget refresh when internet is restored
 */

import { Network } from '@capacitor/network';
import { refreshWidgets } from './widgetBridge';
import { Capacitor } from '@capacitor/core';
import { syncPrayerTimesWhenOnline } from './prayerTimesSync';

let isOnline = true;
let listeners: ((isOnline: boolean) => void)[] = [];
let syncTimeout: NodeJS.Timeout | null = null;

/**
 * Initialize network monitoring
 * Call this once when your app starts
 */
export async function initializeNetworkMonitoring(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Use web API for browser
    initializeWebNetworkMonitoring();
    return;
  }

  try {
    // Get initial network status
    const status = await Network.getStatus();
    isOnline = status.connected;

    // Listen for network status changes
    Network.addListener('networkStatusChange', handleNetworkStatusChange);
    
    console.log(`Network monitoring initialized. Current status: ${isOnline ? 'online' : 'offline'}`);
  } catch (error) {
    console.error('Failed to initialize network monitoring:', error);
  }
}

/**
 * Handle network status changes
 */
async function handleNetworkStatusChange(event: any): Promise<void> {
  const wasOnline = isOnline;
  isOnline = event.connected;

  console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);

  // If we just came back online, refresh widgets and sync prayer times
  if (!wasOnline && isOnline) {
    console.log('Internet connection restored. Refreshing widgets and syncing prayer times...');
    try {
      await refreshWidgets();
      console.log('Widgets refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh widgets:', error);
    }
    
    // Sync prayer times with a small delay
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncPrayerTimesWhenOnline().catch(error => 
        console.error('Prayer times sync failed:', error)
      );
    }, 2000);
  }

  // Notify all listeners
  notifyListeners(isOnline);
}

/**
 * Initialize web-based network monitoring using navigator.onLine
 */
function initializeWebNetworkMonitoring(): void {
  isOnline = navigator.onLine;

  window.addEventListener('online', () => {
    const wasOnline = isOnline;
    isOnline = true;
    console.log('Internet connection restored (web)');
    
    if (!wasOnline) {
      try {
        refreshWidgets();
        console.log('Widgets refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh widgets:', error);
      }
      
      // Sync prayer times with a small delay
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncPrayerTimesWhenOnline().catch(error => 
          console.error('Prayer times sync failed:', error)
        );
      }, 2000);
      
      notifyListeners(true);
    }
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    console.log('Lost internet connection (web)');
    notifyListeners(false);
  });

  console.log(`Network monitoring initialized (web). Current status: ${isOnline ? 'online' : 'offline'}`);
}

/**
 * Check if device is currently online
 */
export function isCurrentlyOnline(): boolean {
  return isOnline;
}

/**
 * Subscribe to network status changes
 */
export function onNetworkStatusChange(callback: (isOnline: boolean) => void): () => void {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

/**
 * Notify all listeners of network status change
 */
function notifyListeners(status: boolean): void {
  listeners.forEach(callback => {
    try {
      callback(status);
    } catch (error) {
      console.error('Error in network status listener:', error);
    }
  });
}

/**
 * Cleanup network monitoring
 */
export async function cleanupNetworkMonitoring(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Remove network listener
    const listeners = await Network.removeAllListeners();
    console.log('Network monitoring cleaned up');
  } catch (error) {
    console.error('Error cleaning up network monitoring:', error);
  }
}
