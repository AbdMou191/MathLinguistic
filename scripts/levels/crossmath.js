// scripts/levels/crossmath.js
// النسخة المحدثة: أزرار موحدة + توليد ديناميكي + ثيم متكامل

(function() {
    'use strict';

    let solutionGrid = []; 
    let displayGrid = [];  
    let selectedInputIdx = null;
    let currentInputBuffer = ""; 
    
    // حالة اللعبة
    let gameStats = {
        points: parseInt(localStorage.getItem('math_user_points') || "0"),
        lives: 3,
        stage: 1
    };

    // إعدادات الصعوبة للمراحل الخمس
    const STAGE_CONFIGS = {
        1: { ops: ['+'], decimals: false, range: [2, 9], name: "الجمع البسيط" },
        2: { ops: ['+', '-'], decimals: false, range: [2, 12], name: "جمع وطرح" },
        3: { ops: ['+', '-'], decimals: true, range: [1, 9], name: "تحدي الكسور" },
        4: { ops: ['+', '-', '*'], decimals: false, range: [2, 10], name: "عمليات مختلطة" },
        5: { ops: ['+', '-', '*', '/'], decimals: true, range: [2, 12], name: "عبقري الرياضيات" }
    };

    window.loadCrossmathPage = function() {
        window.currentLevel = 'crossmath';
        gameStats.lives = 3;
        gameStats.stage = parseInt(localStorage.getItem('crossmath_stage') || "1");
        
        renderCrossmathUI();
        startNewLevel();
        
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('corssmath');
        }
        
        console.log(`🚀 بدء الأرقام المتقاطعة: المرحلة ${gameStats.stage}`);
    };

    function renderCrossmathUI() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // ✅ تم استبدال CSS الخاص بالأزرار لتنسيق gc-btn الموحد
        mainContent.innerHTML = `
        <style>
            .cm-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 15px; max-width: 450px; margin: auto; color: var(--text-primary); }            .cm-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid var(--accent-color); padding-bottom: 10px; }
            
            .cm-stats { 
                display: flex; gap: 15px; font-weight: bold; font-size: 0.9rem; 
                background: var(--card-bg); padding: 10px; border-radius: 10px; 
                width: 100%; justify-content: space-around; margin-bottom: 15px;
                border: 1px solid var(--border-color);
                color: var(--text-primary);
            }

            /* شبكة اللعبة */
            .cm-grid { 
                display: grid; grid-template-columns: repeat(5, 1fr); 
                gap: 6px; width: 100%; aspect-ratio: 1/1; 
                background: var(--border-color); padding: 6px; 
                border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .cm-cell { 
                aspect-ratio: 1; display: flex; align-items: center; justify-content: center; 
                font-size: 1.3rem; font-weight: bold; border-radius: 8px; 
                user-select: none; transition: all 0.2s;
            }
            
            /* أنواع الخلايا */
            .cm-num { background: var(--accent-color); color: #fff; box-shadow: 0 3px 0 var(--accent-hover); }
            .cm-op { background: var(--card-bg); color: var(--text-primary); border: 1px solid var(--border-color); font-size: 1.5rem; }
            .cm-input { 
                background: var(--bg-secondary, #fff); color: var(--text-primary); 
                border: 2px solid var(--accent-color); cursor: pointer; 
                box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
            }
            .cm-input.selected { background: #fff3cd; border-color: #f39c12; transform: scale(0.95); }
            .cm-input.correct { background: #27ae60 !important; color: #fff !important; border-color: #2ecc71; animation: pop 0.3s; }
            .cm-input.wrong { background: #e74c3c !important; color: #fff !important; animation: shake 0.3s; }
            .cm-empty { visibility: hidden; }

            /* ✅ لوحة المفاتيح الموحدة - تستخدم نظام الشبكة والأزرار القياسية */
            .cm-numpad { 
                display: grid; 
                grid-template-columns: repeat(4, 1fr); /* 4 أعمدة مثل التصميم الموحد */
                gap: 10px; 
                width: 100%; 
                max-width: 400px; 
                margin: 20px auto 15px auto; 
            }
            
            .cm-numpad .gc-btn {
                height: 55px; /* ارتفاع موحد */
                font-size: 1.4rem;                font-weight: 700;
                border-radius: 10px;
                box-shadow: 0 4px 0 var(--accent-hover);
                transition: all 0.1s ease;
            }

            .cm-numpad .gc-btn:active {
                transform: translateY(4px);
                box-shadow: none;
            }

            /* تمييز خاص لزر الحذف */
            .cm-numpad .gc-btn-secondary {
                background: #6c757d !important;
                box-shadow: 0 4px 0 #5a6268 !important;
            }

            @keyframes shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            @keyframes pop { 50% { transform: scale(1.1); } }
        </style>

        <div class="cm-wrapper">
            <div class="cm-header">
                <h2 style="margin:0; color: var(--accent-color);">الأرقام المتقاطعة</h2>
                <!-- زر الخروج موحد -->
                <button class="gc-btn gc-btn-secondary" onclick="loadHomePage()" style="height:40px; font-size:0.9rem;">🏠 الرئيسية</button>
            </div>
            
            <div class="cm-stats">
                <span>🏆 <span id="cm-pts">${gameStats.points}</span></span>
                <span>المرحلة: <span id="cm-stg">${gameStats.stage}</span></span>
                <span id="cm-lives" style="color:#e74c3c;">❤️❤️❤️</span>
            </div>

            <div id="cm-board" class="cm-grid"></div>

            <!-- ✅ تم تغيير هيكل الأزرار لاستخدام gc-btn -->
            <div class="cm-numpad">
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(1)">1</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(2)">2</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(3)">3</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(4)">4</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(5)">5</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(6)">6</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(7)">7</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(8)">8</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(9)">9</button>
                <button class="gc-btn gc-btn-primary" onclick="cmInputVal(0)">0</button>
                <!-- زر السالب -->
                <button class="gc-btn gc-btn-warning" onclick="cmInputVal('-')">−</button>                <!-- زر الحذف -->
                <button class="gc-btn gc-btn-secondary" onclick="cmInputVal('DEL')">⌫</button>
            </div>
            
            <!-- أدوات إضافية موحدة في الأسفل -->
            <div class="st-footer">
                 <button class="gc-btn gc-btn-danger" onclick="startNewLevel()">🔄 إعادة المستوى</button>
            </div>
        </div>`;
    }

    function startNewLevel() {
        selectedInputIdx = null;
        currentInputBuffer = "";
        gameStats.lives = 3;
        updateUI();
        generateDynamicPuzzle();
        drawGrid();
        
        const config = getStageConfig(gameStats.stage);
        showToast(`المرحلة ${gameStats.stage}: ${config.name}`, 'info');
    }

    function getStageConfig(stage) {
        if (stage > 5) return STAGE_CONFIGS[5];
        return STAGE_CONFIGS[stage] || STAGE_CONFIGS[1];
    }

    function generateDynamicPuzzle() {
        const config = getStageConfig(gameStats.stage);
        const size = 5; 
        solutionGrid = Array(size * size).fill({v: '', t: 'empty'});
        
        const r = () => Math.floor(Math.random() * (config.range[1] - config.range[0] + 1)) + config.range[0];
        const op = () => config.ops[Math.floor(Math.random() * config.ops.length)];

        let n1 = r(), n2 = r(), n3 = r(), n4 = r();
        let opH1 = op(), opH2 = op(), opV1 = op(), opV2 = op();

        const calc = (a, operation, b) => {
            if (operation === '+') return a + b;
            if (operation === '-') return a - b;
            if (operation === '*') return a * b;
            if (operation === '/') {
                if (b === 0) b = 1;
                return parseFloat((a / b).toFixed(2));
            }
            return 0;
        };
        let resH1 = calc(n1, opH1, n2);
        let resH2 = calc(n3, opH2, n4);
        let resV1 = calc(n1, opV1, n3);
        let resV2 = calc(n2, opV2, n4);

        solutionGrid = Array(25).fill({v: '', t: 'empty'});
        
        // أفقي 1
        solutionGrid[0] = {v: formatNum(n1), t: 'num'};
        solutionGrid[1] = {v: opH1, t: 'op'};
        solutionGrid[2] = {v: formatNum(n2), t: 'num'};
        solutionGrid[3] = {v: '=', t: 'op'};
        solutionGrid[4] = {v: formatNum(resH1), t: 'num'};
        
        // عمودي 1 & 2
        solutionGrid[5] = {v: opV1, t: 'op'};
        solutionGrid[7] = {v: opV2, t: 'op'};

        solutionGrid[10] = {v: formatNum(n3), t: 'num'};
        solutionGrid[11] = {v: opH2, t: 'op'};
        solutionGrid[12] = {v: formatNum(n4), t: 'num'};
        solutionGrid[13] = {v: '=', t: 'op'};
        solutionGrid[14] = {v: formatNum(resH2), t: 'num'};

        solutionGrid[15] = {v: '=', t: 'op'};
        solutionGrid[17] = {v: '=', t: 'op'};

        solutionGrid[20] = {v: formatNum(resV1), t: 'num'};
        solutionGrid[22] = {v: formatNum(resV2), t: 'num'};
        
        displayGrid = solutionGrid.map((cell, idx) => {
            if (cell.t === 'num' && cell.v !== '=' && Math.random() < 0.4) { 
                return { ...cell, t: 'input', originalV: cell.v };
            }
            return cell;
        });
    }

    function formatNum(n) {
        return parseFloat(n).toString();
    }

    function drawGrid() {
        const board = document.getElementById('cm-board');
        if (!board) return;
        board.innerHTML = '';

        displayGrid.forEach((cell, i) => {
            const div = document.createElement('div');
            div.className = `cm-cell ${cell.t === 'empty' ? 'cm-empty' : ''} ${cell.t === 'num' ? 'cm-num' : ''} ${cell.t === 'op' ? 'cm-op' : ''} ${cell.t === 'input' ? 'cm-input' : ''}`;            
            if (cell.t === 'num' || cell.t === 'op') {
                div.innerText = cell.v;
            } else if (cell.t === 'input') {
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
        currentInputBuffer = "";
        const current = document.getElementById(`cm-slot-${idx}`);
        if(current) {
            current.classList.add('selected');
            current.innerText = ""; 
        }
    }

    window.cmInputVal = (val) => {
        if (selectedInputIdx === null) return;
        const cellData = displayGrid[selectedInputIdx];
        const uiElement = document.getElementById(`cm-slot-${selectedInputIdx}`);

        if (val === 'DEL') {
            currentInputBuffer = "";
            uiElement.innerText = "";
            return;
        }

        if (val === '-' && currentInputBuffer !== "") return;
        
        currentInputBuffer += val.toString();
        uiElement.innerText = currentInputBuffer;

        const targetLen = cellData.originalV.toString().length;
        if (currentInputBuffer.length >= targetLen) {
            checkAnswer(selectedInputIdx, currentInputBuffer, cellData.originalV, uiElement);
        }
    };

    function checkAnswer(idx, userVal, correctVal, element) {
        if (parseFloat(userVal) === parseFloat(correctVal)) {
            element.classList.add('correct');            element.classList.remove('selected', 'wrong');
            element.style.pointerEvents = 'none'; 
            
            gameStats.points += 10;
            selectedInputIdx = null;
            currentInputBuffer = "";
            updateUI();
            checkLevelWin();
        } else {
            gameStats.lives--;
            element.classList.add('wrong');
            currentInputBuffer = "";
            setTimeout(() => {
                element.classList.remove('wrong');
                element.innerText = "";
                if(gameStats.lives > 0) element.classList.add('selected');
            }, 600);
            
            updateUI();
            if (gameStats.lives <= 0) {
                showToast("💔 انتهت المحاولات! إعادة المحاولة.", "error");
                setTimeout(startNewLevel, 1500);
            }
        }
    }

    function checkLevelWin() {
        const totalInputs = displayGrid.filter(c => c.t === 'input').length;
        const solvedInputs = document.querySelectorAll('.cm-input.correct').length;

        if (totalInputs > 0 && totalInputs === solvedInputs) {
            gameStats.stage++;
            gameStats.points += 50;
            
            localStorage.setItem('math_user_points', String(gameStats.points));
            localStorage.setItem('crossmath_stage', String(gameStats.stage));
            
            showToast("🎉 رائع! اكتمل اللغز. المرحلة التالية...", "success");
            
            if (typeof window.checkAndUnlockAchievements === 'function') {
                window.checkAndUnlockAchievements();
            }

            setTimeout(startNewLevel, 2000);
        }
    }

    function updateUI() {
        const p = document.getElementById('cm-pts');
        const s = document.getElementById('cm-stg');        const l = document.getElementById('cm-lives');
        
        if (p) p.innerText = String(gameStats.points);
        if (s) s.innerText = String(gameStats.stage);
        if (l) l.innerText = "❤️".repeat(Math.max(0, gameStats.lives));
    }

    function showToast(msg, type) {
        const old = document.querySelector('.cm-toast');
        if(old) old.remove();
        const t = document.createElement('div');
        t.className = 'cm-toast';
        t.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:${type==='error'?'#e74c3c':'#27ae60'};color:#fff;padding:10px 20px;border-radius:20px;z-index:9999;font-weight:bold;font-size:1rem;box-shadow:0 4px 10px rgba(0,0,0,0.3);animation:fadeIn 0.3s;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(()=>{ t.style.opacity="0"; setTimeout(()=>t.remove(),300); }, 2000);
    }

})();