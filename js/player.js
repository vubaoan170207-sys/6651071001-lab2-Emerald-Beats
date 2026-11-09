/**
 * Playlist Manager - Player & Favorites Shared Module
 * Cung cấp chức năng quản lý bài hát yêu thích và trình phát nhạc mô phỏng
 */

(function () {
  const FAVORITES_STORAGE_KEY = 'playlist_manager_favorites_v1';
  const CURRENT_TRACK_KEY = 'playlist_manager_current_track_v1';

  // =========================================================
  // 1. Quản lý danh sách Yêu thích (Favorites)
  // =========================================================
  const FavoritesManager = {
    listeners: [],

    getFavorites() {
      try {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Lỗi đọc localStorage favorites:', e);
      }
      return [];
    },

    isFavorite(trackId) {
      return this.getFavorites().includes(trackId);
    },

    toggleFavorite(trackId) {
      let favs = this.getFavorites();
      if (favs.includes(trackId)) {
        favs = favs.filter((id) => id !== trackId);
      } else {
        favs.push(trackId);
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
      } catch (e) {
        console.error('Lỗi lưu localStorage favorites:', e);
      }
      this.notify(favs);
      return favs.includes(trackId);
    },

    subscribe(callback) {
      this.listeners.push(callback);
    },

    notify(favs) {
      this.listeners.forEach((fn) => fn(favs));
    },
  };

  // =========================================================
  // 2. Định dạng & Tiện ích
  // =========================================================
  function formatTime(seconds) {
    const s = Math.floor(seconds || 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  }

  function truncateText(text, maxLen) {
    if (!text) return '';
    return text.length <= maxLen ? text : text.substring(0, maxLen) + '...';
  }

  // =========================================================
  // 3. Quản lý Trình phát nhạc (Player Manager)
  // =========================================================
  const PlayerManager = {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    volume: 80,
    isMuted: false,
    timerId: null,
    listeners: [],

    init() {
      // Khôi phục bài hát đã lưu nếu có
      try {
        const savedId = localStorage.getItem(CURRENT_TRACK_KEY);
        if (savedId && window.TRACKS_DATA) {
          const found = window.TRACKS_DATA.find((t) => t.id === savedId);
          if (found) {
            this.currentTrack = found;
          }
        }
      } catch (e) {}

      this.bindDOM();
      this.render();

      FavoritesManager.subscribe(() => {
        this.updateFavButton();
      });
    },

    subscribe(callback) {
      this.listeners.push(callback);
    },

    notify() {
      this.listeners.forEach((fn) => fn(this));
    },

    playTrack(track) {
      if (!track) return;
      if (this.currentTrack && this.currentTrack.id === track.id) {
        this.togglePlay();
      } else {
        this.currentTrack = track;
        this.currentTime = 0;
        this.isPlaying = true;
        try {
          localStorage.setItem(CURRENT_TRACK_KEY, track.id);
        } catch (e) {}
        this.startTimer();
        this.render();
        this.notify();
      }
    },

    togglePlay(trackId) {
      if (trackId && (!this.currentTrack || this.currentTrack.id !== trackId)) {
        const found = window.TRACKS_DATA?.find((t) => t.id === trackId);
        if (found) {
          this.playTrack(found);
          return;
        }
      }

      if (!this.currentTrack && window.TRACKS_DATA && window.TRACKS_DATA.length > 0) {
        this.playTrack(window.TRACKS_DATA[0]);
        return;
      }

      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
      this.render();
      this.notify();
    },

    startTimer() {
      this.stopTimer();
      this.timerId = setInterval(() => {
        if (!this.currentTrack) return;
        const total = this.currentTrack.durationSeconds || 180;
        this.currentTime += 1;
        if (this.currentTime >= total) {
          // Tự động chuyển bài tiếp theo
          this.playNext();
        } else {
          this.updateScrubber();
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    },

    playNext() {
      const list = window.TRACKS_DATA || [];
      if (!this.currentTrack || list.length === 0) return;
      const idx = list.findIndex((t) => t.id === this.currentTrack.id);
      const nextIdx = (idx + 1) % list.length;
      this.playTrack(list[nextIdx]);
    },

    playPrev() {
      const list = window.TRACKS_DATA || [];
      if (!this.currentTrack || list.length === 0) return;
      const idx = list.findIndex((t) => t.id === this.currentTrack.id);
      const prevIdx = (idx - 1 + list.length) % list.length;
      this.playTrack(list[prevIdx]);
    },

    seek(sec) {
      this.currentTime = sec;
      this.updateScrubber();
    },

    setVolume(val) {
      this.volume = Math.max(0, Math.min(100, val));
      if (this.volume > 0 && this.isMuted) {
        this.isMuted = false;
      }
      this.renderVolume();
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      this.renderVolume();
    },

    // =========================================================
    // DOM Binding & Render for Audio Player Bar
    // =========================================================
    bindDOM() {
      const scrubber = document.getElementById('playerScrubber');
      if (scrubber) {
        scrubber.addEventListener('input', (e) => {
          this.seek(Number(e.target.value));
        });
      }

      const volSlider = document.getElementById('playerVolSlider');
      if (volSlider) {
        volSlider.addEventListener('input', (e) => {
          this.setVolume(Number(e.target.value));
        });
      }

      const playBtn = document.getElementById('playerMainPlayBtn');
      if (playBtn) {
        playBtn.addEventListener('click', () => this.togglePlay());
      }

      const prevBtn = document.getElementById('playerPrevBtn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.playPrev());
      }

      const nextBtn = document.getElementById('playerNextBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.playNext());
      }

      const muteBtn = document.getElementById('playerMuteBtn');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => this.toggleMute());
      }

      const favBtn = document.getElementById('playerFavBtn');
      if (favBtn) {
        favBtn.addEventListener('click', () => {
          if (this.currentTrack) {
            FavoritesManager.toggleFavorite(this.currentTrack.id);
          }
        });
      }
    },

    render() {
      const bar = document.getElementById('audioPlayerBar');
      if (!bar) return;

      if (!this.currentTrack) {
        bar.classList.remove('active');
        return;
      }

      bar.classList.add('active');

      const thumb = document.getElementById('playerThumb');
      if (thumb) {
        thumb.src = this.currentTrack.coverUrl;
        thumb.alt = this.currentTrack.title;
      }

      const titleLink = document.getElementById('playerTitleLink');
      if (titleLink) {
        titleLink.textContent = truncateText(this.currentTrack.title, 24);
        titleLink.title = this.currentTrack.title;
        titleLink.href = `detail.html?id=${this.currentTrack.id}`;
      }

      const artistText = document.getElementById('playerArtist');
      if (artistText) {
        artistText.textContent = this.currentTrack.artist;
        artistText.title = this.currentTrack.artist;
      }

      const playIcon = document.getElementById('playerPlayIcon');
      if (playIcon) {
        playIcon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
      }

      const pulse = document.getElementById('playerPulse');
      if (pulse) {
        pulse.style.display = this.isPlaying ? 'flex' : 'none';
      }

      const totalTimeElem = document.getElementById('playerTotalTime');
      if (totalTimeElem) {
        totalTimeElem.textContent = formatTime(this.currentTrack.durationSeconds || 180);
      }

      const scrubber = document.getElementById('playerScrubber');
      if (scrubber) {
        scrubber.max = this.currentTrack.durationSeconds || 180;
      }

      this.updateScrubber();
      this.updateFavButton();
      this.renderVolume();
    },

    updateScrubber() {
      const scrubber = document.getElementById('playerScrubber');
      const curTimeElem = document.getElementById('playerCurrentTime');
      const total = this.currentTrack ? this.currentTrack.durationSeconds || 180 : 180;
      const pct = Math.min(100, Math.max(0, (this.currentTime / total) * 100));

      if (scrubber) {
        scrubber.value = this.currentTime;
        scrubber.style.background = `linear-gradient(to right, #059669 0%, #059669 ${pct}%, #334155 ${pct}%, #334155 100%)`;
      }

      if (curTimeElem) {
        curTimeElem.textContent = formatTime(this.currentTime);
      }
    },

    updateFavButton() {
      const favBtn = document.getElementById('playerFavBtn');
      if (!favBtn || !this.currentTrack) return;
      const isFav = FavoritesManager.isFavorite(this.currentTrack.id);
      if (isFav) {
        favBtn.classList.add('is-favorite');
        favBtn.innerHTML = '<i class="fas fa-heart"></i>';
      } else {
        favBtn.classList.remove('is-favorite');
        favBtn.innerHTML = '<i class="far fa-heart"></i>';
      }
    },

    renderVolume() {
      const volBtn = document.getElementById('playerMuteBtn');
      const volSlider = document.getElementById('playerVolSlider');
      const volText = document.getElementById('playerVolText');

      const effVol = this.isMuted ? 0 : this.volume;

      if (volSlider) {
        volSlider.value = effVol;
        volSlider.style.background = `linear-gradient(to right, #059669 0%, #059669 ${effVol}%, #334155 ${effVol}%, #334155 100%)`;
      }

      if (volText) {
        volText.textContent = `${effVol}%`;
      }

      if (volBtn) {
        if (effVol === 0 || this.isMuted) {
          volBtn.className = 'vol-btn muted';
          volBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (effVol < 50) {
          volBtn.className = 'vol-btn';
          volBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
          volBtn.className = 'vol-btn';
          volBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
      }
    },
  };

  // Xuất ra global scope
  window.FavoritesManager = FavoritesManager;
  window.PlayerManager = PlayerManager;
  window.Utils = {
    formatTime,
    formatCurrency,
    truncateText,
  };
})();
