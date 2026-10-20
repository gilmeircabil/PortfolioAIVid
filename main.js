// ============================================
// GILMIER EJ CABIL — VIDEOGRAPHER & VIDEO EDITOR
// ============================================

const videos = [
  {
    title: "AI Product Advertisement",
    duration: "00:30",
    driveUrl: "https://drive.google.com/file/d/1YqKH3NRDqfuTgzvopBkwZ5eGVpIH3Rmp/view?usp=drive_link",
    thumbnail: "assets/thumbnails/2.png"
  },
  {
    title: "AI Product Showcase",
    duration: "00:25",
    driveUrl: "https://drive.google.com/file/d/1FPyNt5-WvR8PPxaU5bKAobQd32uabrCQ/view?usp=drive_link",
    thumbnail: "assets/thumbnails/3.png"
  },
  {
    title: "Social Media Advertisement",
    duration: "00:15",
    driveUrl: "https://drive.google.com/file/d/11Rz761o8WrVvBeWuD-zubItv9E6QeTOu/view?usp=sharing",
    thumbnail: "assets/thumbnails/4.png"
  },
  {
    title: "UGC-Style Product Promo",
    duration: "00:30",
    driveUrl: "https://drive.google.com/file/d/1JAqho9Tt7Idwog4bepQV0Mhw54NP5_HS/view?usp=drive_link",
    thumbnail: "assets/thumbnails/5.png"
  },
  {
    title: "Brand Story Edit",
    duration: "00:45",
    driveUrl: "https://drive.google.com/file/d/1m8287eaD28jFKDWtPxR1OpglWcAXenaL/view?usp=drive_link",
    thumbnail: "assets/thumbnails/6.png"
  },
  {
    title: "Short-Form Campaign Teaser",
    duration: "00:15",
    driveUrl: "https://drive.google.com/file/d/1FIAR8fb95SNZ2wuryj5fPkj9fGVcIOST/view?usp=drive_link",
    thumbnail: "assets/thumbnails/1.png"
  }
];

function escapeHtml(str) {
  return String(str === null || str === undefined ? '' : str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function extractDriveFileId(url) {
  const value = String(url || '').trim();
  if (!value) return null;
  const fileMatch = value.match(/\/file\/d\/([^/]+?)(?=[/?#]|$)/);
  if (fileMatch) return fileMatch[1];
  const openMatch = value.match(/[?&]id=([^&]+)/);
  if (openMatch) return openMatch[1];
  const ucMatch = value.match(/drive\.google\.com\/uc\?export=[^&]+&id=([^&]+)/);
  if (ucMatch) return ucMatch[1];
  return null;
}

function drivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`;
}

// --------------------------------------------
// 1. SCROLL PROGRESS
// --------------------------------------------
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  if (!scrollProgress) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const current = window.scrollY;
  const pct = total > 0 ? (current / total) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}, { passive: true });

// --------------------------------------------
// 2. VIDEO GRID & DIRECT PLAY
// --------------------------------------------
const videoGrid = document.getElementById('videoGrid');
let currentlyPlayingCard = null;

function renderPosterHtml(video) {
  const title = escapeHtml(video.title);
  const thumbSrc = video.thumbnail ? escapeHtml(video.thumbnail) : '';

  const posterImg = thumbSrc
    ? `<img src="${thumbSrc}" alt="${title}" class="video-thumb" loading="lazy">`
    : `<div class="static-placeholder"><span class="static-text">${title}</span></div>`;

  return `
    <div class="video-poster-box" aria-label="Play ${title}">
      ${posterImg}
      <div class="card-gradient"></div>
      <span class="card-title">${title}</span>
      <div class="play-overlay">
        <button class="play-btn" type="button" aria-label="Play ${title}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function createVideoCard(video, index) {
  const fileId = extractDriveFileId(video.driveUrl);
  return `
    <article class="video-card" data-video-index="${index}" data-file-id="${escapeHtml(fileId || '')}">
      <div class="video-media-wrap">
        ${renderPosterHtml(video)}
      </div>
    </article>
  `;
}

function renderVideos() {
  if (!videoGrid) return;
  videoGrid.innerHTML = videos.map((video, index) => createVideoCard(video, index)).join('');
}

function stopCurrentVideo() {
  if (!currentlyPlayingCard) return;

  const card = currentlyPlayingCard;
  const index = Number(card.dataset.videoIndex);
  const video = videos[index];
  const mediaWrap = card.querySelector('.video-media-wrap');

  if (mediaWrap && video) {
    mediaWrap.innerHTML = renderPosterHtml(video);
  }

  card.classList.remove('is-playing');
  currentlyPlayingCard = null;
}

function playVideoInline(card) {
  if (card === currentlyPlayingCard && card.classList.contains('is-playing')) {
    return;
  }

  stopCurrentVideo();

  const index = Number(card.dataset.videoIndex);
  const video = videos[index];
  if (!video) return;

  const fileId = card.dataset.fileId || extractDriveFileId(video.driveUrl);
  if (!fileId) return;

  const mediaWrap = card.querySelector('.video-media-wrap');
  if (!mediaWrap) return;

  card.classList.add('is-playing');
  currentlyPlayingCard = card;

  const iframeSrc = drivePreviewUrl(fileId);

  mediaWrap.innerHTML = `
    <div class="video-embed-box">
      <div class="embed-top-bar">
        <button type="button" class="video-stop-btn" aria-label="Close video (Esc)" title="Close video (Esc)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span class="esc-tag">Close</span>
        </button>
      </div>

      <div class="embed-loader" aria-hidden="true">
        <span class="loader-spinner"></span>
      </div>

      <iframe
        src="${iframeSrc}"
        title="${escapeHtml(video.title)}"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        loading="eager"
        onload="this.parentElement.querySelector('.embed-loader')?.remove();">
      </iframe>
    </div>
  `;
}

if (videoGrid) {
  videoGrid.addEventListener('click', (e) => {
    const stopBtn = e.target.closest('.video-stop-btn');
    if (stopBtn) {
      e.stopPropagation();
      stopCurrentVideo();
      return;
    }

    if (e.target.closest('.video-embed-box')) return;

    const card = e.target.closest('.video-card');
    if (card) playVideoInline(card);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentlyPlayingCard) {
    stopCurrentVideo();
  }
});

renderVideos();

// --------------------------------------------
// 3. NAVIGATION & SCROLL HANDLING
// --------------------------------------------
const siteHeader = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const sectionIds = ['about', 'projects', 'skills', 'contact'];
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    siteHeader?.classList.add('is-scrolled');
  } else {
    siteHeader?.classList.remove('is-scrolled');
  }
}, { passive: true });

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();

    navMenu?.classList.remove('is-open');
    navToggle?.classList.remove('is-active');
    navToggle?.setAttribute('aria-expanded', 'false');

    if (href === '#about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#about'));
      if (history.replaceState) history.replaceState(null, '', ' ');
      return;
    }

    const targetEl = document.querySelector(href);
    if (targetEl) {
      const headerOffset = 70;
      const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetPos),
        behavior: 'smooth'
      });
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === href));
      if (history.replaceState) history.replaceState(null, '', href);
    }
  });
});

function updateActiveNavLink() {
  if (window.scrollY < 120) {
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#about'));
    return;
  }

  const scrollMiddle = window.scrollY + 160;
  let currentSectionId = 'about';

  sections.forEach(sec => {
    if (sec.offsetTop <= scrollMiddle) {
      currentSectionId = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
  });
}

window.addEventListener('scroll', updateActiveNavLink, { passive: true });

// --------------------------------------------
// 4. TOAST NOTIFICATION
// --------------------------------------------
const toastNotice = document.getElementById('toastNotice');
let toastTimer = null;

function showToast(message) {
  if (!toastNotice) return;
  clearTimeout(toastTimer);
  toastNotice.textContent = message;
  toastNotice.classList.add('show');
  toastTimer = setTimeout(() => {
    toastNotice.classList.remove('show');
  }, 2200);
}
