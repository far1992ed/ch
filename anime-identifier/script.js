/* ============================================================
   Anime Snapshot Identifier
   1) trace.moe API  -> anime name + episode + timestamp (free)
   2) AniList GraphQL -> extra details (cover, score...)
   ============================================================ */

'use strict';

const dropZone   = document.getElementById('dropZone');
const fileInput  = document.getElementById('fileInput');
const pickBtn    = document.getElementById('pickBtn');
const previewBox = document.getElementById('previewBox');
const previewImg = document.getElementById('previewImg');
const resetBtn   = document.getElementById('resetBtn');
const searchBtn  = document.getElementById('searchBtn');
const statusEl   = document.getElementById('status');
const resultsEl  = document.getElementById('results');

let selectedFile = null;

// ---------- pick image ----------
pickBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
});

// ---------- drag and drop ----------
['dragover', 'dragenter'].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  })
);
dropZone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) setFile(file);
});

// ---------- set selected file ----------
function setFile(file) {
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewBox.hidden = false;
    searchBtn.disabled = false;
    showStatus('', null);
  };
  reader.readAsDataURL(file);
}

resetBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  previewImg.src = '';
  previewBox.hidden = true;
  searchBtn.disabled = true;
  hideStatus();
  hideResults();
});

// ---------- status messages ----------
function showStatus(msg, type) {
  statusEl.hidden = false;
  statusEl.className = 'status ' + (type || '');
  statusEl.innerHTML = type === 'loading'
    ? '<span class="spinner"></span>' + msg
    : msg;
}
function hideStatus() { statusEl.hidden = true; }
function hideResults() {
  resultsEl.hidden = true;
  resultsEl.innerHTML = '';
}

// ---------- search ----------
searchBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  hideResults();
  showStatus('جارٍ البحث في ملايين المشاهد... قد يستغرق ثوانٍ', 'loading');
  searchBtn.disabled = true;
  try {
    const best = await identifyAnime(selectedFile);
    hideStatus();
    renderResults(best);
  } catch (err) {
    showStatus('❌ ' + (err.message || 'حدث خطأ أثناء البحث، حاول مرة أخرى'), 'error');
  } finally {
    searchBtn.disabled = false;
  }
});

// ---------- trace.moe API ----------
async function identifyAnime(file) {
  const base64 = await fileToBase64(file);

  const res = await fetch('https://api.trace.moe/search', {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: dataURLtoBlob(base64),
  });

  if (res.status === 429) throw new Error('تم تجاوز الحد المسموح من الطلبات، انتظر قليلاً ثم حاول مجدداً');
  if (!res.ok) throw new Error('تعذّر الاتصال بخدمة التعرّف، حاول لاحقاً');

  const data = await res.json();

  if (!data.result || data.result.length === 0) {
    throw new Error('لم نعثر على تطابق! جرّب لقطة شاشة أوضح أو من مشهد مختلف');
  }

  const filtered = data.result.filter((r) => (r.similarity || 0) >= 0.5);
  if (filtered.length === 0) {
    throw new Error('التشابه ضعيف جداً — الصورة قد لا تكون مشهداً حقيقياً من أنمي');
  }

  return { top: filtered[0], others: filtered.slice(1, 4) };
}

// ---------- render results ----------
async function renderResults(payload) {
  const top = payload.top;
  const others = payload.others;
  resultsEl.hidden = false;
  resultsEl.innerHTML = '';

  resultsEl.appendChild(buildCard(top, true));

  if (others.length > 0) {
    const heading = document.createElement('p');
    heading.textContent = 'احتمالات أخرى:';
    heading.style.cssText = 'color: var(--text-dim); margin: 14px 0 6px; font-size: 0.9rem;';
    resultsEl.appendChild(heading);
    others.forEach((r) => resultsEl.appendChild(buildCard(r, false)));
  }

  enrichTopCard(top);
}

function buildCard(r, isTop) {
  const similarityPct = Math.round((r.similarity || 0) * 100);
  const time = formatTime(r.from || 0);

  const card = document.createElement('div');
  card.className = 'result-card';

  const titleEn = (r.filename || '').replace(/\.[^.]+$/, '');
  const animeName =
    (r.anilist && r.anilist.title && (r.anilist.title.romaji || r.anilist.title.english)) || titleEn;
  const animeNameNative = (r.anilist && r.anilist.title && r.anilist.title.native) || '';

  card.innerHTML = `
    <div class="result-top">
      <div class="result-info">
        ${isTop ? '<h2>✨ أفضل تطابق</h2>' : '<h2>احتمال</h2>'}
        <p class="title-en">${escapeHtml(animeName)}</p>
        ${animeNameNative ? '<p class="title-jp">' + escapeHtml(animeNameNative) + '</p>' : ''}
        <div class="badges">
          <span class="badge ep">📺 الحلقة: ${escapeHtml(String(r.episode || '؟'))}</span>
          <span class="badge time">⏱️ الدقيقة: ${time}</span>
          <span class="badge">🎯 التشابه: ${similarityPct}%</span>
        </div>
        <div class="similarity">
          <div class="similarity-fill" style="width: 0%"></div>
        </div>
        <p class="similarity-text">درجة الثقة في التطابق</p>
        ${isTop ? '<a class="more-link" target="_blank" rel="noopener">مشاهدة المقطع الأصلي من trace.moe...</a>' : ''}
      </div>
    </div>
    ${r.image ? '<img class="match-img" src="' + r.image + '" alt="المشهد المطابق" loading="lazy" />' : ''}
  `;

  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = card.querySelector('.similarity-fill');
      if (fill) fill.style.width = similarityPct + '%';
    }, 100);
  });

  if (isTop && r.video) {
    const link = card.querySelector('.more-link');
    if (link) link.href = r.video;
  }

  return card;
}

// ---------- AniList enrichment ----------
async function enrichTopCard(top) {
  const anilistId = top.anilist && top.anilist.id;
  if (!anilistId) return;

  const query = 'query ($id: Int) { Media (id: $id, type: ANIME) { coverImage { extraLarge } averageScore seasonYear format } }';

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: query, variables: { id: anilistId } }),
    });
    const data = await res.json();
    const media = data.data && data.data.Media;
    if (!media) return;

    const firstCard = document.querySelector('.result-card .result-top');
    if (!firstCard) return;

    if (media.coverImage && media.coverImage.extraLarge) {
      const img = document.createElement('img');
      img.className = 'result-cover';
      img.src = media.coverImage.extraLarge;
      img.alt = 'غلاف الأنمي';
      img.loading = 'lazy';
      firstCard.prepend(img);
    }

    const info = firstCard.querySelector('.result-info');
    if (info) {
      const badges = info.querySelector('.badges');
      if (media.averageScore) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = '⭐ تقييم AniList: ' + media.averageScore + '%';
        badges.appendChild(b);
      }
      if (media.seasonYear) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = '🗓️ ' + media.seasonYear;
        badges.appendChild(b);
      }
    }
  } catch (err) {
    /* optional enrichment - ignore failure */
  }
}

// ---------- helpers ----------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('تعذّر قراءة الصورة'));
    reader.readAsDataURL(file);
  });
}

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const head = parts[0];
  const body = parts[1];
  const mime = head.match(/:(.*?);/)[1];
  const bytes = atob(body);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
