/**
 * Browser-compatible Audio Player using Web Audio API
 */

import { getDatabase, getAllFromStore, getByIdFromStore, addToStore, deleteFromStore } from './database.web';
import { AdhanFile } from './types';

let currentAudio: HTMLAudioElement | null = null;
let durationTimeout: NodeJS.Timeout | null = null;

/**
 * Initialize audio (no-op for web)
 */
export async function initializeAudio(): Promise<void> {
  // Web audio works out of the box
}

/**
 * Get all adhan files
 */
export async function getAdhanFiles(): Promise<AdhanFile[]> {
  const files = await getAllFromStore<any>('adhan_files');
  return files.map(mapRowToAdhanFile);
}

/**
 * Get adhan file by filename
 */
export async function getAdhanFileByFilename(filename: string): Promise<AdhanFile | null> {
  const files = await getAdhanFiles();
  return files.find(f => f.filename === filename) || null;
}

/**
 * Get adhan file by ID
 */
export async function getAdhanFileById(id: number): Promise<AdhanFile | null> {
  const file = await getByIdFromStore<any>('adhan_files', id);
  return file ? mapRowToAdhanFile(file) : null;
}

/**
 * Add adhan file
 */
export async function addAdhanFile(adhanFile: Omit<AdhanFile, 'id' | 'createdAt'>): Promise<AdhanFile> {
  const id = await addToStore('adhan_files', {
    ...adhanFile,
    created_at: new Date().toISOString(),
  });
  
  const newFile = await getAdhanFileById(id);
  if (!newFile) throw new Error('Failed to retrieve saved adhan file');
  return newFile;
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
 * Play adhan
 * @param adhanFile - The adhan file to play
 * @param durationLimitSeconds - Optional duration limit in seconds (e.g., 5 for sample)
 */
export async function playAdhan(adhanFile: AdhanFile, durationLimitSeconds?: number): Promise<void> {
  try {
    console.log(`[Adhan] Starting playback for: ${adhanFile.name}`);
    await stopAdhan();
    
    currentAudio = new Audio();
    
    // Convert relative paths to absolute URLs
    let audioUrl = adhanFile.path;
    if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('blob:')) {
      // For relative paths, construct absolute URL
      if (audioUrl.startsWith('/')) {
        audioUrl = window.location.origin + audioUrl;
      } else {
        audioUrl = window.location.origin + '/' + audioUrl;
      }
    }
    
    console.log(`[Adhan] Audio URL: ${audioUrl}`);
    
    // Set up error handler BEFORE setting src
    let errorOccurred = false;
    currentAudio.addEventListener('error', (e: Event) => {
      errorOccurred = true;
      const target = e.target as HTMLAudioElement;
      const error = target.error;
      let errorMessage = 'Unknown error';
      
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Playback aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - file not accessible';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Decoding error - file may be corrupted';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
        }
      }
      
      console.error(`[Adhan] Error (${error?.code}): ${errorMessage}`);
      console.error(`[Adhan] Tried to load: ${audioUrl}`);
    }, { once: true });
    
    // Wait for the audio to load
    await new Promise<void>((resolve, reject) => {
      if (!currentAudio) return reject(new Error('Audio element not created'));
      
      const timeoutId = setTimeout(() => {
        console.error(`[Adhan] Load timeout - file may not exist or is not accessible`);
        reject(new Error('Audio load timeout'));
      }, 5000);
      
      currentAudio!.addEventListener('canplaythrough', () => {
        clearTimeout(timeoutId);
        console.log(`[Adhan] Audio loaded successfully`);
        resolve();
      }, { once: true });
      
      currentAudio!.addEventListener('loadeddata', () => {
        console.log(`[Adhan] Data loaded, playing...`);
      }, { once: true });
      
      // Set the source after listeners are attached
      console.log(`[Adhan] Setting audio source...`);
      currentAudio!.src = audioUrl;
      currentAudio!.load();
    });
    
    // Now play the audio
    console.log(`[Adhan] Calling play()...`);
    const playPromise = currentAudio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log(`[Adhan] Playback started successfully`))
        .catch((error) => console.error(`[Adhan] Play promise rejected:`, error));
    }
    
    // Set up duration limit if specified
    if (durationLimitSeconds && durationLimitSeconds > 0) {
      durationTimeout = setTimeout(async () => {
        console.log(`[Adhan] Duration limit reached, stopping playback`);
        await stopAdhan();
      }, durationLimitSeconds * 1000);
    }
    
    console.log(`[Adhan] ✓ Playing: ${adhanFile.name}${durationLimitSeconds ? ` (${durationLimitSeconds}s)` : ' (full)'}`);
  } catch (error) {
    console.error('[Adhan] Fatal error:', error);
    console.error('[Adhan] Adhan file:', adhanFile);
    throw error;
  }
}

/**
 * Play from asset (same as playAdhan for web)
 * @param assetSource - The asset source
 * @param name - The name of the adhan
 * @param durationLimitSeconds - Optional duration limit in seconds (e.g., 5 for sample)
 */
export async function playAdhanFromAsset(assetSource: string, name: string = 'Adhan', durationLimitSeconds?: number): Promise<void> {
  try {
    await stopAdhan();
    
    currentAudio = new Audio();
    
    // Wait for the audio to load
    await new Promise<void>((resolve, reject) => {
      if (!currentAudio) return reject(new Error('Audio element not created'));
      
      currentAudio.addEventListener('error', (e: Event) => {
        const target = e.target as HTMLAudioElement;
        const error = target.error;
        console.error('Audio loading error for:', assetSource);
        console.error('Error code:', error?.code);
        reject(new Error(`Failed to load audio: ${assetSource}`));
      });
      
      currentAudio.addEventListener('canplaythrough', () => {
        resolve();
      }, { once: true });
      
      currentAudio.src = assetSource;
      currentAudio.load();
    });
    
    await currentAudio.play();
    
    // Set up duration limit if specified
    if (durationLimitSeconds && durationLimitSeconds > 0) {
      durationTimeout = setTimeout(async () => {
        await stopAdhan();
      }, durationLimitSeconds * 1000);
    }
    
    console.log(`Playing adhan from asset: ${assetSource}${durationLimitSeconds ? ` (limited to ${durationLimitSeconds}s)` : ''}`);
  } catch (error) {
    console.error('Error playing adhan:', error);
    throw error;
  }
}

/**
 * Stop adhan
 */
export async function stopAdhan(): Promise<void> {
  // Clear any pending duration timeout
  if (durationTimeout) {
    clearTimeout(durationTimeout);
    durationTimeout = null;
  }
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Pause adhan
 */
export async function pauseAdhan(): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
  }
}

/**
 * Resume adhan
 */
export async function resumeAdhan(): Promise<void> {
  if (currentAudio) {
    currentAudio.play();
  }
}

/**
 * Set volume
 */
export async function setAdhanVolume(volume: number): Promise<void> {
  if (currentAudio) {
    currentAudio.volume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Get playback status
 */
export async function getPlaybackStatus(): Promise<any> {
  if (!currentAudio) return null;
  
  return {
    isLoaded: true,
    isPlaying: !currentAudio.paused,
    positionMillis: currentAudio.currentTime * 1000,
    durationMillis: currentAudio.duration * 1000,
  };
}

/**
 * Check if playing
 */
export async function isAdhanPlaying(): Promise<boolean> {
  return currentAudio !== null && !currentAudio.paused;
}

/**
 * Cleanup
 */
export async function cleanupAudio(): Promise<void> {
  await stopAdhan();
}

/**
 * Delete adhan file
 */
export async function deleteAdhanFile(id: number): Promise<void> {
  await deleteFromStore('adhan_files', id);
}

/**
 * Map row to AdhanFile
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
