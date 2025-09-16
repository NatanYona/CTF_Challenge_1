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
// ENHANCED TIMER AND STATS SYSTEM
// ===========================================
let gameStartTime = Date.now();
let failedAttempts = 0;
let timerInterval;
let gameCompleted = false;
let hintUsed = false;
let speedBonusThresholds = [30, 60, 120, 300]; // Thresholds in seconds for speed bonuses

function initializeTimer() {
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameCompleted) {
            // Timer runs silently
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
// ADVANCED SCORING SYSTEM
// ===========================================
function calculateScore(timeSeconds, attempts, hintsUsed = false) {
    // Base score significantly increased
    let baseScore = 50000;
    
    // Time-based scoring (more complex curve)
    let timeMultiplier = 1.0;
    if (timeSeconds <= 30) {
        timeMultiplier = 3.0; // Triple score for under 30 seconds
    } else if (timeSeconds <= 60) {
        timeMultiplier = 2.5; // 2.5x for under 1 minute
    } else if (timeSeconds <= 120) {
        timeMultiplier = 2.0; // 2x for under 2 minutes
    } else if (timeSeconds <= 300) {
        timeMultiplier = 1.5; // 1.5x for under 5 minutes
    } else if (timeSeconds <= 600) {
        timeMultiplier = 1.2; // 1.2x for under 10 minutes
    } else if (timeSeconds <= 1200) {
        timeMultiplier = 1.0; // Base multiplier for under 20 minutes
    } else {
        // Exponential penalty for longer times
        const extraMinutes = (timeSeconds - 1200) / 60;
        timeMultiplier = Math.max(0.1, 1.0 - (extraMinutes * 0.05));
    }
    
    // Apply time multiplier
    baseScore *= timeMultiplier;
    
    // Attempts-based penalty (exponential)
    let attemptsPenalty = 0;
    if (attempts > 0) {
        // Each failed attempt reduces score exponentially
        attemptsPenalty = baseScore * (1 - Math.pow(0.85, attempts));
    }
    baseScore -= attemptsPenalty;
    
    // Perfect run bonus
    if (attempts === 0) {
        baseScore += 25000; // Perfect run bonus
    }
    
    // Speed bonuses
    speedBonusThresholds.forEach((threshold, index) => {
        if (timeSeconds <= threshold) {
            const bonus = (speedBonusThresholds.length - index) * 5000;
            baseScore += bonus;
        }
    });
    
    // First attempt bonus
    if (attempts <= 1) {
        baseScore += 15000;
    } else if (attempts <= 2) {
        baseScore += 8000;
    } else if (attempts <= 3) {
        baseScore += 3000;
    }
    
    // Hint penalty
    if (hintsUsed) {
        baseScore *= 0.8; // 20% penalty for using hints
    }
    
    // Consistency bonus (time vs attempts balance)
    const timePerAttempt = attempts > 0 ? timeSeconds / (attempts + 1) : timeSeconds;
    if (timePerAttempt > 30 && attempts <= 2) {
        baseScore += 5000; // Thoughtful approach bonus
    }
    
    // Ensure minimum score
    return Math.max(1000, Math.floor(baseScore));
}

function getScoreBreakdown(timeSeconds, attempts, hintsUsed = false) {
    const breakdown = {
        baseScore: 50000,
        timeMultiplier: 1.0,
        timeBonus: 0,
        perfectBonus: 0,
        speedBonus: 0,
        firstAttemptBonus: 0,
        attemptsPenalty: 0,
        hintPenalty: 0,
        consistencyBonus: 0,
        finalScore: 0
    };
    
    // Calculate each component
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
    
    breakdown.timeBonus = breakdown.baseScore * (breakdown.timeMultiplier - 1);
    
    if (attempts === 0) breakdown.perfectBonus = 25000;
    
    speedBonusThresholds.forEach((threshold, index) => {
        if (timeSeconds <= threshold) {
            breakdown.speedBonus += (speedBonusThresholds.length - index) * 5000;
        }
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
                                      breakdown.speedBonus + breakdown.firstAttemptBonus + 
                                      breakdown.perfectBonus - breakdown.attemptsPenalty;
        breakdown.hintPenalty = scoreBeforeHintPenalty * 0.2;
    }
    
    const timePerAttempt = attempts > 0 ? timeSeconds / (attempts + 1) : timeSeconds;
    if (timePerAttempt > 30 && attempts <= 2) {
        breakdown.consistencyBonus = 5000;
    }
    
    breakdown.finalScore = calculateScore(timeSeconds, attempts, hintsUsed);
    
    return breakdown;
}

// ===========================================
// ENHANCED FILE SYSTEM - DUAL STORAGE
// ===========================================
const HIGHSCORES_FILE = 'highscores.txt';

// Try to write to file system (will fail on GitHub Pages but work locally)
async function writeHighScoresToFile(scores) {
    try {
        if (typeof window !== 'undefined' && window.fs && window.fs.writeFile) {
            // This would work in a local file system environment
            const content = scores.map(s => 
                `${s.initials}|${s.score}|${s.time}|${s.attempts}|${s.timestamp || Date.now()}`
            ).join('\n');
            
            await window.fs.writeFile(HIGHSCORES_FILE, content, 'utf8');
            console.log('✅ Scores saved to file successfully');
            return true;
        }
    } catch (error) {
        console.warn('⚠ Could not write to file system:', error.message);
    }
    return false;
}

// Enhanced localStorage with backup
function saveHighScoresToLocalStorage(scores) {
    try {
        // Sort by score before saving
        scores.sort((a, b) => b.score - a.score);
        
        // Add timestamps if missing
        scores.forEach(score => {
            if (!score.timestamp) {
                score.timestamp = Date.now();
            }
        });
        
        localStorage.setItem('ctfHighScores', JSON.stringify(scores));
        localStorage.setItem('ctfHighScoresBackup', JSON.stringify(scores));
        localStorage.setItem('ctfLastSaved', Date.now().toString());
        
        console.log('💾 Scores saved to localStorage');
        return true;
    } catch (error) {
        console.error('Error saving scores to localStorage', error);
        return false;
    }
}

async function loadHighScores() {
    try {
        // Try to load from file first (will fail on GitHub Pages)
        if (typeof window !== 'undefined' && window.fs && window.fs.readFile) {
            try {
                const content = await window.fs.readFile(HIGHSCORES_FILE, { encoding: 'utf8' });
                const scores = content.trim().split('\n').map(line => {
                    const [initials, score, time, attempts, timestamp] = line.split('|');
                    return {
                        initials: initials || 'AAA',
                        score: parseInt(score) || 0,
                        time: parseInt(time) || 0,
                        attempts: parseInt(attempts) || 0,
                        timestamp: parseInt(timestamp) || Date.now()
                    };
                }).filter(score => score.score > 0);
                
                if (scores.length > 0) {
                    console.log('📁 Scores loaded from file');
                    return scores.sort((a, b) => b.score - a.score);
                }
            } catch (fileError) {
                console.log('📁 No file found, falling back to localStorage');
            }
        }
        
        // Fallback to localStorage
        return loadHighScoresFromLocalStorage();
    } catch (error) {
        console.log('Error loading highscores, initializing new array', error);
        return [];
    }
}

function loadHighScoresFromLocalStorage() {
    try {
        const scoresJson = localStorage.getItem('ctfHighScores');
        if (!scoresJson) {
            // Try backup
            const backupJson = localStorage.getItem('ctfHighScoresBackup');
            if (backupJson) {
                console.log('🔄 Restored from backup');
                const scores = JSON.parse(backupJson);
                saveHighScoresToLocalStorage(scores);
                return scores;
            }
            return [];
        }
        
        const scores = JSON.parse(scoresJson);
        return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error loading scores from localStorage', error);
        
        // Try backup
        try {
            const backupJson = localStorage.getItem('ctfHighScoresBackup');
            if (backupJson) {
                console.log('🔄 Restored from corrupted localStorage backup');
                return JSON.parse(backupJson);
            }
        } catch (backupError) {
            console.error('Backup also corrupted', backupError);
        }
        
        return [];
    }
}

async function saveHighScore(initials, score, time, attempts) {
    try {
        const scores = await loadHighScores();
        const newScore = {
            initials,
            score,
            time,
            attempts,
            timestamp: Date.now()
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 100 scores
        const topScores = scores.slice(0, 100);
        
        // Try to save to file first
        const fileSaved = await writeHighScoresToFile(topScores);
        
        // Always save to localStorage as backup
        const localSaved = saveHighScoresToLocalStorage(topScores);
        
        if (fileSaved) {
            showSuccessMessage('🎉 Score guardado en archivo y localStorage!');
        } else if (localSaved) {
            showSuccessMessage('💾 Score guardado en localStorage (archivo no disponible)');
        } else {
            showSaveInstructions(initials, score, time, attempts);
            return false;
        }
        
        // Update Wall of Fame if open
        const wallOfFameModal = document.querySelector('.wall-of-fame-modal');
        if (wallOfFameModal) {
            wallOfFameModal.remove();
            showWallOfFame();
        }
        
        return true;
    } catch (error) {
        console.error('Error saving score:', error);
        showSaveInstructions(initials, score, time, attempts);
        return false;
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <div class="success-content">
            <div class="success-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        successDiv.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 500);
    }, 3000);
}

function showSaveInstructions(initials, score, time, attempts) {
    const modal = document.createElement('div');
    modal.className = 'save-instructions-modal';
    modal.innerHTML = `
        <div class="save-instructions-content">
            <h3>💾 GUARDAR SCORE MANUALMENTE</h3>
            <p>Para guardar tu puntaje permanentemente, copia el siguiente código y pégalo en el archivo <strong>highscores.txt</strong>:</p>
            
            <div class="score-display">
                <div class="initials">${initials}</div>
                <div class="score">${score.toLocaleString()} puntos</div>
                <div class="breakdown-info">Tiempo: ${formatTime(time)} | Intentos: ${attempts}</div>
            </div>
            
            <div class="code-line">${initials}|${score}|${time}|${attempts}|${Date.now()}</div>
            
            <p><strong>Instrucciones:</strong></p>
            <ol>
                <li>Crea un archivo llamado "highscores.txt" en la raíz del proyecto</li>
                <li>Agrega la línea de arriba al archivo</li>
                <li>Guarda el archivo</li>
                <li>Actualiza la página para ver tu puntaje en el Wall of Fame</li>
            </ol>
            
            <button onclick="copyToClipboard('${initials}|${score}|${time}|${attempts}|${Date.now()}')" class="copy-btn">
                📋 COPIAR CÓDIGO
            </button>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                ENTENDIDO
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessMessage('📋 Código copiado al portapapeles!');
    }).catch(() => {
        console.log('Fallback copy method');
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccessMessage('📋 Código copiado!');
    });
}

// Always show initials input for any score
async function checkHighScore(score) {
    return true;
}

function showInitialsInput(score, time, attempts) {
    const breakdown = getScoreBreakdown(time, attempts, hintUsed);
    
    const modal = document.createElement('div');
    modal.className = 'initials-modal';
    modal.innerHTML = `
        <div class="initials-modal-content">
            <div class="arcade-title">🏆 GUARDAR SCORE</div>
            <div class="score-display">
                <div class="label">SCORE FINAL:</div>
                <div class="value">${score.toLocaleString()}</div>
            </div>
            
            <div class="score-breakdown">
                <div class="breakdown-title">📊 DESGLOSE DEL PUNTAJE:</div>
                <div class="breakdown-item">Base: +${breakdown.baseScore.toLocaleString()}</div>
                <div class="breakdown-item">Multiplicador de tiempo: x${breakdown.timeMultiplier.toFixed(2)}</div>
                ${breakdown.speedBonus > 0 ? `<div class="breakdown-item bonus">Bonus velocidad: +${breakdown.speedBonus.toLocaleString()}</div>` : ''}
                ${breakdown.perfectBonus > 0 ? `<div class="breakdown-item bonus">Ejecución perfecta: +${breakdown.perfectBonus.toLocaleString()}</div>` : ''}
                ${breakdown.firstAttemptBonus > 0 ? `<div class="breakdown-item bonus">Bonus pocos intentos: +${breakdown.firstAttemptBonus.toLocaleString()}</div>` : ''}
                ${breakdown.consistencyBonus > 0 ? `<div class="breakdown-item bonus">Bonus consistencia: +${breakdown.consistencyBonus.toLocaleString()}</div>` : ''}
                ${breakdown.attemptsPenalty > 0 ? `<div class="breakdown-item penalty">Penalización intentos: -${Math.floor(breakdown.attemptsPenalty).toLocaleString()}</div>` : ''}
                ${breakdown.hintPenalty > 0 ? `<div class="breakdown-item penalty">Penalización pistas: -${Math.floor(breakdown.hintPenalty).toLocaleString()}</div>` : ''}
            </div>
            
            <div class="initials-input-section">
                <div class="label">INGRESA TUS INICIALES:</div>
                <div class="initials-inputs">
                    <input type="text" class="initial-input" maxlength="1" id="initial1">
                    <input type="text" class="initial-input" maxlength="1" id="initial2">
                    <input type="text" class="initial-input" maxlength="1" id="initial3">
                </div>
            </div>
            
            <button onclick="submitInitials(${score}, ${time}, ${attempts})" class="arcade-btn">
                GUARDAR SCORE
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const inputs = modal.querySelectorAll('.initial-input');
    inputs[0].focus();
    
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
            if (e.key === 'Enter') {
                submitInitials(score, time, attempts);
            }
        });
    });
}

function submitInitials(score, time, attempts) {
    const initial1 = document.getElementById('initial1').value || 'A';
    const initial2 = document.getElementById('initial2').value || 'A';
    const initial3 = document.getElementById('initial3').value || 'A';
    
    const initials = initial1 + initial2 + initial3;
    
    const modal = document.querySelector('.initials-modal');
    if (modal) modal.remove();
    
    saveHighScore(initials, score, time, attempts);
    
    setTimeout(() => {
        showWallOfFame();
    }, 1000);
}

async function showWallOfFame() {
    const scores = await loadHighScores();
    const topScores = scores.slice(0, 10);
    
    const lastSaved = localStorage.getItem('ctfLastSaved');
    const lastSavedDate = lastSaved ? new Date(parseInt(lastSaved)).toLocaleString() : 'Nunca';
    
    const modal = document.createElement('div');
    modal.className = 'wall-of-fame-modal';
    modal.innerHTML = `
        <div class="wall-of-fame-content">
            <div class="arcade-header">
                <div class="glitch arcade-title" data-text="🏆 WALL OF FAME">🏆 WALL OF FAME</div>
                <div class="subtitle">TOP HACKERS</div>
                <div class="storage-info">
                    <div class="local-storage-notice">💾 Datos locales | Último guardado: ${lastSavedDate}</div>
                </div>
            </div>
            
            <div class="scoreboard">
                <div class="scoreboard-header">
                    <span class="rank-col">RANK</span>
                    <span class="initials-col">NAME</span>
                    <span class="score-col">SCORE</span>
                    <span class="time-col">TIME</span>
                    <span class="attempts-col">INTENTOS</span>
                </div>
                
                ${topScores.length > 0 ? topScores.map((entry, index) => `
                    <div class="score-row ${index < 3 ? 'top-three' : ''}">
                        <span class="rank">${getRankDisplay(index + 1)}</span>
                        <span class="initials">${entry.initials}</span>
                        <span class="score">${entry.score.toLocaleString()}</span>
                        <span class="time">${formatTime(entry.time)}</span>
                        <span class="attempts">${entry.attempts}</span>
                    </div>
                `).join('') : `
                    <div class="no-scores">
                        <div class="empty-message">NO SCORES YET</div>
                        <div class="be-first">BE THE FIRST HACKER!</div>
                    </div>
                `}
            </div>
            
            <div class="stats-summary">
                <div class="stats-title">📈 ESTADÍSTICAS</div>
                <div class="stats-row">
                    <span>Total de partidas: ${scores.length}</span>
                    <span>Score promedio: ${scores.length > 0 ? Math.floor(scores.reduce((a, b) => a + b.score, 0) / scores.length).toLocaleString() : '0'}</span>
                </div>
                <div class="stats-row">
                    <span>Mejor tiempo: ${scores.length > 0 ? formatTime(Math.min(...scores.map(s => s.time))) : 'N/A'}</span>
                    <span>Score máximo: ${scores.length > 0 ? Math.max(...scores.map(s => s.score)).toLocaleString() : '0'}</span>
                </div>
            </div>
            
            <div class="download-buttons">
                <button onclick="exportHighScores()" class="download-btn">
                    💾 EXPORTAR SCORES
                </button>
                <button onclick="importHighScores()" class="download-btn">
                    📤 IMPORTAR SCORES
                </button>
                <button onclick="clearHighScores()" class="download-btn danger">
                    🗑️ LIMPIAR SCORES
                </button>
            </div>
            
            <div class="wall-of-fame-actions">
                <button onclick="closeWallOfFame()" class="arcade-btn">
                    🚀 CONTINUE HACKING
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

function clearHighScores() {
    if (confirm('¿Estás seguro de que quieres borrar todos los puntajes? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('ctfHighScores');
        localStorage.removeItem('ctfHighScoresBackup');
        localStorage.removeItem('ctfLastSaved');
        
        const wallOfFameModal = document.querySelector('.wall-of-fame-modal');
        if (wallOfFameModal) {
            wallOfFameModal.remove();
            showWallOfFame();
        }
        
        showSuccessMessage('🗑️ Todos los puntajes han sido eliminados');
    }
}

function exportHighScores() {
    const scores = loadHighScoresFromLocalStorage();
    const content = scores.map(s => 
        `${s.initials}|${s.score}|${s.time}|${s.attempts}|${s.timestamp || Date.now()}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `highscores_${new Date().toISOString().split('T')[0]}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showSuccessMessage('📁 Scores exportados correctamente');
}

function importHighScores() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const newScores = content.trim().split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        const [initials, score, time, attempts, timestamp] = line.split('|');
                        return {
                            initials: initials || 'AAA',
                            score: parseInt(score) || 0,
                            time: parseInt(time) || 0,
                            attempts: parseInt(attempts) || 0,
                            timestamp: parseInt(timestamp) || Date.now()
                        };
                    })
                    .filter(score => score.score > 0);
                
                // Merge with existing scores
                const existingScores = loadHighScoresFromLocalStorage();
                const allScores = [...existingScores, ...newScores];
                
                // Remove duplicates and sort
                const uniqueScores = allScores
                    .filter((score, index, arr) => 
                        arr.findIndex(s => s.initials === score.initials && s.score === score.score && s.time === score.time) === index
                    )
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 100); // Keep top 100
                
                saveHighScoresToLocalStorage(uniqueScores);
                
                // Update Wall of Fame
                const wallOfFameModal = document.querySelector('.wall-of-fame-modal');
                if (wallOfFameModal) {
                    wallOfFameModal.remove();
                    showWallOfFame();
                }
                
                showSuccessMessage(`✅ Se importaron ${newScores.length} puntajes correctamente`);
            } catch (error) {
                showSuccessMessage('⚠ Error importando los puntajes. Formato incorrecto.');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function getRankDisplay(rank) {
    switch(rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `#${rank}`;
    }
}

function closeWallOfFame() {
    const modal = document.querySelector('.wall-of-fame-modal');
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 500);
    }
}

// ===========================================
// ENHANCED STATS MODAL WITH SCORE BREAKDOWN
// ===========================================
async function createStatsModal() {
    const modal = document.createElement('div');
    modal.id = 'statsModal';
    modal.className = 'stats-modal';
    
    const elapsedTime = getElapsedTime();
    const score = calculateScore(elapsedTime, failedAttempts, hintUsed);
    const breakdown = getScoreBreakdown(elapsedTime, failedAttempts, hintUsed);
    const efficiency = failedAttempts === 0 ? 'PERFECTO' : 
                     failedAttempts <= 2 ? 'EXCELENTE' : 
                     failedAttempts <= 5 ? 'BUENO' : 'MEJORABLE';
    
    modal.innerHTML = `
        <div class="stats-modal-content">
            <div class="stats-header">
                <div class="glitch stats-title" data-text="🎯 MISIÓN COMPLETADA">🎯 MISIÓN COMPLETADA</div>
                <div class="stats-subtitle">ANÁLISIS DE RENDIMIENTO</div>
            </div>
            
            <div class="final-score-display">
                <div class="score-label">SCORE FINAL</div>
                <div class="score-value">${score.toLocaleString()}</div>
            </div>
            
            <div class="score-breakdown-section">
                <div class="breakdown-title">📊 DESGLOSE DETALLADO</div>
                <div class="breakdown-grid">
                    <div class="breakdown-item base">
                        <span class="item-label">Score Base:</span>
                        <span class="item-value">+${breakdown.baseScore.toLocaleString()}</span>
                    </div>
                    <div class="breakdown-item ${breakdown.timeMultiplier > 1 ? 'bonus' : 'neutral'}">
                        <span class="item-label">Multiplicador Tiempo:</span>
                        <span class="item-value">x${breakdown.timeMultiplier.toFixed(2)}</span>
                    </div>
                    ${breakdown.speedBonus > 0 ? `
                        <div class="breakdown-item bonus">
                            <span class="item-label">Bonus Velocidad:</span>
                            <span class="item-value">+${breakdown.speedBonus.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${breakdown.perfectBonus > 0 ? `
                        <div class="breakdown-item bonus">
                            <span class="item-label">Ejecución Perfecta:</span>
                            <span class="item-value">+${breakdown.perfectBonus.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${breakdown.firstAttemptBonus > 0 ? `
                        <div class="breakdown-item bonus">
                            <span class="item-label">Bonus Pocos Intentos:</span>
                            <span class="item-value">+${breakdown.firstAttemptBonus.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${breakdown.consistencyBonus > 0 ? `
                        <div class="breakdown-item bonus">
                            <span class="item-label">Bonus Consistencia:</span>
                            <span class="item-value">+${breakdown.consistencyBonus.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${breakdown.attemptsPenalty > 0 ? `
                        <div class="breakdown-item penalty">
                            <span class="item-label">Penalización Intentos:</span>
                            <span class="item-value">-${Math.floor(breakdown.attemptsPenalty).toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${breakdown.hintPenalty > 0 ? `
                        <div class="breakdown-item penalty">
                            <span class="item-label">Penalización Pistas:</span>
                            <span class="item-value">-${Math.floor(breakdown.hintPenalty).toLocaleString()}</span>
                        </div>
                    ` : ''}
                </div>
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
            
            <div class="performance-analysis">
                <div class="analysis-title">📝 ANÁLISIS DE RENDIMIENTO</div>
                <div class="analysis-text">${getPerformanceAnalysis(elapsedTime, failedAttempts, score)}</div>
            </div>
            
            <div class="action-buttons">
                <button class="arcade-btn primary" onclick="checkAndSaveScore(${score}, ${elapsedTime}, ${failedAttempts})">
                    💾 GUARDAR SCORE
                </button>
                <button class="arcade-btn" onclick="showWallOfFame()">
                    🏆 WALL OF FAME
                </button>
                <button class="arcade-btn" onclick="closeStatsModal()">
                    🚀 CONTINUAR
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

function getPerformanceAnalysis(time, attempts, score) {
    if (time < 30 && attempts === 0) {
        return "🔥 RENDIMIENTO EXTRAORDINARIO: Completaste el challenge en tiempo récord sin errores. Eres un verdadero elite hacker!";
    } else if (time < 60 && attempts <= 1) {
        return "⚡ EXCELENTE RENDIMIENTO: Velocidad impresionante con mínimos errores. Tienes gran potencial como pentester.";
    } else if (time < 300 && attempts <= 3) {
        return "✅ BUEN RENDIMIENTO: Tiempo respetable con pocos errores. Sigues un enfoque metodológico sólido.";
    } else if (attempts === 0) {
        return "🎯 PRECISIÓN PERFECTA: Aunque tomaste tu tiempo, no cometiste errores. La paciencia es una virtud del hacker.";
    } else if (time < 120) {
        return "🏃‍♂️ VELOCIDAD SOBRE PRECISIÓN: Eres rápido pero podrías mejorar la precisión. Considera tomarte un poco más de tiempo.";
    } else if (attempts <= 2) {
        return "🧠 ENFOQUE METÓDICO: Pocos errores indican un buen proceso de pensamiento. El tiempo se mejora con la práctica.";
    } else {
        return "📚 ESPACIO PARA MEJORAR: Cada hacker tiene que empezar en algún lugar. ¡Sigue practicando y mejorarás!";
    }
}

async function checkAndSaveScore(score, time, attempts) {
    closeStatsModal();
    showInitialsInput(score, time, attempts);
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
    
    // Time-based achievements
    if (time < 30) achievements.push('⚡ LIGHTNING FAST - Menos de 30 segundos');
    else if (time < 60) achievements.push('🏃 SPEED DEMON - Menos de 1 minuto');
    else if (time < 300) achievements.push('⏰ QUICK SOLVER - Menos de 5 minutos');
    
    // Attempts-based achievements
    if (attempts === 0) achievements.push('🎯 FIRST SHOT - Sin errores');
    else if (attempts <= 1) achievements.push('🎪 ALMOST PERFECT - Máximo 1 error');
    else if (attempts <= 2) achievements.push('🧠 BIG BRAIN - Máximo 2 errores');
    
    // Score-based achievements
    if (score >= 150000) achievements.push('👑 LEGENDARY - Score legendario');
    else if (score >= 120000) achievements.push('💎 ELITE STATUS - Score élite');
    else if (score >= 90000) achievements.push('🏆 MASTER CLASS - Score magistral');
    else if (score >= 60000) achievements.push('⭐ HIGH PERFORMER - Alto rendimiento');
    
    // Special achievements
    if (time > 1800) achievements.push('🕰️ METHODICAL - Más de 30 minutos');
    if (attempts >= 10) achievements.push('💪 PERSISTENT - Nunca te rindes');
    if (time < 60 && attempts <= 2) achievements.push('🚀 ROCKET HACKER - Rápido y preciso');
    
    // Always include completion achievement
    achievements.push('📃 FLAG HUNTER - Challenge completado');
    
    return achievements;
}

function closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 500);
    }
}

// ===========================================
// ENHANCED COMPLETION SYSTEM
// ===========================================
function showCompletionEasterEggs() {
    console.clear();
    const score = calculateScore(getElapsedTime(), failedAttempts, hintUsed);
    const breakdown = getScoreBreakdown(getElapsedTime(), failedAttempts, hintUsed);
    
    console.log(`%c
██████╗ ██╗    ██╗███████╗███████╗ ██████╗ ███╗   ███╗███████╗
██╔══██╗██║    ██║██╔════╝██╔════╝██╔═══██╗████╗ ████║██╔════╝
███████║██║ █╗ ██║█████╗  ███████╗██║   ██║██╔████╔██║█████╗  
██╔══██║██║███╗██║██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██╔══╝  
██║  ██║╚███╔███╔╝███████╗███████║╚██████╔╝██║ ╚═╝ ██║███████╗
╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
                                                              
    🎉 ¡FELICITACIONES! Has crackeado el sistema.
    🏆 Tiempo: ${formatTime(getElapsedTime())}
    🎯 Intentos fallidos: ${failedAttempts}
    🔥 Score: ${score.toLocaleString()}
    📊 Nivel: ${getRanking(getElapsedTime(), failedAttempts)}
    
    📈 DESGLOSE DEL SCORE:
    • Base: ${breakdown.baseScore.toLocaleString()}
    • Multiplicador: x${breakdown.timeMultiplier.toFixed(2)}
    • Bonificaciones: +${(breakdown.speedBonus + breakdown.perfectBonus + breakdown.firstAttemptBonus + breakdown.consistencyBonus).toLocaleString()}
    • Penalizaciones: -${Math.floor(breakdown.attemptsPenalty + breakdown.hintPenalty).toLocaleString()}
    `, 'color: #00ff00; font-family: monospace; font-weight: bold;');
    
    console.log('%c📝 COMANDOS SECRETOS DESBLOQUEADOS:', 'color: #00ffff; font-weight: bold;');
    console.log('• hack() - Modo hacker avanzado');
    console.log('• stats() - Ver estadísticas detalladas');
    console.log('• konami() - Código secreto');
    console.log('• walloffame() - Ver hall de la fama');
    console.log('• breakdown() - Desglose de puntuación');
    
    window.hack = () => {
        console.log('%c🚨 INICIANDO MODO HACKER...', 'color: #ff0000; font-size: 16px;');
        document.body.style.filter = 'hue-rotate(120deg)';
        setTimeout(() => document.body.style.filter = '', 3000);
    };

    window.stats = () => {
        console.table({
            'Tiempo Total': formatTime(getElapsedTime()),
            'Intentos Fallidos': failedAttempts,
            'Score Final': score,
            'Eficiencia': getRanking(getElapsedTime(), failedAttempts),
            'Inicio': new Date(gameStartTime).toLocaleTimeString(),
            'Completado': new Date().toLocaleTimeString()
        });
    };
    
    window.breakdown = () => {
        console.table(breakdown);
        console.log('%cAnálisis: ' + getPerformanceAnalysis(getElapsedTime(), failedAttempts, score), 'color: #ffaa00; font-style: italic;');
    };
    
    window.konami = () => {
        console.log('%c🎮 KONAMI CODE DETECTED! Unlocking secret features...', 'color: #ff00ff;');
        document.querySelector('.terminal').style.transform = 'rotateY(360deg)';
        document.querySelector('.terminal').style.transition = 'transform 2s';
    };

    window.walloffame = () => {
        showWallOfFame();
    };
}

// ===========================================
// SERVER CONNECTION FUNCTIONS (NUEVA FUNCIONALIDAD)
// ===========================================
function connectToServer() {
    // URL configurada del servidor
    const SERVER_URL = "https://natanyona.github.io/CTF_Terminal/";
    
    const btn = event.target;
    const originalText = btn.innerHTML;
    const originalStyle = {
        background: btn.style.background,
        color: btn.style.color
    };
    
    // Feedback visual de conexión
    btn.style.background = 'linear-gradient(45deg, #00ffff, #0099cc)';
    btn.style.color = '#000';
    btn.innerHTML = '🔄 ESTABLECIENDO CONEXIÓN...';
    btn.style.transform = 'scale(1.02)';
    btn.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.8)';
    
    // Simular proceso de conexión
    setTimeout(() => {
        btn.innerHTML = '📡 PREPARANDO ENTORNO...';
        
        setTimeout(() => {
            btn.innerHTML = '✅ REDIRIGIENDO A SANDBOX...';
            
            // Abrir en nueva pestaña
            try {
                // Abrir el servidor sandbox
                const serverWindow = window.open(SERVER_URL, '_blank');
                
                // Verificar si se bloqueó el popup
                if (!serverWindow || serverWindow.closed || typeof serverWindow.closed === 'undefined') {
                    btn.innerHTML = '🚫 POPUP BLOQUEADO';
                    btn.style.background = 'linear-gradient(45deg, #ff3300, #cc0000)';
                    console.warn('⚠️ Popup fue bloqueado. Permitir popups para este sitio.');
                    
                    setTimeout(() => {
                        // Intentar navegación directa
                        window.location.href = SERVER_URL;
                    }, 2000);
                } else {
                    // Conexión exitosa
                    btn.innerHTML = '🎯 SANDBOX ACTIVO';
                    btn.style.background = 'linear-gradient(45deg, #00ff00, #33cc33)';
                    
                    // Log de éxito
                    console.log('✅ Conexión al sandbox establecida');
                    console.log('🔗 URL:', SERVER_URL);
                    console.log('🕐 Tiempo:', new Date().toLocaleTimeString());
                    
                    setTimeout(() => resetButton(), 4000);
                }
                
            } catch (error) {
                console.error('❌ Error conectando al servidor:', error);
                btn.innerHTML = '❌ ERROR DE CONEXIÓN';
                btn.style.background = 'linear-gradient(45deg, #ff0000, #990000)';
                setTimeout(() => resetButton(), 3000);
            }
            
        }, 1500);
    }, 1000);
    
    function resetButton() {
        btn.style.background = originalStyle.background || 'linear-gradient(45deg, #001a33, #003366)';
        btn.style.color = originalStyle.color || '#00ffff';
        btn.innerHTML = originalText;
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
    }
    
    // Analytics/logging opcional
    logServerConnection();
}

// ===========================================
// FUNCIÓN DE LOGGING PARA CONEXIONES AL SERVIDOR
// ===========================================
function logServerConnection() {
    const connectionData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        gameTime: getElapsedTime(),
        attempts: failedAttempts
    };
    
    console.group('🌐 SERVER CONNECTION LOG');
    console.log('📊 Datos de conexión:', connectionData);
    console.log('⏱️ Tiempo en juego:', formatTime(getElapsedTime()));
    console.log('🎯 Intentos realizados:', failedAttempts);
    console.groupEnd();
}

// ===========================================
// FUNCIÓN AUXILIAR PARA VERIFICAR ESTADO DEL SERVIDOR
// ===========================================
async function checkServerStatus() {
    const SERVER_URL = "https://natanyona.github.io/CTF_Terminal/";
    
    try {
        // Intentar hacer una verificación básica (opcional)
        // Nota: Esto podría estar bloqueado por CORS
        const response = await fetch(SERVER_URL, { 
            method: 'HEAD',
            mode: 'no-cors' 
        });
        
        return true; // Asumimos que está disponible
    } catch (error) {
        console.log('ℹ️ No se pudo verificar estado del servidor (normal si hay CORS)');
        return true; // Asumimos disponibilidad
    }
}

// ===========================================
// FUNCIÓN PARA ACTUALIZAR STATUS DEL SERVIDOR EN TIEMPO REAL
// ===========================================
function updateServerStatusDisplay() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.server-status span');
    
    if (statusIndicator && statusText) {
        checkServerStatus().then(isOnline => {
            if (isOnline) {
                statusIndicator.style.background = '#00ff00';
                statusIndicator.style.animation = 'pulse-status 2s infinite';
                statusText.textContent = 'Servidor activo - Sandbox listo para conexión';
            } else {
                statusIndicator.style.background = '#ff6600';
                statusIndicator.style.animation = 'pulse-status 1s infinite';
                statusText.textContent = 'Verificando estado del servidor...';
            }
        });
    }
}

// ===========================================
// ORIGINAL CORE FUNCTIONS (Enhanced)
// ===========================================

// FUNCIÓN ORIGINAL COMENTADA - REEMPLAZADA POR connectToServer()
/*
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
*/

// Obfuscated flag (unchanged)
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
            stopTimer();
            
            statusMessage.textContent = '🎉 ¡FLAG CORRECTA! ¡Felicitaciones, hacker!';
            statusMessage.classList.add('status-success', 'show');

            document.body.style.animation = 'glitch 0.1s linear 10';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 1000);

            showCompletionEasterEggs();
            
            setTimeout(() => {
                createStatsModal();
            }, 2000);

        } else if (flag.length > 0) {
            failedAttempts++;
            
            statusMessage.textContent = `⚠ Flag incorrecta. Sigue intentando... (${failedAttempts} intentos fallidos)`;
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

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeTimer();
    
    const terminal = document.querySelector('.terminal');
    const wallOfFameSection = document.createElement('div');
    wallOfFameSection.className = 'content-section';
    wallOfFameSection.innerHTML = `
        <div class="section-title">[HALL OF FAME] Top Hackers</div>
        <p style="margin-bottom: 15px; opacity: 0.8;">Ve los mejores puntajes de la comunidad hacker con sistema de scoring avanzado.</p>
        <button onclick="showWallOfFame()" class="download-btn">
            🏆 VER WALL OF FAME
        </button>
    `;
    
    const lastSection = terminal.querySelector('.content-section:last-of-type');
    terminal.insertBefore(wallOfFameSection, lastSection);
    
    // Verificar estado del servidor cada 30 segundos
    updateServerStatusDisplay();
    setInterval(updateServerStatusDisplay, 30000);
});

// Konami Code Easter Egg (Enhanced)
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        console.log('%c🎮 KONAMI CODE ACTIVATED! MEGA BONUS UNLOCKED!', 'color: #ff00ff; font-size: 20px; font-weight: bold;');
        
        // Visual effects
        document.body.style.animation = 'rainbow 2s infinite';
        
        // Score bonus if game is active
        if (!gameCompleted) {
            showSuccessMessage('🎮 ¡KONAMI CODE! Bonus activado para el próximo intento');
            // Could add actual game benefits here
        }
        
        setTimeout(() => {
            document.body.style.animation = '';
            konamiCode = [];
        }, 5000);
    }
});