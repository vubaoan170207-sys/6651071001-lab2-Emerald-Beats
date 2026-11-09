/**
 * Playlist Manager - Detail Page Logic (JavaScript thuần)
 * Hiển thị chi tiết bài hát theo id, danh sách bài hát liên quan, lời bài hát
 */

document.addEventListener('DOMContentLoaded', () => {
  const tracks = window.TRACKS_DATA || [];
  window.PlayerManager.init();

  // Lấy id từ URL params (?id=track-01)
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');

  const notFoundSection = document.getElementById('notFoundSection');
  const detailMainContent = document.getElementById('detailMainContent');

  const track = tracks.find((t) => t.id === trackId);

  if (!track) {
    if (notFoundSection) notFoundSection.style.display = 'block';
    if (detailMainContent) detailMainContent.style.display = 'none';
    return;
  }

  if (notFoundSection) notFoundSection.style.display = 'none';
  if (detailMainContent) detailMainContent.style.display = 'block';

  // =========================================================
  // 1. Cập nhật thông tin chi tiết (Hero)
  // =========================================================
  document.title = `${track.title} - ${track.artist} | Playlist Manager`;

  const coverImg = document.getElementById('detailCover');
  const titleElem = document.getElementById('detailTitle');
  const artistElem = document.getElementById('detailArtist');
  const genreBadge = document.getElementById('detailGenre');
  const dateBadge = document.getElementById('detailDate');
  const albumElem = document.getElementById('detailAlbum');
  const durationElem = document.getElementById('detailDuration');
  const playsElem = document.getElementById('detailPlays');
  const priceElem = document.getElementById('detailPrice');
  const descElem = document.getElementById('detailDesc');
  const excerptBox = document.getElementById('detailExcerptBox');
  const excerptElem = document.getElementById('detailExcerpt');
  const lyricsElem = document.getElementById('detailLyrics');
  const copyLyricsBtn = document.getElementById('detailCopyLyricsBtn');

  const mainPlayBtn = document.getElementById('detailMainPlayBtn');
  const topFavBtn = document.getElementById('detailTopFavBtn');
  const heroFavBtn = document.getElementById('detailHeroFavBtn');

  if (coverImg) {
    coverImg.src = track.coverUrl;
    coverImg.alt = `Ảnh bìa ${track.title}`;
  }
  if (titleElem) titleElem.textContent = track.title;
  if (artistElem) artistElem.textContent = track.artist;
  if (genreBadge) genreBadge.innerHTML = `<i class="fas fa-tag"></i> ${track.genre}`;
  if (dateBadge) dateBadge.innerHTML = `<i class="far fa-calendar-alt"></i> ${track.releaseDate}`;
  if (albumElem) albumElem.textContent = track.album || 'Đang cập nhật';
  if (durationElem) durationElem.textContent = track.duration;
  if (playsElem) playsElem.textContent = Number(track.plays).toLocaleString('vi-VN');
  if (priceElem) priceElem.textContent = window.Utils.formatCurrency(track.price);
  if (descElem) descElem.textContent = track.description;

  if (track.lyricsExcerpt) {
    if (excerptBox) excerptBox.style.display = 'block';
    if (excerptElem) excerptElem.textContent = `“${track.lyricsExcerpt}”`;
  } else {
    if (excerptBox) excerptBox.style.display = 'none';
  }

  const fullLyrics =
    track.lyrics ||
    track.lyricsExcerpt ||
    'Lời bài hát đang được cập nhật cho tác phẩm này.';
  if (lyricsElem) {
    lyricsElem.textContent = fullLyrics;
  }

  // Sao chép lời bài hát
  if (copyLyricsBtn) {
    copyLyricsBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(fullLyrics);
        copyLyricsBtn.innerHTML = '<i class="fas fa-check" style="color: var(--primary-400);"></i> <span>Đã sao chép!</span>';
        setTimeout(() => {
          copyLyricsBtn.innerHTML = '<i class="far fa-copy"></i> <span>Sao chép lời</span>';
        }, 2000);
      } catch (e) {
        console.error('Không thể sao chép lời:', e);
      }
    });
  }

  // =========================================================
  // 2. Trạng thái Nút Phát & Nút Thích
  // =========================================================
  function updateActionButtons() {
    const isFav = window.FavoritesManager.isFavorite(track.id);
    const isPlaying =
      window.PlayerManager.isPlaying &&
      window.PlayerManager.currentTrack &&
      window.PlayerManager.currentTrack.id === track.id;

    // Main Play Button
    if (mainPlayBtn) {
      mainPlayBtn.innerHTML = `
        <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
        <span>${isPlaying ? 'Tạm dừng phát' : 'Phát bài hát'}</span>
      `;
    }

    // Top Favorite Button
    if (topFavBtn) {
      topFavBtn.className = `player-fav-btn ${isFav ? 'is-favorite' : ''}`;
      topFavBtn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i>`;
    }

    // Hero Favorite Button
    if (heroFavBtn) {
      heroFavBtn.className = `detail-fav-btn ${isFav ? 'is-favorite' : ''}`;
      heroFavBtn.innerHTML = `
        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
        <span>${isFav ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</span>
      `;
    }
  }

  if (mainPlayBtn) {
    mainPlayBtn.addEventListener('click', () => {
      window.PlayerManager.togglePlay(track.id);
      updateActionButtons();
    });
  }

  function handleFavToggle() {
    window.FavoritesManager.toggleFavorite(track.id);
    updateActionButtons();
  }

  if (topFavBtn) topFavBtn.addEventListener('click', handleFavToggle);
  if (heroFavBtn) heroFavBtn.addEventListener('click', handleFavToggle);

  // =========================================================
  // 3. Danh sách bài hát liên quan (Related Tracks)
  // =========================================================
  function renderRelatedTracks() {
    const relatedContainer = document.getElementById('relatedTracksList');
    if (!relatedContainer) return;

    const related = tracks
      .filter((t) => t.id !== track.id && (t.genre === track.genre || t.artist === track.artist))
      .slice(0, 4);

    if (related.length === 0) {
      relatedContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Không có bài hát tương tự.</p>';
      return;
    }

    relatedContainer.innerHTML = '';
    related.forEach((item) => {
      const isItemPlaying =
        window.PlayerManager.isPlaying &&
        window.PlayerManager.currentTrack &&
        window.PlayerManager.currentTrack.id === item.id;

      const div = document.createElement('div');
      div.className = 'related-item';
      div.innerHTML = `
        <img src="${item.coverUrl}" alt="${item.title}" class="related-thumb" />
        <div class="related-info">
          <a href="detail.html?id=${item.id}" class="related-title" title="${item.title}">
            ${item.title}
          </a>
          <p class="related-artist">${item.artist}</p>
        </div>
        <button
          type="button"
          class="related-play-btn"
          aria-label="${isItemPlaying ? 'Tạm dừng' : 'Phát'} ${item.title}"
          title="${isItemPlaying ? 'Tạm dừng' : 'Phát bài hát'}"
        >
          <i class="fas ${isItemPlaying ? 'fa-pause' : 'fa-play'}"></i>
        </button>
      `;

      const playBtn = div.querySelector('.related-play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          window.PlayerManager.togglePlay(item.id);
        });
      }

      relatedContainer.appendChild(div);
    });
  }

  // =========================================================
  // 4. Lắng nghe cập nhật
  // =========================================================
  window.PlayerManager.subscribe(() => {
    updateActionButtons();
    renderRelatedTracks();
  });

  window.FavoritesManager.subscribe(() => {
    updateActionButtons();
  });

  updateActionButtons();
  renderRelatedTracks();
});
