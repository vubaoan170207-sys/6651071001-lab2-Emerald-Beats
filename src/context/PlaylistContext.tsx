import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track } from '../types';
import tracksData from '../data/data.json';

interface PlaylistContextType {
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  selectedTrack: Track | null;
  openModal: (track: Track) => void;
  closeModal: () => void;
  activeTab: 'all' | 'favorites';
  setActiveTab: (tab: 'all' | 'favorites') => void;

  // Audio Player State
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  playingTrackId: string | null; // Compatibility
  playTrack: (track: Track) => void;
  togglePlay: (trackId?: string) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrev: () => void;
}

const FAVORITES_STORAGE_KEY = 'playlist_manager_favorites_v1';

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          return parsed as string[];
        }
      }
    } catch {
      // localStorage read error
    }
    return [];
  });

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Audio Player States
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync favorites with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // storage full
    }
  }, [favorites]);

  // Simulated audio playback progress (timer)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && currentTrack) {
      intervalId = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.durationSeconds) {
            // Loop or reset to start
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, currentTrack]);

  const toggleFavorite = (trackId: string): void => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isFavorite = (trackId: string): boolean => {
    return favorites.includes(trackId);
  };

  const openModal = (track: Track): void => {
    setSelectedTrack(track);
  };

  const closeModal = (): void => {
    setSelectedTrack(null);
  };

  const playTrack = (track: Track): void => {
    if (currentTrack?.id === track.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentTrack(track);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const togglePlay = (trackId?: string): void => {
    if (trackId) {
      if (currentTrack?.id === trackId) {
        setIsPlaying((prev) => !prev);
      } else {
        const found = (tracksData as Track[]).find((t) => t.id === trackId);
        if (found) {
          setCurrentTrack(found);
          setCurrentTime(0);
          setIsPlaying(true);
        }
      }
    } else {
      if (currentTrack) {
        setIsPlaying((prev) => !prev);
      } else if ((tracksData as Track[]).length > 0) {
        // play first track by default
        setCurrentTrack(tracksData[0] as Track);
        setCurrentTime(0);
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (): void => {
    setIsMuted((prev) => !prev);
  };

  const playNext = (): void => {
    const list = tracksData as Track[];
    if (!currentTrack || list.length === 0) return;
    const currentIndex = list.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % list.length;
    setCurrentTrack(list[nextIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const playPrev = (): void => {
    const list = tracksData as Track[];
    if (!currentTrack || list.length === 0) return;
    const currentIndex = list.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    setCurrentTrack(list[prevIndex]);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <PlaylistContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        selectedTrack,
        openModal,
        closeModal,
        activeTab,
        setActiveTab,
        currentTrack,
        isPlaying,
        currentTime,
        volume,
        isMuted,
        playingTrackId: isPlaying && currentTrack ? currentTrack.id : null,
        playTrack,
        togglePlay,
        setCurrentTime,
        setVolume,
        toggleMute,
        playNext,
        playPrev,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = (): PlaylistContextType => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};
