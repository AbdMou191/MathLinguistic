// scripts/levels/crossmath.js
// النسخة المحدثة: توليد ديناميكي، 5 مراحل صعوبة، ثيم متكامل، وإنجازات.

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
        stage: 1 // نبدأ من المرحلة 1
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
        // استعادة المرحلة terakhir أو البدء من 1
        gameStats.stage = parseInt(localStorage.getItem('crossmath_stage') || "1");
        
        renderCrossmathUI();
        startNewLevel();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('corssmath'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
        
        console.log(`🚀 بدء الأرقام المتقاطعة: المرحلة ${gameStats.stage}`);
        
        // ✅ تحديث الميتا حتى في حالة الخطأ (اختياري لكن مفضل)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('corssmath');
        }
    };

    function renderCrossmathUI() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
        <style>
            .cm-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 15px; max-width: 450px; margin: auto; color: var(--text-primary); }
            .cm-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid var(--accent-color); padding-bottom: 10px; }
            
            .cm-stats { 
                display: flex; gap: 15px; font-weight: bold; font-size: 0.9rem;                 background: var(--card-bg); padding: 10px; border-radius: 10px; 
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

            /* لوحة المفاتيح */
            .cm-numpad { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; width: 100%; margin-top: 20px; }
            .n-btn { padding: 12px 0; background: var(--accent-color); color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1.2rem; box-shadow: 0 3px 0 var(--accent-hover); }
            .n-btn:active { transform: translateY(3px); box-shadow: none; }
            .n-btn.special { background: #e67e22; box-shadow: 0 3px 0 #d35400; }
            .n-btn.del { background: #c0392b; box-shadow: 0 3px 0 #922b21; }

            @keyframes shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            @keyframes pop { 50% { transform: scale(1.1); } }
        </style>

        <div class="cm-wrapper">
            <div class="cm-header">
                <h2 style="margin:0; color: var(--accent-color);">الأرقام المتقاطعة</h2>
                <button class="n-btn" style="padding:6px 12px; font-size:0.8rem; background:#95a5a6; box-shadow:none;" onclick="loadHomePage()">خروج</button>
            </div>
                        <div class="cm-stats">
                <span>🏆 <span id="cm-pts">${gameStats.points}</span></span>
                <span>المرحلة: <span id="cm-stg">${gameStats.stage}</span></span>
                <span id="cm-lives" style="color:#e74c3c;">❤️❤️❤️</span>
            </div>

            <div id="cm-board" class="cm-grid"></div>

            <div class="cm-numpad">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="n-btn" onclick="cmInputVal(${n})">${n}</button>`).join('')}
                <button class="n-btn special" onclick="cmInputVal('-')">-</button>
                <button class="n-btn del" onclick="cmInputVal('DEL')">⌫</button>
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
        // إذا تجاوز المرحلة 5، نستخدم إعدادات المرحلة 5 مع زيادة صعوبة عشوائية بسيطة
        if (stage > 5) return STAGE_CONFIGS[5];
        return STAGE_CONFIGS[stage] || STAGE_CONFIGS[1];
    }

    function generateDynamicPuzzle() {
        const config = getStageConfig(gameStats.stage);
        const size = 5; // شبكة 5x5 ثابتة للعرض
        solutionGrid = Array(size * size).fill({v: '', t: 'empty'});
        
        // توليد أرقام عشوائية للمنطق
        const r = () => Math.floor(Math.random() * (config.range[1] - config.range[0] + 1)) + config.range[0];
        
        // نختار عمليات مسموحة
        const op = () => config.ops[Math.floor(Math.random() * config.ops.length)];

        // نبني معادلتين أفقيتين ومعادلتين عموديتين تتقاطعان في المنتصف
        // الهيكل:
        // N1 OpH1 N2 = ResH1
        // OpV1      OpV2
        // N3 OpH2 N4 = ResH2        // =         =
        // ResV1     ResV2
        
        // لتبسيط التوليد وضمان الصحة، سنولد الأرقام ثم نحسب النتائج
        let n1 = r(), n2 = r(), n3 = r(), n4 = r();
        let opH1 = op(), opH2 = op(), opV1 = op(), opV2 = op();

        // دالة حساب آمنة
        const calc = (a, operation, b) => {
            if (operation === '+') return a + b;
            if (operation === '-') return a - b;
            if (operation === '*') return a * b;
            if (operation === '/') {
                // لضمان قسمة صحيحة أو عشرية نظيفة، نعدل الأرقام إذا لزم الأمر
                if (b === 0) b = 1;
                return parseFloat((a / b).toFixed(2));
            }
            return 0;
        };

        // تصحيح بسيط للقسمة لتكون نتائجها جميلة (اختياري، لكن يفضل للألعاب)
        if (config.ops.includes('/') && (opH1 === '/' || opH2 === '/' || opV1 === '/' || opV2 === '/')) {
             // هنا يمكن إضافة منطق معقد لضبط الأرقام، للتبسيط سنعتمد على toFixed
        }

        let resH1 = calc(n1, opH1, n2);
        let resH2 = calc(n3, opH2, n4);
        let resV1 = calc(n1, opV1, n3);
        let resV2 = calc(n2, opV2, n4);

        // تعبئة المصفوفة (Index: 0..24)
        // الصف 0: N1, OpH1, N2, =, ResH1
        solutionGrid[0] = {v: formatNum(n1), t: 'num'};
        solutionGrid[1] = {v: opH1, t: 'op'};
        solutionGrid[2] = {v: formatNum(n2), t: 'num'};
        solutionGrid[3] = {v: '=', t: 'op'};
        solutionGrid[4] = {v: formatNum(resH1), t: 'num'};

        // الصف 1: OpV1, (فارغ), OpV2, (فارغ), (فارغ) -> في الواقع التقاطع يكون في الأعمدة
        // لتصحيح الهيكل ليتناسب مع 5x5 بشكل متقاطع حقيقي:
        // دعنا نستخدم هيكل أبسط: 3 معادلات صغيرة أو هيكل + و X
        
        // هيكل بديل مضمون للشبكة 5x5:
        // [N1] [Op1] [N2] [=] [R1]
        // [Op2]  .    [Op3]  .   .
        // [N3] [Op4] [N4] [=] [R2]
        // [=]   .    [=]   .   .
        // [R3]  .    [R4]  .   .
        
        // إعادة التعيين للهيكل الصحيح        solutionGrid = Array(25).fill({v: '', t: 'empty'});
        
        // أفقي 1
        solutionGrid[0] = {v: formatNum(n1), t: 'num'};
        solutionGrid[1] = {v: opH1, t: 'op'};
        solutionGrid[2] = {v: formatNum(n2), t: 'num'};
        solutionGrid[3] = {v: '=', t: 'op'};
        solutionGrid[4] = {v: formatNum(resH1), t: 'num'};
        
        // عمودي 1 (يتقاطع عند 0)
        solutionGrid[5] = {v: opV1, t: 'op'};
        solutionGrid[10] = {v: formatNum(n3), t: 'num'}; // تقاطع؟ لا، لنجعلها مستقلة قليلاً أو متصلة
        // لتبسيط الكود وضمان العمل فوراً: سنولد لغزاً بسيطاً يتكون من معادلتين فقط متداخلتين
        
        // الهيكل النهائي المعتمد (بسيط وقوي):
        // 0:N1, 1:OpH, 2:N2, 3:=, 4:ResH
        // 5:OpV, 6:., 7:OpV2, 8:., 9:.
        // 10:N3, 11:OpH2, 12:N4, 13:=, 14:ResH2
        // 15:=, 16:., 17:=, 18:., 19:.
        // 20:ResV1, 21:., 22:ResV2, 23:., 24:.
        
        // إعادة حساب لضمان التقاطع الصحيح
        // العمود 0: N1 OpV1 N3 = ResV1
        // العمود 2: N2 OpV2 N4 = ResV2
        
        resV1 = calc(n1, opV1, n3);
        resV2 = calc(n2, opV2, n4);

        // تعبئة نهائية
        solutionGrid[0] = {v: formatNum(n1), t: 'num'};
        solutionGrid[1] = {v: opH1, t: 'op'};
        solutionGrid[2] = {v: formatNum(n2), t: 'num'};
        solutionGrid[3] = {v: '=', t: 'op'};
        solutionGrid[4] = {v: formatNum(resH1), t: 'num'};

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
        // إنشاء اللغز (إخفاء بعض الأرقام)
        displayGrid = solutionGrid.map((cell, idx) => {
            if (cell.t === 'num' && cell.v !== '=' && Math.random() < 0.4) { // إخفاء 40% من الأرقام
                return { ...cell, t: 'input', originalV: cell.v };
            }
            return cell;
        });
    }

    function formatNum(n) {
        // إزالة الفواصل العشرية الزائدة (مثلاً 5.00 تصبح 5)
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
                if (currentInputBuffer && selectedInputIdx === i) {
                     // لا نعرض buffer هنا لتجنب التشويش، ننتظر التأكيد أو نعرضه داخل الخانة
                }
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
            current.innerText = ""; // مسح أي محتوى سابق عند التحديد للكتابة الجديدة
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

        // منع إدخال غير رقمي ما عدا السالب في البداية
        if (val === '-' && currentInputBuffer !== "") return;
        
        currentInputBuffer += val.toString();
        uiElement.innerText = currentInputBuffer;

        // التحقق التلقائي إذا تطابق الطول مع الإجابة الأصلية
        const targetLen = cellData.originalV.toString().length;
        if (currentInputBuffer.length >= targetLen) {
            checkAnswer(selectedInputIdx, currentInputBuffer, cellData.originalV, uiElement);
        }
    };

    function checkAnswer(idx, userVal, correctVal, element) {
        // مقارنة مرنة (تتجاهل الفواصل العشرية الزائدة)
        if (parseFloat(userVal) === parseFloat(correctVal)) {
            element.classList.add('correct');
            element.classList.remove('selected', 'wrong');
            element.style.pointerEvents = 'none'; // منع التعديل
            
            gameStats.points += 10;
            selectedInputIdx = null;
            currentInputBuffer = "";
            updateUI();
            checkLevelWin();
        } else {
            // خطأ
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
                showToast("💔 انتهت المحاولات! إعادة المحاولة.", "error");                setTimeout(startNewLevel, 1500);
            }
        }
    }

    function checkLevelWin() {
        const totalInputs = displayGrid.filter(c => c.t === 'input').length;
        const solvedInputs = document.querySelectorAll('.cm-input.correct').length;

        if (totalInputs > 0 && totalInputs === solvedInputs) {
            gameStats.stage++;
            gameStats.points += 50;
            
            localStorage.setItem('math_user_points', gameStats.points);
            localStorage.setItem('crossmath_stage', gameStats.stage);
            
            showToast("🎉 رائع! اكتمل اللغز. المرحلة التالية...", "success");
            
            if (typeof window.checkAndUnlockAchievements === 'function') {
                window.checkAndUnlockAchievements();
            }

            setTimeout(startNewLevel, 2000);
        }
    }

    function updateUI() {
        const p = document.getElementById('cm-pts');
        const s = document.getElementById('cm-stg');
        const l = document.getElementById('cm-lives');
        
        if (p) p.innerText = gameStats.points;
        if (s) s.innerText = gameStats.stage;
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
        setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.remove(),300); }, 2000);
    }

})();