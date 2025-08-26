// Matrix rain effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
const matrixArray = matrix.split("");
const fontSize = 10;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff00';
    ctx.font = fontSize + 'px arial';

    for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

// Resize canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ===========================================
// TIMER AND STATS SYSTEM
// ===========================================
let gameStartTime = Date.now();
let failedAttempts = 0;
let timerInterval;
let gameCompleted = false;

// Initialize timer (hidden - runs in background)
function initializeTimer() {
    // Timer runs silently in background - no visual display
    startTimer();
}

function startTimer() {
    // Timer runs silently, only used for final stats
    timerInterval = setInterval(() => {
        if (!gameCompleted) {
            // Timer just keeps track internally, no visual updates
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
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

// ===========================================
// STATS MODAL
// ===========================================
function createStatsModal() {
    const modal = document.createElement('div');
    modal.id = 'statsModal';
    modal.className = 'stats-modal';
    
    const elapsedTime = getElapsedTime();
    const efficiency = failedAttempts === 0 ? 'PERFECTO' : 
                     failedAttempts <= 2 ? 'EXCELENTE' : 
                     failedAttempts <= 5 ? 'BUENO' : 'MEJORABLE';
    
    modal.innerHTML = `
        <div class="stats-modal-content">
            <div class="stats-header">
                <div class="glitch stats-title" data-text="🎯 MISIÓN COMPLETADA">🎯 MISIÓN COMPLETADA</div>
                <div class="stats-subtitle">ANÁLISIS DE RENDIMIENTO</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-label">TIEMPO TOTAL</div>
                    <div class="stat-value">${formatTime(elapsedTime)}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-label">INTENTOS FALLIDOS</div>
                    <div class="stat-value">${failedAttempts}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-label">EFICIENCIA</div>
                    <div class="stat-value">${efficiency}</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-label">RANKING</div>
                    <div class="stat-value">${getRanking(elapsedTime, failedAttempts)}</div>
                </div>
            </div>
            
            <div class="achievement-section">
                <div class="achievement-title">🏅 LOGROS DESBLOQUEADOS</div>
                <div class="achievements">
                    ${getAchievements(elapsedTime, failedAttempts).map(achievement => 
                        `<div class="achievement">${achievement}</div>`
                    ).join('')}
                </div>
            </div>
            
            <button class="close-modal-btn" onclick="closeStatsModal()">
                🚀 CONTINUAR HACKEANDO
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal appearance
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

function getRanking(time, attempts) {
    if (time < 60 && attempts === 0) return 'ELITE HACKER';
    if (time < 120 && attempts <= 1) return 'MASTER HACKER';
    if (time < 300 && attempts <= 3) return 'SKILLED HACKER';
    if (time < 600 && attempts <= 5) return 'NOVICE HACKER';
    return 'SCRIPT KIDDIE';
}

function getAchievements(time, attempts) {
    const achievements = [];
    
    if (attempts === 0) achievements.push('🎯 FIRST SHOT - Sin errores');
    if (time < 60) achievements.push('⚡ SPEED DEMON - Menos de 1 minuto');
    if (time < 300) achievements.push('🏃 QUICK SOLVER - Menos de 5 minutos');
    if (attempts <= 2) achievements.push('🧠 BIG BRAIN - Máximo 2 intentos');
    if (time > 1800) achievements.push('🐌 METHODICAL - Más de 30 minutos');
    
    achievements.push('🔓 FLAG HUNTER - Challenge completado');
    
    return achievements;
}

function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    modal.classList.add('fade-out');
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 500);
}

// ===========================================
// ENHANCED EASTER EGGS
// ===========================================
function showCompletionEasterEggs() {
    // Console ASCII art celebration
    console.clear();
    console.log(`%c
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████║███████║██║     █████╔╝ █████╗  ██████╔╝
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                  
    🎉 ¡FELICITACIONES! Has crackeado el sistema.
    🏆 Tiempo: ${formatTime(getElapsedTime())}
    🎯 Intentos fallidos: ${failedAttempts}
    🔥 Nivel: ${getRanking(getElapsedTime(), failedAttempts)}
    
    💾 DATOS DEL SISTEMA DESBLOQUEADOS:
    📁 User: root@ctf-server
    🌐 IP: 192.168.1.337
    🔐 Access Level: ADMIN
    `, 'color: #00ff00; font-family: monospace; font-weight: bold;');
    
    // Hidden console commands
    console.log('%c🔍 COMANDOS SECRETOS DESBLOQUEADOS:', 'color: #00ffff; font-weight: bold;');
    console.log('• hack() - Modo hacker avanzado');
    console.log('• stats() - Ver estadísticas detalladas');
    console.log('• konami() - Código secreto');
    
    // Add secret functions to window object
    window.hack = () => {
        console.log('%c🚨 INICIANDO MODO HACKER...', 'color: #ff0000; font-size: 16px;');
        document.body.style.filter = 'hue-rotate(120deg)';
        setTimeout(() => document.body.style.filter = '', 3000);
    };

    
    window.stats = () => {
        console.table({
            'Tiempo Total': formatTime(getElapsedTime()),
            'Intentos Fallidos': failedAttempts,
            'Eficiencia': getRanking(getElapsedTime(), failedAttempts),
            'Inicio': new Date(gameStartTime).toLocaleTimeString(),
            'Completado': new Date().toLocaleTimeString()
        });
    };
    
    window.konami = () => {
        console.log('%c🎮 KONAMI CODE DETECTED! Unlocking secret features...', 'color: #ff00ff;');
        document.querySelector('.terminal').style.transform = 'rotateY(360deg)';
        document.querySelector('.terminal').style.transition = 'transform 2s';
    };
}

// ===========================================
// ORIGINAL FUNCTIONS (ENHANCED)
// ===========================================
function downloadFile() {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = './public/ctf_challenge.zip';
    a.download = 'ctf_challenge.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const btn = event.target;
    btn.style.background = '#00ff00';
    btn.style.color = '#000';
    btn.innerHTML = '✅ DESCARGANDO...';

    setTimeout(() => {
        btn.style.background = 'linear-gradient(45deg, #001100, #003300)';
        btn.style.color = '#00ff00';
        btn.innerHTML = '📦 DESCARGAR CTF.ZIP';
    }, 2000);
}

// Obfuscated flag
const _0x1a2b = ['Lz0oDjAsMCU8OSQsICg9KjUqJSUrLDIsLiArOwU=', 'YWRtaW4=', 'aGFja2Vy', 'cm9vdA=='];
const _0x3c4d = (str) => atob(str);
const _0x5e6f = (a, b) =>
    String.fromCharCode(...a.split('').map((c, i) => c.charCodeAt(0) ^ b.charCodeAt(i % b.length)));
const _0x7g8h = () => _0x5e6f(_0x3c4d(_0x1a2b[0]), "linuxeslomas");

const _debug = () => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    return end - start > 100;
};

function submitFlag(event) {
    event.preventDefault();

    const flagInput = document.getElementById('flagInput');
    const statusMessage = document.getElementById('statusMessage');
    const flag = flagInput.value.trim();

    if (_debug()) {
        statusMessage.textContent = '🔒 Sistema bloqueado por actividad sospechosa';
        statusMessage.classList.add('status-error', 'show');
        return;
    }

    statusMessage.classList.remove('show', 'status-success', 'status-error');

    setTimeout(() => {
        const correctFlag = _0x7g8h();
        const flagHash = btoa(flag).split('').reverse().join('');
        const correctHash = btoa(correctFlag).split('').reverse().join('');

        if (flag === correctFlag && flagHash === correctHash) {
            stopTimer(); // Stop the timer
            
            statusMessage.textContent = '🎉 ¡FLAG CORRECTA! ¡Felicitaciones, hacker!';
            statusMessage.classList.add('status-success', 'show');

            // Visual celebration effect
            document.body.style.animation = 'glitch 0.1s linear 10';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 1000);

            // Show easter eggs and stats
            showCompletionEasterEggs();
            
            // Show stats modal after a delay
            setTimeout(() => {
                createStatsModal();
            }, 2000);

        } else if (flag.length > 0) {
            failedAttempts++; // Increment failed attempts
            
            statusMessage.textContent = `❌ Flag incorrecta. Sigue intentando... (${failedAttempts} intentos fallidos)`;
            statusMessage.classList.add('status-error', 'show');

            flagInput.style.borderColor = '#ff0000';
            flagInput.style.animation = 'shake 0.5s';

            setTimeout(() => {
                flagInput.style.borderColor = '#00ff00';
                flagInput.style.animation = '';
            }, 500);
        }
    }, 1000);
}

// Initialize timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTimer();
});

// Shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    /* Timer Display Styles - REMOVED (timer now hidden) */
    
    /* Stats Modal Styles */
    .stats-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    .stats-modal.show {
        opacity: 1;
    }
    
    .stats-modal.fade-out {
        opacity: 0;
    }
    
    .stats-modal-content {
        background: linear-gradient(135deg, #001122, #002244);
        border: 2px solid #00ff00;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        text-align: center;
        box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
        position: relative;
        overflow: hidden;
    }
    
    .stats-modal-content::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #00ff00, #00ffff, #00ff00);
        z-index: -1;
        border-radius: 17px;
        animation: borderGlow 3s ease-in-out infinite alternate;
    }
    
    .stats-header {
        margin-bottom: 30px;
    }
    
    .stats-title {
        font-size: 2em;
        font-weight: 700;
        color: #00ff00;
        margin-bottom: 10px;
        text-shadow: 0 0 20px #00ff00;
    }
    
    .stats-subtitle {
        font-size: 1.2em;
        color: #00ffff;
        opacity: 0.8;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .stat-item {
        background: rgba(0, 255, 0, 0.1);
        border: 1px solid rgba(0, 255, 0, 0.3);
        border-radius: 10px;
        padding: 15px;
        transition: all 0.3s ease;
    }
    
    .stat-item:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }
    
    .stat-icon {
        font-size: 2em;
        margin-bottom: 10px;
    }
    
    .stat-label {
        font-size: 0.9em;
        color: #00ffff;
        margin-bottom: 5px;
    }
    
    .stat-value {
        font-size: 1.3em;
        font-weight: 700;
        color: #00ff00;
        text-shadow: 0 0 10px #00ff00;
    }
    
    .achievement-section {
        margin-bottom: 30px;
    }
    
    .achievement-title {
        font-size: 1.3em;
        color: #ffaa00;
        margin-bottom: 15px;
        text-shadow: 0 0 10px #ffaa00;
    }
    
    .achievements {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
    }
    
    .achievement {
        background: linear-gradient(45deg, #332200, #664400);
        border: 1px solid #ffaa00;
        border-radius: 20px;
        padding: 8px 15px;
        font-size: 0.9em;
        color: #ffaa00;
        text-shadow: 0 0 5px #ffaa00;
    }
    
    .close-modal-btn {
        padding: 15px 30px;
        background: linear-gradient(45deg, #003300, #006600);
        color: #00ff00;
        border: 2px solid #00ff00;
        border-radius: 10px;
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        font-size: 1.1em;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .close-modal-btn:hover {
        background: #00ff00;
        color: #000;
        box-shadow: 0 0 30px #00ff00;
        transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
        .stats-modal-content {
            padding: 20px;
            margin: 20px;
        }
        
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .stats-title {
            font-size: 1.5em;
        }
    }
`;
document.head.appendChild(style);

// Initial console message
console.log(`
    🎯 CTF Challenge Console - Enhanced Edition
    ⏱️ Timer iniciado: ${new Date().toLocaleTimeString()}
    🔧 ¿Encontraste algo interesante aquí? 
    🔍 Sigue buscando... la flag puede estar en cualquier lado.
    💡 Tip: Completa el challenge para desbloquear comandos secretos!
        `);

// Konami Code Easter Egg
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        console.log('%c🎮 KONAMI CODE ACTIVATED! 30 LIVES UNLOCKED!', 'color: #ff00ff; font-size: 20px; font-weight: bold;');
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
            konamiCode = [];
        }, 5000);
    }
});

// Add rainbow animation for Konami code
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);