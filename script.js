/* ═══════════════════════════════════════════════
   HORROR DATING EXPERIENCE — script.js
   ═══════════════════════════════════════════════ */

// ── STATE ──────────────────────────────────────
let profileIndex = 0;
let postWarning  = false;
let swipeCount   = 0;
let popupTimer   = null;
let govShown     = false;

// ── PROFILES DATA ──────────────────────────────
// Images: 0–4 = normal → uncanny. Phase drives horror level.
const profiles = [
  {
    name: "JESSICA M.",
    age: 23,
    interests: "Hiking, Netflix, cooking.",
    distance: "8 miles away",
    bio: "Just a normal girl looking for fun :) love dogs and long walks!!",
    img: "assets/profile1.png",
    phase: 0
  },
  {
    name: "MIKE R.",
    age: 27,
    interests: "Gaming, music, travel.",
    distance: "14 miles away",
    bio: "Easy going guy. Looking for someone real to share good times with haha.",
    img: "assets/profile2.png",
    phase: 0
  },
  {
    name: "SARA_09",
    age: 21,
    interests: "Photography, eating, chilling.",
    distance: "20 miles away",
    bio: "I am a HOT girl looking for company ;) Text me to have a good time hehe <3 xoxo",
    img: "assets/profile3.png",
    phase: 1
  },
  {
    name: "USER_4471",
    age: 19,
    interests: "Hiking, eating, chilling.",
    distance: "3 miles away",
    bio: "I love people. I love meeting people. I love to be around people. Are you people?",
    img: "assets/profile4.png",
    phase: 2
  },
  {
    name: "NATA ORDOñEZ",
    age: 20,
    interests: "Being near you. Watching. Waiting.",
    distance: "0 miles away",
    bio: "I know you. I have always known you. Please do not run. It only makes it worse.",
    img: "assets/profile5.png",
    phase: 3
  },
  // Post-warning profiles (more uncanny)
  {
    name: "UNIT_001",
    age: 24,
    interests: "Observing. Recording. Replicating.",
    distance: "12 miles away",
    bio: "We are compatible. You are compatible. Please accept. Please accept. Please accept.",
    img: "assets/profile4.png",
    phase: 3
  },
  {
    name: "___",
    age: "??",
    interests: "You.",
    distance: "inside",
    bio: "do not open the door do not open the door do not open the door do not open the door",
    img: "assets/profile5.png",
    phase: 3
  }
];

// ── CHAT SCRIPTS (per profile, keyed by profile name) ─────────────────────
// Each entry is an array of message objects: { from:'them'|'me_auto', text, delay, eerie }
// 'me_auto' = a suggested user reply shown as placeholder text (not sent automatically)
const chatScripts = {
  "JESSICA M.": [
    { from:'them', text:"omg hi!! so happy we matched hehe 😊", delay:1200 },
    { from:'them', text:"what are you up to tonight?", delay:2800 },
    { from:'them', text:"we should totally hang out sometime!!", delay:5000 }
  ],
  "MIKE R.": [
    { from:'them', text:"hey! nice to meet you :)", delay:1000 },
    { from:'them', text:"so uh what kind of music do you like", delay:3000 },
    { from:'them', text:"i play guitar btw. just saying haha", delay:5500 }
  ],
  "SARA_09": [
    { from:'them', text:"heyyy ;)", delay:900 },
    { from:'them', text:"i saw your profile and i thought wow. just. wow.", delay:2500 },
    { from:'them', text:"do you ever feel like someone is watching you", delay:5000 },
    { from:'them', text:"i mean like. in a cute way lol", delay:6200, eerie:false }
  ],
  "USER_4471": [
    { from:'them', text:"HELLO.", delay:800 },
    { from:'them', text:"I AM HAPPY TO MEET YOU. I AM A PERSON.", delay:2000 },
    { from:'them', text:"I ENJOY HUMAN ACTIVITIES SUCH AS EATING AND BREATHING.", delay:4000 },
    { from:'them', text:"YOU ARE VERY CLOSE TO ME.", delay:6500, eerie:true }
  ],
  "NATA ORDOñEZ": [
    { from:'them', text:"i knew you would say yes", delay:600, eerie:true },
    { from:'them', text:"i have been watching your choices", delay:2000, eerie:true },
    { from:'them', text:"you rejected the others but not me", delay:3800, eerie:true },
    { from:'them', text:"does that mean you feel it too", delay:5800, eerie:true }
  ],
  "UNIT_001": [
    { from:'them', text:"COMPATIBILITY INDEX: 99.7%", delay:700, eerie:true },
    { from:'them', text:"we are the same. we want the same things.", delay:2200, eerie:true },
    { from:'them', text:"do not be afraid. we are already very close.", delay:4500, eerie:true },
    { from:'them', text:"do not open the door.", delay:7000, eerie:true }
  ],
  "___": [
    { from:'them', text:"...", delay:1500, eerie:true },
    { from:'them', text:"you can hear me can't you", delay:3500, eerie:true },
    { from:'them', text:"then why won't you answer", delay:6000, eerie:true },
    { from:'them', text:"i'm right outside.", delay:9000, eerie:true }
  ]
};

// Fallback script for unknown profiles (post-warning)
const eerieDefaultScript = [
  { from:'them', text:"hello.", delay:800, eerie:true },
  { from:'them', text:"i can see you.", delay:3000, eerie:true },
  { from:'them', text:"stay.", delay:5500, eerie:true }
];

// Responses to user messages — escalate by phase
const autoResponses = {
  0: ["haha yeah totally!", "omg same!!", "that's so cool :)", "tell me more about yourself!", "aw you're so sweet lol"],
  1: ["haha yeah...", "i know what you mean", "sometimes i feel like that too", "it's funny you said that"],
  2: ["i know.", "i already knew you'd say that.", "you always say that.", "does it matter?", "...why did you type that"],
  3: ["do not type. just listen.", "we are running out of time.", "they will see this.", "you know what you have to do.", "do not open the door."]
};

let chatState = {
  profile: null,
  scriptIndex: 0,
  responseCount: 0,
  scriptTimer: null,
  phase: 0
};

// ── WIN POPUP MESSAGES ─────────────────────────
const popupMessages = [
  { title: "HOTS.COM Notification", msg: "You have a new match!" },
  { title: "HOTS.COM Notification", msg: "Someone wants to talk to you..." },
  { title: "New Message Received", msg: "She sent you a message. Click to reply." },
  { title: "HOTS.COM Alert", msg: "3 people liked your profile today!" },
  { title: "New Message Received", msg: "They're waiting for your reply..." },
  { title: "System Notice", msg: "Your session is being monitored for safety." }
];

// ── CLOCK ──────────────────────────────────────
function updateClock() {
  const el = document.getElementById('taskbar-clock');
  if (!el) return;
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  el.textContent = `${h}:${String(m).padStart(2,'0')} ${ampm}`;
}
setInterval(updateClock, 30000);
updateClock();

// ── SCREEN MANAGEMENT ─────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  const el = document.getElementById(id);

  if (id === 'screen-browser') {
    el.style.display = 'flex';
  } else {
    el.style.display = 'block';
  }

  requestAnimationFrame(() => el.classList.add('active'));
}

function showPage(id) {
  document.querySelectorAll('.browser-page').forEach(p => {
    p.classList.remove('active-page');
    p.style.display = 'none';
  });
  const el = document.getElementById(id);
  el.style.display = 'block';
  requestAnimationFrame(() => el.classList.add('active-page'));
}

// ── DESKTOP ────────────────────────────────────
function openBrowser() {
  triggerGlitchFlash(80);
  setTimeout(() => {
    showScreen('screen-browser');
    document.getElementById('address-input').value = 'http://www.hots.com/index.html';
    showPage('page-landing');
    startVhsCanvas();
  }, 100);
}

function closeBrowser() {
  showScreen('screen-desktop');
  stopPopupTimer();
}

// ── LANDING → PROFILES ─────────────────────────
function goToProfiles() {
  triggerGlitchFlash(120);
  setTimeout(() => {
    document.getElementById('address-input').value = 'http://www.hots.com/browse.html';
    showPage('page-profiles');
    profileIndex = 0;
    swipeCount = 0;
    loadProfile(profileIndex);
    startPopupTimer();
    startVhsCanvas();
  }, 140);
}

// ── PROFILES ───────────────────────────────────
function loadProfile(idx) {
  const p = profiles[Math.min(idx, profiles.length - 1)];
  const phase = postWarning ? Math.max(p.phase, 2) : p.phase;

  // Animate transition
  const panel = document.getElementById('profile-info-panel');
  const photoWrap = document.getElementById('profile-photo-wrap');
  panel.style.opacity = '0';
  photoWrap.style.opacity = '0';

  setTimeout(() => {
    document.getElementById('profile-name').textContent = p.name;
    document.getElementById('profile-age').textContent = p.age;
    document.getElementById('profile-interests').textContent = p.interests;
    document.getElementById('profile-distance').textContent = p.distance;
    document.getElementById('profile-bio').innerHTML = p.bio;
    document.getElementById('profile-photo').src = p.img;

    applyPhaseEffects(phase);

    panel.style.opacity = '1';
    photoWrap.style.opacity = '1';
    panel.style.transition = 'opacity 0.5s';
    photoWrap.style.transition = 'opacity 0.6s';
  }, 300);
}

function applyPhaseEffects(phase) {
  const photo = document.getElementById('profile-photo');
  const nameEl = document.getElementById('profile-name');

  // Remove previous classes
  nameEl.classList.remove('glitch-text');

  if (phase === 0) {
    photo.style.filter = 'grayscale(30%) contrast(0.9) brightness(0.9)';
    photo.style.animationDuration = '8s';
  } else if (phase === 1) {
    photo.style.filter = 'grayscale(60%) contrast(1.1) brightness(0.75) sepia(20%)';
    photo.style.animationDuration = '5s';
  } else if (phase === 2) {
    photo.style.filter = 'grayscale(80%) contrast(1.3) brightness(0.6) hue-rotate(180deg)';
    photo.style.animationDuration = '3s';
    nameEl.classList.add('glitch-text');
    triggerGlitchFlash(60);
  } else if (phase >= 3) {
    photo.style.filter = 'grayscale(100%) contrast(2) brightness(0.4) hue-rotate(220deg) invert(10%)';
    photo.style.animationDuration = '1.5s';
    nameEl.classList.add('glitch-text');
    triggerGlitchFlash(100);
    // Flicker the page
    setTimeout(() => triggerGlitchFlash(80), 400);
  }
}

function rejectProfile() {
  swipeCount++;
  advanceProfile();
}

function acceptProfile() {
  swipeCount++;
  // Open chat instead of advancing immediately
  const p = profiles[Math.min(profileIndex, profiles.length - 1)];
  const phase = postWarning ? Math.max(p.phase, 2) : p.phase;
  openChat(p, phase);
}

function advanceProfile() {
  // Trigger government warning at swipe 4 (before it was shown)
  if (swipeCount === 4 && !govShown) {
    showGovPopup();
    return;
  }

  profileIndex++;
  if (profileIndex >= profiles.length) {
    // Loop through uncanny profiles at the end
    profileIndex = Math.max(3, profiles.length - 3);
  }
  loadProfile(profileIndex);
}

// ── VHS CANVAS EFFECT ─────────────────────────
let vhsAnimId = null;
function startVhsCanvas() {
  const canvas = document.getElementById('vhs-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const wrap = document.getElementById('profile-photo-wrap');
    if (!wrap) return;
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
  }
  resize();

  function drawNoise() {
    if (!document.getElementById('page-profiles').classList.contains('active-page')) {
      vhsAnimId = requestAnimationFrame(drawNoise);
      return;
    }
    resize();
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    // Scanlines
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.04})`;
      ctx.fillRect(0, y, w, 2);
    }

    // Random noise specks
    const intensity = postWarning ? 0.12 : 0.06;
    for (let i = 0; i < w * h * intensity; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const bright = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${bright},${bright},${bright},0.25)`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Occasional horizontal tracking glitch bar
    if (Math.random() < (postWarning ? 0.12 : 0.04)) {
      const barY = Math.random() * h;
      const barH = 2 + Math.random() * 8;
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.2})`;
      ctx.fillRect(0, barY, w, barH);
    }

    // Color bleed / chromatic aberration
    if (Math.random() < (postWarning ? 0.08 : 0.02)) {
      const lineY = Math.random() * h;
      ctx.fillStyle = 'rgba(255,0,0,0.15)';
      ctx.fillRect(0, lineY, w, 1);
      ctx.fillStyle = 'rgba(0,255,255,0.15)';
      ctx.fillRect(2, lineY, w, 1);
    }

    vhsAnimId = requestAnimationFrame(drawNoise);
  }
  if (vhsAnimId) cancelAnimationFrame(vhsAnimId);
  drawNoise();
}

// ── WIN POPUP (match notifications) ───────────
function startPopupTimer() {
  stopPopupTimer();
  // First popup after 15–30 seconds
  const delay = 15000 + Math.random() * 15000;
  popupTimer = setTimeout(scheduleNextPopup, delay);
}

function scheduleNextPopup() {
  // Only show if profiles page is active and gov popup not showing
  const profilesActive = document.getElementById('page-profiles').classList.contains('active-page');
  const govHidden = document.getElementById('gov-popup').classList.contains('hidden');
  if (profilesActive && govHidden) showWinPopup();
  // Next popup: 20–45 seconds later
  const delay = 20000 + Math.random() * 25000;
  popupTimer = setTimeout(scheduleNextPopup, delay);
}

function stopPopupTimer() {
  if (popupTimer) { clearTimeout(popupTimer); popupTimer = null; }
}

function showWinPopup() {
  const data = popupMessages[Math.floor(Math.random() * popupMessages.length)];
  document.getElementById('win-popup-title-text').textContent = data.title;
  document.getElementById('win-popup-msg').textContent = data.msg;
  const popup = document.getElementById('win-popup');
  // Randomize position slightly
  const tx = (Math.random() - 0.5) * 200;
  const ty = (Math.random() - 0.5) * 150;
  popup.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
  popup.classList.remove('hidden');
  // Auto-close after 6 seconds
  setTimeout(() => closeWinPopup(), 6000);
}

function closeWinPopup() {
  document.getElementById('win-popup').classList.add('hidden');
}

// ── GOVERNMENT WARNING POPUP ──────────────────
function showGovPopup() {
  govShown = true;
  stopPopupTimer();
  triggerGlitchFlash(200);
  setTimeout(() => {
    document.getElementById('gov-overlay').classList.remove('hidden');
    document.getElementById('gov-popup').classList.remove('hidden');
  }, 220);
}

function closeGovPopup() {
  document.getElementById('gov-overlay').classList.add('hidden');
  document.getElementById('gov-popup').classList.add('hidden');

  // Mark post-warning state
  postWarning = true;
  document.body.classList.add('post-warning');

  // Dramatic glitch sequence
  triggerGlitchFlash(150);
  setTimeout(() => triggerGlitchFlash(100), 300);
  setTimeout(() => triggerGlitchFlash(80), 600);

  // Continue profiles with darker tone
  setTimeout(() => {
    profileIndex++;
    if (profileIndex >= profiles.length) profileIndex = profiles.length - 2;
    loadProfile(profileIndex);
    startPopupTimer();
  }, 700);
}

function tryPlayVideo() {
  const video = document.getElementById('gov-video');
  const placeholder = document.getElementById('gov-video-placeholder');
  // Check if video source is accessible
  video.style.display = 'block';
  placeholder.style.display = 'none';
  video.play().catch(() => {
    // Video file not found — show placeholder again
    video.style.display = 'none';
    placeholder.style.display = 'block';
    placeholder.innerHTML = '⚠ Video file not found.<br/><small>Place your video at <code>assets/warning.mp4</code></small>';
  });
}

// ── GLITCH FLASH ──────────────────────────────
function triggerGlitchFlash(durationMs) {
  const el = document.getElementById('glitch-flash');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), durationMs);
}

// ── RANDOM AMBIENT GLITCHES ───────────────────
function ambientGlitch() {
  const profilesActive = document.getElementById('page-profiles') &&
    document.getElementById('page-profiles').classList.contains('active-page');
  if (profilesActive) {
    const roll = Math.random();
    // Rare screen flicker
    if (roll < (postWarning ? 0.08 : 0.02)) {
      triggerGlitchFlash(50 + Math.random() * 100);
    }
    // Subtle text distortion on bio
    if (roll < (postWarning ? 0.05 : 0.01)) {
      const bio = document.getElementById('profile-bio');
      if (bio) {
        const orig = bio.innerHTML;
        bio.style.transform = `translateX(${(Math.random()-0.5)*4}px)`;
        setTimeout(() => { bio.style.transform = ''; }, 200);
      }
    }
  }
  const delay = 3000 + Math.random() * 7000;
  setTimeout(ambientGlitch, delay);
}

// ── CHAT SYSTEM ───────────────────────────────
function openChat(profile, phase) {
  // Reset state
  chatState.profile = profile;
  chatState.scriptIndex = 0;
  chatState.responseCount = 0;
  chatState.phase = phase;
  if (chatState.scriptTimer) clearTimeout(chatState.scriptTimer);

  // Populate header
  document.getElementById('chat-title-name').textContent = profile.name + ' — Chat';
  document.getElementById('chat-strip-name').textContent = profile.name;
  document.getElementById('chat-typing-name').textContent = profile.name.split(' ')[0];
  document.getElementById('chat-profile-thumb').src = profile.img;

  // Clear messages
  const feed = document.getElementById('chat-messages');
  feed.innerHTML = '';

  // System message
  appendChatMsg('system-msg', '✨ You matched with ' + profile.name + ' ✨');

  // Show popup
  document.getElementById('chat-overlay').classList.remove('hidden');
  document.getElementById('chat-popup').classList.remove('hidden');

  // Start scripted messages
  const script = chatScripts[profile.name] || eerieDefaultScript;
  runChatScript(script);
}

function runChatScript(script) {
  if (chatState.scriptIndex >= script.length) return;
  const msg = script[chatState.scriptIndex];
  chatState.scriptIndex++;

  // Show typing indicator
  const typingEl = document.getElementById('chat-typing');
  typingEl.classList.remove('hidden');

  chatState.scriptTimer = setTimeout(() => {
    typingEl.classList.add('hidden');
    appendChatMsg('them' + (msg.eerie ? ' eerie' : ''), msg.text);

    // Queue next
    const script2 = chatScripts[chatState.profile.name] || eerieDefaultScript;
    if (chatState.scriptIndex < script2.length) {
      const next = script2[chatState.scriptIndex];
      const gap = (next.delay - msg.delay) || 2000;
      chatState.scriptTimer = setTimeout(() => runChatScript(script2), Math.max(gap, 800));
    }
  }, msg.delay);
}

function appendChatMsg(cls, text) {
  const feed = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + cls;
  div.textContent = text;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendChatMsg('me', text);

  // Auto-response after typing delay
  const phase = chatState.phase;
  const typingEl = document.getElementById('chat-typing');
  typingEl.classList.remove('hidden');

  setTimeout(() => {
    typingEl.classList.add('hidden');
    const pool = autoResponses[Math.min(phase, 3)];
    const reply = pool[chatState.responseCount % pool.length];
    chatState.responseCount++;
    const isEerie = phase >= 2;
    appendChatMsg('them' + (isEerie ? ' eerie' : ''), reply);

    // Post-warning: occasional extra unsettling message
    if (postWarning && Math.random() < 0.4) {
      setTimeout(() => {
        typingEl.classList.remove('hidden');
        setTimeout(() => {
          typingEl.classList.add('hidden');
          appendChatMsg('them eerie', eerieDefaultScript[Math.floor(Math.random()*eerieDefaultScript.length)].text);
        }, 1500);
      }, 2000);
    }
  }, 1200 + Math.random() * 1000);
}

function continueChat() {
  // Hide action row
  document.getElementById('chat-action-row').style.display = 'none';
  document.getElementById('chat-input').focus();

  // Phase 3 (final profiles) = game over path
  if (chatState.phase >= 3) {
    const typingEl = document.getElementById('chat-typing');
    // Sequence: eerie final message → screen fades → game over
    setTimeout(() => {
      typingEl.classList.remove('hidden');
      setTimeout(() => {
        typingEl.classList.add('hidden');
        appendChatMsg('them eerie', 'good. i was hoping you would stay.');
      }, 2000);
    }, 1500);

    setTimeout(() => {
      typingEl.classList.remove('hidden');
      setTimeout(() => {
        typingEl.classList.add('hidden');
        appendChatMsg('them eerie', 'you were always going to say yes.');
      }, 1800);
    }, 5000);

    setTimeout(() => {
      typingEl.classList.remove('hidden');
      setTimeout(() => {
        typingEl.classList.add('hidden');
        appendChatMsg('them eerie', 'i am already inside.');
        // Lock input
        document.getElementById('chat-input').disabled = true;
        document.getElementById('chat-send-btn').disabled = true;
      }, 1600);
    }, 8500);

    // Trigger game over after final message
    setTimeout(() => triggerGameOver(), 12500);
    return;
  }

  // Lower phases: just a subtle extra message
  if (chatState.phase >= 2) {
    const typingEl = document.getElementById('chat-typing');
    setTimeout(() => {
      typingEl.classList.remove('hidden');
      setTimeout(() => {
        typingEl.classList.add('hidden');
        appendChatMsg('them eerie', 'good. i was hoping you would stay.');
      }, 2200);
    }, 3500);
  }
}

function blockAndClose() {
  if (chatState.scriptTimer) clearTimeout(chatState.scriptTimer);
  document.getElementById('chat-typing').classList.add('hidden');

  // Show a brief system blocked message
  appendChatMsg('system-msg', '🚫 You blocked this user.');

  setTimeout(() => {
    document.getElementById('chat-overlay').classList.add('hidden');
    document.getElementById('chat-popup').classList.add('hidden');
    // Restore action row for next time
    document.getElementById('chat-action-row').style.display = 'flex';

    // Advance to next profile
    swipeCount++;
    if (swipeCount === 4 && !govShown) {
      showGovPopup();
    } else {
      profileIndex++;
      if (profileIndex >= profiles.length) profileIndex = Math.max(3, profiles.length - 3);
      loadProfile(profileIndex);
    }
  }, 900);
}

// ── GAME OVER ─────────────────────────────────
function triggerGameOver() {
  // Close all overlays
  if (chatState.scriptTimer) clearTimeout(chatState.scriptTimer);
  stopPopupTimer();
  document.getElementById('chat-overlay').classList.add('hidden');
  document.getElementById('chat-popup').classList.add('hidden');
  document.getElementById('gov-overlay').classList.add('hidden');
  document.getElementById('gov-popup').classList.add('hidden');
  document.getElementById('win-popup').classList.add('hidden');

  // Glitch flash sequence before reveal
  triggerGlitchFlash(200);
  setTimeout(() => triggerGlitchFlash(150), 350);
  setTimeout(() => triggerGlitchFlash(300), 600);

  // Show game over screen
  setTimeout(() => {
    showScreen('screen-gameover');

    // Reset static animation by cloning the element
    const staticEl = document.getElementById('gameover-static');
    const clone = staticEl.cloneNode(true);
    staticEl.parentNode.replaceChild(clone, staticEl);

    // Reset line animations
    ['go-line-1','go-line-2'].forEach(id => {
      const el = document.getElementById(id);
      el.style.animation = 'none';
      el.offsetHeight; // reflow
      el.style.animation = '';
    });

    // Show CONNECTION TERMINATED after the two main lines
    setTimeout(() => {
      const sub = document.getElementById('go-line-3');
      sub.classList.remove('hidden');
      sub.style.animationDelay = '0s';
    }, 6500);

    // Show restart button last
    setTimeout(() => {
      document.getElementById('gameover-restart').classList.remove('hidden');
    }, 9000);

  }, 800);
}

function restartGame() {
  // Full reset
  profileIndex = 0;
  postWarning  = false;
  swipeCount   = 0;
  govShown     = false;
  chatState    = { profile: null, scriptIndex: 0, responseCount: 0, scriptTimer: null, phase: 0 };
  document.body.classList.remove('post-warning');

  // Hide game over elements for next time
  document.getElementById('go-line-3').classList.add('hidden');
  document.getElementById('gameover-restart').classList.add('hidden');
  // Re-enable chat input
  document.getElementById('chat-input').disabled = false;
  document.getElementById('chat-send-btn').disabled = false;
  document.getElementById('chat-action-row').style.display = 'flex';

  // Go back to desktop
  triggerGlitchFlash(300);
  setTimeout(() => showScreen('screen-desktop'), 350);
}

// ── INIT ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Ensure correct initial state
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  const desk = document.getElementById('screen-desktop');
  desk.style.display = 'block';
  desk.classList.add('active');

  // Start ambient effects
  setTimeout(ambientGlitch, 8000);

  // Initial clock
  updateClock();
});

// ══════════════════════════════
// DRAGGABLE DESKTOP ICONS
// ══════════════════════════════

const desktopIcons = document.querySelectorAll('.desktop-icon');

desktopIcons.forEach(icon => {

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  icon.style.position = 'absolute';

  icon.addEventListener('mousedown', (e) => {

    isDragging = true;

    offsetX = e.clientX - icon.offsetLeft;
    offsetY = e.clientY - icon.offsetTop;

    icon.style.zIndex = 999;

  });

  document.addEventListener('mousemove', (e) => {

    if (!isDragging) return;

    icon.style.left = (e.clientX - offsetX) + 'px';
    icon.style.top = (e.clientY - offsetY) + 'px';

  });

  document.addEventListener('mouseup', () => {

    isDragging = false;

  });

});