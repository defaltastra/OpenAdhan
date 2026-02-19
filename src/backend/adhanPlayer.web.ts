/**
 * Browser-compatible Audio Player using Web Audio API
 */

import { getDatabase, getAllFromStore, getByIdFromStore, addToStore, deleteFromStore } from './database.web';
import { AdhanFile } from './types';

let currentAudio: HTMLAudioElement | null = null;

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
 */
export async function playAdhanByFilename(filename: string): Promise<void> {
  const adhanFile = await getAdhanFileByFilename(filename);
  if (!adhanFile) {
    throw new Error(`Adhan file not found: ${filename}`);
  }
  await playAdhan(adhanFile);
}

/**
 * Play adhan
 */
export async function playAdhan(adhanFile: AdhanFile): Promise<void> {
  try {
    await stopAdhan();
    
    currentAudio = new Audio();
    
    // Wait for the audio to load
    await new Promise<void>((resolve, reject) => {
      if (!currentAudio) return reject(new Error('Audio element not created'));
      
      currentAudio.addEventListener('error', (e: Event) => {
        const target = e.target as HTMLAudioElement;
        const error = target.error;
        let errorMessage = 'Unknown error';
        
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Playback aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Decoding error';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio format not supported or file not found';
              break;
          }
        }
        
        console.error('Audio error:', errorMessage);
        console.error('Failed to load:', adhanFile.path);
        console.error('Error code:', error?.code);
        reject(new Error(`${errorMessage}: ${adhanFile.path}`));
      });
      
      currentAudio.addEventListener('canplaythrough', () => {
        resolve();
      }, { once: true });
      
      // Set the source after listeners are attached
      currentAudio.src = adhanFile.path;
      currentAudio.load();
    });
    
    // Now play the audio
    await currentAudio.play();
    
    console.log(`Playing adhan: ${adhanFile.name} from ${adhanFile.path}`);
  } catch (error) {
    console.error('Error playing adhan:', error);
    console.error('Path:', adhanFile.path);
    throw error;
  }
}

/**
 * Play from asset (same as playAdhan for web)
 */
export async function playAdhanFromAsset(assetSource: string, name: string = 'Adhan'): Promise<void> {
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
    console.log(`Playing adhan from asset: ${assetSource}`);
  } catch (error) {
    console.error('Error playing adhan:', error);
    throw error;
  }
}

/**
 * Stop adhan
 */
export async function stopAdhan(): Promise<void> {
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
