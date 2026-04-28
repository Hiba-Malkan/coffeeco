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

        if (pct <= 0.25) {
            cupImg = 'cup-0.png';
        }
        else if (pct > 0.25 && pct <= 0.50) {
            cupImg = 'cup-25.png';
        }
        else if (pct > 0.50 && pct <= 0.75) {
            cupImg = 'cup-50.png';
        }
        else if (pct > 0.75 && pct <= 0.98) {
            cupImg = 'cup-75.png';
        }
        else if (pct > 0.98) {
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
        <span class="task-del" onclick="event.stopPropagation(); deleteTask(${i})">X</span>
    </div>
    `).join('');
    rebuildDots();
}

let activeTrack = -1;
let currentAudio = null;

function playTrack(i) {
    const tracks = [
        'assets/tracks/cafe-scape.mp3',
        'assets/tracks/forest-scape.mp3',
        'assets/tracks/white-noise.mp3',
        'assets/tracks/lofi.mp3',
        'assets/tracks/classical.mp3'
    ];
    const names = ['cafe scape', 'forest scape', 'white noise', 'lofi', 'classical'];

    if (activeTrack == i) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        document.getElementById('track-' + i).classList.remove('playing');
        document.getElementById('track-' + i).querySelector('.track-play').textContent = '▶';
        activeTrack = -1;
        toast('paused');
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
    }

    // Reset previous track icon
    if (activeTrack !== -1) {
        document.getElementById('track-' + activeTrack).classList.remove('playing');
        document.getElementById('track-' + activeTrack).querySelector('.track-play').textContent = '▶';
    }

    document.querySelectorAll('.track').forEach(t => t.classList.remove('playing'));
    document.getElementById('track-' + i).classList.add('playing');
    document.getElementById('track-' + i).querySelector('.track-play').textContent = '⏸';

    currentAudio = new Audio(tracks[i]);
    currentAudio.loop = true;
    currentAudio.addEventListener('ended', () => {
        currentAudio.currentTime = 0;
        currentAudio.play();
    });
    currentAudio.play().catch(err => {
        if (err.name !== 'AbortError') toast('could not play track');
    });

    activeTrack = i;
    toast('now playing: ' + names[i]);
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