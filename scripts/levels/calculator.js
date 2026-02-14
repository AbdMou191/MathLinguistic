// scripts/levels/calculator.js
(function() {
    let expression = "";
    let lastResult = "0";
    let activeModule = "sci"; // الوضع الافتراضي: الحساب العلمي

    window.loadCalculatorPage = function() {
        window.currentLevel = 'calculator';
        renderAcademicCalc();
    };

    function renderAcademicCalc() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        mainContent.style.backgroundColor = "#000";
        mainContent.innerHTML = `
        <style>
            .acad-container {
                direction: ltr; 
                font-family: 'Fira Code', monospace;
                width: 100%; 
                min-height: 100vh; 
                display: flex; 
                flex-direction: column;
                background: #000; 
                color: #e0e0e0; 
                box-sizing: border-box;
            }

            /* شاشة النتائج */
            .acad-screen {
                padding: 25px; 
                flex: 0 0 auto; 
                min-height: 130px;
                display: flex; 
                flex-direction: column; 
                justify-content: flex-end; 
                align-items: flex-end;
                background: #000; 
                border-bottom: 1px solid #1a1a1a;
            }
            .acad-formula { 
                color: #555; 
                font-size: 1.1rem; 
                min-height: 1.6rem; 
                word-break: break-all;
                text-align: right;
            }
            .acad-output { 
                color: #00ff88; 
                font-size: 3rem; 
                font-weight: 200; 
                overflow-x: auto; 
                width: 100%; 
                text-align: right; 
                margin-top: 10px;
            }

            /* التبويبات - تم حذف خيار المصفوفة */
            .module-tabs { 
                display: flex; 
                background: #0a0a0a; 
                padding: 6px; 
                gap: 6px; 
                border-bottom: 1px solid #1a1a1a; 
            }
            .m-tab { 
                flex: 1; 
                padding: 14px; 
                border: none; 
                background: none; 
                color: #444; 
                cursor: pointer; 
                font-size: 0.8rem; 
                font-weight: bold; 
                border-radius: 8px;
                transition: 0.3s ease;
            }
            .m-tab.active { 
                color: #00ff88; 
                background: #111; 
                box-shadow: inset 0 0 5px rgba(0,255,136,0.1);
            }

            /* منطقة الأزرار */
            .control-panel { 
                flex: 1; 
                padding: 12px;
                background: #000;
            }
            
            .grid-layout { 
                display: grid; 
                grid-template-columns: repeat(5, 1fr); 
                gap: 10px; 
                width: 100%;
            }
            
            .btn {
                height: 55px; 
                border-radius: 10px; 
                border: 1px solid #151515; 
                font-size: 1rem;
                cursor: pointer; 
                background: #0d0d0d; 
                color: #aaa;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.1s;
            }
            .btn:active { 
                background: #1a1a1a; 
                transform: scale(0.95);
            }
            
            .btn-accent { color: #00ff88; border-color: #00ff8811; }
            .btn-sci { color: #4dadff; font-size: 0.85rem; }
            .btn-op { color: #ff9f0a; font-size: 1.4rem; }
            .btn-danger { color: #ff4d4d; }
            .btn-solve { 
                background: #008554; 
                color: #fff; 
                grid-column: span 2; 
                font-weight: bold;
                border: none;
            }

            /* واجهة الإحصاء */
            .stats-wrapper {
                padding: 15px;
            }
            .stats-input {
                width: 100%;
                background: #0a0a0a;
                border: 1px solid #222;
                color: #00ff88;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                font-family: inherit;
                font-size: 1.1rem;
                box-sizing: border-box;
                outline: none;
            }

            .exit-area {
                padding: 20px;
                text-align: center;
            }
            .exit-link {
                background: none; border: none; color: #333; 
                font-size: 0.7rem; cursor: pointer; letter-spacing: 3px;
            }
        </style>

        <div class="acad-container">
            <div class="module-tabs">
                <button class="m-tab ${activeModule==='sci'?'active':''}" onclick="switchModule('sci')">SCIENTIFIC_CALC</button>
                <button class="m-tab ${activeModule==='stats'?'active':''}" onclick="switchModule('stats')">STATISTICAL_ANALYSIS</button>
            </div>

            <div class="acad-screen">
                <div class="acad-formula" id="f-display">${expression}</div>
                <div class="acad-output" id="o-display">${lastResult}</div>
            </div>

            <div class="control-panel">
                ${renderPanel()}
            </div>
            
            <div class="exit-area">
                <button class="exit-link" onclick="loadHomePage()">[ DISCONNECT_CORE ]</button>
            </div>
        </div>`;
    }

    function renderPanel() {
        if (activeModule === 'sci') {
            return `
            <div class="grid-layout">
                <button class="btn btn-sci" onclick="add('Math.PI')">π</button>
                <button class="btn btn-sci" onclick="add('Math.E')">e</button>
                <button class="btn btn-sci" onclick="add('Math.pow(')">xʸ</button>
                <button class="btn btn-danger" onclick="clearAll()">AC</button>
                <button class="btn btn-danger" onclick="del()">DEL</button>

                <button class="btn btn-sci" onclick="add('Math.sin(')">sin</button>
                <button class="btn btn-sci" onclick="add('Math.cos(')">cos</button>
                <button class="btn btn-sci" onclick="add('Math.tan(')">tan</button>
                <button class="btn btn-sci" onclick="add('Math.sqrt(')">√</button>
                <button class="btn btn-op" onclick="add('/')">÷</button>

                <button class="btn btn-sci" onclick="add('Math.log(')">ln</button>
                <button class="btn btn-sci" onclick="add('Math.log10(')">log</button>
                <button class="btn btn-sci" onclick="add('factorial(')">n!</button>
                <button class="btn btn-sci" onclick="add('(')">(</button>
                <button class="btn btn-op" onclick="add('*')">×</button>

                <button class="btn" onclick="add('7')">7</button>
                <button class="btn" onclick="add('8')">8</button>
                <button class="btn" onclick="add('9')">9</button>
                <button class="btn btn-sci" onclick="add(')')">)</button>
                <button class="btn btn-op" onclick="add('-')">−</button>

                <button class="btn" onclick="add('4')">4</button>
                <button class="btn" onclick="add('5')">5</button>
                <button class="btn" onclick="add('6')">6</button>
                <button class="btn btn-accent" onclick="add('Math.exp(')">eˣ</button>
                <button class="btn btn-op" onclick="add('+')">+</button>

                <button class="btn" onclick="add('1')">1</button>
                <button class="btn" onclick="add('2')">2</button>
                <button class="btn" onclick="add('3')">3</button>
                <button class="btn btn-accent" onclick="add('Ans')">Ans</button>
                <button class="btn btn-solve" onclick="solve()">EXECUTE</button>

                <button class="btn" style="grid-column: span 2" onclick="add('0')">0</button>
                <button class="btn" onclick="add('.')">.</button>
            </div>`;
        } else {
            return `
            <div class="stats-wrapper">
                <input type="text" id="stats-input" class="stats-input" 
                       placeholder="Input sequence: 5, 10, 15..." inputmode="decimal">
                <div class="grid-layout">
                    <button class="btn btn-sci" onclick="statsCalc('mean')">MEAN</button>
                    <button class="btn btn-sci" onclick="statsCalc('sd')">STD_DEV</button>
                    <button class="btn btn-sci" onclick="statsCalc('var')">VARIANCE</button>
                    <button class="btn btn-sci" onclick="statsCalc('sum')">SUM_ALL</button>
                    <button class="btn btn-danger" style="grid-column: span 5; margin-top:15px;" 
                            onclick="document.getElementById('stats-input').value=''">CLEAR_BUFFER</button>
                </div>
            </div>`;
        }
    }

    // --- المنطق النظيف (بدون مصفوفات) ---
    window.switchModule = (m) => { 
        activeModule = m; 
        renderAcademicCalc(); 
    };

    window.add = (t) => {
        if(t === 'Ans') expression += lastResult;
        else expression += t;
        updateScreen();
    };

    window.clearAll = () => { expression = ""; lastResult = "0"; updateScreen(); };
    window.del = () => { expression = expression.slice(0, -1); updateScreen(); };

    window.solve = () => {
        try {
            let res = eval(expression);
            lastResult = Number.isInteger(res) ? res.toString() : res.toFixed(6).replace(/\.?0+$/,"");
            expression = ""; 
            updateScreen();
        } catch { 
            lastResult = "SYNTAX_ERR"; 
            updateScreen(); 
        }
    };

    window.statsCalc = (type) => {
        const input = document.getElementById('stats-input');
        if(!input) return;
        const data = input.value.split(',').map(Number).filter(n => !isNaN(n));
        if(data.length === 0) return;
        
        let mean = data.reduce((a,b)=>a+b)/data.length;
        let res = 0;

        if(type === 'mean') res = mean;
        else if(type === 'sum') res = data.reduce((a,b)=>a+b);
        else if(type === 'var') res = data.reduce((a,b)=>a+Math.pow(b-mean, 2), 0) / data.length;
        else if(type === 'sd') res = Math.sqrt(data.reduce((a,b)=>a+Math.pow(b-mean, 2), 0) / data.length);

        lastResult = res.toFixed(4);
        updateScreen();
    };

    function updateScreen() {
        const f = document.getElementById('f-display');
        const o = document.getElementById('o-display');
        if(f) f.innerText = expression.replace(/Math\./g, '');
        if(o) o.innerText = lastResult;
    }

    window.factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);

})();
