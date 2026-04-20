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
    // meow u have to write the update cup function and uh call it here
    updateUI();
}

function onSessionEnd() {
    if (mode == 'focus') {
        completedSession++;
        cupsToday++;
        const isLong = completedSession % SESSION == 0;
        document.getElementById('break-title').textContent = isLong ? 'long break!' : 'break time!';
        document.getElementById('break-msg').textContent = isLong ? 'take a long break and relax!' : 'take a short break and stretch!'; // these r copilot's auto complete msgs. GENERIC. REPLACE.
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
    // cup reset. as soon as i do the art!!
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

    //cup
    updateUI();

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
// cup
updateUI();

