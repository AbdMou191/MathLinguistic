// scripts/levels/loudoukou.js
// النسخة المتوافقة تماماً مع main.css (ثيم داكن/نهاري) + أزرار 5x2.

window.LoudoukouGame = (function() {
    'use strict';

    const GRID_SIZE = 9;
    let solution = [];
    let initialBoard = [];
    let selectedCellIndex = -1;
    
    let state = {
        stage: 1,
        points: parseInt(localStorage.getItem('math_user_points') || "0"),
        blocksSolved: parseInt(localStorage.getItem('loudoukou_blocks') || "0"),
        lives: 3
    };

    function init() {
        console.log("🚀 بدء لودوكو: متوافق مع ثيم MathLinguistic");
        state.stage = 1;
        state.lives = 3;
        
        renderUI();
        startNewRound();
        localStorage.setItem('loudoukou_played', 'true');
    }

    function renderUI() {
        const main = document.getElementById('main-content');
        if (!main) return;

        main.innerHTML = `
        <style>
            /* حاوية اللعبة ترث الألوان من الجسم */
            .lou-wrapper { 
                direction: rtl; 
                font-family: 'Cairo', sans-serif; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                padding: 15px; 
                max-width: 450px; 
                margin: auto; 
                color: var(--text-primary); 
            }
            
            .lou-header { 
                width: 100%; 
                display: flex;                 justify-content: space-between; 
                margin-bottom: 15px; 
                border-bottom: 2px solid var(--accent-color); 
                padding-bottom: 10px; 
            }
            
            .lou-stats { 
                display: flex; 
                gap: 15px; 
                font-weight: bold; 
                font-size: 0.9rem; 
                background: var(--card-bg); 
                padding: 10px; 
                border-radius: 10px; 
                width: 100%; 
                justify-content: space-around; 
                margin-bottom: 15px;
                border: 1px solid var(--border-color);
                color: var(--text-primary);
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            .lives-container { color: #ff6b81; letter-spacing: 3px; font-size: 1.3rem; }
            
            /* === الشبكة الرئيسية === */
            .lou-grid {
                display: grid; 
                grid-template-columns: repeat(9, 1fr);
                /* لون الحدود هو لون النص الرئيسي ليظهر بوضوح في كلا الثيمين */
                background: var(--text-primary); 
                border: 3px solid var(--text-primary);
                width: 100%; 
                aspect-ratio: 1/1; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }

            /* === الخانة الواحدة (التباين الذكي) === */
            .l-cell {
                /* القيم الافتراضية (النهاري) */
                background: #ffffff;
                color: #2d2d2d;
                
                display: flex;
                align-items: center; 
                justify-content: center;
                font-size: 1.2rem; 
                font-weight: bold; 
                cursor: pointer;
                user-select: none;
                border-right: 1px solid #e0e0e0;
                border-bottom: 1px solid #e0e0e0;                position: relative;
                transition: all 0.2s;
            }

            /* === التصحيح الحاسم للوضع الداكن === */
            [data-theme="dark"] .l-cell {
                background: #252525; /* نفس --card-bg */
                color: #e0e0e0;     /* نفس --text-primary */
                border-color: #333333; /* نفس --border-color */
            }

            /* إزالة الحدود الزائدة */
            .l-cell:nth-child(9n) { border-right: none; }
            .l-cell:nth-last-child(-n+9) { border-bottom: none; }

            /* حدود سميكة للفصل بين بلوكات 3x3 */
            .l-cell:nth-child(3n):not(:nth-child(9n)) {
                border-left: 3px solid var(--text-primary);
                margin-left: -1px;
            }
            
            .l-cell.border-bottom-thick {
                border-bottom: 3px solid var(--text-primary) !important;
                margin-bottom: -1px;
                z-index: 1;
            }
            
            /* الخلايا الثابتة (المعطاة) */
            .l-cell.fixed { 
                /* نهاري */
                background: #f0f0f0; 
                color: #2d2d2d;
                cursor: default; 
                opacity: 0.9;
            }
            /* ليلي للخلايا الثابتة */
            [data-theme="dark"] .l-cell.fixed {
                background: #333333; /* أفتح قليلاً من الخلفية */
                color: #ffffff;
            }

            /* التحديد */
            .l-cell.selected { 
                background: var(--accent-color) !important; 
                color: #fff !important; 
                transform: scale(0.95);
            }
            
            /* خطأ */
            .l-cell.error {                 background: #e74c3c !important; 
                color: #fff !important; 
                animation: shake 0.3s; 
            }
            
            /* صحيح */
            .l-cell.success { 
                background: #27ae60 !important; 
                color: #fff !important; 
                animation: pop 0.3s; 
            }

            /* === لوحة المفاتيح === */
            .lou-numpad { 
                display: grid; 
                grid-template-columns: repeat(5, 1fr); 
                gap: 8px; 
                width: 100%; 
                margin-top: 20px; 
            }
            .n-btn { 
                padding: 12px 0; 
                font-size: 1.3rem; 
                background: var(--accent-color); 
                color: #fff; 
                border: none; 
                border-radius: 8px; 
                font-weight: bold; 
                cursor: pointer; 
                box-shadow: 0 3px 0 var(--accent-hover); 
                transition: all 0.1s;
            }
            .n-btn:active { transform: translateY(3px); box-shadow: none; }
            
            .n-btn.hint { 
                background: #f39c12; 
                box-shadow: 0 3px 0 #d35400; 
                font-size: 1.1rem;
            }

            @keyframes shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            @keyframes pop { 50% { transform: scale(1.1); } }
        </style>

        <div class="lou-wrapper">
            <div class="lou-header">
                <h2 style="margin:0; color: var(--accent-color);">لودوكو</h2>
                <button class="n-btn" style="padding:6px 12px; font-size:0.8rem; background:#95a5a6; box-shadow:none;" onclick="loadHomePage()">خروج</button>
            </div>
                        <div class="lou-stats">
                <span>🏆 <span id="l-pts">${state.points}</span></span>
                <span>المرحلة: <span id="l-stg">${state.stage}</span></span>
                <span class="lives-container" id="l-lives">❤️❤️❤️</span>
            </div>

            <div id="l-grid" class="lou-grid"></div>

            <div class="lou-numpad">
                <!-- الصف الأول -->
                <button class="n-btn" onclick="window.LoudoukouGame.input(1)">1</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(2)">2</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(3)">3</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(4)">4</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(5)">5</button>
                
                <!-- الصف الثاني -->
                <button class="n-btn" onclick="window.LoudoukouGame.input(6)">6</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(7)">7</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(8)">8</button>
                <button class="n-btn" onclick="window.LoudoukouGame.input(9)">9</button>
                <button class="n-btn hint" onclick="window.LoudoukouGame.hint()">💡</button>
            </div>
        </div>`;
    }

    // ... (بقية الدوال البرمجية unchanged لأنها لا تؤثر على الألوان) ...
    function startNewRound() {
        selectedCellIndex = -1;
        state.lives = 3;
        updateStats();
        generatePuzzle();
        drawGrid();
        const filled = initialBoard.filter(x => x !== 0).length;
        showToast(`المرحلة ${state.stage}: ${Math.round((filled/81)*100)}% مملوءة`, 'info');
    }

    function generatePuzzle() {
        solution = new Array(81).fill(0);
        solve(solution);
        initialBoard = [...solution];
        let toRemove = state.stage === 1 ? 10 : (state.stage <= 5 ? 15 + (state.stage * 2) : (state.stage <= 15 ? 30 + (state.stage * 1.5) : 50 + (state.stage * 0.5)));
        if (toRemove > 60) toRemove = 60;
        let count = 0;
        while (count < toRemove) {
            const idx = Math.floor(Math.random() * 81);
            if (initialBoard[idx] !== 0) { initialBoard[idx] = 0; count++; }
        }
    }
    function solve(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                for (let n = 1; n <= 9; n++) {
                    if (isValid(board, i, n)) { board[i] = n; if (solve(board)) return true; board[i] = 0; }
                }
                return false;
            }
        }
        return true;
    }

    function isValid(board, idx, num) {
        const r = Math.floor(idx / 9), c = idx % 9;
        for (let i = 0; i < 9; i++) if (board[r * 9 + i] === num || board[i * 9 + c] === num) return false;
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (board[(br + i) * 9 + (bc + j)] === num) return false;
        return true;
    }

    function drawGrid() {
        const grid = document.getElementById('l-grid');
        grid.innerHTML = '';
        initialBoard.forEach((val, i) => {
            const cell = document.createElement('div');
            cell.className = 'l-cell';
            const row = Math.floor(i / 9);
            if (row === 2 || row === 5) cell.classList.add('border-bottom-thick');
            if (val !== 0) { cell.textContent = val; cell.classList.add('fixed'); } 
            else { cell.onclick = () => select(i, cell); cell.id = `c-${i}`; }
            grid.appendChild(cell);
        });
    }

    function select(idx, el) {
        if (selectedCellIndex !== -1) {
            const prev = document.getElementById(`c-${selectedCellIndex}`);
            if (prev) prev.classList.remove('selected');
        }
        selectedCellIndex = idx;
        el.classList.add('selected');
    }

    function input(val) {
        if (selectedCellIndex === -1) return;
        const cell = document.getElementById(`c-${selectedCellIndex}`);
        if (val === solution[selectedCellIndex]) {
            cell.textContent = val;
            cell.classList.add('fixed', 'success');
            cell.classList.remove('selected', 'error');            state.points += 5;
            checkWin();
        } else {
            state.lives--;
            cell.classList.add('error');
            setTimeout(() => cell.classList.remove('error'), 400);
            if (state.lives <= 0) { showToast('💔 انتهت الأرواح!', 'error'); setTimeout(() => startNewRound(), 1000); return; }
        }
        updateStats();
    }

    function hint() {
        if (state.points < 15) return showToast('نقاط غير كافية!', 'error');
        const empties = Array.from(document.querySelectorAll('.l-cell:not(.fixed)'));
        if (!empties.length) return;
        const rand = empties[Math.floor(Math.random() * empties.length)];
        const idx = parseInt(rand.id.split('-')[1]);
        rand.textContent = solution[idx];
        rand.classList.add('fixed', 'success');
        state.points -= 15;
        updateStats();
        checkWin();
    }

    function checkWin() {
        const cells = document.querySelectorAll('.l-cell');
        let full = true, correct = true;
        cells.forEach((c, i) => {
            if (!c.classList.contains('fixed')) full = false;
            if (parseInt(c.textContent) !== solution[i]) correct = false;
        });
        if (full && correct) {
            state.blocksSolved++;
            state.stage++;
            state.points += 50;
            localStorage.setItem('math_user_points', state.points);
            localStorage.setItem('loudoukou_blocks', state.blocksSolved);
            showToast('🎉 أحسنت! المرحلة التالية...', 'success');
            setTimeout(startNewRound, 1500);
            if (window.checkAndUnlockAchievements) window.checkAndUnlockAchievements();
        }
    }

    function updateStats() {
        const p = document.getElementById('l-pts');
        const s = document.getElementById('l-stg');
        const b = document.getElementById('l-blk');
        const l = document.getElementById('l-lives');
        if (p) p.textContent = state.points;
        if (s) s.textContent = state.stage;        if (b) b.textContent = state.blocksSolved;
        if (l) {
            l.textContent = '❤️'.repeat(state.lives);
            if(state.lives === 1) l.style.animation = "shake 0.5s infinite";
            else l.style.animation = "none";
        }
    }

    function showToast(msg, type) {
        const t = document.createElement('div');
        t.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${type==='error'?'#e74c3c':'#27ae60'};color:#fff;padding:10px 20px;border-radius:20px;z-index:9999;font-weight:bold;font-size:1rem;box-shadow:0 4px 10px rgba(0,0,0,0.3);animation:fadeIn 0.3s;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity=0; setTimeout(()=>t.remove(),300); }, 2000);
    }

    return { init, input, hint };
})();

window.loadLoudoukouPage = function() {
    window.LoudoukouGame.init();
};