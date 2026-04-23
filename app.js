// ============================================
// Just NO lol — App Logic
// ============================================

const API_URL = 'https://naas.isalman.dev/no';

// Funny quotes to pair with each rejection
const FUNNY_QUOTES = [
  "Because, lol... no",
  "The vibes said absolutely not.",
  "Your request has been received. And denied.",
  "404: Approval not found.",
  "This ain't it, chief.",
  "The stars aligned and they all said no.",
  "My gut feeling has filed a restraining order.",
  "Nope. Not today. Not ever. Bye.",
  "I consulted my magic 8-ball. It laughed.",
  "Hard pass. Soft no. Medium rejection.",
  "Even my therapist would say no to this.",
  "I'd rather fight a bear. In flip-flops.",
  "The council of NO has spoken.",
  "That's gonna be a yikes from me, dawg.",
  "I checked with future me. Still no.",
  "Error 403: Permission to yes — DENIED.",
  "My ancestors are shaking their heads.",
  "Respectfully, disrespectfully… no.",
  "My horoscope literally warned me about this.",
  "The WiFi of approval has disconnected.",
  "I ran the numbers. They ran away.",
  "Let me sleep on it. *snores indefinitely*",
  "My spirit animal just filed a complaint.",
  "That idea went straight to the recycle bin.",
  "I'll add it to my list of things I won't do.",
  "My brain left the chat.",
  "The audacity detector is off the charts.",
  "I'm not saying no forever. Just for eternity.",
  "Even autocorrect gave up on this one.",
  "I tried saying yes but my mouth said NO.",
];

// DOM Elements
const bigNoBtn = document.getElementById('big-no-btn');
const noReason = document.getElementById('no-reason');
const noQuote = document.getElementById('no-quote');
const noDisplay = document.getElementById('no-display');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const clearBtn = document.getElementById('clear-btn');
const counterText = document.getElementById('counter-text');
const copyMainBtn = document.getElementById('copy-main-btn');

// State
let history = [];
let totalCount = 0;
let isLoading = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Load history from localStorage
  const saved = localStorage.getItem('justno-history');
  if (saved) {
    try {
      history = JSON.parse(saved);
      totalCount = history.length;
      renderHistory();
      updateCounter();
    } catch (e) {
      history = [];
    }
  }

  // Create background particles
  createParticles();

  // Event listeners
  bigNoBtn.addEventListener('click', handleNoClick);
  clearBtn.addEventListener('click', handleClear);

  // Main copy button
  if (copyMainBtn) {
    copyMainBtn.addEventListener('click', () => {
      const reason = noReason.textContent;
      if (reason && reason !== 'Press the button to unleash the power of NO.') {
        copyToClipboard(reason, copyMainBtn);
      }
    });
  }
}

// ============================================
// API CALL
// ============================================
async function fetchNo() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return data.reason;
}

// ============================================
// MAIN HANDLER
// ============================================
async function handleNoClick(e) {
  if (isLoading) return;
  isLoading = true;

  // Ripple effect
  createRipple(e);

  // Button loading state
  bigNoBtn.classList.add('loading');
  const btnEmoji = bigNoBtn.querySelector('.btn-emoji');
  const origEmoji = btnEmoji.textContent;
  btnEmoji.textContent = '⏳';

  // Fade out current reason
  noReason.classList.add('loading');
  noQuote.classList.remove('visible');

  try {
    const reason = await fetchNo();
    const quote = getRandomQuote();
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Update display
    noReason.textContent = reason;
    noReason.classList.remove('loading');
    noReason.classList.remove('pop-in');
    // Force reflow
    void noReason.offsetWidth;
    noReason.classList.add('pop-in');

    noQuote.textContent = `"${quote}"`;
    noQuote.classList.add('visible');

    noDisplay.classList.add('active');

    // Show copy button
    if (copyMainBtn) {
      copyMainBtn.style.display = 'inline-flex';
    }

    // Screen shake
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);

    // Emoji burst
    createEmojiBurst();

    // Add to history
    const entry = {
      id: Date.now(),
      reason,
      quote,
      time: timestamp,
    };
    history.unshift(entry);
    totalCount++;

    // Save & render
    saveHistory();
    renderHistory();
    updateCounter();

  } catch (err) {
    noReason.textContent = 'The server also said NO. Try again? 😅';
    noReason.classList.remove('loading');
    noReason.classList.remove('pop-in');
    void noReason.offsetWidth;
    noReason.classList.add('pop-in');

    showToast('⚠️ API is being stubborn. Try again!');
  } finally {
    isLoading = false;
    bigNoBtn.classList.remove('loading');
    btnEmoji.textContent = origEmoji;
  }
}

// ============================================
// HISTORY RENDERING
// ============================================
function renderHistory() {
  if (history.length === 0) {
    historyEmpty.style.display = 'block';
    clearBtn.style.display = 'none';
    // Remove all items
    const items = historyList.querySelectorAll('.history-item');
    items.forEach(item => item.remove());
    return;
  }

  historyEmpty.style.display = 'none';
  clearBtn.style.display = 'inline-flex';

  // Clear existing items
  const existingItems = historyList.querySelectorAll('.history-item');
  existingItems.forEach(item => item.remove());

  // Render items (show last 50)
  const displayItems = history.slice(0, 50);
  displayItems.forEach((entry, idx) => {
    const item = createHistoryItem(entry, history.length - idx);
    item.style.animationDelay = `${idx * 0.05}s`;
    historyList.appendChild(item);
  });
}

function createHistoryItem(entry, number) {
  const div = document.createElement('div');
  div.className = 'history-item';
  div.innerHTML = `
    <div class="history-number">#${number}</div>
    <div class="history-content">
      <p class="history-reason">${escapeHTML(entry.reason)}</p>
      <div class="history-meta">
        <span class="history-quote">"${escapeHTML(entry.quote)}"</span>
        <span class="history-time">${escapeHTML(entry.time)}</span>
      </div>
    </div>
    <button class="copy-btn history-copy-btn" type="button" title="Copy to clipboard">
      <span class="copy-icon">📋</span>
    </button>
  `;

  // Attach copy handler
  const copyBtn = div.querySelector('.history-copy-btn');
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(entry.reason, copyBtn);
  });

  return div;
}

// ============================================
// CLEAR HISTORY
// ============================================
function handleClear() {
  history = [];
  totalCount = 0;
  saveHistory();
  renderHistory();
  updateCounter();

  // Reset display
  noReason.textContent = 'Press the button to unleash the power of NO.';
  noReason.classList.remove('pop-in');
  noQuote.textContent = '';
  noQuote.classList.remove('visible');
  noDisplay.classList.remove('active');

  showToast('🗑️ All rejections erased. A fresh start!');
}

// ============================================
// HELPERS
// ============================================
function getRandomQuote() {
  return FUNNY_QUOTES[Math.floor(Math.random() * FUNNY_QUOTES.length)];
}

function updateCounter() {
  const plural = totalCount === 1 ? 'rejection' : 'rejections';
  counterText.textContent = `${totalCount} ${plural} served`;
}

function saveHistory() {
  localStorage.setItem('justno-history', JSON.stringify(history));
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    const iconEl = btn.querySelector('.copy-icon');
    const labelEl = btn.querySelector('.copy-label');
    const origIcon = iconEl.textContent;
    const origLabel = labelEl ? labelEl.textContent : null;

    iconEl.textContent = '✅';
    if (labelEl) labelEl.textContent = 'Copied!';
    btn.classList.add('copied');

    showToast('📋 Copied to clipboard!');

    setTimeout(() => {
      iconEl.textContent = origIcon;
      if (labelEl) labelEl.textContent = origLabel;
      btn.classList.remove('copied');
    }, 1500);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 Copied to clipboard!');
  }
}

// ============================================
// VISUAL EFFECTS
// ============================================
function createRipple(e) {
  const btn = bigNoBtn;
  const ripple = document.getElementById('btn-ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.remove('animate');
  void ripple.offsetWidth;
  ripple.classList.add('animate');

  setTimeout(() => ripple.classList.remove('animate'), 600);
}

function createEmojiBurst() {
  const emojis = ['🚫', '❌', '🙅', '💀', '😤', '🖐️', '👎', '🤚', '⛔', '🔥'];
  const btn = bigNoBtn.getBoundingClientRect();
  const centerX = btn.left + btn.width / 2;
  const centerY = btn.top + btn.height / 2;

  for (let i = 0; i < 8; i++) {
    const span = document.createElement('span');
    span.className = 'emoji-burst';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5);
    const distance = 80 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 60;
    const rot = (Math.random() - 0.5) * 720;

    span.style.left = `${centerX}px`;
    span.style.top = `${centerY}px`;
    span.style.setProperty('--tx', `${tx}px`);
    span.style.setProperty('--ty', `${ty}px`);
    span.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1000);
  }
}

function createParticles() {
  const container = document.getElementById('bg-particles');
  const colors = ['rgba(255,60,95,0.3)', 'rgba(255,107,138,0.2)', 'rgba(255,160,122,0.15)'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = `${8 + Math.random() * 15}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(particle);
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// ============================================
// KEYBOARD SHORTCUT
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
    e.preventDefault();
    bigNoBtn.click();
  }
});

// ============================================
// COOKIE CONSENT
// ============================================
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function initConsent() {
  const banner = document.getElementById('consent-banner');
  const acceptBtn = document.getElementById('consent-accept');
  const declineBtn = document.getElementById('consent-decline');

  if (!banner) return;

  const consent = getCookie('justno-consent');

  if (consent) {
    // Already consented or declined — hide banner
    banner.style.display = 'none';
    return;
  }

  // Show banner after a short delay
  setTimeout(() => {
    banner.classList.add('visible');
  }, 1500);

  acceptBtn.addEventListener('click', () => {
    setCookie('justno-consent', 'accepted', 365);
    banner.classList.remove('visible');
    banner.classList.add('hidden');
    showToast('👍 Cool! Your rejections are being saved locally.');
  });

  declineBtn.addEventListener('click', () => {
    setCookie('justno-consent', 'declined', 365);
    banner.classList.remove('visible');
    banner.classList.add('hidden');
    // Clear any existing localStorage data
    localStorage.removeItem('justno-history');
    history = [];
    totalCount = 0;
    renderHistory();
    updateCounter();
    showToast('🤷 No worries. History won\'t be saved.');
  });
}

// ============================================
// START
// ============================================
init();
initConsent();

// ============================================
// RATE LIMIT BANNER
// ============================================
(function initRateLimitBanner() {
  const banner = document.getElementById('rate-limit-banner');
  const closeBtn = document.getElementById('rate-limit-close');
  if (!banner || !closeBtn) return;

  // Check if already dismissed this session
  if (sessionStorage.getItem('justno-rate-limit-dismissed')) {
    banner.classList.add('dismissed');
    return;
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.add('dismissed');
    sessionStorage.setItem('justno-rate-limit-dismissed', '1');
  });
})();
