import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import tracksData from '../data/data.json';
import { Track } from '../types';
import { formatCurrency } from '../utils';
import { usePlaylist } from '../context/PlaylistContext';
import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  Clock,
  Disc3,
  Calendar,
  Headphones,
  Music2,
  Sparkles,
} from 'lucide-react';

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isFavorite, toggleFavorite, playingTrackId, togglePlay } = usePlaylist();

  const track = useMemo(() => {
    return (tracksData as Track[]).find((t) => t.id === id);
  }, [id]);

  const relatedTracks = useMemo(() => {
    if (!track) return [];
    return (tracksData as Track[])
      .filter((t) => t.id !== track.id && (t.genre === track.genre || t.artist === track.artist))
      .slice(0, 4);
  }, [track]);

  if (!track) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Music2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">Không tìm thấy bài hát</h2>
          <p className="text-sm text-slate-400">
            Bài hát bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-950/40"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Quay về trang danh sách</span>
          </Link>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(track.id);
  const isPlaying = playingTrackId === track.id;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Quay lại danh sách bài hát"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors focus:outline-none focus:underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Quay lại danh sách</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite(track.id)}
              aria-label={
                isFav
                  ? `Xóa bài hát ${track.title} khỏi mục yêu thích`
                  : `Thêm bài hát ${track.title} vào mục yêu thích`
              }
              className={`p-2 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isFav
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Track Detail Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-emerald-950/40 border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Big Album Cover */}
            <div className="relative group w-56 h-56 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shrink-0 shadow-2xl shadow-black/60 ring-2 ring-emerald-500/20 bg-slate-950">
              <img
                src={track.coverUrl}
                alt={`Ảnh bìa album chính thức của bài hát ${track.title} của ca sĩ ${track.artist}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                type="button"
                onClick={() => togglePlay(track.id)}
                aria-label={isPlaying ? `Tạm dừng ${track.title}` : `Phát bài hát ${track.title}`}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-950/80 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-white"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="w-8 h-8 fill-current translate-x-0.5" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Info details */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  {track.genre}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Ngày phát hành: {track.releaseDate}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {track.title}
              </h1>

              <p className="text-xl font-semibold text-emerald-400">
                {track.artist}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Disc3 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Album: <strong className="text-slate-200">{track.album}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Thời lượng: <strong className="text-slate-200">{track.duration}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Lượt nghe: <strong className="text-slate-200">{track.plays.toLocaleString('vi-VN')}</strong>
                </span>
              </div>

              {/* Price card */}
              <div className="inline-block bg-slate-900/80 border border-emerald-500/30 rounded-2xl px-5 py-3 text-left shadow-inner">
                <span className="text-xs text-slate-400 block font-medium">Bản quyền số thương mại</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(track.price)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => togglePlay(track.id)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                      <span>Phát nhạc ngay</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(track.id)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2 transition-all ${
                    isFav
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
                    aria-hidden="true"
                  />
                  <span>{isFav ? 'Đã trong Yêu thích' : 'Thêm vào Yêu thích'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs: Description & Lyrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Description (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                Giới thiệu tác phẩm
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                {track.description}
              </p>
            </div>

            {/* Lyrics Excerpt Box */}
            {track.lyricsExcerpt && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Music2 className="w-5 h-5" aria-hidden="true" />
                  Trích dẫn ca từ nổi bật
                </h2>
                <div className="p-6 bg-slate-900/60 rounded-2xl border-l-4 border-emerald-500 font-serif italic text-lg text-slate-200 leading-loose">
                  &ldquo;{track.lyricsExcerpt}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Related tracks (1 col) */}
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Gợi ý cùng thể loại</h3>
              <div className="space-y-3">
                {relatedTracks.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/item/${rel.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-700/60 border border-transparent hover:border-emerald-500/30 transition-all group"
                  >
                    <img
                      src={rel.coverUrl}
                      alt={`Ảnh bìa bài hát ${rel.title}`}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 truncate">
                        {rel.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{rel.artist}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
