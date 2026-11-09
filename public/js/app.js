/**
 * Playlist Manager - Main Page Logic (JavaScript thuần)
 * Quản lý tìm kiếm, lọc thể loại, sắp xếp, modal xem nhanh và thống kê
 */

document.addEventListener('DOMContentLoaded', () => {
  const tracks = window.TRACKS_DATA || [];

  // =========================================================
  // 1. Quản lý trạng thái (State)
  // =========================================================
  const state = {
    searchQuery: '',
    selectedGenre: 'ALL',
    sortBy: 'default',
    activeTab: 'all', // 'all' | 'favorites'
    isLoading: true,
    selectedModalTrack: null,
    modalActiveTab: 'info', // 'info' | 'lyrics'
  };

  // Khởi tạo PlayerManager
  window.PlayerManager.init();

  // =========================================================
  // 2. DOM Elements
  // =========================================================
  const tabAllBtn = document.getElementById('tabAllBtn');
  const tabFavBtn = document.getElementById('tabFavBtn');
  const totalCountBadge = document.getElementById('totalCountBadge');
  const favCountBadge = document.getElementById('favCountBadge');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const genreSelect = document.getElementById('genreSelect');
  const sortSelect = document.getElementById('sortSelect');

  const statTotalTracks = document.getElementById('statTotalTracks');
  const statFavTracks = document.getElementById('statFavTracks');
  const statTotalDuration = document.getElementById('statTotalDuration');
  const statDurationTitle = document.getElementById('statDurationTitle');

  const sectionTitle = document.getElementById('sectionTitle');
  const sectionSubtitle = document.getElementById('sectionSubtitle');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  const trackGrid = document.getElementById('trackGrid');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptyDesc = document.getElementById('emptyDesc');
  const emptyActionBtn = document.getElementById('emptyActionBtn');

  // Modal elements
  const modalOverlay = document.getElementById('quickViewModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCover = document.getElementById('modalCover');
  const modalPlayTrigger = document.getElementById('modalPlayTrigger');
  const modalGenreTag = document.getElementById('modalGenreTag');
  const modalReleaseDate = document.getElementById('modalReleaseDate');
  const modalTrackTitle = document.getElementById('modalTrackTitle');
  const modalArtist = document.getElementById('modalArtist');
  const modalAlbum = document.getElementById('modalAlbum');
  const modalDuration = document.getElementById('modalDuration');
  const modalPrice = document.getElementById('modalPrice');
  const modalPlays = document.getElementById('modalPlays');
  const modalTabInfoBtn = document.getElementById('modalTabInfoBtn');
  const modalTabLyricsBtn = document.getElementById('modalTabLyricsBtn');
  const modalPaneInfo = document.getElementById('modalPaneInfo');
  const modalPaneLyrics = document.getElementById('modalPaneLyrics');
  const modalDescText = document.getElementById('modalDescText');
  const modalExcerptBox = document.getElementById('modalExcerptBox');
  const modalExcerptText = document.getElementById('modalExcerptText');
  const modalLyricsContent = document.getElementById('modalLyricsContent');
  const copyLyricsBtn = document.getElementById('copyLyricsBtn');
  const modalFavToggleBtn = document.getElementById('modalFavToggleBtn');
  const modalPlayToggleBtn = document.getElementById('modalPlayToggleBtn');
  const modalFullDetailLink = document.getElementById('modalFullDetailLink');

  // Newsletter elements
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterMsg = document.getElementById('newsletterMsg');

  // =========================================================
  // 3. Khởi tạo danh sách Thể loại (Genre Dropdown)
  // =========================================================
  function initGenres() {
    const genreSet = new Set();
    tracks.forEach((t) => {
      if (t.genre) genreSet.add(t.genre);
    });
    const genres = Array.from(genreSet).sort();

    if (genreSelect) {
      genreSelect.innerHTML = '<option value="ALL">Tất cả thể loại</option>';
      genres.forEach((g) => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt);
      });
    }
  }

  // =========================================================
  // 4. Lọc & Sắp xếp dữ liệu (Filter & Sort Logic)
  // =========================================================
  function getFilteredTracks() {
    const favs = window.FavoritesManager.getFavorites();

    const filtered = tracks.filter((t) => {
      // 1. Lọc theo tab
      if (state.activeTab === 'favorites' && !favs.includes(t.id)) {
        return false;
      }

      // 2. Lọc theo thể loại
      if (state.selectedGenre !== 'ALL' && t.genre !== state.selectedGenre) {
        return false;
      }

      // 3. Lọc theo từ khóa tìm kiếm (tên bài, nghệ sĩ, album)
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const mTitle = t.title.toLowerCase().includes(q);
        const mArtist = t.artist.toLowerCase().includes(q);
        const mAlbum = (t.album || '').toLowerCase().includes(q);
        if (!mTitle && !mArtist && !mAlbum) {
          return false;
        }
      }

      return true;
    });

    // 4. Sắp xếp
    if (state.sortBy === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else if (state.sortBy === 'title-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    } else if (state.sortBy === 'duration-desc') {
      filtered.sort((a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0));
    } else if (state.sortBy === 'duration-asc') {
      filtered.sort((a, b) => (a.durationSeconds || 0) - (b.durationSeconds || 0));
    } else if (state.sortBy === 'plays-desc') {
      filtered.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    }

    return filtered;
  }

  // =========================================================
  // 5. Cập nhật Thống kê (Stats)
  // =========================================================
  function formatTotalDuration(seconds) {
    const s = Math.floor(seconds || 0);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const remainder = s % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút ${remainder} giây`;
  }

  function updateStats() {
    const favs = window.FavoritesManager.getFavorites();
    const favCount = favs.length;
    const totalCount = tracks.length;

    if (totalCountBadge) totalCountBadge.textContent = totalCount;
    if (favCountBadge) favCountBadge.textContent = favCount;

    if (statTotalTracks) statTotalTracks.textContent = totalCount;
    if (statFavTracks) statFavTracks.textContent = favCount;

    const targetList =
      state.activeTab === 'favorites'
        ? tracks.filter((t) => favs.includes(t.id))
        : tracks;

    const totalSeconds = targetList.reduce(
      (sum, t) => sum + (t.durationSeconds || 0),
      0
    );

    if (statTotalDuration) {
      statTotalDuration.textContent = formatTotalDuration(totalSeconds);
    }
    if (statDurationTitle) {
      statDurationTitle.textContent = `Tổng thời lượng ${
        state.activeTab === 'favorites' ? 'yêu thích' : 'playlist'
      }`;
    }
  }

  // =========================================================
  // 6. Hiển thị Skeleton Loading (Mô phỏng 1.2s ban đầu)
  // =========================================================
  function renderSkeletons() {
    if (!trackGrid) return;
    trackGrid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      card.innerHTML = `
        <div class="skeleton-box" style="aspect-ratio: 1/1; width: 100%;"></div>
        <div class="skeleton-box" style="height: 18px; width: 75%;"></div>
        <div class="skeleton-box" style="height: 14px; width: 50%;"></div>
        <div class="skeleton-box" style="height: 24px; width: 40%; border-radius: 9999px;"></div>
        <div class="skeleton-box" style="height: 28px; width: 100%; margin-top: 8px;"></div>
      `;
      trackGrid.appendChild(card);
    }
  }

  // =========================================================
  // 7. Hiển thị Thẻ bài hát (Track Cards Rendering)
  // =========================================================
  function renderTracks() {
    if (state.isLoading) {
      renderSkeletons();
      return;
    }

    const filtered = getFilteredTracks();
    const favs = window.FavoritesManager.getFavorites();
    const currentPlayingId =
      window.PlayerManager.isPlaying && window.PlayerManager.currentTrack
        ? window.PlayerManager.currentTrack.id
        : null;

    updateStats();

    // Cập nhật tiêu đề danh mục
    if (sectionTitle) {
      if (state.activeTab === 'favorites') {
        sectionTitle.innerHTML = '<i class="fas fa-heart" style="color: var(--primary-400);"></i> Bộ sưu tập Yêu thích';
      } else {
        sectionTitle.innerHTML = '<i class="fas fa-headphones" style="color: var(--primary-400);"></i> Danh Sách Nhạc Thịnh Hành';
      }
    }

    if (sectionSubtitle) {
      sectionSubtitle.textContent = `Hiển thị ${filtered.length} bài hát phù hợp`;
    }

    // Hiển thị / ẩn nút Đặt lại bộ lọc
    const hasFilter =
      state.searchQuery.trim() !== '' ||
      state.selectedGenre !== 'ALL' ||
      state.sortBy !== 'default';
    if (resetFiltersBtn) {
      resetFiltersBtn.style.display = hasFilter ? 'inline-flex' : 'none';
    }

    if (!trackGrid) return;
    trackGrid.innerHTML = '';

    if (filtered.length === 0) {
      trackGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';

      if (state.activeTab === 'favorites') {
        if (emptyTitle) emptyTitle.textContent = 'Chưa có bài hát nào trong mục yêu thích';
        if (emptyDesc)
          emptyDesc.textContent =
            'Hãy bấm vào biểu tượng trái tim trên các bài hát để lưu lại vào danh sách yêu thích của bạn.';
        if (emptyActionBtn) {
          emptyActionBtn.textContent = 'Khám phá bài hát ngay';
          emptyActionBtn.onclick = () => {
            switchTab('all');
          };
        }
      } else {
        if (emptyTitle) emptyTitle.textContent = 'Không tìm thấy bài hát phù hợp';
        if (emptyDesc)
          emptyDesc.textContent =
            'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn một thể loại âm nhạc khác.';
        if (emptyActionBtn) {
          emptyActionBtn.textContent = 'Xóa tất cả bộ lọc';
          emptyActionBtn.onclick = () => {
            resetAllFilters();
          };
        }
      }
      return;
    }

    // Có bài hát
    trackGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    filtered.forEach((track) => {
      const isFav = favs.includes(track.id);
      const isPlaying = currentPlayingId === track.id;

      const card = document.createElement('article');
      card.className = `track-card ${isPlaying ? 'is-active-playing' : ''}`;
      card.dataset.trackId = track.id;

      card.innerHTML = `
        <div>
          <!-- Bìa album & Overlay -->
          <div class="card-cover-wrapper">
            <img
              src="${track.coverUrl}"
              alt="Ảnh bìa bài hát ${track.title}"
              class="card-cover-img"
              loading="lazy"
            />

            <!-- Semi-transparent overlay -->
            <div class="card-overlay">
              <button
                type="button"
                class="overlay-play-btn btn-play-card"
                aria-label="${isPlaying ? 'Tạm dừng' : 'Phát'} bài hát ${track.title}"
                title="${isPlaying ? 'Tạm dừng' : 'Phát bài hát'}"
              >
                <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
              </button>

              <button
                type="button"
                class="overlay-eye-btn btn-quick-view"
                aria-label="Xem nhanh ${track.title}"
                title="Xem nhanh thông tin"
              >
                <i class="fas fa-eye"></i>
              </button>
            </div>

            ${
              isPlaying
                ? `<div class="badge-playing">
                     <span class="ping-dot"></span>
                     Đang phát
                   </div>`
                : ''
            }

            <div class="badge-duration">
              <i class="far fa-clock"></i>
              ${track.duration}
            </div>
          </div>

          <!-- Thông tin bài hát -->
          <div class="card-info">
            <h3 class="card-title">
              <a href="detail.html?id=${track.id}" title="${track.title}">
                ${track.title}
              </a>
            </h3>

            <p class="card-artist" title="${track.artist}">
              ${track.artist}
            </p>

            <p class="card-album" title="${track.album || ''}">
              <i class="fas fa-compact-disc"></i>
              <span>${window.Utils.truncateText(track.album || '', 26)}</span>
            </p>
          </div>

          <!-- Tag thể loại -->
          <div>
            <span class="genre-tag">${track.genre}</span>
          </div>
        </div>

        <!-- Footer / Giá & Nút hành động -->
        <div class="card-footer">
          <div>
            <span class="card-price-label">Bản quyền số</span>
            <span class="card-price-val">${window.Utils.formatCurrency(track.price)}</span>
          </div>

          <div class="card-actions">
            <button
              type="button"
              class="card-fav-btn btn-fav-card ${isFav ? 'is-favorite' : ''}"
              aria-label="${isFav ? 'Bỏ thích' : 'Yêu thích'}"
              title="${isFav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}"
            >
              <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
            </button>

            <a
              href="detail.html?id=${track.id}"
              class="card-detail-btn"
              title="Xem trang chi tiết"
            >
              Chi tiết
            </a>
          </div>
        </div>
      `;

      // Gắn sự kiện cho các nút trên thẻ
      const playBtn = card.querySelector('.btn-play-card');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.PlayerManager.togglePlay(track.id);
        });
      }

      const quickViewBtn = card.querySelector('.btn-quick-view');
      if (quickViewBtn) {
        quickViewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openModal(track);
        });
      }

      const favBtn = card.querySelector('.btn-fav-card');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.FavoritesManager.toggleFavorite(track.id);
        });
      }

      trackGrid.appendChild(card);
    });
  }

  // =========================================================
  // 8. Chuyển Tab (Tất cả / Yêu thích)
  // =========================================================
  function switchTab(tab) {
    state.activeTab = tab;
    if (tab === 'all') {
      tabAllBtn?.classList.add('active');
      tabFavBtn?.classList.remove('active');
    } else {
      tabFavBtn?.classList.add('active');
      tabAllBtn?.classList.remove('active');
    }
    renderTracks();
  }

  if (tabAllBtn) {
    tabAllBtn.addEventListener('click', () => switchTab('all'));
  }
  if (tabFavBtn) {
    tabFavBtn.addEventListener('click', () => switchTab('favorites'));
  }

  // =========================================================
  // 9. Tìm kiếm với Debounce (300ms)
  // =========================================================
  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = val.trim() ? 'block' : 'none';
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = val;
        renderTracks();
      }, 300);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
      }
      clearSearchBtn.style.display = 'none';
      state.searchQuery = '';
      renderTracks();
    });
  }

  // =========================================================
  // 10. Lọc Thể loại & Sắp xếp
  // =========================================================
  if (genreSelect) {
    genreSelect.addEventListener('change', (e) => {
      state.selectedGenre = e.target.value;
      renderTracks();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderTracks();
    });
  }

  function resetAllFilters() {
    state.searchQuery = '';
    state.selectedGenre = 'ALL';
    state.sortBy = 'default';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (genreSelect) genreSelect.value = 'ALL';
    if (sortSelect) sortSelect.value = 'default';
    renderTracks();
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetAllFilters);
  }

  // =========================================================
  // 11. Modal Xem Nhanh (Quick View Track Modal)
  // =========================================================
  function openModal(track) {
    if (!track) return;
    state.selectedModalTrack = track;
    state.modalActiveTab = 'info';

    // Cập nhật dữ liệu vào modal
    if (modalCover) {
      modalCover.src = track.coverUrl;
      modalCover.alt = track.title;
    }
    if (modalGenreTag) modalGenreTag.textContent = track.genre;
    if (modalReleaseDate) modalReleaseDate.textContent = track.releaseDate;
    if (modalTrackTitle) modalTrackTitle.textContent = track.title;
    if (modalArtist) modalArtist.textContent = track.artist;
    if (modalAlbum) modalAlbum.textContent = track.album;
    if (modalDuration) modalDuration.textContent = track.duration;
    if (modalPrice) modalPrice.textContent = window.Utils.formatCurrency(track.price);
    if (modalPlays) modalPlays.textContent = Number(track.plays).toLocaleString('vi-VN');

    // Tab info
    if (modalDescText) modalDescText.textContent = track.description;
    if (track.lyricsExcerpt) {
      if (modalExcerptBox) modalExcerptBox.style.display = 'block';
      if (modalExcerptText) modalExcerptText.textContent = `“${track.lyricsExcerpt}”`;
    } else {
      if (modalExcerptBox) modalExcerptBox.style.display = 'none';
    }

    // Tab lyrics
    if (modalLyricsContent) {
      modalLyricsContent.textContent =
        track.lyrics ||
        track.lyricsExcerpt ||
        'Lời bài hát đang được cập nhật cho tác phẩm này.';
    }

    if (modalFullDetailLink) {
      modalFullDetailLink.href = `detail.html?id=${track.id}`;
    }

    switchModalTab('info');
    updateModalButtons();

    if (modalOverlay) {
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    state.selectedModalTrack = null;
  }

  function switchModalTab(tab) {
    state.modalActiveTab = tab;
    if (tab === 'info') {
      modalTabInfoBtn?.classList.add('active');
      modalTabLyricsBtn?.classList.remove('active');
      modalPaneInfo?.classList.add('active');
      modalPaneLyrics?.classList.remove('active');
    } else {
      modalTabLyricsBtn?.classList.add('active');
      modalTabInfoBtn?.classList.remove('active');
      modalPaneLyrics?.classList.add('active');
      modalPaneInfo?.classList.remove('active');
    }
  }

  function updateModalButtons() {
    if (!state.selectedModalTrack) return;
    const track = state.selectedModalTrack;
    const isFav = window.FavoritesManager.isFavorite(track.id);
    const isPlaying =
      window.PlayerManager.isPlaying &&
      window.PlayerManager.currentTrack &&
      window.PlayerManager.currentTrack.id === track.id;

    // Favorite button
    if (modalFavToggleBtn) {
      if (isFav) {
        modalFavToggleBtn.className = 'modal-fav-btn is-favorite';
        modalFavToggleBtn.innerHTML = '<i class="fas fa-heart"></i> <span>Đã yêu thích</span>';
      } else {
        modalFavToggleBtn.className = 'modal-fav-btn';
        modalFavToggleBtn.innerHTML = '<i class="far fa-heart"></i> <span>Yêu thích</span>';
      }
    }

    // Play button on cover
    if (modalPlayTrigger) {
      modalPlayTrigger.innerHTML = `<i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
    }

    // Play button on actions bar
    if (modalPlayToggleBtn) {
      modalPlayToggleBtn.innerHTML = `
        <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
        <span>${isPlaying ? 'Tạm dừng' : 'Nghe thử'}</span>
      `;
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay?.classList.contains('open')) {
      closeModal();
    }
  });

  if (modalTabInfoBtn) {
    modalTabInfoBtn.addEventListener('click', () => switchModalTab('info'));
  }
  if (modalTabLyricsBtn) {
    modalTabLyricsBtn.addEventListener('click', () => switchModalTab('lyrics'));
  }

  // Nút Play trên modal
  function toggleModalPlay() {
    if (state.selectedModalTrack) {
      window.PlayerManager.togglePlay(state.selectedModalTrack.id);
      updateModalButtons();
    }
  }
  if (modalPlayTrigger) modalPlayTrigger.addEventListener('click', toggleModalPlay);
  if (modalPlayToggleBtn) modalPlayToggleBtn.addEventListener('click', toggleModalPlay);

  // Nút Thích trên modal
  if (modalFavToggleBtn) {
    modalFavToggleBtn.addEventListener('click', () => {
      if (state.selectedModalTrack) {
        window.FavoritesManager.toggleFavorite(state.selectedModalTrack.id);
        updateModalButtons();
      }
    });
  }

  // Nút Sao chép lời bài hát
  if (copyLyricsBtn) {
    copyLyricsBtn.addEventListener('click', async () => {
      if (!state.selectedModalTrack) return;
      const lyrics =
        state.selectedModalTrack.lyrics ||
        state.selectedModalTrack.lyricsExcerpt ||
        '';
      try {
        await navigator.clipboard.writeText(lyrics);
        copyLyricsBtn.innerHTML = '<i class="fas fa-check" style="color: var(--primary-400);"></i> <span>Đã sao chép!</span>';
        setTimeout(() => {
          copyLyricsBtn.innerHTML = '<i class="far fa-copy"></i> <span>Sao chép lời</span>';
        }, 2000);
      } catch (err) {
        console.error('Không thể sao chép văn bản:', err);
      }
    });
  }

  // =========================================================
  // 12. Newsletter Form Validation (Email Regex)
  // =========================================================
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail?.value.trim() || '';

      if (!validateEmail(email)) {
        if (newsletterEmail) newsletterEmail.classList.add('error');
        if (newsletterMsg) {
          newsletterMsg.className = 'newsletter-msg error';
          newsletterMsg.innerHTML =
            '<i class="fas fa-exclamation-circle"></i> Vui lòng nhập định dạng email hợp lệ (ví dụ: ten@domain.com).';
        }
        return;
      }

      if (newsletterEmail) {
        newsletterEmail.classList.remove('error');
        newsletterEmail.value = '';
      }
      if (newsletterMsg) {
        newsletterMsg.className = 'newsletter-msg success';
        newsletterMsg.innerHTML =
          '<i class="fas fa-check-circle"></i> Cảm ơn bạn! Địa chỉ email đã được xác thực và đăng ký thành công.';
      }
    });
  }

  // =========================================================
  // 13. Lắng nghe cập nhật từ Player & Favorites
  // =========================================================
  window.FavoritesManager.subscribe(() => {
    updateStats();
    renderTracks();
    if (state.selectedModalTrack) {
      updateModalButtons();
    }
  });

  window.PlayerManager.subscribe(() => {
    renderTracks();
    if (state.selectedModalTrack) {
      updateModalButtons();
    }
  });

  // =========================================================
  // 14. Khởi chạy ban đầu
  // =========================================================
  initGenres();
  renderSkeletons();

  // Mô phỏng skeleton 1.2s như phiên bản gốc
  setTimeout(() => {
    state.isLoading = false;
    renderTracks();
  }, 1200);
});
