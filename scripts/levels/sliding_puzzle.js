// scripts/levels/sliding_puzzle.js

(function() {
    let size = 3;
    let tiles = [];
    let solution = [];
    let moves = 0;
    let timerInterval = null;
    let seconds = 0;
    
    let sStats = {
        get points() { return parseInt(localStorage.getItem('math_user_points') || "0"); },
        set points(val) { localStorage.setItem('math_user_points', val); },
        lives: 3
    };

    window.loadSliding_puzzlePage = function() {
        window.currentLevel = 'sliding_puzzle';
        sStats.lives = 3;
        renderPuzzleUI();
        initPuzzleGame(3);
    };

    function renderPuzzleUI() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
        <style>
            .puzzle-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px; color: var(--text-main); max-width: 450px; margin: auto; }
            .puzzle-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 3px solid var(--primary-color, #4a90e2); padding-bottom: 10px; }
            .stats-bar { width: 100%; display: flex; justify-content: space-around; background: var(--bg-card); padding: 10px; border-radius: 10px; margin-bottom: 15px; border: 1px solid var(--border-color); color: var(--text-main); }
            .stat-item { font-weight: bold; font-size: 1rem; }
            
            /* تعديل شبكة اللعبة لتناسب الثيم */
            .puzzle-grid { 
                display: grid; 
                background: var(--border-color); /* لون الإطار الخلفي */
                padding: 10px; 
                border-radius: 12px; 
                gap: 8px; 
                width: 100%; 
                aspect-ratio: 1/1; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            }

            /* خانات الأرقام مرتبطة بالثيم الآن */
            .p-tile { 
                background: var(--bg-card); /* تتغير مع الثيم */
                color: var(--text-main);    /* تتغير مع الثيم */
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold; 
                border-radius: 8px; 
                cursor: pointer; 
                user-select: none;
                transition: transform 0.1s, background 0.2s; 
                border: 1px solid var(--border-color);
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .p-tile:active { transform: scale(0.95); background: var(--bg-body); }
            
            /* الخانة الفارغة */
            .p-tile.empty { 
                background: transparent; 
                border: 1px dashed var(--border-color); 
                box-shadow: none;
                cursor: default; 
            }

            .p-tile.wrong { animation: puzzleShake 0.3s; background: var(--danger-color, #ff4d4d) !important; color: white; }

            .p-controls { width: 100%; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
            .p-row { display: flex; gap: 10px; width: 100%; }
            
            .p-select { 
                flex: 1; padding: 12px; border-radius: 8px; 
                border: 1px solid var(--border-color); 
                font-family: 'Cairo'; 
                background: var(--bg-card); 
                color: var(--text-main); 
            }

            .p-btn { flex: 1; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; font-family: 'Cairo'; transition: 0.3s; }
            .btn-hint { background: #f39c12; color: white; }
            .btn-new { background: var(--primary-color, #4a90e2); color: white; }

            @keyframes puzzleShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            
            .ts-1 { font-size: 1.8rem; } .ts-2 { font-size: 1.2rem; } .ts-3 { font-size: 0.9rem; }
        </style>

        <div class="puzzle-wrapper">
            <div class="puzzle-header">
                <h2 style="margin:0; color: var(--primary-color, #4a90e2);">ترتيب الأرقام</h2>
                <button class="p-btn" style="max-width:80px; background: var(--border-color); color: var(--text-main);" onclick="loadHomePage()">خروج</button>
            </div>
            
            <div class="stats-bar">
                <div class="stat-item">🏆 <span id="p-points">${sStats.points}</span></div>
                <div id="p-lives" class="stat-item">❤️❤️❤️</div>
                <div class="stat-item">⏱️ <span id="p-timer">00:00</span></div>
            </div>

            <div class="p-row" style="margin-bottom:15px;">
                <select id="p-diff" class="p-select" onchange="initPuzzleGame(this.value)">
                    <option value="3">3×3</option>
                    <option value="4">4×4</option>
                    <option value="5">5×5</option>
                    <option value="6">6×6</option>
                    <option value="7">7×7</option>
                    <option value="8">8×8</option>
                    <option value="9">9×9</option>
                </select>
                <div class="stat-item" style="background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);">
                    👣 <span id="p-moves">0</span>
                </div>
            </div>

            <div id="puzzle-board" class="puzzle-grid"></div>

            <div class="p-controls">
                <div class="p-row">
                    <button class="p-btn btn-hint" onclick="usePuzzleHint()">💡 تلميح (15 ن)</button>
                    <button class="p-btn btn-new" onclick="initPuzzleGame()">جولة جديدة</button>
                </div>
            </div>
        </div>`;
    }

    // [بقية الدوال initPuzzleGame, shufflePuzzle, drawPuzzleBoard... تبقى كما هي]
    // سأعيد كتابة drawPuzzleBoard للتأكد من ربط الكلاسات بشكل صحيح

    window.initPuzzleGame = function(newSize) {
        if(newSize) size = parseInt(newSize);
        moves = 0; seconds = 0; sStats.lives = 3;
        clearInterval(timerInterval);
        startPuzzleTimer();
        solution = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
        solution.push(null);
        tiles = [...solution];
        shufflePuzzle();
        drawPuzzleBoard();
        updatePuzzleStats();
    };

    function shufflePuzzle() {
        for (let i = 0; i < size * size * 20; i++) {
            const emptyIdx = tiles.indexOf(null);
            const n = getPuzzleNeighbors(emptyIdx);
            const move = n[Math.floor(Math.random() * n.length)];
            [tiles[emptyIdx], tiles[move]] = [tiles[move], tiles[emptyIdx]];
        }
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
        const textClass = size < 5 ? 'ts-1' : (size < 8 ? 'ts-2' : 'ts-3');

        tiles.forEach((tile, i) => {
            const cell = document.createElement('div');
            cell.className = `p-tile ${textClass} ${tile === null ? 'empty' : ''}`;
            cell.innerText = tile || '';
            if(tile !== null) cell.onclick = () => handlePuzzleMove(i);
            board.appendChild(cell);
        });
    }

    function handlePuzzleMove(idx) {
        const emptyIdx = tiles.indexOf(null);
        if(getPuzzleNeighbors(idx).includes(emptyIdx)) {
            [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
            moves++;
            drawPuzzleBoard();
            updatePuzzleStats();
            checkPuzzleWin();
        } else {
            sStats.lives--;
            const cell = document.querySelectorAll('.p-tile')[idx];
            cell.classList.add('wrong');
            setTimeout(() => cell.classList.remove('wrong'), 300);
            updatePuzzleStats();
            if(sStats.lives <= 0) { alert("انتهت المحاولات!"); initPuzzleGame(); }
        }
    }

    window.usePuzzleHint = () => {
        if(sStats.points < 15) { alert("تحتاج 15 نقطة!"); return; }
        for(let i=0; i < tiles.length; i++) {
            if(tiles[i] !== solution[i] && solution[i] !== null) {
                const val = solution[i];
                const curr = tiles.indexOf(val);
                [tiles[curr], tiles[i]] = [tiles[i], tiles[curr]];
                sStats.points -= 15;
                drawPuzzleBoard();
                updatePuzzleStats();
                break;
            }
        }
    };

    function checkPuzzleWin() {
        if(tiles.every((t, i) => t === solution[i])) {
            clearInterval(timerInterval);
            const winBonus = size * 15;
            sStats.points += winBonus;
            updatePuzzleStats();
            setTimeout(() => alert(`رائع! ربحت ${winBonus} نقطة.`), 200);
            if (typeof window.checkAndUnlockAchievements === 'function') window.checkAndUnlockAchievements();
        }
    }

    function updatePuzzleStats() {
        if(document.getElementById('p-points')) document.getElementById('p-points').innerText = sStats.points;
        if(document.getElementById('p-lives')) document.getElementById('p-lives').innerText = "❤️".repeat(sStats.lives);
        if(document.getElementById('p-moves')) document.getElementById('p-moves').innerText = moves;
    }

    function startPuzzleTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const m = Math.floor(seconds/60).toString().padStart(2,'0');
            const s = (seconds%60).toString().padStart(2,'0');
            if(document.getElementById('p-timer')) document.getElementById('p-timer').innerText = `${m}:${s}`;
        }, 1000);
    }
})();
