/* ============================================================
   cp_1.js  –  User Feedback Form Logic
   Covers:
     • DOM manipulation & event listeners
     • Real-time character counting (input event)
     • Tooltip show/hide (mouseover / mouseout)
     • Form validation with preventDefault
     • Event bubbling & delegation
     • stopPropagation on the card to prevent background clicks
     • Dynamic feedback entry appending
============================================================ */

// ── Element References ──────────────────────────────────────
const form          = document.getElementById('feedback-form');
const nameInput     = document.getElementById('name');
const emailInput    = document.getElementById('email');
const commentsInput = document.getElementById('comments');
const feedbackDiv   = document.getElementById('feedback-display');
const fbHeading     = document.getElementById('fb-heading');
const toast         = document.getElementById('toast');
const card          = document.getElementById('form-card');

// ── Tooltip map: fieldId → tooltipId ───────────────────────
const tooltipMap = {
  'name'    : 'tip-name',
  'email'   : 'tip-email',
  'comments': 'tip-comments'
};

// ── Character Counter Helper ────────────────────────────────
function updateCounter(field, counterId) {
  const counter = document.getElementById(counterId);
  const max     = parseInt(field.getAttribute('maxlength'), 10);
  const len     = field.value.length;
  counter.textContent = `${len} / ${max}`;

  // Colour feedback: warn at 80%, limit at 100%
  counter.classList.remove('warn', 'limit');
  if (len >= max)             counter.classList.add('limit');
  else if (len >= max * 0.8)  counter.classList.add('warn');
}

// ── Event Delegation on the FORM ───────────────────────────
// Handles 'input', 'mouseover', 'mouseout' for all children
// via a single listener on the parent form (delegation).
form.addEventListener('input', function (e) {
  const target = e.target;

  // Real-time character count
  if (target.id === 'name')     updateCounter(target, 'counter-name');
  if (target.id === 'email')    updateCounter(target, 'counter-email');
  if (target.id === 'comments') updateCounter(target, 'counter-comments');

  // Clear validation error as user types
  clearError(target);
});

// Tooltip show via delegation (mouseover bubbles up to form)
form.addEventListener('mouseover', function (e) {
  const id = e.target.id;
  if (tooltipMap[id]) {
    document.getElementById(tooltipMap[id]).classList.add('visible');
  }
});

// Tooltip hide via delegation (mouseout bubbles up to form)
form.addEventListener('mouseout', function (e) {
  const id = e.target.id;
  if (tooltipMap[id]) {
    document.getElementById(tooltipMap[id]).classList.remove('visible');
  }
});

// ── Keyboard Event: Escape clears focused field ─────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      active.value = '';
      // Trigger counter update manually after clearing
      active.dispatchEvent(new Event('input'));
    }
  }
});

// ── stopPropagation: card stops background click events ─────
// Prevents any click inside the card from reaching the body.
card.addEventListener('click', function (e) {
  e.stopPropagation();
});

// Background click handler (would fire without stopPropagation)
document.body.addEventListener('click', function () {
  console.log('Background clicked (outside card)');
});

// ── Validation Helpers ──────────────────────────────────────
function showError(field, msgId) {
  field.classList.add('invalid');
  document.getElementById(msgId).classList.add('show');
}

function clearError(field) {
  field.classList.remove('invalid');
  const errId = 'err-' + field.id;
  const errEl = document.getElementById(errId);
  if (errEl) errEl.classList.remove('show');
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

// ── Form Submission ─────────────────────────────────────────
form.addEventListener('submit', function (e) {
  e.preventDefault(); // Always prevent default first

  let valid = true;

  // Validate Name
  if (nameInput.value.trim() === '') {
    showError(nameInput, 'err-name');
    valid = false;
  }

  // Validate Email
  if (!isValidEmail(emailInput.value)) {
    showError(emailInput, 'err-email');
    valid = false;
  }

  // Validate Comments
  if (commentsInput.value.trim() === '') {
    showError(commentsInput, 'err-comments');
    valid = false;
  }

  if (!valid) return; // Stop if any field is invalid

  // Append feedback entry dynamically
  appendFeedback(
    nameInput.value.trim(),
    emailInput.value.trim(),
    commentsInput.value.trim()
  );

  // Reset form
  form.reset();
  ['name', 'email', 'comments'].forEach(id => {
    const field = document.getElementById(id);
    const counter = document.getElementById('counter-' + id);
    const max = field.getAttribute('maxlength');
    counter.textContent = `0 / ${max}`;
    counter.classList.remove('warn', 'limit');
  });

  showToast();
});

// ── Append Feedback Entry ───────────────────────────────────
function appendFeedback(name, email, comment) {
  fbHeading.style.display = 'block';

  const entry = document.createElement('div');
  entry.classList.add('feedback-entry');

  const now = new Date().toLocaleString();

  entry.innerHTML = `
    <div class="fe-name">${escapeHTML(name)}</div>
    <div class="fe-email">${escapeHTML(email)}</div>
    <div class="fe-comment">${escapeHTML(comment)}</div>
    <div class="fe-time">Submitted: ${now}</div>
  `;

  // Insert newest entry at the top
  feedbackDiv.insertBefore(entry, fbHeading.nextSibling);
}

// ── Toast Notification ──────────────────────────────────────
function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Security: Escape HTML to prevent XSS ───────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
