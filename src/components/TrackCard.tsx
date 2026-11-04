import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, Eye, Clock, Disc3 } from 'lucide-react';
import { Track } from '../types';
import { formatCurrency, truncateText } from '../utils';
import { usePlaylist } from '../context/PlaylistContext';

interface TrackCardProps {
  track: Track;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { isFavorite, toggleFavorite, openModal, playingTrackId, togglePlay } = usePlaylist();
  const isFav = isFavorite(track.id);
  const isPlaying = playingTrackId === track.id;

  return (
    <article
      className={`group relative bg-slate-800/80 hover:bg-slate-800 border transition-all duration-300 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 ${
        isPlaying ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-700/60 hover:border-emerald-500/50'
      }`}
    >
      <div>
        {/* Cover Image & Overlay Controls */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-slate-900 group/image">
          <img
            src={track.coverUrl}
            alt={`Ảnh bìa album của bài hát ${track.title} do nghệ sĩ ${track.artist} thể hiện`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
            loading="lazy"
          />

          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => togglePlay(track.id)}
              aria-label={isPlaying ? `Tạm dừng phát bài hát ${track.title}` : `Phát bài hát ${track.title}`}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" aria-hidden="true" />
              )}
            </button>

            {/* Quick View Modal Trigger */}
            <button
              type="button"
              onClick={() => openModal(track)}
              aria-label={`Xem nhanh thông tin bài hát ${track.title}`}
              className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 flex items-center justify-center border border-slate-600 shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <Eye className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Playing wave badge */}
          {isPlaying && (
            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Đang phát
            </div>
          )}

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            {track.duration}
          </div>
        </div>

        {/* Info Area */}
        <div className="space-y-1 mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base text-slate-100 hover:text-emerald-400 transition-colors line-clamp-1">
              <Link
                to={`/item/${track.id}`}
                title={track.title}
                className="focus:outline-none focus:underline"
              >
                {truncateText(track.title, 24)}
              </Link>
            </h3>
          </div>

          <p className="text-sm text-slate-400 font-medium line-clamp-1" title={track.artist}>
            {track.artist}
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
            <Disc3 className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span title={track.album}>{truncateText(track.album, 26)}</span>
          </p>
        </div>

        {/* Genre Tag */}
        <div className="mb-4">
          <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            {track.genre}
          </span>
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Bản quyền số</span>
          <span className="text-sm font-bold text-emerald-400">
            {formatCurrency(track.price)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(track.id)}
            aria-label={
              isFav
                ? `Bỏ bài hát ${track.title} khỏi danh sách yêu thích`
                : `Thêm bài hát ${track.title} vào danh sách yêu thích`
            }
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isFav
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400 hover:bg-emerald-900'
                : 'bg-slate-700/50 border-slate-600/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Detail Link Button */}
          <Link
            to={`/item/${track.id}`}
            aria-label={`Xem chi tiết bài hát ${track.title}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/60 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
};
