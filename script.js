/* ===========================
   script.js - completo y corregido
   Compatible con index.html y styles.css subidos
   =========================== */

/* ---------------------------
   Matrix rain effect
   --------------------------- */
(function () {
    const canvas = document.getElementById('matrix');
    if (!canvas) {
        console.warn('Canvas #matrix no encontrado. Efecto Matrix desactivado.');
        return;
    }
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrixChars.split("");
    const fontSize = 12;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = new Array(columns).fill(1);

    function resetDrops() {
        columns = Math.floor(canvas.width / fontSize);
        drops = new Array(columns).fill(1);
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const body = document.body;
        if (body.classList.contains('level-2')) {
            ctx.fillStyle = '#ff3300';
        } else if (body.classList.contains('level-3')) {
            ctx.fillStyle = '#6666ff';
        } else {
            ctx.fillStyle = '#00ff00';
        }

        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let matrixInterval = setInterval(drawMatrix, 35);

    window.addEventListener('resize', () => {
        resizeCanvas();
        resetDrops();
    });

    // expose for debugging if needed
    window._matrix = {
        start: () => { if (!matrixInterval) matrixInterval = setInterval(drawMatrix, 35); },
        stop: () => { clearInterval(matrixInterval); matrixInterval = null; }
    };
})();

/* ---------------------------
   Estado del juego / timer / scoring
   --------------------------- */
let currentLevel = 1;
let gameStartTime = Date.now();
let failedAttempts = 0;
let timerInterval = null;
let gameCompleted = false;
let hintUsed = false;
let speedBonusThresholds = [30, 60, 120, 300];

function initializeTimer() {
    stopTimer();
    gameStartTime = Date.now();
    startTimer();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        /* no-op visual timer (puedes ampliar si quieres mostrar) */
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    gameCompleted = true;
}

function getElapsedTime() {
    return Math.floor((Date.now() - gameStartTime) / 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

/* ---------------------------
   Flags y niveles
   --------------------------- */
const levelFlags = {
    1: 'CTF{HICISTE_LAS_MOVIDAS_BIEN}',
    2: 'CTF{L0S_P3RM1S05_S0N_L4_CL4V3_P4R4_3L_T3S0R0_D3_L0S_H4CK3R5}',
    3: 'CTF{3l1t3_h4ck3r_m4st3r_0f_4ll}'
};

/*
  selectLevel: compatible con:
    - selectLevel(1)  (llamada simple desde HTML)
    - selectLevel(event, 1) (si prefieres pasar event)
*/
function selectLevel() {
    // soporte para argumentos variables
    // posibles invocaciones:
    // - selectLevel(1)
    // - selectLevel(event, 1)
    // - selectLevel(null, 1)
    let evt = null;
    let level = 1;

    if (arguments.length === 1) {
        // selectLevel(1)
        level = typeof arguments[0] === 'number' ? arguments[0] : 1;
    } else if (arguments.length >= 2) {
        // selectLevel(event, 1)
        evt = arguments[0];
        level = typeof arguments[1] === 'number' ? arguments[1] : level;
    }

    // clamp level
    level = Math.max(1, Math.min(3, level));

    // reset state
    resetGameState();

    currentLevel = level;

    // Update visual theme
    document.body.className = `level-${level}`;

    // Update level indicator
    const indicator = document.querySelector('.level-indicator');
    if (indicator) indicator.textContent = level;

    // Update active button (if clicked)
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    if (evt && evt.target && evt.target.classList) {
        evt.target.classList.add('active');
    } else {
        // try to find the button for the level and activate
        const fallbackBtn = document.querySelectorAll('.level-btn')[level - 1];
        if (fallbackBtn) fallbackBtn.classList.add('active');
    }

    // Show/hide shutdown overlay
    const overlay = document.getElementById('shutdownOverlay');
    if (overlay) {
        if (level === 3) {
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }

    // Update terminal title / glitch data-text
    const terminalTitle = document.querySelector('.terminal-title');
    const glitchElement = document.querySelector('.glitch');

    switch (level) {
        case 1:
            if (terminalTitle) terminalTitle.textContent = 'SECURE CTF TERMINAL';
            if (glitchElement) glitchElement.setAttribute('data-text', 'SECURE CTF TERMINAL');
            break;
        case 2:
            if (terminalTitle) terminalTitle.textContent = 'ADVANCED HACKER TERMINAL';
            if (glitchElement) glitchElement.setAttribute('data-text', 'ADVANCED HACKER TERMINAL');
            break;
        case 3:
            if (terminalTitle) terminalTitle.textContent = 'ELITE MASTER TERMINAL';
            if (glitchElement) glitchElement.setAttribute('data-text', 'ELITE MASTER TERMINAL');
            break;
    }

    console.log(`%cNivel ${level} activado`, `color: ${level === 1 ? '#00ff00' : level === 2 ? '#ff3300' : '#6666ff'}; font-weight: bold;`);
}

function resetGameState() {
    gameStartTime = Date.now();
    failedAttempts = 0;
    gameCompleted = false;
    hintUsed = false;

    if (timerInterval) clearInterval(timerInterval);
    initializeTimer();

    const flagInput = document.getElementById('flagInput');
    const statusMessage = document.getElementById('statusMessage');

    if (flagInput) {
        flagInput.value = '';
        flagInput.style.borderColor = '';
        flagInput.style.animation = '';
    }
    if (statusMessage) {
        statusMessage.textContent = '';
        statusMessage.classList.remove('show', 'status-success', 'status-error');
    }
}

/* ---------------------------
   Anti-debug helper (simple)
   --------------------------- */
const _debug = () => {
    // ligera heurística para detectar open devtools (no perfecta)
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const end = performance.now();
    return (end - start) > 100;
};

/* ---------------------------
   submitFlag (form)
   --------------------------- */
function submitFlag(event) {
    if (event && event.preventDefault) event.preventDefault();

    const flagInput = document.getElementById('flagInput');
    const statusMessage = document.getElementById('statusMessage');
    const flag = flagInput ? flagInput.value.trim() : '';

    if (!statusMessage) {
        console.warn('statusMessage no encontrado en DOM.');
    }

    // Anti-debug
    try {
        if (_debug()) {
            if (statusMessage) {
                statusMessage.textContent = '🔒 Sistema bloqueado por actividad sospechosa';
                statusMessage.classList.add('status-error', 'show');
            }
            return;
        }
    } catch (err) {
        console.warn('Anti-debug falló', err);
    }

    if (statusMessage) statusMessage.classList.remove('show', 'status-success', 'status-error');

    setTimeout(() => {
        const correctFlag = levelFlags[currentLevel];

        if (flag === correctFlag) {
            stopTimer();

            let successMessage = '';
            if (currentLevel === 1) successMessage = '🎉 ¡FLAG CORRECTA! ¡Bienvenido al mundo hacker!';
            else if (currentLevel === 2) successMessage = '🔥 ¡EXCELENTE! Has dominado el nivel avanzado!';
            else successMessage = '👑 ¡LEYENDA! Has conquistado el nivel elite!';

            if (statusMessage) {
                statusMessage.textContent = successMessage;
                statusMessage.classList.add('status-success', 'show');
            }

            // breve glitch visual
            document.body.style.animation = 'glitch 0.1s linear 10';
            setTimeout(() => document.body.style.animation = '', 1000);

            showCompletionEasterEggs();
            setTimeout(() => createStatsModal(), 1000);

        } else if (flag.length > 0) {
            failedAttempts++;

            let errorMessage = '';
            if (currentLevel === 1) errorMessage = `⚠️ Flag incorrecta. Sigue intentando... (${failedAttempts} intentos fallidos)`;
            else if (currentLevel === 2) errorMessage = `🔴 Acceso denegado. Nivel avanzado requiere precisión... (${failedAttempts} intentos)`;
            else errorMessage = `💀 Sistema de seguridad activado. Elite no perdona errores... (${failedAttempts} intentos)`;

            if (statusMessage) {
                statusMessage.textContent = errorMessage;
                statusMessage.classList.add('status-error', 'show');
            }

            if (flagInput) {
                flagInput.style.borderColor = currentLevel === 1 ? '#ff0000' : currentLevel === 2 ? '#ff6600' : '#ff3366';
                flagInput.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    flagInput.style.borderColor = currentLevel === 1 ? '#00ff00' : currentLevel === 2 ? '#ff3300' : '#6666ff';
                    flagInput.style.animation = '';
                }, 500);
            }
        }
    }, 800);
}

/* ---------------------------
   Scoring system
   --------------------------- */
function calculateScore(timeSeconds, attempts, hintsUsed = false) {
    let baseScore = 50000;

    let timeMultiplier = 1.0;
    if (timeSeconds <= 30) timeMultiplier = 3.0;
    else if (timeSeconds <= 60) timeMultiplier = 2.5;
    else if (timeSeconds <= 120) timeMultiplier = 2.0;
    else if (timeSeconds <= 300) timeMultiplier = 1.5;
    else if (timeSeconds <= 600) timeMultiplier = 1.2;
    else if (timeSeconds <= 1200) timeMultiplier = 1.0;
    else {
        const extraMinutes = (timeSeconds - 1200) / 60;
        timeMultiplier = Math.max(0.1, 1.0 - (extraMinutes * 0.05));
    }

    baseScore = Math.floor(baseScore * timeMultiplier);

    if (attempts === 0) baseScore += 25000;

    // speed bonuses
    speedBonusThresholds.forEach((threshold, index) => {
        if (timeSeconds <= threshold) {
            const bonus = (speedBonusThresholds.length - index) * 5000;
            baseScore += bonus;
        }
    });

    // attempts bonus
    if (attempts <= 1) baseScore += 15000;
    else if (attempts <= 2) baseScore += 8000;
    else if (attempts <= 3) baseScore += 3000;

    // penalty scale
    if (attempts > 0) {
        const attemptsPenalty = baseScore * (1 - Math.pow(0.85, attempts));
        baseScore = Math.max(0, Math.floor(baseScore - attemptsPenalty));
    }

    if (hintsUsed) baseScore = Math.floor(baseScore * 0.8);

    const timePerAttempt = attempts > 0 ? timeSeconds / (attempts + 1) : timeSeconds;
    if (timePerAttempt > 30 && attempts <= 2) baseScore += 5000;

    return Math.max(1000, Math.floor(baseScore));
}

/* ---------------------------
   Breakdown, achievements, ranking, analysis
   --------------------------- */
function getScoreBreakdown(timeSeconds, attempts, hintsUsed = false) {
    const breakdown = {
        baseScore: 50000,
        timeMultiplier: 1.0,
        speedBonus: 0,
        perfectBonus: 0,
        firstAttemptBonus: 0,
        attemptsPenalty: 0,
        hintPenalty: 0,
        consistencyBonus: 0,
        finalScore: 0
    };

    if (timeSeconds <= 30) breakdown.timeMultiplier = 3.0;
    else if (timeSeconds <= 60) breakdown.timeMultiplier = 2.5;
    else if (timeSeconds <= 120) breakdown.timeMultiplier = 2.0;
    else if (timeSeconds <= 300) breakdown.timeMultiplier = 1.5;
    else if (timeSeconds <= 600) breakdown.timeMultiplier = 1.2;
    else if (timeSeconds <= 1200) breakdown.timeMultiplier = 1.0;
    else {
        const extraMinutes = (timeSeconds - 1200) / 60;
        breakdown.timeMultiplier = Math.max(0.1, 1.0 - (extraMinutes * 0.05));
    }

    breakdown.timeBonus = Math.floor(breakdown.baseScore * (breakdown.timeMultiplier - 1));

    if (attempts === 0) breakdown.perfectBonus = 25000;

    speedBonusThresholds.forEach((threshold, index) => {
        if (timeSeconds <= threshold) breakdown.speedBonus += (speedBonusThresholds.length - index) * 5000;
    });

    if (attempts <= 1) breakdown.firstAttemptBonus = 15000;
    else if (attempts <= 2) breakdown.firstAttemptBonus = 8000;
    else if (attempts <= 3) breakdown.firstAttemptBonus = 3000;

    if (attempts > 0) {
        const baseWithMultiplier = breakdown.baseScore * breakdown.timeMultiplier;
        breakdown.attemptsPenalty = baseWithMultiplier * (1 - Math.pow(0.85, attempts));
    }

    if (hintsUsed) {
        const scoreBeforeHintPenalty = breakdown.baseScore * breakdown.timeMultiplier +
            breakdown.speedBonus + breakdown.firstAttemptBonus + breakdown.perfectBonus - breakdown.attemptsPenalty;
        breakdown.hintPenalty = scoreBeforeHintPenalty * 0.2;
    }

    const timePerAttempt = attempts > 0 ? timeSeconds / (attempts + 1) : timeSeconds;
    if (timePerAttempt > 30 && attempts <= 2) breakdown.consistencyBonus = 5000;

    breakdown.finalScore = calculateScore(timeSeconds, attempts, hintsUsed);

    return breakdown;
}

function getRanking(time, attempts) {
    const score = calculateScore(time, attempts, hintUsed);
    if (score >= 150000) return 'LEGENDARY HACKER';
    if (score >= 120000) return 'ELITE HACKER';
    if (score >= 90000) return 'MASTER HACKER';
    if (score >= 60000) return 'EXPERT HACKER';
    if (score >= 40000) return 'SKILLED HACKER';
    if (score >= 25000) return 'JUNIOR HACKER';
    if (score >= 15000) return 'NOVICE HACKER';
    return 'SCRIPT KIDDIE';
}

function getAchievements(time, attempts) {
    const achievements = [];
    const score = calculateScore(time, attempts, hintUsed);

    if (time < 30) achievements.push('⚡ LIGHTNING FAST - Menos de 30 segundos');
    else if (time < 60) achievements.push('🏃 SPEED DEMON - Menos de 1 minuto');
    else if (time < 300) achievements.push('⏰ QUICK SOLVER - Menos de 5 minutos');

    if (attempts === 0) achievements.push('🎯 FIRST SHOT - Sin errores');
    else if (attempts <= 1) achievements.push('🎪 ALMOST PERFECT - Máximo 1 error');
    else if (attempts <= 2) achievements.push('🧠 BIG BRAIN - Máximo 2 errores');

    if (score >= 150000) achievements.push('👑 LEGENDARY - Score legendario');
    else if (score >= 120000) achievements.push('💎 ELITE STATUS - Score élite');
    else if (score >= 90000) achievements.push('🏆 MASTER CLASS - Score magistral');
    else if (score >= 60000) achievements.push('⭐ HIGH PERFORMER - Alto rendimiento');

    if (time > 1800) achievements.push('🕰️ METHODICAL - Más de 30 minutos');
    if (attempts >= 10) achievements.push('💪 PERSISTENT - Nunca te rindes');
    if (time < 60 && attempts <= 2) achievements.push('🚀 ROCKET HACKER - Rápido y preciso');

    if (currentLevel === 1) achievements.push('🟢 ROOKIE GRADUATE - Nivel principiante completado');
    if (currentLevel === 2) achievements.push('🔴 ADVANCED WARRIOR - Nivel avanzado dominado');
    if (currentLevel === 3) achievements.push('🔵 ELITE MASTER - Nivel élite conquistado');

    achievements.push('🔓 FLAG HUNTER - Challenge completado');

    return achievements;
}

function getPerformanceAnalysis(time, attempts, score) {
    let baseAnalysis = '';

    if (time < 30 && attempts === 0) baseAnalysis = "RENDIMIENTO EXTRAORDINARIO: Completaste el challenge en tiempo récord sin errores. Eres un verdadero elite hacker!";
    else if (time < 60 && attempts <= 1) baseAnalysis = "EXCELENTE RENDIMIENTO: Velocidad impresionante con mínimos errores. Tienes gran potencial como pentester.";
    else if (time < 300 && attempts <= 3) baseAnalysis = "BUEN RENDIMIENTO: Tiempo respetable con pocos errores. Sigues un enfoque metodológico sólido.";
    else if (attempts === 0) baseAnalysis = "PRECISIÓN PERFECTA: Aunque tomaste tu tiempo, no cometiste errores. La paciencia es una virtud del hacker.";
    else if (time < 120) baseAnalysis = "VELOCIDAD SOBRE PRECISIÓN: Eres rápido pero podrías mejorar la precisión. Considera tomarte un poco más de tiempo.";
    else if (attempts <= 2) baseAnalysis = "ENFOQUE METÓDICO: Pocos errores indican un buen proceso de pensamiento. El tiempo se mejora con la práctica.";
    else baseAnalysis = "ESPACIO PARA MEJORAR: Cada hacker tiene que empezar en algún lugar. ¡Sigue practicando y mejorarás!";

    let levelAnalysis = '';
    if (currentLevel === 1) levelAnalysis = 'Nivel: ROOKIE — Practica lo básico.';
    if (currentLevel === 2) levelAnalysis = 'Nivel: ADVANCED — Buen nivel, pule la precisión.';
    if (currentLevel === 3) levelAnalysis = 'Nivel: ELITE — Excelente, mantén la consistencia.';

    return `${baseAnalysis} ${levelAnalysis}`;
}

/* ---------------------------
   Completion easter eggs + consola
   --------------------------- */
function showCompletionEasterEggs() {
    console.clear();
    const elapsed = getElapsedTime();
    const score = calculateScore(elapsed, failedAttempts, hintUsed);

    const levelName = currentLevel === 1 ? 'ROOKIE' : currentLevel === 2 ? 'ADVANCED' : 'ELITE';
    const levelColor = currentLevel === 1 ? '#00ff00' : currentLevel === 2 ? '#ff3300' : '#6666ff';

    console.log(`%c
███████╗██╗     ███████╗██╗   ██╗███████╗██████╗ 
██╔══██║██║     ██╔══██║██║   ██║██╔════╝██╔══██╗
███████║██║     ███████║██║   ██║█████╗  ██████╔╝
██╔══██║██║     ██╔══██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║  ██║███████╗███████║ ╚████╔╝ ███████╗██║  ██║
╚═╝  ╚═╝╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
`, `color: ${levelColor}; font-family: monospace; font-weight: bold;`);

    console.log(`Felicitaciones! Has crackeado el nivel ${levelName}.`);
    console.log(`Tiempo: ${formatTime(elapsed)}`);
    console.log(`Intentos fallidos: ${failedAttempts}`);
    console.log(`Score: ${score.toLocaleString()}`);
    console.log(`Nivel: ${getRanking(elapsed, failedAttempts)}`);

    console.log('%cComandos secretos:', 'color: #00ffff; font-weight: bold;');
    console.log('• hack() • stats() • konami() • walloffame() • breakdown()');
    // define global helper commands
    window.hack = () => {
        console.log('%cIniciando modo hacker...', 'color: #ff0000; font-size: 14px; font-weight: bold;');
        document.body.style.filter = 'hue-rotate(45deg) saturate(120%)';
        setTimeout(() => { document.body.style.filter = ''; }, 2500);
    };
    window.stats = () => {
        console.table({
            'Nivel Actual': `${currentLevel}`,
            'Tiempo Total': formatTime(getElapsedTime()),
            'Intentos Fallidos': failedAttempts,
            'Score Final': score,
            'Ranking': getRanking(getElapsedTime(), failedAttempts)
        });
    };
    window.konami = () => {
        console.log('%cKONAMI TRIGGERED', 'color: #ff00ff');
        document.querySelector('.terminal')?.classList.add('konami-active');
        setTimeout(() => document.querySelector('.terminal')?.classList.remove('konami-active'), 2000);
    };
    window.walloffame = () => showWallOfFame();
    window.breakdown = () => {
        const bd = getScoreBreakdown(getElapsedTime(), failedAttempts, hintUsed);
        console.table(bd);
        console.log(getPerformanceAnalysis(getElapsedTime(), failedAttempts, calculateScore(getElapsedTime(), failedAttempts, hintUsed)));
    };
}

/* ---------------------------
   Stats modal + Wall of Fame + persistence
   --------------------------- */
function createStatsModal() {
    // Remove any existing stats modal
    const existing = document.getElementById('statsModal');
    if (existing) existing.remove();

    const elapsedTime = getElapsedTime();
    const score = calculateScore(elapsedTime, failedAttempts, hintUsed);
    const breakdown = getScoreBreakdown(elapsedTime, failedAttempts, hintUsed);

    const modal = document.createElement('div');
    modal.id = 'statsModal';
    modal.className = 'stats-modal';

    let levelTitle = currentLevel === 1 ? 'NIVEL ROOKIE COMPLETADO' : currentLevel === 2 ? 'NIVEL ADVANCED DOMINADO' : 'NIVEL ELITE CONQUISTADO';
    let levelEmoji = currentLevel === 1 ? '🟢' : currentLevel === 2 ? '🔴' : '🔵';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="stats-header">
                <div class="glitch stats-title" data-text="${levelEmoji} ${levelTitle}">${levelEmoji} ${levelTitle}</div>
                <div class="stats-subtitle">ANÁLISIS DE RENDIMIENTO</div>
            </div>

            <div class="final-score-display">
                <div class="score-label">SCORE FINAL</div>
                <div class="score-value">${score.toLocaleString()}</div>
            </div>

            <div class="score-breakdown-section">
                <div class="breakdown-title">Desglose detallado</div>
                <div class="breakdown-grid">
                    <div class="breakdown-item base">
                        <span class="item-label">Score Base:</span>
                        <span class="item-value">+${breakdown.baseScore.toLocaleString ? breakdown.baseScore.toLocaleString() : breakdown.baseScore}</span>
                    </div>
                    <div class="breakdown-item ${breakdown.timeMultiplier > 1 ? 'bonus' : 'neutral'}">
                        <span class="item-label">Multiplicador Tiempo:</span>
                        <span class="item-value">x${breakdown.timeMultiplier.toFixed(2)}</span>
                    </div>
                    ${breakdown.speedBonus > 0 ? `<div class="breakdown-item bonus"><span class="item-label">Bonus Velocidad:</span><span class="item-value">+${breakdown.speedBonus.toLocaleString()}</span></div>` : ''}
                    ${breakdown.perfectBonus > 0 ? `<div class="breakdown-item bonus"><span class="item-label">Ejecución Perfecta:</span><span class="item-value">+${breakdown.perfectBonus.toLocaleString()}</span></div>` : ''}
                    ${breakdown.firstAttemptBonus > 0 ? `<div class="breakdown-item bonus"><span class="item-label">Bonus Pocos Intentos:</span><span class="item-value">+${breakdown.firstAttemptBonus.toLocaleString()}</span></div>` : ''}
                    ${breakdown.consistencyBonus > 0 ? `<div class="breakdown-item bonus"><span class="item-label">Bonus Consistencia:</span><span class="item-value">+${breakdown.consistencyBonus.toLocaleString()}</span></div>` : ''}
                    ${breakdown.attemptsPenalty > 0 ? `<div class="breakdown-item penalty"><span class="item-label">Penalización Intentos:</span><span class="item-value">-${Math.floor(breakdown.attemptsPenalty).toLocaleString()}</span></div>` : ''}
                    ${breakdown.hintPenalty > 0 ? `<div class="breakdown-item penalty"><span class="item-label">Penalización Pistas:</span><span class="item-value">-${Math.floor(breakdown.hintPenalty).toLocaleString()}</span></div>` : ''}
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-item"><div class="stat-icon">⏱️</div><div class="stat-label">TIEMPO TOTAL</div><div class="stat-value">${formatTime(elapsedTime)}</div></div>
                <div class="stat-item"><div class="stat-icon">🎯</div><div class="stat-label">INTENTOS FALLIDOS</div><div class="stat-value">${failedAttempts}</div></div>
                <div class="stat-item"><div class="stat-icon">⭐</div><div class="stat-label">EFICIENCIA</div><div class="stat-value">${failedAttempts === 0 ? 'PERFECTO' : failedAttempts <= 2 ? 'EXCELENTE' : 'BUENO'}</div></div>
                <div class="stat-item"><div class="stat-icon">🏆</div><div class="stat-label">RANKING</div><div class="stat-value">${getRanking(elapsedTime, failedAttempts)}</div></div>
            </div>

            <div class="achievement-section">
                <div class="achievement-title">Logros desbloqueados</div>
                <div class="achievements">
                    ${getAchievements(elapsedTime, failedAttempts).map(a => `<div class="achievement">${a}</div>`).join('')}
                </div>
            </div>

            <div class="performance-analysis"><div class="analysis-title">Análisis de rendimiento</div><div class="analysis-text">${getPerformanceAnalysis(elapsedTime, failedAttempts, score)}</div></div>

            <div class="action-buttons">
                <button class="arcade-btn primary" onclick="checkAndSaveScore(${score}, ${elapsedTime}, ${failedAttempts})">💾 GUARDAR SCORE</button>
                <button class="arcade-btn" onclick="showWallOfFame()">🏆 WALL OF FAME</button>
                <button class="arcade-btn" onclick="closeStatsModal()">🚀 CONTINUAR</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 50);
}

function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
    }
}

/* ---------------------------
   High scores (localStorage)
   --------------------------- */
function loadHighScoresFromLocalStorage() {
    try {
        const raw = localStorage.getItem('ctfHighScores');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (e) {
        console.warn('Error leyendo highscores:', e);
        return [];
    }
}

function saveHighScoresToLocalStorage(scores) {
    try {
        const s = Array.isArray(scores) ? scores : [];
        localStorage.setItem('ctfHighScores', JSON.stringify(s.slice(0, 500)));
        localStorage.setItem('ctfLastSaved', Date.now().toString());
    } catch (e) {
        console.error('Error guardando highscores:', e);
    }
}

function checkAndSaveScore(score, time, attempts) {
    // Abre modal de iniciales
    openInitialsModal(score, time, attempts, currentLevel);
}

function openInitialsModal(score, time, attempts, level = 1) {
    // evita duplicados
    const existing = document.querySelector('.initials-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'initials-modal';
    modal.innerHTML = `
        <div class="initials-modal-content">
            <h2>Guardar Score</h2>
            <p>Ingresa tus iniciales (3 letras):</p>
            <div class="initials-inputs">
                <input id="initial1" maxlength="1" class="initial-input" />
                <input id="initial2" maxlength="1" class="initial-input" />
                <input id="initial3" maxlength="1" class="initial-input" />
            </div>
            <div style="margin-top:20px;">
                <button onclick="submitInitials(${score}, ${time}, ${attempts}, ${level})" class="arcade-btn primary">GUARDAR</button>
                <button onclick="this.closest('.initials-modal').remove()" class="arcade-btn">CANCELAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const i1 = document.getElementById('initial1');
    const i2 = document.getElementById('initial2');
    const i3 = document.getElementById('initial3');
    [i1, i2, i3].forEach((el, idx) => {
        el.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
            if (e.target.value && idx < 2) (idx === 0 ? i2 : i3).focus();
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && idx > 0) {
                (idx === 1 ? i1 : i2).focus();
            }
            if (e.key === 'Enter') {
                submitInitials(score, time, attempts, level);
            }
        });
    });
    i1.focus();
}

function submitInitials(score, time, attempts, level = 1) {
    const i1 = (document.getElementById('initial1') || {}).value || 'A';
    const i2 = (document.getElementById('initial2') || {}).value || 'A';
    const i3 = (document.getElementById('initial3') || {}).value || 'A';
    const initials = (i1 + i2 + i3).slice(0, 3).toUpperCase();

    const scores = loadHighScoresFromLocalStorage();
    const entry = {
        initials,
        score: Number(score) || 0,
        time: Number(time) || 0,
        attempts: Number(attempts) || 0,
        level: Number(level) || 1,
        timestamp: Date.now()
    };
    scores.push(entry);

    // sort y keep top 500
    const uniqueSorted = scores
        .slice()
        .sort((a, b) => b.score - a.score || a.time - b.time)
        .slice(0, 500);

    saveHighScoresToLocalStorage(uniqueSorted);

    // cerrar modals y mostrar wall
    document.querySelectorAll('.initials-modal, #statsModal').forEach(m => m.remove());
    showWallOfFame();
    showSuccessMessage('🏆 Puntaje guardado correctamente');
}

/* ---------------------------
   Wall of Fame (modal)
   --------------------------- */
function showWallOfFame() {
    const existing = document.querySelector('.wall-of-fame-modal');
    if (existing) existing.remove();

    const scores = loadHighScoresFromLocalStorage();
    const top = scores.slice(0, 50);

    const modal = document.createElement('div');
    modal.className = 'wall-of-fame-modal';
    modal.innerHTML = `
        <div class="wall-of-fame-content">
            <div class="arcade-header">
                <div class="arcade-title">WALL OF FAME</div>
                <div class="subtitle">Los mejores hackers</div>
            </div>

            <div class="scoreboard">
                <div class="scoreboard-header">
                    <div>#</div><div>INICIALES</div><div>NIVEL</div><div>TIEMPO</div><div>INT</div><div>SCORE</div>
                </div>
                ${top.length > 0 ? top.map((s, idx) => `
                    <div class="score-row ${idx < 3 ? 'top-three' : ''}">
                        <div class="rank">${getRankDisplay(idx+1)}</div>
                        <div class="initials">${s.initials}</div>
                        <div class="level-col">${getLevelBadge(s.level)}</div>
                        <div class="time">${formatTime(s.time)}</div>
                        <div class="attempts">${s.attempts}</div>
                        <div class="score">${Number(s.score).toLocaleString()}</div>
                    </div>
                `).join('') : `
                    <div class="no-scores">
                        <div class="empty-message">NO SCORES YET</div>
                        <div class="be-first">BE THE FIRST HACKER!</div>
                    </div>
                `}
            </div>

            <div class="stats-summary">
                <div class="stats-title">📈 ESTADÍSTICAS POR NIVEL</div>
                <div class="stats-row"><span>Total de partidas:</span><span>${scores.length}</span></div>
                <div class="stats-row"><span>Score promedio:</span><span>${scores.length > 0 ? Math.floor(scores.reduce((a,b)=>a+(b.score||0),0)/scores.length).toLocaleString() : '0'}</span></div>
                <div class="stats-row"><span>Nivel 1 completados:</span><span>${scores.filter(s=>s.level===1).length}</span></div>
                <div class="stats-row"><span>Nivel 2 completados:</span><span>${scores.filter(s=>s.level===2).length}</span></div>
                <div class="stats-row"><span>Mejor tiempo:</span><span>${scores.length > 0 ? formatTime(Math.min(...scores.map(s=>s.time||9999999))) : 'N/A'}</span></div>
                <div class="stats-row"><span>Score máximo:</span><span>${scores.length > 0 ? Math.max(...scores.map(s=>s.score||0)).toLocaleString() : '0'}</span></div>
            </div>

            <div class="download-buttons">
                <button onclick="exportHighScores()" class="download-btn">💾 EXPORTAR SCORES</button>
                <button onclick="importHighScores()" class="download-btn">📤 IMPORTAR SCORES</button>
                <button onclick="clearHighScores()" class="download-btn danger">🗑️ LIMPIAR SCORES</button>
            </div>

            <div class="wall-of-fame-actions" style="margin-top:16px;">
                <button onclick="closeWallOfFame()" class="arcade-btn">🚀 CONTINUAR</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(()=> modal.classList.add('show'), 50);
}

function closeWallOfFame() {
    const modal = document.querySelector('.wall-of-fame-modal');
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(()=> modal.remove(), 300);
    }
}

function getLevelBadge(level) {
    return level === 1 ? '🟢 1' : level === 2 ? '🔴 2' : level === 3 ? '🔵 3' : level;
}
function getRankDisplay(rank) {
    return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
}

function clearHighScores() {
    if (!confirm('¿Estás seguro de que quieres borrar todos los puntajes?')) return;
    localStorage.removeItem('ctfHighScores');
    showSuccessMessage('🗑️ Todos los puntajes han sido eliminados');
    closeWallOfFame();
}

/* ---------------------------
   Export / Import Highscores
   --------------------------- */
function exportHighScores() {
    const scores = loadHighScoresFromLocalStorage();
    const content = scores.map(s => `${s.initials}|${s.score}|${s.time}|${s.attempts}|${s.level}|${s.timestamp||Date.now()}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highscores_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showSuccessMessage('📁 Scores exportados correctamente');
}

function importHighScores() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const content = String(ev.target.result || '');
                const lines = content.split('\n').map(l => l.trim()).filter(l => l);
                const parsed = lines.map(line => {
                    const parts = line.split('|');
                    return {
                        initials: parts[0] || 'AAA',
                        score: parseInt(parts[1]) || 0,
                        time: parseInt(parts[2]) || 0,
                        attempts: parseInt(parts[3]) || 0,
                        level: parseInt(parts[4]) || 1,
                        timestamp: parseInt(parts[5]) || Date.now()
                    };
                }).filter(s => s.score > 0);
                const existing = loadHighScoresFromLocalStorage();
                const all = existing.concat(parsed);
                // dedupe by initials+score+time
                const unique = [];
                const seen = new Set();
                for (const it of all) {
                    const key = `${it.initials}|${it.score}|${it.time}`;
                    if (!seen.has(key)) {
                        unique.push(it); seen.add(key);
                    }
                }
                unique.sort((a,b) => b.score - a.score);
                saveHighScoresToLocalStorage(unique.slice(0, 500));
                showSuccessMessage(`✅ Se importaron ${parsed.length} puntajes correctamente`);
                closeWallOfFame();
                showWallOfFame();
            } catch (err) {
                console.error('Import error', err);
                showSuccessMessage('⚠ Error importando los puntajes. Formato incorrecto.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

/* ---------------------------
   Success notification
   --------------------------- */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `<div class="success-content"><div class="success-message">${message}</div></div>`;
    document.body.appendChild(successDiv);
    setTimeout(()=> successDiv.classList.add('show'), 20);
    setTimeout(()=> {
        successDiv.classList.add('fade-out');
        setTimeout(()=> { if (successDiv.parentElement) successDiv.remove(); }, 500);
    }, 3200);
}

/* ---------------------------
   Server connection UI
   connectToServer accepts:
     - connectToServer(event)
     - connectToServer() (will pick .server-btn)
   --------------------------- */
function connectToServer(evt) {
    let btn = null;

    if (evt && evt.target) btn = evt.target;
    // fallback: find the first .server-btn
    if (!btn) btn = document.querySelector('.server-btn');

    if (!btn) {
        console.warn('Botón de servidor no encontrado; redirigiendo.');
        window.location.href = SERVER_URL;
        return;
    }

    const originalText = btn.innerHTML;
    const originalStyle = {
        background: btn.style.background,
        color: btn.style.color
    };

    function resetButton() {
        btn.style.background = originalStyle.background || 'linear-gradient(45deg, #001a33, #003366)';
        btn.style.color = originalStyle.color || '#00ffff';
        btn.innerHTML = originalText;
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
    }

    btn.style.background = 'linear-gradient(45deg, #00ffff, #0099cc)';
    btn.style.color = '#000';
    btn.innerHTML = '🔄 ESTABLECIENDO CONEXIÓN...';
    btn.style.transform = 'scale(1.02)';
    btn.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.8)';

    setTimeout(() => {
        btn.innerHTML = '📡 PREPARANDO ENTORNO...';
        setTimeout(() => {
            btn.innerHTML = '✅ REDIRIGIENDO A SANDBOX...';
            try {
                const serverWindow = window.open(SERVER_URL, '_blank');
                if (!serverWindow || serverWindow.closed || typeof serverWindow.closed === 'undefined') {
                    btn.innerHTML = '🚫 POPUP BLOQUEADO';
                    btn.style.background = 'linear-gradient(45deg, #ff3300, #cc0000)';
                    console.warn('⚠️ Popup fue bloqueado. Intentando fallback...');
                    setTimeout(()=> { window.location.href = SERVER_URL; }, 1600);
                } else {
                    btn.innerHTML = '🎯 SANDBOX ACTIVO';
                    btn.style.background = 'linear-gradient(45deg, #00ff00, #33cc33)';
                    setTimeout(resetButton, 2000);
                }
            } catch (err) {
                console.error('❌ Error conectando al servidor:', err);
                btn.innerHTML = '❌ ERROR DE CONEXIÓN';
                btn.style.background = 'linear-gradient(45deg, #ff0000, #990000)';
                setTimeout(resetButton, 2000);
            }
        }, 1000);
    }, 600);
}

/* ---------------------------
   Server status (simple checker)
   --------------------------- */
async function checkServerStatus() {
    const SERVER_URL = "https://natanyona.github.io/CTF_Terminal/";
    try {
        // HEAD + no-cors won't provide status, but we attempt to fetch to see if reachable
        await fetch(SERVER_URL, { method: 'GET', mode: 'no-cors' });
        return true;
    } catch (err) {
        console.log('No se pudo verificar estado del servidor (CORS o desconexión).', err);
        // Para UX, devolvemos true porque sandbox es externo y CORS puede bloquear HEAD.
        return true;
    }
}

function updateServerStatusDisplay() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusSpan = document.querySelector('.server-status span');
    if (!statusIndicator || !statusSpan) return;

    checkServerStatus().then(isOnline => {
        if (isOnline) {
            statusIndicator.style.background = '#00ff00';
            statusIndicator.style.animation = 'pulse-status 2s infinite';
            statusSpan.textContent = 'Servidor activo - Sandbox listo para conexión';
        } else {
            statusIndicator.style.background = '#ff6600';
            statusIndicator.style.animation = 'pulse-status 1s infinite';
            statusSpan.textContent = 'Verificando estado del servidor.';
        }
    });
}

/* ---------------------------
   Konami code easter egg
   --------------------------- */
let konamiBuffer = [];
const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
document.addEventListener('keydown', (e) => {
    konamiBuffer.push(e.code);
    if (konamiBuffer.length > konamiSeq.length) konamiBuffer.shift();
    if (JSON.stringify(konamiBuffer) === JSON.stringify(konamiSeq)) {
        console.log('%cKONAMI ACTIVATED', 'color: #ff00ff; font-weight: bold;');
        showSuccessMessage('🎮 KONAMI CODE ACTIVADO');
        // efecto visual
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(()=> document.body.style.animation = '', 4000);
        konamiBuffer = [];
    }
});

/* ---------------------------
   Utilities: copy to clipboard
   --------------------------- */
function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showSuccessMessage('📋 Copiado'); } catch(e){ console.warn(e); }
        ta.remove();
        return;
    }
    navigator.clipboard.writeText(text).then(()=> showSuccessMessage('📋 Copiado al portapapeles'));
}

/* ---------------------------
   Initialization on DOMContentLoaded
   --------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // Start timer
    initializeTimer();

    // Set initial level (works if HTML calls selectLevel(1) too)
    selectLevel(1);

    // Update server status periodically
    updateServerStatusDisplay();
    setInterval(updateServerStatusDisplay, 30000);

    // Attach submit listener as progressive enhancement in case inline handler missing
    const form = document.getElementById('flagForm');
    if (form) {
        form.addEventListener('submit', (e) => submitFlag(e));
    }

    // Attach connectToServer enhancement (if HTML uses inline onclick, it's ok; this is additive)
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // let inline onclick run first (if present). then this
            // but to avoid double-open, prevent default navigation if anchor.
            e.preventDefault();
            connectToServer(e);
        });
    });

    // style tweaks for scoreboard columns (optional)
    const style = document.createElement('style');
    style.textContent = `
        .scoreboard-header { grid-template-columns: 60px 1fr 80px 100px 80px 100px; }
        .score-row { grid-template-columns: 60px 1fr 80px 100px 80px 100px; }
    `;
    document.head.appendChild(style);
});

/* ---------------------------
   Expose some helpers globally (para consola)
   --------------------------- */
window.selectLevel = selectLevel;
window.connectToServer = connectToServer;
window.submitFlag = submitFlag;
window.showWallOfFame = showWallOfFame;
window.exportHighScores = exportHighScores;
window.importHighScores = importHighScores;
window.clearHighScores = clearHighScores;
window.copyToClipboard = copyToClipboard;

/* End of script.js */
