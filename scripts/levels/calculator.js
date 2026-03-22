// scripts/levels/calculator.js
(function() {
    let expression = "";
    let lastResult = "0";
    let activeModule = "sci"; 

    window.loadCalculatorPage = function() {
        window.currentLevel = 'calculator';
        renderAcademicCalc();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('beginner'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
    };

    function renderAcademicCalc() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        // نترك الحاوية بدون فرض خلفية لتعتمد على خلفية الموقع الأصلية
        mainContent.style.backgroundColor = "transparent"; 
        
        mainContent.innerHTML = `
        <style>
            .calc-master-container {
                direction: ltr;
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
                padding: 10px;
                box-sizing: border-box;
            }

            /* شاشة النتائج - تتبنى ألوان الموقع */
            .calc-display-unit {
                background: var(--card-bg, rgba(255, 255, 255, 0.05));
                border: 2px solid var(--border-color, rgba(128, 128, 128, 0.2));
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 15px;
                text-align: right;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .calc-formula { 
                color: var(--text-color, #555); 
                opacity: 0.8;
                font-size: 0.9rem; 
                min-height: 1.2rem;
                overflow: hidden;
            }
            .calc-output { 
                color: #00ff88; /* اللون الأخضر المميز لتطبيقك */
                font-size: 2.2rem; 
                font-weight: bold; 
                margin-top: 5px;
                word-wrap: break-word;
            }

            /* التبويبات بأسلوب البطاقات */
            .calc-nav {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
            }
            .nav-item {
                flex: 1;
                padding: 10px;
                border: 1px solid var(--border-color, #ccc);
                border-radius: 8px;
                background: var(--card-bg, #eee);
                color: var(--text-color, #333);
                font-weight: bold;
                cursor: pointer;
                text-align: center;
                font-size: 0.8rem;
            }
            .nav-item.active {
                background: #00ff88;
                color: #000;
                border-color: #00ff88;
            }

            /* شبكة الأزرار - تحسين التباين للوضع النهاري */
            .calc-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 6px;
            }
            
            .calc-btn {
                height: 50px;
                border: 1px solid var(--border-color, rgba(0,0,0,0.1));
                border-radius: 8px;
                background: var(--card-bg, #f9f9f9);
                color: var(--text-color, #111); /* يضمن الظهور في الوضع النهاري */
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s, transform 0.1s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .calc-btn:active { transform: scale(0.95); opacity: 0.8; }
            
            /* ألوان مميزة للعمليات */
            .btn-blue { color: #007bff; }
            .btn-orange { color: #fd7e14; }
            .btn-red { color: #dc3545; }
            .btn-equal { 
                grid-column: span 2; 
                background: #00ff88 !important; 
                color: #000 !important; 
            }

            .stats-box {
                background: var(--card-bg, rgba(255,255,255,0.05));
                padding: 15px;
                border-radius: 10px;
                border: 1px solid var(--border-color, #ccc);
            }
            .stats-field {
                width: 100%;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid var(--border-color, #ccc);
                background: var(--input-bg, #fff);
                color: #000;
                margin-bottom: 10px;
                box-sizing: border-box;
            }

            .home-btn {
                margin-top: 20px;
                width: 100%;
                padding: 10px;
                background: none;
                border: 1px solid var(--border-color, #888);
                color: var(--text-color, #888);
                border-radius: 8px;
                cursor: pointer;
            }
        </style>

        <div class="calc-master-container">
            <div class="calc-nav">
                <div class="nav-item ${activeModule==='sci'?'active':''}" onclick="switchModule('sci')">SCIENTIFIC</div>
                <div class="nav-item ${activeModule==='stats'?'active':''}" onclick="switchModule('stats')">STATISTICS</div>
            </div>

            <div class="calc-display-unit">
                <div class="calc-formula" id="f-display">${expression}</div>
                <div class="calc-output" id="o-display">${lastResult}</div>
            </div>

            <div id="calculator-body">
                ${renderBody()}
            </div>
            
            <button class="home-btn" onclick="loadHomePage()">[ عودة للرئيسية ]</button>
        </div>`;
    }

    function renderBody() {
        if (activeModule === 'sci') {
            return `
            <div class="calc-grid">
                <button class="calc-btn btn-blue" onclick="add('Math.PI')">π</button>
                <button class="calc-btn btn-blue" onclick="add('Math.E')">e</button>
                <button class="calc-btn btn-blue" onclick="add('Math.pow(')">xʸ</button>
                <button class="calc-btn btn-red" onclick="clearAll()">AC</button>
                <button class="calc-btn btn-red" onclick="del()">DEL</button>

                <button class="calc-btn btn-blue" onclick="add('Math.sin(')">sin</button>
                <button class="calc-btn btn-blue" onclick="add('Math.cos(')">cos</button>
                <button class="calc-btn btn-blue" onclick="add('Math.tan(')">tan</button>
                <button class="calc-btn btn-blue" onclick="add('Math.sqrt(')">√</button>
                <button class="calc-btn btn-orange" onclick="add('/')">÷</button>

                <button class="calc-btn btn-blue" onclick="add('Math.log(')">ln</button>
                <button class="calc-btn btn-blue" onclick="add('Math.log10(')">log</button>
                <button class="calc-btn btn-blue" onclick="add('factorial(')">n!</button>
                <button class="calc-btn" onclick="add('(')">(</button>
                <button class="calc-btn btn-orange" onclick="add('*')">×</button>

                <button class="calc-btn" onclick="add('7')">7</button>
                <button class="calc-btn" onclick="add('8')">8</button>
                <button class="calc-btn" onclick="add('9')">9</button>
                <button class="calc-btn" onclick="add(')')">)</button>
                <button class="calc-btn btn-orange" onclick="add('-')">−</button>

                <button class="calc-btn" onclick="add('4')">4</button>
                <button class="calc-btn" onclick="add('5')">5</button>
                <button class="calc-btn" onclick="add('6')">6</button>
                <button class="calc-btn btn-blue" onclick="add('Math.exp(')">eˣ</button>
                <button class="calc-btn btn-orange" onclick="add('+')">+</button>

                <button class="calc-btn" onclick="add('1')">1</button>
                <button class="calc-btn" onclick="add('2')">2</button>
                <button class="calc-btn" onclick="add('3')">3</button>
                <button class="calc-btn btn-blue" onclick="add('Ans')">Ans</button>
                <button class="calc-btn btn-equal" onclick="solve()">=</button>

                <button class="calc-btn" style="grid-column: span 2" onclick="add('0')">0</button>
                <button class="calc-btn" onclick="add('.')">.</button>
            </div>`;
        } else {
            return `
            <div class="stats-box">
                <input type="text" id="stats-input" class="stats-field" placeholder="الأرقام: 1, 2, 3" inputmode="decimal">
                <div class="calc-grid">
                    <button class="calc-btn btn-blue" onclick="statsCalc('mean')">MEAN</button>
                    <button class="calc-btn btn-blue" onclick="statsCalc('sd')">SD</button>
                    <button class="calc-btn btn-blue" onclick="statsCalc('var')">VAR</button>
                    <button class="calc-btn btn-blue" onclick="statsCalc('sum')">SUM</button>
                    <button class="calc-btn btn-red" style="grid-column: span 5; margin-top:10px;" onclick="document.getElementById('stats-input').value=''">CLEAR</button>
                </div>
            </div>`;
        }
    }

    // المنطق البرمجي الأساسي
    window.switchModule = (m) => { activeModule = m; renderAcademicCalc(); };
    window.add = (t) => { if(t === 'Ans') expression += lastResult; else expression += t; updateScreen(); };
    window.clearAll = () => { expression = ""; lastResult = "0"; updateScreen(); };
    window.del = () => { expression = expression.slice(0, -1); updateScreen(); };
    window.solve = () => {
        try {
            let res = eval(expression);
            lastResult = Number.isInteger(res) ? res.toString() : res.toFixed(4).replace(/\.?0+$/,"");
            expression = ""; updateScreen();
        } catch { lastResult = "Error"; updateScreen(); }
    };
    window.statsCalc = (type) => {
        const input = document.getElementById('stats-input');
        if(!input) return;
        const data = input.value.split(',').map(Number).filter(n => !isNaN(n));
        if(data.length === 0) return;
        let mean = data.reduce((a,b)=>a+b)/data.length;
        let res = (type === 'mean') ? mean : (type === 'sum') ? data.reduce((a,b)=>a+b) : (type === 'var') ? data.reduce((a,b)=>a+Math.pow(b-mean, 2), 0) / data.length : Math.sqrt(data.reduce((a,b)=>a+Math.pow(b-mean, 2), 0) / data.length);
        lastResult = res.toFixed(3); updateScreen();
    };
    function updateScreen() {
        const f = document.getElementById('f-display');
        const o = document.getElementById('o-display');
        if(f) f.innerText = expression.replace(/Math\./g, '');
        if(o) o.innerText = lastResult;
    }
    window.factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);
})();
