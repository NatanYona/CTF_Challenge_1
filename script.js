        // Matrix rain effect
        const canvas = document.getElementById('matrix');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        const matrixArray = matrix.split("");
        const fontSize = 10;
        const columns = canvas.width/fontSize;
        const drops = [];
        
        for(let x = 0; x < columns; x++) {
            drops[x] = 1; 
        }
        
        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px arial';
            
            for(let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
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
        
        // Download function (archivo real)
        function downloadFile() {
            // Crear elemento de descarga para archivo existente
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = './public/ctf_challenge.zip'; // Ruta a tu archivo ZIP
            a.download = 'ctf_challenge.zip'; // Nombre del archivo al descargar
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Efecto visual
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
        
        // Ofuscación de la flag (múltiples capas)
        const _0x1a2b = ['Q1RGe2VqZW1wbG9fZmxhZ18xMjN9', 'YWRtaW4=', 'aGFja2Vy', 'cm9vdA=='];
        const _0x3c4d = (str) => atob(str);
        const _0x5e6f = (a, b) => String.fromCharCode(...a.split('').map((c, i) => c.charCodeAt(0) ^ b.charCodeAt(i % b.length)));
        const _0x7g8h = () => _0x3c4d(_0x1a2b[0]);
        
        // Anti-debugging simple
        const _debug = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            return end - start > 100;
        };
        
        // Submit flag function con validación ofuscada
        function submitFlag(event) {
            event.preventDefault();
            
            const flagInput = document.getElementById('flagInput');
            const statusMessage = document.getElementById('statusMessage');
            const flag = flagInput.value.trim();
            
            // Anti-debugging check
            if (_debug()) {
                statusMessage.textContent = '🔒 Sistema bloqueado por actividad sospechosa';
                statusMessage.classList.add('status-error', 'show');
                return;
            }
            
            statusMessage.classList.remove('show', 'status-success', 'status-error');
            
            setTimeout(() => {
                // Validación con flag ofuscada
                const correctFlag = _0x7g8h(); // Flag en base64 ofuscada
                
                // Verificación con hash adicional para mayor seguridad
                const flagHash = btoa(flag).split('').reverse().join('');
                const correctHash = btoa(correctFlag).split('').reverse().join('');
                
                if (flag === correctFlag && flagHash === correctHash) {
                    statusMessage.textContent = '🎉 ¡FLAG CORRECTA! ¡Felicitaciones, hacker!';
                    statusMessage.classList.add('status-success', 'show');
                    
                    // Efecto de celebración
                    document.body.style.animation = 'glitch 0.1s linear 10';
                    setTimeout(() => {
                        document.body.style.animation = '';
                    }, 1000);
                    
                    // Easter egg en consola
                    console.log('🎯 ' + _0x3c4d('RmVsaWNpdGFjaW9uZXMhIEhhcyBkZXNibG9xdWVhZG8gZWwgc2lzdGVtYQ=='));
                    
                } else if (flag.length > 0) {
                    statusMessage.textContent = '❌ Flag incorrecta. Sigue intentando...';
                    statusMessage.classList.add('status-error', 'show');
                    
                    // Efecto de error
                    flagInput.style.borderColor = '#ff0000';
                    flagInput.style.animation = 'shake 0.5s';
                    
                    setTimeout(() => {
                        flagInput.style.borderColor = '#00ff00';
                        flagInput.style.animation = '';
                    }, 500);
                }
            }, 1000);
        }
        
        // Shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
        
        // Console commands easter egg
        console.log(`
        ██████╗ ██████╗ ███╗   ██╗███████╗ ██████╗ ██╗     ███████╗
       ██╔════╝██╔═══██╗████╗  ██║██╔════╝██╔═══██╗██║     ██╔════╝
       ██║     ██║   ██║██╔██╗ ██║███████╗██║   ██║██║     █████╗  
       ██║     ██║   ██║██║╚██╗██║╚════██║██║   ██║██║     ██╔══╝  
       ╚██████╗╚██████╔╝██║ ╚████║███████║╚██████╔╝███████╗███████╗
        ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚══════╝╚══════╝
        
        🎯 CTF Challenge Console
        📧 ¿Encontraste algo interesante aquí? 
        🔍 Sigue buscando... la flag puede estar en cualquier lado.
        `);