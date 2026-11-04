import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
} from 'lucide-react';
import { usePlaylist } from '../context/PlaylistContext';
import { truncateText } from '../utils';

/**
 * Chuyển đổi giây thành chuỗi hiển thị mm:ss
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    togglePlay,
    setCurrentTime,
    setVolume,
    toggleMute,
    playNext,
    playPrev,
    isFavorite,
    toggleFavorite,
  } = usePlaylist();

  if (!currentTrack) return null;

  const totalDuration = currentTrack.durationSeconds || 180;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));
  const isFav = isFavorite(currentTrack.id);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const targetSecond = Number(e.target.value);
    setCurrentTime(targetSecond);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value);
    setVolume(val);
  };

  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <section
      role="region"
      aria-label="Trình phát nhạc cố định"
      className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/30 px-4 py-3 sm:py-3.5 shadow-2xl shadow-black text-slate-100 animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* 1. Track Info (Cover, Title, Artist, Favorite) */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0 justify-between md:justify-start">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/80 shadow-md">
              <img
                src={currentTrack.coverUrl}
                alt={`Ảnh bìa bài hát ${currentTrack.title}`}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <Link
                to={`/item/${currentTrack.id}`}
                title={currentTrack.title}
                className="text-sm font-bold text-white hover:text-emerald-400 transition-colors truncate block focus:outline-none focus:underline"
              >
                {truncateText(currentTrack.title, 22)}
              </Link>
              <p className="text-xs text-slate-400 truncate" title={currentTrack.artist}>
                {currentTrack.artist}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(currentTrack.id)}
            aria-label={
              isFav
                ? `Bỏ bài hát ${currentTrack.title} khỏi danh sách yêu thích`
                : `Thêm bài hát ${currentTrack.title} vào danh sách yêu thích`
            }
            className={`p-2 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 shrink-0 ${
              isFav
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* 2. Central Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center w-full md:w-2/4 max-w-xl space-y-1.5">
          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={playPrev}
              aria-label="Phát bài hát trước đó"
              className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-full p-1.5"
            >
              <SkipBack className="w-5 h-5 fill-current" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => togglePlay()}
              aria-label={isPlaying ? 'Tạm dừng bài hát' : 'Tiếp tục phát bài hát'}
              className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={playNext}
              aria-label="Phát bài hát kế tiếp"
              className="text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-full p-1.5"
            >
              <SkipForward className="w-5 h-5 fill-current" aria-hidden="true" />
            </button>
          </div>

          {/* Time & Progress Scrubber */}
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 group flex items-center">
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Thanh trượt thời lượng bài hát"
                aria-valuemin={0}
                aria-valuemax={totalDuration}
                aria-valuenow={currentTime}
                aria-valuetext={`${formatTime(currentTime)} trên ${formatTime(totalDuration)}`}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                style={{
                  background: `linear-gradient(to right, #059669 0%, #059669 ${progressPercent}%, #334155 ${progressPercent}%, #334155 100%)`,
                }}
              />
            </div>

            <span className="text-xs font-mono text-slate-400 w-10">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* 3. Volume & Mode Actions */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt tiếng âm thanh'}
              className="text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded p-0.5"
            >
              {isMuted || effectiveVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" aria-hidden="true" />
              ) : effectiveVolume < 50 ? (
                <Volume1 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              value={effectiveVolume}
              onChange={handleVolumeChange}
              aria-label="Thanh điều chỉnh mức âm lượng"
              className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              style={{
                background: `linear-gradient(to right, #059669 0%, #059669 ${effectiveVolume}%, #334155 ${effectiveVolume}%, #334155 100%)`,
              }}
            />

            <span className="text-xs font-mono text-slate-400 w-8 text-right">
              {effectiveVolume}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
