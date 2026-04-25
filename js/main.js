const DURATIONS = {
    focus: 25,
    short: 5,
    long: 15
}

let mode = 'focus';
let running = false;
let seconds = 25 * 60;
let totalSeconds = 25 * 60;
let completedSession = 0;
let cupsToday = 0;
let ticker = null;
let activeTrack = -1;
let spPlaying = false;
let spToken = null;
let sessions = 4;
let lastCupImg = '';

const POOKIE_MSGS = [
    'meow meow meoww', 'love you!!', 'coffeeee', 'touch grass, just not now', 'code!!', 'sleep... now what is that??'
]

function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0', 5000);
}

function updateCup() {
    const pct = 1 - (seconds / totalSeconds);
    let cupImg;

    if (pct <= 0.01) {
        cupImg = 'cup-0.png';
    }
    else if (pct < 0.26) {
        cupImg = 'cup-25.png';
    }
    else if (pct < 0.51) {
        cupImg = 'cup-50.png';
    }
    else if (pct < 0.76) {
        cupImg = 'cup-75.png';
    }
    else {
        cupImg = 'cup-100.png';
    }

    if (cupImg !== lastCupImg) {
        document.getElementById('cup-img').src = 'assets/' + cupImg;
        lastCupImg = cupImg;
    }
}

function getTotalSessions() {
    return tasks.reduce((sum, t) => sum + t.sessions, 0) || sessions;
}

function rebuildDots() {
    const row = document.getElementById('session-dots');
    row.innerHTML = '';
    const totalSessions = getTotalSessions();
    for (let i = 0; i < totalSessions; i++) {
        const d = document.createElement('div');
        d.className = 'dot';
        row.appendChild(d);
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    const totalSessions = getTotalSessions();
    const cur = completedSession % totalSessions;
    dots.forEach((d, i) => {
        d.className = 'dot';
        if (i < cur) {
            d.classList.add('done');
        } 
        else if (i === cur && mode === 'focus') {
            d.classList.add('current');
        }
    });
}

function updateUI() {
    document.getElementById('timer-time').textContent = fmt(seconds);
    const labels = {
        focus: 'focus time',
        short: 'short break',
        long: 'long break'
    };
    document.getElementById('timer-label').textContent = labels[mode];
    const totalSessions = getTotalSessions();
    document.getElementById('timer-session').textContent = 'session ' + ((completedSession % totalSessions) + 1) + ' of ' + totalSessions;
    document.getElementById('play-btn').textContent = running ? '⏸' : '▶'; 
    document.getElementById('cups-label').textContent = cupsToday + ' cup' + (cupsToday !== 1 ? 's' : '') + ' today';
}

function toggleTimer() {
    running = !running;
    if (running) {
        ticker = setInterval(tick, 1000);
    }
    else {
        clearInterval(ticker);
    }
    updateUI();
}

function tick() {
    if (seconds <= 0) {
        clearInterval(ticker);
        running = false;
        onSessionEnd();
        return;
    }
    seconds--;
    if (mode === 'focus') updateCup();
    updateUI();
}

function onSessionEnd() {
    if (mode === 'focus') {
        completedSession++;
        cupsToday++;
        const totalSessions = getTotalSessions();
        const isLong = completedSession % totalSessions === 0;
        document.getElementById('break-title').textContent = isLong ? 'long break!' : 'break time!';
        document.getElementById('break-msg').textContent = isLong
        ? 'get a coffee!!'
        : 'take a short break and stretch a bit!';
        document.getElementById('break-banner').style.display = 'block';
    }
    else {
        setMode('focus');
    }
    updateUI();
}

function dismissBreak() {
    document.getElementById('break-banner').style.display = 'none';
    const totalSessions = getTotalSessions();
    const isLong = completedSession % totalSessions === 0;
    setMode(isLong ? 'long' : 'short');
}

function resetTimer() {
    clearInterval(ticker);
    running = false;
    seconds = DURATIONS[mode] * 60;
    totalSeconds = seconds;
    updateCup();
    updateUI();
}

function skipSession() {
    clearInterval(ticker);
    running = false;
    seconds = 0;
    onSessionEnd();
}

function setMode(m) {
    clearInterval(ticker);
    running = false;
    mode = m;
    seconds = DURATIONS[mode] * 60;
    totalSeconds = seconds;
    document.querySelectorAll('.mode-btn').forEach((b, i) => {
        b.classList.toggle('active', ['focus', 'short', 'long'][i] === mode);
    });
    lastCupImg = '';
    updateCup();
    updateUI();
}

function applySettings() {
    DURATIONS.focus = Math.max(1, parseInt(document.getElementById('s-focus').value)) || 25;
    DURATIONS.short = Math.max(1, parseInt(document.getElementById('s-short').value)) || 5;
    DURATIONS.long = Math.max(5, parseInt(document.getElementById('s-long').value)) || 15;
    DURATIONS.session = Math.max(1, parseInt(document.getElementById('s-sess').value)) || 4;
    sessions = Math.max(1, Math.min(12, parseInt(document.getElementById('s-sess').value))) || 4;
    
    rebuildDots();
    resetTimer();
    toast('settings saved!');

}

function setBg(el) {
    document.querySelectorAll('.swatch-wrap').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    const bg = el.getAttribute('data-bg');
    const dark = el.getAttribute('data-dark') === 'true';
    document.body.style.backgroundColor = bg;

    if (dark) {
        document.documentElement.style.setProperty('--bg', bg);
        document.documentElement.style.setProperty('--bg2', bg);
        document.documentElement.style.setProperty('--text', '#ffffff');
        document.documentElement.style.setProperty('--text-strong', '#ffffff');
        document.documentElement.style.setProperty('--text-muted', 'rgba(255, 255, 255, 0.6)');
        document.documentElement.style.setProperty('--text-faint', 'rgba(255, 255, 255, 0.4)');
        document.documentElement.style.setProperty('--border', 'rgba(255, 255, 255, 0.22)');
        document.documentElement.style.setProperty('--border-mid', 'rgba(255, 255, 255, 0.12)');
        document.documentElement.style.setProperty('--surface', 'rgba(255, 255, 255, 0.05)');
        document.documentElement.style.setProperty('--dot-empty', 'rgba(255, 255, 255, 0.18)');
        document.documentElement.style.setProperty('--accent', '#c68b59');
        document.documentElement.style.setProperty('--accent-dark', '#e8a870');
        document.documentElement.style.setProperty('--accent-lite', '#e8c9a0');
    }

    else {
        // light mode default
        document.documentElement.style.setProperty('--bg', bg);
        document.documentElement.style.setProperty('--bg2', bg);
        document.documentElement.style.setProperty('--text', '#3d1f08');
        document.documentElement.style.setProperty('--text-strong', '#1e0f05');
        document.documentElement.style.setProperty('--text-muted', 'rgba(61, 31, 13, 0.45)');
        document.documentElement.style.setProperty('--text-faint', 'rgba(61, 31, 13, 0.35)');
        document.documentElement.style.setProperty('--border', 'rgba(107, 62, 38, 0.3)');
        document.documentElement.style.setProperty('--border-mid', 'rgba(107, 62, 38, 0.18)');
        document.documentElement.style.setProperty('--surface', 'rgba(255, 255, 255, 0.28)');
        document.documentElement.style.setProperty('--dot-empty', 'rgba(107,62,38,0.18)');
        document.documentElement.style.setProperty('--accent', '#6b3e26');
        document.documentElement.style.setProperty('--accent-dark', '#3d1f0d');
        document.documentElement.style.setProperty('--accent-lite', '#c68b59');
    }

}
function switchTab(name) {
    document.querySelectorAll('.tab').forEach((t, i) => 
        t.classList.toggle('active', ['tasks', 'music', 'settings'][i] === name)
    );
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('pane-' + name).classList.add('active');
}

let tasks = [];
function addTask(task) {
    const inp = document.getElementById('task-input');
    const text = inp.value.trim();
    if (!text) {
        return; 
    }
    tasks.push({
        text,
        done: false,
        sessions: 1
    });
    inp.value = '';
    renderTasks();
}

function toggleTask(i) {
    tasks[i].done = !tasks[i].done;
    renderTasks();
}

function deleteTask(i) {
    tasks.splice(i, 1);
    renderTasks();
}

function updateTaskSessions(i, value) {
    const num = Math.max(1, Math.min(99, parseInt(value) || 1));
    tasks[i].sessions = num;
    renderTasks();
}

function renderTasks() {
    document.getElementById('task-list').innerHTML = tasks.map((t, i) => `
    <div class="task-item ${t.done ? 'done' : ''}" onclick="toggleTask(${i})">
        <div class="task-check">
            ${t.done ?  '✓' : ''}
        </div>
        <span class="task-text">${t.text}</span>
        <input class="task-sessions" type="number" min="1" max="99" value="${t.sessions}" 
               onclick="event.stopPropagation()" 
               onchange="updateTaskSessions(${i}, this.value)" />
        <span class="task-del" onclick="event.stopPropagation(); deleteTask(${i})">✗</span>
    </div>
    `).join('');
    rebuildDots();
}

function generateVerifier() {
    const arr = new Uint8Array(32);
    window.crypto.getRandomValues(arr);
    return btoa(String.fromCharCode(...arr))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function connectSpotify() {
    const clientId = document.getElementById('sp-client-id').value.trim();
    if (!clientId) { toast('paste your client id first!'); return; }

    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    localStorage.setItem('sp_verifier', verifier);
    localStorage.setItem('sp_client_id', clientId);

    const redirectUri = 'https://coffeco-seven.vercel.app';
    const scopes = encodeURIComponent([
        'user-read-playback-state',
        'user-read-currently-playing',
    ].join(' '));

    window.location.href =
        `https://accounts.spotify.com/authorize` +
        `?client_id=${clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scopes}` +
        `&code_challenge_method=S256` +
        `&code_challenge=${challenge}`;
}

(async function checkSpotifyCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    const verifier = localStorage.getItem('sp_verifier');
    const clientId = localStorage.getItem('sp_client_id');
    const redirectUri = 'https://coffeco-seven.vercel.app';

    window.history.replaceState(null, '', window.location.pathname);

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: verifier,
        })
    });

    const data = await res.json();
    if (!data.access_token) { toast('spotify auth failed :('); return; }

    spToken = data.access_token;
    localStorage.setItem('sp_token', spToken);

    document.getElementById('sp-setup').style.display = 'none';
    document.getElementById('sp-connect-btn').style.display = 'none';
    document.getElementById('sp-player').style.display = 'flex';
    toast('spotify connected!');
    startSpotifyPolling();
})();

function fetchCurrentTrack() {
    if (!spToken) return;
    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: 'Bearer ' + spToken }
    })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
        if (!data || !data.item) {
            document.getElementById('sp-track').textContent = 'nothing playing';
            document.getElementById('sp-artist').textContent = '—';
            return;
        }
        document.getElementById('sp-track').textContent = data.item.name;
        document.getElementById('sp-artist').textContent = data.item.artists.map(a => a.name).join(', ');
        if (data.item.album.images[0]) {
            document.getElementById('sp-art-img').src = data.item.album.images[0].url;
        }
    })
    .catch(() => {});
}

// polls spotify every 10 seconds to keep display fresh
function startSpotifyPolling() {
    fetchCurrentTrack();
    setInterval(fetchCurrentTrack, 10000);
}

function spToggle() {
    if (!spToken) { toast('connect spotify first'); return; }
        const endpoint = spPlaying ? 'pause' : 'play';
        fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {

            method: 'PUT',
            headers: { 
                'Authorization': 'Bearer ' + spToken 
            }
        })

    .then(() => {
        spPlaying = !spPlaying;
        document.getElementById('sp-play-btn').textContent = spPlaying ? '⏸' : '▶';
        toast(spPlaying ? 'playing' : 'paused');
    }).catch(() => toast('spotify error, token may have expired'));
}

function spNext() {
    if (!spToken) {
        return;
    }
    fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer ' + spToken 
        }
     }).then(() => {
        setTimeout(fetchCurrentTrack, 400);
        toast('skipped to next track');
     })
}

function spPrev() {
    if (!spToken) {
        return;
    }
    fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer ' + spToken 
        }
     }).then(() => {
        setTimeout(fetchCurrentTrack, 400);
        toast('skipped to previous track');
    })
}

function spSeek(e) {
    const bar = e.currentTarget;
    const pct = e.offsetX / bar.offsetWidth;
    document.getElementById('sp-progress').style.width = Math.round(pct * 100) + '%';
}

function playTrack(i) {
    if (activeTrack == i) {
        document.getElementById('track-' + i).classList.remove('playing');
        activeTrack = -1;
        toast('paused');
        return;
    }
    document.querySelectorAll('.track').forEach(t => t.classList.remove('playing'));
    document.getElementById('track-' + i).classList.add('playing');
    const names = ['cozy cafe', 'deadline']

    activeTrack = i;
    toast('now playing: '+ names[i]);
}

function pookieClick() {
    const el = document.getElementById('pookie');
    el.style.transform = 'scale(1.18) rotate(10deg)';
    setTimeout(() => {
        el.style.transform = '';
    }, 350);
    
    toast(POOKIE_MSGS[Math.floor(Math.random() * POOKIE_MSGS.length)]);
}

rebuildDots();
updateCup();
updateUI();