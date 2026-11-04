import React, { useState, useEffect, useMemo } from 'react';
import tracksData from '../data/data.json';
import { Track } from '../types';
import { TrackCard } from '../components/TrackCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { Header } from '../components/Header';
import { TrackModal } from '../components/TrackModal';
import { usePlaylist } from '../context/PlaylistContext';
import {
  Heart,
  Music,
  Clock,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Headphones,
} from 'lucide-react';
import { validateEmail } from '../utils';

/**
 * Định dạng tổng số giây thành chuỗi giờ và phút
 */
function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút ${seconds % 60} giây`;
}

export const ListPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('default');

  // Newsletter state showcasing validateEmail utility
  const [email, setEmail] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { favorites, activeTab, setActiveTab, selectedTrack, closeModal } = usePlaylist();

  // Simulate skeleton loading for 1.2s
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setTracks(tracksData as Track[]);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Extract unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    (tracksData as Track[]).forEach((t) => set.add(t.genre));
    return Array.from(set).sort();
  }, []);

  // Filter and Sort logic
  const filteredTracks = useMemo(() => {
    const result = tracks.filter((track) => {
      // 1. Tab filter (Favorites vs All)
      if (activeTab === 'favorites' && !favorites.includes(track.id)) {
        return false;
      }

      // 2. Genre filter
      if (selectedGenre !== 'ALL' && track.genre !== selectedGenre) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = track.title.toLowerCase().includes(query);
        const matchArtist = track.artist.toLowerCase().includes(query);
        const matchAlbum = track.album.toLowerCase().includes(query);
        if (!matchTitle && !matchArtist && !matchAlbum) {
          return false;
        }
      }

      return true;
    });

    // 4. Sorting logic
    if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else if (sortBy === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    } else if (sortBy === 'duration-desc') {
      result.sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === 'duration-asc') {
      result.sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else if (sortBy === 'plays-desc') {
      result.sort((a, b) => b.plays - a.plays);
    }

    return result;
  }, [tracks, activeTab, favorites, selectedGenre, searchQuery, sortBy]);

  // Statistics calculation for the current playlist context
  const stats = useMemo(() => {
    const totalCount = tracks.length;
    const favoriteCount = favorites.length;
    const targetList = activeTab === 'favorites'
      ? tracks.filter((t) => favorites.includes(t.id))
      : tracks;
    const totalDurationSeconds = targetList.reduce(
      (sum, track) => sum + (track.durationSeconds || 0),
      0
    );

    return {
      totalCount,
      favoriteCount,
      totalDurationFormatted: formatTotalDuration(totalDurationSeconds),
    };
  }, [tracks, favorites, activeTab]);

  const handleSubscribe = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailStatus('error');
      return;
    }
    setEmailStatus('success');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 pb-28 sm:pb-24">
      {/* Header with Search and Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        genres={genres}
        totalTracks={tracks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================= */}
        {/* 3. STATS WIDGET (Thống kê nhanh ở đầu trang) */}
        {/* ========================================================= */}
        <section
          aria-label="Thống kê nhanh danh sách phát"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Stat 1: Tổng số bài hát */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Music className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tổng số bài hát
              </p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {stats.totalCount}{' '}
                <span className="text-xs font-normal text-slate-400">bản ghi</span>
              </h3>
            </div>
          </div>

          {/* Stat 2: Số bài yêu thích */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Heart className="w-6 h-6 fill-emerald-400 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Bài hát yêu thích
              </p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {stats.favoriteCount}{' '}
                <span className="text-xs font-normal text-slate-400">bài đã thả tim</span>
              </h3>
            </div>
          </div>

          {/* Stat 3: Tổng thời lượng playlist */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Clock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tổng thời lượng {activeTab === 'favorites' ? 'yêu thích' : 'playlist'}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {stats.totalDurationFormatted}
              </h3>
            </div>
          </div>
        </section>

        {/* Section Header & Reset Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'favorites' ? (
                <span className="flex items-center gap-2">
                  <Heart className="w-7 h-7 text-emerald-400 fill-emerald-400" aria-hidden="true" />
                  Bộ sưu tập Yêu thích
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Headphones className="w-7 h-7 text-emerald-400" aria-hidden="true" />
                  Danh Sách Nhạc Thịnh Hành
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {loading
                ? 'Đang đồng bộ dữ liệu âm nhạc...'
                : `Hiển thị ${filteredTracks.length} bài hát phù hợp`}
            </p>
          </div>

          {/* Reset Filters / Reload */}
          {(searchQuery || selectedGenre !== 'ALL' || sortBy !== 'default') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('ALL');
                setSortBy('default');
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Đặt lại bộ lọc & sắp xếp
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* Responsive Grid System:
            Mobile (<640px): grid-cols-1
            Tablet (640px - 1024px): sm:grid-cols-2
            Desktop (>1024px): lg:grid-cols-3 xl:grid-cols-4
        */}
        {/* ========================================================= */}
        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            aria-busy="true"
            aria-live="polite"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500 border border-slate-700">
              <Music className="w-8 h-8" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {activeTab === 'favorites'
                ? 'Chưa có bài hát nào trong mục yêu thích'
                : 'Không tìm thấy bài hát phù hợp'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {activeTab === 'favorites'
                ? 'Hãy bấm vào biểu tượng trái tim trên các bài hát để lưu lại vào danh sách yêu thích của bạn.'
                : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn một thể loại âm nhạc khác.'}
            </p>
            {activeTab === 'favorites' ? (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-950/40"
              >
                Khám phá bài hát ngay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('ALL');
                  setSortBy('default');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Newsletter Subscription (Demonstrates validateEmail) */}
        <section
          aria-labelledby="newsletter-heading"
          className="mt-16 bg-gradient-to-r from-slate-800/90 via-slate-800 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-xl"
        >
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h3 id="newsletter-heading" className="text-xl sm:text-2xl font-bold text-white">
              Đăng ký nhận bản tin âm nhạc mới nhất
            </h3>
            <p className="text-sm text-slate-300">
              Nhận thông báo sớm nhất về các ca khúc độc quyền, bảng xếp hạng âm nhạc và ưu đãi bản quyền mỗi tuần.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailStatus !== 'idle') setEmailStatus('idle');
                  }}
                  placeholder="Nhập địa chỉ email của bạn (vd: your@email.com)"
                  aria-label="Địa chỉ email đăng ký"
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    emailStatus === 'error'
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-700 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Đăng ký</span>
              </button>
            </form>

            {/* Validation Feedback */}
            {emailStatus === 'error' && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                Vui lòng nhập định dạng email hợp lệ (ví dụ: ten@domain.com).
              </p>
            )}

            {emailStatus === 'success' && (
              <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Cảm ơn bạn! Địa chỉ email đã được xác thực và đăng ký thành công.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Quick View Track Modal */}
      <TrackModal track={selectedTrack} onClose={closeModal} />
    </div>
  );
};
