// scripts/levels/crossmath.js
(function() {
    let solutionGrid = []; 
    let displayGrid = [];  
    let selectedInputIdx = null;
    let currentInputBuffer = ""; // لتخزين الرقم أثناء الكتابة (يدعم خانات متعددة والسالب)

    let cmStats = {
        points: parseInt(localStorage.getItem('math_user_points') || "0"),
        lives: 3,
        currentStage: 1
    };

    window.loadCrossmathPage = function() {
        window.currentLevel = 'crossmath';
        cmStats.lives = 3;
        cmStats.currentStage = 1;
        renderCrossmathUI();
        startNewLevel();
    };

    function startNewLevel() {
        selectedInputIdx = null;
        currentInputBuffer = "";
        generateRandomPuzzle();
        updateUI();
    }

    function showGameMessage(title, message, isSuccess = true) {
        const overlay = document.createElement('div');
        overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10000; font-family:'Cairo',sans-serif;`;
        
        const modal = document.createElement('div');
        modal.style = `background:var(--bg-card, #fff); color:var(--text-main, #000); padding:30px; border-radius:20px; text-align:center; max-width:300px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border-top: 5px solid ${isSuccess ? '#2ecc71' : '#e74c3c'}`;
        
        modal.innerHTML = `
            <h2 style="margin-top:0; color:${isSuccess ? '#2ecc71' : '#e74c3c'}">${title}</h2>
            <p style="font-size:1.1rem; margin-bottom:20px;">${message}</p>
            <button id="modal-ok" style="background:#4a90e2; color:white; border:none; padding:10px 30px; border-radius:10px; cursor:pointer; font-weight:bold;">موافق</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.getElementById('modal-ok').onclick = () => {
            overlay.remove();
        };
    }

    function generateRandomPuzzle() {
        const ops = ['+', '-', '*'];
        // رفع نطاق الأرقام لزيادة التحدي
        let n1 = Math.floor(Math.random() * 12) + 1;
        let n2 = Math.floor(Math.random() * 12) + 1;
        let n3 = Math.floor(Math.random() * 12) + 1;
        let n4 = Math.floor(Math.random() * 12) + 1;

        let opH1 = ops[Math.floor(Math.random() * ops.length)];
        let opH2 = ops[Math.floor(Math.random() * ops.length)];
        let opV1 = ops[Math.floor(Math.random() * ops.length)];
        let opV2 = ops[Math.floor(Math.random() * ops.length)];

        const calc = (a, op, b) => {
            if (op === '+') return a + b;
            if (op === '-') return a - b;
            if (op === '*') return a * b;
            return 0;
        };

        solutionGrid = Array(25).fill({v: '', t: 'empty'});
        
        // بناء المعادلات
        let resH1 = calc(n1, opH1, n2);
        let resH2 = calc(n3, opH2, n4);
        let resV1 = calc(n1, opV1, n3);
        let resV2 = calc(n2, opV2, n4);

        solutionGrid[0] = {v: n1, t: 'num'};    solutionGrid[1] = {v: opH1, t: 'op'};
        solutionGrid[2] = {v: n2, t: 'num'};    solutionGrid[3] = {v: '=', t: 'op'};
        solutionGrid[4] = {v: resH1, t: 'num'};
        solutionGrid[5] = {v: opV1, t: 'op'};   solutionGrid[7] = {v: opV2, t: 'op'};
        solutionGrid[10] = {v: n3, t: 'num'};   solutionGrid[11] = {v: opH2, t: 'op'};
        solutionGrid[12] = {v: n4, t: 'num'};   solutionGrid[13] = {v: '=', t: 'op'};
        solutionGrid[14] = {v: resH2, t: 'num'};
        solutionGrid[15] = {v: '=', t: 'op'};   solutionGrid[17] = {v: '=', t: 'op'};
        solutionGrid[20] = {v: resV1, t: 'num'}; solutionGrid[22] = {v: resV2, t: 'num'};

        displayGrid = solutionGrid.map((cell, idx) => {
            let difficultyChance = 0.5;
            if (cell.t === 'num' && Math.random() < difficultyChance) {
                return { ...cell, t: 'input', originalV: cell.v };
            }
            return cell;
        });

        drawGrid();
    }

    function drawGrid() {
        const board = document.getElementById('cm-board');
        if (!board) return;
        board.innerHTML = '';

        displayGrid.forEach((cell, i) => {
            const div = document.createElement('div');
            div.className = `cm-cell ${cell.t === 'empty' ? 'cm-empty' : ''}`;
            if (cell.t === 'num') {
                div.className += ' cm-num';
                div.innerText = cell.v;
            } else if (cell.t === 'op') {
                div.className += ' cm-op';
                div.innerText = cell.v;
            } else if (cell.t === 'input') {
                div.className += ' cm-input';
                div.id = `cm-slot-${i}`;
                div.onclick = () => selectCell(i);
            }
            board.appendChild(div);
        });
    }

    function selectCell(idx) {
        if (selectedInputIdx !== null) {
            const prev = document.getElementById(`cm-slot-${selectedInputIdx}`);
            if(prev) prev.classList.remove('selected');
        }
        selectedInputIdx = idx;
        currentInputBuffer = ""; // تصفير الكتابة عند اختيار خلية جديدة
        const current = document.getElementById(`cm-slot-${idx}`);
        if(current) current.classList.add('selected');
    }

    window.cmInputVal = (val) => {
        if (selectedInputIdx === null) return;
        
        const cell = displayGrid[selectedInputIdx];
        const uiElement = document.getElementById(`cm-slot-${selectedInputIdx}`);

        if (val === 'DEL') {
            currentInputBuffer = "";
            uiElement.innerText = "";
            return;
        }

        // إضافة الرقم أو السالب للـ Buffer
        currentInputBuffer += val.toString();
        uiElement.innerText = currentInputBuffer;

        // التحقق التلقائي إذا تطابق الطول أو إذا ضغط المستخدم على تأكيد (يمكنك إضافة زر تأكيد أو ترك التحقق تلقائي)
        // هنا سنجعله يتحقق بمجرد أن يتطابق الرقم أو يتجاوزه
        if (currentInputBuffer === cell.originalV.toString()) {
            uiElement.classList.add('correct');
            uiElement.classList.remove('selected', 'wrong');
            cmStats.points += 10;
            selectedInputIdx = null;
            updateUI();
            checkStageWin();
        } else if (currentInputBuffer.length >= cell.originalV.toString().length && !cell.originalV.toString().startsWith(currentInputBuffer)) {
            // خطأ
            cmStats.lives--;
            uiElement.classList.add('wrong');
            currentInputBuffer = "";
            setTimeout(() => {
                uiElement.classList.remove('wrong');
                uiElement.innerText = "";
            }, 500);
            updateUI();
            if (cmStats.lives <= 0) {
                showGameMessage("خسارة", "انتهت المحاولات! ستبدأ من جديد.", false);
                loadCrossmathPage();
            }
        }
    };

    function checkStageWin() {
        const totalInputs = displayGrid.filter(c => c.t === 'input').length;
        const solvedInputs = document.querySelectorAll('.cm-input.correct').length;

        if (totalInputs === solvedInputs) {
            cmStats.currentStage++;
            cmStats.points += 30;
            localStorage.setItem('math_user_points', cmStats.points);
            
            showGameMessage("رائع!", `اكتملت المرحلة! مكافأة +30 نقطة.`, true);
            setTimeout(startNewLevel, 1500);
        }
    }

    function updateUI() {
        localStorage.setItem('math_user_points', cmStats.points);
        if(document.getElementById('cm-points')) document.getElementById('cm-points').innerText = cmStats.points;
        if(document.getElementById('cm-lives')) document.getElementById('cm-lives').innerText = "❤️".repeat(cmStats.lives);
        if(document.getElementById('cm-stage')) document.getElementById('cm-stage').innerText = cmStats.currentStage;
    }

    function renderCrossmathUI() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
        <style>
            .cm-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px; color: var(--text-main); }
            .cm-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; max-width: 360px; background: var(--bg-card); padding: 15px; border-radius: 20px; }
            .cm-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: bold; border-radius: 12px; }
            .cm-num { background: #4a90e2; color: white; }
            .cm-op { background: var(--border-color, #f1f2f6); color: var(--text-main); }
            .cm-input { background: var(--bg-main, #fff); border: 2px solid #4a90e2; cursor: pointer; color: var(--text-main); min-height: 50px; }
            .cm-input.selected { border-color: #f1c40f; box-shadow: 0 0 10px rgba(241, 196, 15, 0.4); }
            .cm-input.correct { background: #2ecc71 !important; border-color: #2ecc71; color: white; }
            .cm-input.wrong { background: #e74c3c !important; color: white; animation: shake 0.4s; }
            .numpad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 25px; width: 100%; max-width: 360px; }
            .n-btn { padding: 15px 0; background: #34495e; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1.2rem; }
            .n-btn.special { background: #e67e22; }
            @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        </style>
        <div class="cm-wrapper">
            <h2 style="color:#4a90e2;">الأرقام المتقاطعة</h2>
            <div style="margin-bottom:20px; display:flex; gap:20px; font-weight:bold;">
                <span>🏆 <span id="cm-points">${cmStats.points}</span></span>
                <span>المرحلة: <span id="cm-stage">1</span></span>
                <span id="cm-lives">❤️❤️❤️</span>
            </div>
            <div id="cm-board" class="cm-grid"></div>
            <div class="numpad">
                ${[1,2,3,4,5,6,7,8,9,0].map(n => `<button class="n-btn" onclick="cmInputVal(${n})">${n}</button>`).join('')}
                <button class="n-btn special" onclick="cmInputVal('-')">-</button>
                <button class="n-btn special" style="background:#c0392b;" onclick="cmInputVal('DEL')">⌫</button>
            </div>
            <button onclick="loadHomePage()" style="margin-top:20px; background:none; border:none; color:#4a90e2; cursor:pointer; font-weight:bold;">خروج</button>
        </div>`;
    }
})();
