/**
 * Adhan Player Module
 * Handles playing adhan audio files
 * 
 * For React Native, install:
 * npm install react-native-sound
 * or
 * expo install expo-av
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { getDatabase } from './database';
import { AdhanFile } from './types';

/**
 * Current playing sound instance
 */
let currentSound: Audio.Sound | null = null;

/**
 * Timeout for stopping audio after duration limit
 */
let durationTimeout: NodeJS.Timeout | null = null;

/**
 * Map database row to AdhanFile object
 */
function mapRowToAdhanFile(row: any): AdhanFile {
  return {
    id: row.id,
    name: row.name,
    filename: row.filename,
    path: row.path,
    duration: row.duration,
    createdAt: row.created_at,
  };
}

/**
 * Initialize audio mode for the app
 */
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.error('Failed to initialize audio mode:', error);
  }
}

/**
 * Get all available adhan files
 */
export async function getAdhanFiles(): Promise<AdhanFile[]> {
  const db = await getDatabase();
  
  const rows = await db.getAllAsync('SELECT * FROM adhan_files ORDER BY name');
  
  return rows.map(mapRowToAdhanFile);
}

/**
 * Get adhan file by filename
 */
export async function getAdhanFileByFilename(filename: string): Promise<AdhanFile | null> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync(
    'SELECT * FROM adhan_files WHERE filename = ?',
    [filename]
  );

  if (!row) return null;
  
  return mapRowToAdhanFile(row);
}

/**
 * Get adhan file by ID
 */
export async function getAdhanFileById(id: number): Promise<AdhanFile | null> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync(
    'SELECT * FROM adhan_files WHERE id = ?',
    [id]
  );

  if (!row) return null;
  
  return mapRowToAdhanFile(row);
}

/**
 * Add a new adhan file to the database
 */
export async function addAdhanFile(adhanFile: Omit<AdhanFile, 'id' | 'createdAt'>): Promise<AdhanFile> {
  const db = await getDatabase();

  const result = await db.runAsync(
    'INSERT INTO adhan_files (name, filename, path, duration) VALUES (?, ?, ?, ?)',
    [adhanFile.name, adhanFile.filename, adhanFile.path, adhanFile.duration || null]
  );

  const newAdhan = await getAdhanFileById(result.lastInsertRowId);
  
  if (!newAdhan) {
    throw new Error('Failed to retrieve saved adhan file');
  }

  return newAdhan;
}

/**
 * Play adhan by filename
 * @param filename - The filename of the adhan to play
 * @param durationLimitSeconds - Optional duration limit in seconds (e.g., 5 for sample)
 */
export async function playAdhanByFilename(filename: string, durationLimitSeconds?: number): Promise<void> {
  console.log(`[Adhan] Attempting to play: ${filename}`);
  const adhanFile = await getAdhanFileByFilename(filename);
  
  if (!adhanFile) {
    const err = `Adhan file not found: ${filename}`;
    console.error(`[Adhan] ${err}`);
    throw new Error(err);
  }

  console.log(`[Adhan] Found adhan file:`, adhanFile);
  await playAdhan(adhanFile, durationLimitSeconds);
}

/**
 * Play adhan from AdhanFile object
 * @param adhanFile - The adhan file to play
 * @param durationLimitSeconds - Optional duration limit in seconds (e.g., 5 for sample)
 */
export async function playAdhan(adhanFile: AdhanFile, durationLimitSeconds?: number): Promise<void> {
  try {
    console.log(`[Adhan] Starting playback for: ${adhanFile.name}`);
    // Stop any currently playing sound
    await stopAdhan();

    // Initialize audio if not already done
    await initializeAudio();

    // Create and load new sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: adhanFile.path },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    currentSound = sound;
    
    // Set up duration limit if specified
    if (durationLimitSeconds && durationLimitSeconds > 0) {
      console.log(`[Adhan] Setting duration limit: ${durationLimitSeconds}s`);
      durationTimeout = setTimeout(async () => {
        console.log(`[Adhan] Duration limit reached, stopping playback`);
        await stopAdhan();
      }, durationLimitSeconds * 1000);
    }
    
    console.log(`[Adhan] ✓ Playing: ${adhanFile.name}${durationLimitSeconds ? ` (${durationLimitSeconds}s)` : ' (full)'}`);
  } catch (error) {
    console.error(`[Adhan] Fatal error:`, error);
    console.error(`[Adhan] Adhan file:`, adhanFile);
    throw error;
  }
}

/**
 * Play adhan from local asset
 * For bundled assets in React Native
 * @param assetSource - The asset source
 * @param name - The name of the adhan
 * @param durationLimitSeconds - Optional duration limit in seconds (e.g., 5 for sample)
 */
export async function playAdhanFromAsset(assetSource: any, name: string = 'Adhan', durationLimitSeconds?: number): Promise<void> {
  try {
    console.log(`[Adhan] Playing from asset: ${name}`);
    await stopAdhan();
    await initializeAudio();

    const { sound } = await Audio.Sound.createAsync(
      assetSource,
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    currentSound = sound;
    
    // Set up duration limit if specified
    if (durationLimitSeconds && durationLimitSeconds > 0) {
      console.log(`[Adhan] Setting duration limit: ${durationLimitSeconds}s`);
      durationTimeout = setTimeout(async () => {
        console.log(`[Adhan] Duration limit reached, stopping playback`);
        await stopAdhan();
      }, durationLimitSeconds * 1000);
    }
    
    console.log(`[Adhan] ✓ Playing: ${name}${durationLimitSeconds ? ` (${durationLimitSeconds}s)` : ' (full)'}`);
  } catch (error) {
    console.error('[Adhan] Error playing from asset:', error);
    throw error;
  }
}

/**
 * Stop currently playing adhan
 */
export async function stopAdhan(): Promise<void> {
  // Clear any pending duration timeout
  if (durationTimeout) {
    clearTimeout(durationTimeout);
    durationTimeout = null;
  }
  
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
      console.log('Adhan stopped');
    } catch (error) {
      console.error('Error stopping adhan:', error);
    }
  }
}

/**
 * Pause currently playing adhan
 */
export async function pauseAdhan(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.pauseAsync();
      console.log('Adhan paused');
    } catch (error) {
      console.error('Error pausing adhan:', error);
    }
  }
}

/**
 * Resume paused adhan
 */
export async function resumeAdhan(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.playAsync();
      console.log('Adhan resumed');
    } catch (error) {
      console.error('Error resuming adhan:', error);
    }
  }
}

/**
 * Set volume for adhan playback
 */
export async function setAdhanVolume(volume: number): Promise<void> {
  if (currentSound) {
    try {
      // Volume should be between 0.0 and 1.0
      const normalizedVolume = Math.max(0, Math.min(1, volume));
      await currentSound.setVolumeAsync(normalizedVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }
}

/**
 * Get current playback status
 */
export async function getPlaybackStatus(): Promise<AVPlaybackStatus | null> {
  if (currentSound) {
    try {
      return await currentSound.getStatusAsync();
    } catch (error) {
      console.error('Error getting playback status:', error);
      return null;
    }
  }
  return null;
}

/**
 * Check if adhan is currently playing
 */
export async function isAdhanPlaying(): Promise<boolean> {
  const status = await getPlaybackStatus();
  return status !== null && status.isLoaded && status.isPlaying;
}

/**
 * Playback status update callback
 */
function onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
  if (status.isLoaded) {
    if (status.didJustFinish) {
      console.log('Adhan playback finished');
      // Clean up after playback finishes
      stopAdhan();
    }
    
    if (status.isPlaying) {
      // You can track playback progress here if needed
      // console.log(`Position: ${status.positionMillis}ms / ${status.durationMillis}ms`);
    }
  } else if (status.error) {
    console.error('Playback error:', status.error);
  }
}

/**
 * Clean up audio resources
 */
export async function cleanupAudio(): Promise<void> {
  await stopAdhan();
}

/**
 * Delete an adhan file from the database
 */
export async function deleteAdhanFile(id: number): Promise<void> {
  const db = await getDatabase();
  
  const adhan = await getAdhanFileById(id);
  
  if (!adhan) {
    throw new Error(`Adhan file with id ${id} not found`);
  }

  await db.runAsync('DELETE FROM adhan_files WHERE id = ?', [id]);
}
