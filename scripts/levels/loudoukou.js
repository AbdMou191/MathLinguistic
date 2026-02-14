// scripts/levels/loudoukou.js

(function() {
    let solution = [];
    let initialBoard = [];
    let selectedCell = null;
    
    let sStats = {
        points: parseInt(localStorage.getItem('math_user_points') || "0"),
        lives: 3,
        completedBlocksCount: 0 
    };

    window.loadLoudoukouPage = function() {
        window.currentLevel = 'loudoukou';
        sStats.lives = 3;
        sStats.completedBlocksCount = 0;
        // تصفير إحصائيات الجولة الحالية في localStorage لتبدأ من جديد
        localStorage.setItem('loudoukou_blocks', '0');
        
        renderLoudoukouUI();
        newSudokuGame();
        
        // تسجيل أن المستخدم دخل اللعبة (إنجازات محتملة)
        localStorage.setItem('loudoukou_played', 'true');
    };

    function renderLoudoukouUI() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
        <style>
            .sudoku-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px; color: var(--text-main); }
            .sudoku-header { width: 100%; max-width: 450px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 3px solid #4a90e2; padding-bottom: 10px; }
            .stats-bar { width: 100%; max-width: 450px; display: flex; justify-content: space-around; background: var(--bg-card); padding: 10px; border-radius: 10px; margin-bottom: 15px; border: 1px solid var(--border-color); }
            .stat-item { font-weight: bold; font-size: 1rem; }
            .sudoku-grid { display: grid; grid-template-columns: repeat(9, 1fr); border: 3px solid #34495e; background: #fff; width: 100%; max-width: 405px; aspect-ratio: 1/1; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .s-cell { border: 0.5px solid #dcdde1; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; cursor: pointer; color: #2f3640; position: relative; }
            .s-cell:nth-child(3n) { border-left: 2px solid #34495e; }
            .s-cell.row-border { border-bottom: 2px solid #34495e; }
            .s-cell.fixed { background: #f1f2f6; color: #7f8c8d; cursor: default; }
            .s-cell.wrong { color: #e84118 !important; background: #ffebee !important; animation: shake 0.3s; }
            .s-cell:focus { background: #e1f5fe; outline: none; box-shadow: inset 0 0 0 2px #4a90e2; }
            .numpad { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 20px; width: 100%; max-width: 405px; }
            .n-btn { padding: 12px; background: #4a90e2; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
            .btn-action { flex: 1; padding: 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        </style>
        <div class="sudoku-wrapper">
            <div class="sudoku-header">
                <h2 style="margin:0; color:#4a90e2;">لودوكو</h2>
                <button class="btn-action" style="max-width:80px; background:#95a5a6; color:white;" onclick="loadHomePage()">خروج</button>
            </div>
            <div class="stats-bar">
                <div class="stat-item">🏆 <span id="s-points">${sStats.points}</span></div>
                <div id="s-lives" class="stat-item">❤️❤️❤️</div>
                <div class="stat-item">🧩 <span id="s-blocks">0/9</span></div>
            </div>
            <div id="sudoku-board" class="sudoku-grid"></div>
            <div class="numpad">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="n-btn" onclick="fillNum(${n})">${n}</button>`).join('')}
                <button class="n-btn" style="background:#f39c12;" onclick="getHint()">💡 تلميح</button>
            </div>
            <div class="controls" style="display:flex; gap:10px; margin-top:20px; width:100%; max-width:405px;">
                <button class="btn-action" style="background:#3498db; color:white;" onclick="newSudokuGame()">جولة جديدة</button>
            </div>
        </div>`;
    }

    window.newSudokuGame = function() {
        sStats.lives = 3;
        sStats.completedBlocksCount = 0;
        localStorage.setItem('loudoukou_blocks', '0');
        updateStatsUI();
        
        const board = Array(81).fill(0);
        solve(board);
        solution = [...board];
        initialBoard = [...solution];
        let holes = 45;
        while(holes > 0) {
            let idx = Math.floor(Math.random() * 81);
            if(initialBoard[idx] !== "") { initialBoard[idx] = ""; holes--; }
        }
        drawGrid();
    };

    function drawGrid() {
        const grid = document.getElementById('sudoku-board');
        if(!grid) return;
        grid.innerHTML = '';
        for(let i=0; i<81; i++) {
            const cell = document.createElement('div');
            cell.className = 's-cell';
            const row = Math.floor(i/9);
            if((row + 1) % 3 === 0 && row < 8) cell.classList.add('row-border');
            if(initialBoard[i] !== "") {
                cell.innerText = initialBoard[i];
                cell.classList.add('fixed');
            } else {
                cell.tabIndex = 0;
                cell.onclick = () => { selectedCell = cell; cell.focus(); };
            }
            grid.appendChild(cell);
        }
    }

    window.fillNum = (n) => {
        if(!selectedCell || selectedCell.classList.contains('fixed')) return;
        const cells = Array.from(document.querySelectorAll('.s-cell'));
        const idx = cells.indexOf(selectedCell);

        if(n === solution[idx]) {
            selectedCell.innerText = n;
            selectedCell.classList.remove('wrong');
            selectedCell.classList.add('fixed');
            checkBlocksProgress();
        } else {
            sStats.lives--;
            selectedCell.classList.add('wrong');
            updateStatsUI();
            if(sStats.lives <= 0) {
                alert("انتهت المحاولات!");
                newSudokuGame();
            }
        }
    };

    window.getHint = () => {
        if(sStats.points < 15) { alert("تحتاج 15 نقطة!"); return; }
        const emptyCells = Array.from(document.querySelectorAll('.s-cell'))
                                .map((c, i) => ({cell: c, idx: i}))
                                .filter(item => item.cell.innerText === "" && !item.cell.classList.contains('fixed'));
        if(emptyCells.length > 0) {
            const pick = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            pick.cell.innerText = solution[pick.idx];
            pick.cell.classList.add('fixed');
            sStats.points -= 15;
            localStorage.setItem('math_user_points', sStats.points);
            updateStatsUI();
            checkBlocksProgress();
        }
    };

    function checkBlocksProgress() {
        const cells = document.querySelectorAll('.s-cell');
        let currentBlocks = 0;
        for (let block = 0; block < 9; block++) {
            let isComplete = true;
            let bR = Math.floor(block / 3) * 3;
            let bC = (block % 3) * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let idx = (bR + r) * 9 + (bC + c);
                    if (cells[idx].innerText == "" || parseInt(cells[idx].innerText) !== solution[idx]) {
                        isComplete = false; break;
                    }
                }
            }
            if (isComplete) currentBlocks++;
        }

        if (currentBlocks > sStats.completedBlocksCount) {
            let diff = currentBlocks - sStats.completedBlocksCount;
            sStats.points += (diff * 20);
            sStats.completedBlocksCount = currentBlocks;
            
            // تحديث الإحصائيات لنظام الإنجازات المركزي
            localStorage.setItem('loudoukou_blocks', sStats.completedBlocksCount);
            localStorage.setItem('math_user_points', sStats.points);
            
            updateStatsUI();
            // استدعاء الفحص المركزي للإنجازات
            if (typeof window.checkAndUnlockAchievements === 'function') {
                window.checkAndUnlockAchievements();
            }
        }
    }

    function updateStatsUI() {
        if(document.getElementById('s-points')) document.getElementById('s-points').innerText = sStats.points;
        if(document.getElementById('s-lives')) document.getElementById('s-lives').innerText = "❤️".repeat(sStats.lives);
        if(document.getElementById('s-blocks')) document.getElementById('s-blocks').innerText = `${sStats.completedBlocksCount}/9`;
    }

    // خوارزمية التوليد
    function solve(b) {
        for(let i=0; i<81; i++) {
            if(b[i] === 0) {
                let nums = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
                for(let n of nums) {
                    if(isValid(b, i, n)) {
                        b[i] = n;
                        if(solve(b)) return true;
                        b[i] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }
    function isValid(b, idx, val) {
        let r = Math.floor(idx/9), c = idx%9;
        for(let i=0; i<9; i++) if(b[r*9+i]===val || b[i*9+c]===val) return false;
        let br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
        for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(b[(br+i)*9+(bc+j)]===val) return false;
        return true;
    }
})();
