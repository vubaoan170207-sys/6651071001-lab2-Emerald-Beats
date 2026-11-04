import React, { useMemo } from 'react';
import { Music, Heart, Search, X, Radio, ArrowUpDown } from 'lucide-react';
import { usePlaylist } from '../context/PlaylistContext';
import { debounce } from '../utils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  genres: string[];
  totalTracks: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  genres,
  totalTracks,
}) => {
  const { favorites, activeTab, setActiveTab } = usePlaylist();

  // Áp dụng hàm debounce từ utils.ts cho ô tìm kiếm
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        onSearchChange(val);
      }, 300),
    [onSearchChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    debouncedSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Top bar: Brand + Stats + Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/30">
              <Music className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Playlist Manager
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  React 18 + TS
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Hệ thống quản lý & phát nhạc trực tuyến chuẩn mực
              </p>
            </div>
          </div>

          {/* Navigation Tabs (All vs Favorites) */}
          <nav
            aria-label="Chế độ xem danh sách"
            className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner"
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" aria-hidden="true" />
              <span>Tất cả bài hát</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-900/50 text-slate-300">
                {totalTracks}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-white' : ''}`}
                aria-hidden="true"
              />
              <span>Yêu thích</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-900/50 text-slate-300">
                {favorites.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Filter bar: Search input + Genre selector + Sort selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input with Debounce */}
          <div className="relative md:col-span-6 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              placeholder="Tìm kiếm bài hát, ca sĩ, album..."
              defaultValue={searchQuery}
              onChange={handleInputChange}
              aria-label="Tìm kiếm bài hát theo tên hoặc nghệ sĩ"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Genre Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <label
              htmlFor="genre-select"
              className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline"
            >
              Thể loại:
            </label>
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              aria-label="Lọc theo thể loại bài hát"
              className="w-full py-2.5 px-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả thể loại</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline flex items-center gap-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Sắp xếp:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sắp xếp danh sách bài hát"
              className="w-full py-2.5 px-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="default">Thứ tự mặc định</option>
              <option value="title-asc">Tên bài hát (A → Z)</option>
              <option value="title-desc">Tên bài hát (Z → A)</option>
              <option value="duration-desc">Thời lượng (Dài nhất)</option>
              <option value="duration-asc">Thời lượng (Ngắn nhất)</option>
              <option value="plays-desc">Lượt nghe nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
