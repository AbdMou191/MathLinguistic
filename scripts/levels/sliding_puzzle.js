// scripts/levels/sliding_puzzle.js
// النسخة النهائية المصححة: زر "خلط جديد" يعمل بكفاءة، أرواح ديناميكية، وإنجازات.

(function() {
    'use strict';

    let size = 3; 
    let tiles = [];
    let solution = [];
    let moves = 0;
    let timerInterval = null;
    let seconds = 0;
    
    let gameStats = {
        points: parseInt(localStorage.getItem('math_user_points') || "0"),
        lives: 3,
        maxGridSolved: parseInt(localStorage.getItem('sliding_max_grid') || "0")
    };

    window.loadSliding_puzzlePage = function() {
        window.currentLevel = 'sliding_puzzle';
        moves = 0;
        seconds = 0;
        
        renderPuzzleUI();
        // ننتظر قليلاً لضمان رسم الواجهة ثم نبدأ اللعبة
        setTimeout(() => initPuzzleGame(3), 50);
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('sliding-puzzie'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
    };

    function renderPuzzleUI() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
        <style>
            .puzzle-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 15px; max-width: 500px; margin: auto; color: var(--text-primary); }
            .puzzle-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid var(--accent-color); padding-bottom: 10px; }
            
            .puzzle-stats { 
                display: flex; gap: 15px; font-weight: bold; font-size: 0.9rem; 
                background: var(--card-bg); padding: 10px; border-radius: 10px; 
                width: 100%; justify-content: space-around; margin-bottom: 15px;
                border: 1px solid var(--border-color);
                color: var(--text-primary);
            }

            .puzzle-grid { 
                display: grid; 
                background: var(--border-color); 
                padding: 8px;                 border-radius: 12px; 
                gap: 6px; 
                width: 100%; 
                aspect-ratio: 1/1; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }

            .p-tile { 
                background: var(--accent-color); 
                color: #fff; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold; 
                border-radius: 8px; 
                cursor: pointer; 
                user-select: none;
                font-size: 1.4rem;
                box-shadow: 0 4px 0 var(--accent-hover);
                transition: transform 0.1s, background 0.2s;
            }
            .p-tile:active { transform: scale(0.95); box-shadow: none; }
            
            .p-tile.empty { 
                background: transparent; 
                border: 2px dashed var(--border-color); 
                box-shadow: none;
                cursor: default; 
            }

            .p-tile.wrong { animation: shake 0.3s; background: #e74c3c !important; }

            .p-controls { width: 100%; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
            .p-row { display: flex; gap: 10px; width: 100%; align-items: center; }
            
            .p-select { 
                flex: 1; padding: 10px; border-radius: 8px; 
                border: 1px solid var(--border-color); 
                font-family: 'Cairo'; 
                background: var(--bg-secondary, #fff); 
                color: var(--text-primary); 
                font-weight: bold;
                cursor: pointer;
            }

            .p-btn { flex: 1; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; font-family: 'Cairo'; transition: 0.2s; color: #fff; }
            .btn-new { background: var(--accent-color); }
            .btn-home { background: #95a5a6; flex: 0 0 auto; padding: 10px 15px; }
            @keyframes shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        </style>

        <div class="puzzle-wrapper">
            <div class="puzzle-header">
                <h2 style="margin:0; color: var(--accent-color);">ترتيب الأرقام</h2>
                <button class="p-btn btn-home" onclick="loadHomePage()">خروج</button>
            </div>
            
            <div class="puzzle-stats">
                <span>🏆 <span id="p-pts">${gameStats.points}</span></span>
                <span id="p-lives-container">❤️❤️❤️</span>
                <span>⏱️ <span id="p-timer">00:00</span></span>
                <span>👣 <span id="p-moves">0</span></span>
            </div>

            <div class="p-row">
                <label style="font-weight:bold; font-size:0.9rem;">حجم الشبكة:</label>
                <select id="p-diff" class="p-select" onchange="window.initPuzzleGame(parseInt(this.value))">
                    ${[3,4,5,6,7,8,9].map(n => `<option value="${n}">${n} × ${n}</option>`).join('')}
                </select>
            </div>

            <div id="puzzle-board" class="puzzle-grid"></div>

            <div class="p-controls">
                <div class="p-row">
                    <button class="p-btn btn-new" onclick="window.shuffleCurrentGame()">🔄 خلط جديد</button>
                </div>
            </div>
        </div>`;
    }

    // دالة بدء/إعادة تعيين اللعبة بحجم معين
    window.initPuzzleGame = function(newSize) {
        if(newSize && newSize > 0) {
            size = newSize;
        }
        
        // تحديث القائمة المنسدلة لتطابق الحجم الحالي فقط إذا كانت موجودة
        const select = document.getElementById('p-diff');
        if(select) {
            select.value = size;
        }
        
        moves = 0; 
        seconds = 0; 
        gameStats.lives = size; // الأرواح تساوي الحجم
        
        clearInterval(timerInterval);        startPuzzleTimer();
        
        // إعداد الحل الصحيح
        solution = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
        solution.push(null);
        
        tiles = [...solution];
        shufflePuzzle();
        drawPuzzleBoard();
        updatePuzzleStats();
        
        // showToast(`بدء لغز ${size}×${size} | لديك ${size} محاولات`, 'info');
    };

    // دالة جديدة مخصصة لزر "خلط جديد"
    window.shuffleCurrentGame = function() {
        if(!document.getElementById('puzzle-board')) return;
        
        moves = 0;
        seconds = 0;
        gameStats.lives = size; // إعادة الأرواح كاملة
        
        clearInterval(timerInterval);
        startPuzzleTimer();
        
        // إعادة بناء اللغز من الحل الصحيح ثم خلطه
        tiles = [...solution];
        shufflePuzzle();
        drawPuzzleBoard();
        updatePuzzleStats();
        
        showToast('تم خلط اللغز من جديد! حظاً موفقاً.', 'info');
    };

    function shufflePuzzle() {
        let emptyIdx = tiles.indexOf(null);
        let previousIdx = -1;
        // زيادة عدد حركات الخلط لضمان عشوائية جيدة
        const shuffleMoves = size * 30; 
        
        for (let i = 0; i < shuffleMoves; i++) {
            const neighbors = getPuzzleNeighbors(emptyIdx);
            const validNeighbors = neighbors.filter(n => n !== previousIdx);
            const move = validNeighbors.length > 0 
                ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
                : neighbors[Math.floor(Math.random() * neighbors.length)];
            
            [tiles[emptyIdx], tiles[move]] = [tiles[move], tiles[emptyIdx]];
            previousIdx = emptyIdx;
            emptyIdx = move;        }
    }

    function getPuzzleNeighbors(idx) {
        const n = [];
        const r = Math.floor(idx / size), c = idx % size;
        if (r > 0) n.push(idx - size);
        if (r < size - 1) n.push(idx + size);
        if (c > 0) n.push(idx - 1);
        if (c < size - 1) n.push(idx + 1);
        return n;
    }

    function drawPuzzleBoard() {
        const board = document.getElementById('puzzle-board');
        if(!board) return;
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        const fontSize = size > 6 ? '0.8rem' : (size > 4 ? '1.1rem' : '1.4rem');

        tiles.forEach((tile, i) => {
            const cell = document.createElement('div');
            cell.className = `p-tile ${tile === null ? 'empty' : ''}`;
            cell.style.fontSize = fontSize;
            cell.innerText = tile || '';
            if(tile !== null) cell.onclick = () => handlePuzzleMove(i);
            board.appendChild(cell);
        });
    }

    function handlePuzzleMove(idx) {
        const emptyIdx = tiles.indexOf(null);
        const neighbors = getPuzzleNeighbors(emptyIdx);
        
        if(neighbors.includes(idx)) {
            // حركة صحيحة
            [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
            moves++;
            drawPuzzleBoard();
            updatePuzzleStats();
            checkPuzzleWin();
        } else {
            // حركة خاطئة: خصم حياة
            gameStats.lives--;
            
            const cell = document.querySelectorAll('.p-tile')[idx];
            if(cell) {
                cell.classList.add('wrong');
                setTimeout(() => cell.classList.remove('wrong'), 400);            }
            
            updatePuzzleStats();
            
            if(gameStats.lives <= 0) {
                showToast(`💔 انتهت المحاولات! كان لديك ${size} محاولات فقط.`, 'error');
                setTimeout(() => {
                    window.shuffleCurrentGame(); // إعادة نفس المستوى
                }, 1500);
            }
        }
    }

    function checkPuzzleWin() {
        const isWin = tiles.every((t, i) => t === solution[i]);
        if(isWin) {
            clearInterval(timerInterval);
            const winBonus = size * 15;
            gameStats.points += winBonus;
            
            if(size > gameStats.maxGridSolved) {
                gameStats.maxGridSolved = size;
                localStorage.setItem('sliding_max_grid', size);
                showToast(`🎉 رقم قياسي جديد! (${size}x${size})`, "success");
            } else {
                showToast(`🎉 أحسنت! ربحت ${winBonus} نقطة`, "success");
            }

            localStorage.setItem('math_user_points', gameStats.points);
            updatePuzzleStats();

            if(size < 9) {
                setTimeout(() => {
                    const nextSize = size + 1;
                    showToast(`🚀 الانتقال إلى ${nextSize}x${nextSize}...`, "info");
                    window.initPuzzleGame(nextSize);
                }, 2000);
            } else {
                showToast("👑 مبروك! أكملت جميع المستويات حتى 9x9!", "success");
            }

            if (typeof window.checkAndUnlockAchievements === 'function') {
                window.checkAndUnlockAchievements();
            }
        }
    }

    function updatePuzzleStats() {
        const p = document.getElementById('p-pts');
        const lContainer = document.getElementById('p-lives-container');        const m = document.getElementById('p-moves');
        const t = document.getElementById('p-timer');
        
        if(p) p.innerText = gameStats.points;
        
        if(lContainer) {
            lContainer.innerText = '❤️'.repeat(Math.max(0, gameStats.lives));
            if(gameStats.lives <= 2) {
                lContainer.style.animation = "shake 0.5s infinite";
                lContainer.style.color = "#e74c3c";
            } else {
                lContainer.style.animation = "none";
                lContainer.style.color = "var(--text-primary)";
            }
        }
        
        if(m) m.innerText = moves;
        if(t) {
            const mins = Math.floor(seconds/60).toString().padStart(2,'0');
            const secs = (seconds%60).toString().padStart(2,'0');
            t.innerText = `${mins}:${secs}`;
        }
    }

    function startPuzzleTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            updatePuzzleStats();
        }, 1000);
    }

    function showToast(msg, type) {
        const old = document.querySelector('.p-toast');
        if(old) old.remove();
        const t = document.createElement('div');
        t.className = 'p-toast';
        t.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:${type==='error'?'#e74c3c':'#27ae60'};color:#fff;padding:10px 20px;border-radius:20px;z-index:9999;font-weight:bold;font-size:1rem;box-shadow:0 4px 10px rgba(0,0,0,0.3);animation:fadeIn 0.3s;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.remove(),300); }, 2000);
    }

})();