const DURATIONS = {
    focus: 25,
    short: 5,
    long: 15
}

const SESSION = 4;

let mode = 'focus';
let running = false;
let seconds = 25 * 60;
let totalSeconds = 25 * 60;
let completedSession = 0;
let cupsToday = 0;
let ticker = null;

function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function toast(msg) {
    const el = document.createElement('toast');
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0', 2400);
}

function updateCup() {
    const pct = 1 - (seconds / totalSeconds);
    let cupImg;

    if (pct === 0) {
        cupImg = 'cup-0.png';
    }
    else if (pct < 0.25) {
        cupImg = 'cup-25.png';
    }
    else if (pct < 0.5) {
        cupImg = 'cup-50.png';
    }
    else if (pct < 0.75) {
        cupImg = 'cup-75.png';
    }
    else {
        cupImg = 'cup-100.png';
    }

    document.getElementById('cup-img').src = 'assets/' + cupImg;
}

function updateUI() {
    document.getElementById('timer-time').textContent = fmt(seconds);
    const labels = {
        focus: 'focus time',
        short: 'short break',
        long: 'long break'
    };
    document.getElementById('timer-label').textContent = labels[mode];
    document.getElementById('timer-session').textContent = 'session ' + ((completedSession % SESSION) + 1) + ' of ' + SESSION;
    document.getElementById('play-btn').textContent = running ? '⏸' : '▶'; 
    document.getElementById('cups-label').textContent = cupsToday + ' cup' + (cupsToday !== 1 ? 's' : '') + ' today';
    const dots = document.querySelectorAll('.dot');
    const cur = completedSession % SESSION;
    dots.forEach((dot, i) => {
        dot.className = 'dot';
        if (i < cur) {
            dot.classList.add('done');
        } 
        else if (i == cur && mode == 'focus') {
                dot.classList.add('current');
            }
    });
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
        const isLong = completedSession % SESSION === 0;
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
    const isLong = completedSession % SESSION == 0;
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
    updateCup();
    updateUI();
}

function applySettings() {
    DURATIONS.focus = Math.max(1, parseInt(document.getElementById('s-focus').value)) || 25;
    DURATIONS.short = Math.max(1, parseInt(document.getElementById('s-short').value)) || 5;
    DURATIONS.long = Math.max(5, parseInt(document.getElementById('s-long').value)) || 15;
    DURATIONS.session = Math.max(8, parseInt(document.getElementById('s-sess').value)) || 4;
    const dotsRow = document.getElementById('session-dots');
    dotsRow.innerHTML = '';
    for (let i = 0; i <sessions ; i++) {
        const d = document.createElement('div');
        d.className = 'dot';
        dotsRow.appendChild(d);
    }
    resetTimer();
    toast('settings saved!');

}

function setBg(el) {
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    document.body.style.background = el.getAttribute('data-bg');
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
        done: false
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

function renderTasks() {
    document.getElementById('task-list').innerHTML = tasks.map((t, i) => `
    <div class="task-item ${t.done ? 'done' : ''}" onclick="toggleTask(${i})">
        <div class="task-check">
            ${t.done ?  '✓' : ''}
        </div>
        <span class="task-text">${t.text}</span>
        <span class="task-del" onclick="event.stopPropagation(); deleteTask(${i})">✗</span>
    </div>
    `).join('');
}

function playTrack() {
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
updateCup();
updateUI();