import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Play,
  Pause,
  Heart,
  Clock,
  Disc3,
  Music2,
  FileText,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';
import { Track } from '../types';
import { formatCurrency } from '../utils';
import { usePlaylist } from '../context/PlaylistContext';

interface TrackModalProps {
  track: Track | null;
  onClose: () => void;
}

export const TrackModal: React.FC<TrackModalProps> = ({ track, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const { isFavorite, toggleFavorite, playingTrackId, togglePlay } = usePlaylist();

  const [activeTab, setActiveTab] = useState<'info' | 'lyrics'>('info');
  const [copied, setCopied] = useState<boolean>(false);

  const isFav = track ? isFavorite(track.id) : false;
  const isPlaying = track ? playingTrackId === track.id : false;

  // ESC key and Focus trap management
  useEffect(() => {
    if (!track) return;

    setActiveTab('info');
    setCopied(false);

    // Save previous active element to restore focus upon closing
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusableElements = modalElement.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      // 1. ESC Key Close
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // 2. Focus Trap on Tab
      if (e.key === 'Tab') {
        const currentFocusables = modalElement.querySelectorAll<HTMLElement>(focusableSelector);
        if (currentFocusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = currentFocusables[0];
        const lastElement = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [track, onClose]);

  if (!track) return null;

  const displayLyrics =
    track.lyrics ||
    track.lyricsExcerpt ||
    'Lời bài hát đang được cập nhật cho tác phẩm này.';

  const handleCopyLyrics = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(displayLyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access error
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      {/* Modal Dialog Content Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-track-title"
        aria-describedby="modal-track-desc"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ chi tiết bài hát"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="overflow-y-auto pr-1 space-y-6">
          {/* Header Track Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 bg-slate-950 border border-slate-700 shadow-md">
              <img
                src={track.coverUrl}
                alt={`Ảnh bìa bài hát ${track.title} của nghệ sĩ ${track.artist}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => togglePlay(track.id)}
                aria-label={isPlaying ? `Tạm dừng ${track.title}` : `Phát ${track.title}`}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  {track.genre}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  {track.releaseDate}
                </span>
              </div>

              <h2
                id="modal-track-title"
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              >
                {track.title}
              </h2>

              <p className="text-base font-medium text-emerald-400">
                {track.artist}
              </p>

              <div className="text-sm text-slate-400 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1">
                  <Disc3 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  {track.album}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  {track.duration}
                </span>
              </div>

              {/* Price & Plays */}
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <span className="text-xs text-slate-400 block">Bản quyền số</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {formatCurrency(track.price)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Lượt nghe</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {track.plays.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Thông tin vs Lời bài hát (Lyrics) */}
          <div className="flex items-center border-b border-slate-800 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Mô tả & Thông tin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'lyrics'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music2 className="w-4 h-4" aria-hidden="true" />
              <span>Lời bài hát (Lyrics)</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Mô tả bài hát
                </h3>
                <p
                  id="modal-track-desc"
                  className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
                >
                  {track.description}
                </p>
              </div>

              {track.lyricsExcerpt && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Music2 className="w-4 h-4" aria-hidden="true" />
                    Trích dẫn lời bài hát
                  </h3>
                  <blockquote className="italic text-sm text-slate-300 pl-4 border-l-2 border-emerald-500 py-2 bg-slate-800/30 rounded-r-lg">
                    &ldquo;{track.lyricsExcerpt}&rdquo;
                  </blockquote>
                </div>
              )}
            </div>
          ) : (
            /* Dedicated Lyrics Section */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Music2 className="w-4 h-4" aria-hidden="true" />
                  Lời bài hát chính thức
                </h3>
                <button
                  type="button"
                  onClick={handleCopyLyrics}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Sao chép lời</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 max-h-64 overflow-y-auto font-sans leading-relaxed text-sm text-slate-200 whitespace-pre-line shadow-inner">
                {displayLyrics}
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Favorite Toggle */}
              <button
                type="button"
                onClick={() => toggleFavorite(track.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isFav
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
                  aria-hidden="true"
                />
                <span>{isFav ? 'Đã yêu thích' : 'Yêu thích'}</span>
              </button>

              {/* Play preview toggle */}
              <button
                type="button"
                onClick={() => togglePlay(track.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Nghe thử</span>
                  </>
                )}
              </button>
            </div>

            {/* Go to full detail page */}
            <Link
              to={`/item/${track.id}`}
              onClick={onClose}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg px-2 py-1"
            >
              Xem trang chi tiết đầy đủ &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
