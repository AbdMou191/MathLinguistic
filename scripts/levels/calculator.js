// scripts/levels/calculator.js
(function() {
    let expression = "";
    let lastResult = "0";
    let activeModule = "sci"; 

    // تعريف دالة العاملي على window لتعمل داخل eval
    window.factorial = (n) => {
        if (n < 0) return "Error";
        if (n === 0) return 1;
        if (!Number.isInteger(n)) return "Error"; // العاملي للأعداد الصحيحة فقط
        if (n > 170) return "Infinity"; // لتجنب تجاوز سعة الذاكرة
        
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    };

    window.loadCalculatorPage = function() {
        window.currentLevel = 'calculator';
        renderAcademicCalc();
        
        // تحديث الميتا بعد نجاح التحميل والعرض
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('beginner'); 
        }
    };

    function renderAcademicCalc() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
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
                font-family: sans-serif; /* لضمان مظهر موحد للأرقام */
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
                min-height: 80px; /* ضمان مساحة ثابتة للشاشة */
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
            }
            .calc-formula { 
                color: var(--text-color, #555); 
                opacity: 0.8;
                font-size: 1rem; 
                min-height: 1.2rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 5px;
            }
            .calc-output { 
                color: #00ff88; /* اللون الأخضر المميز لتطبيقك */
                font-size: 2.5rem; 
                font-weight: bold; 
                margin-top: 0;
                word-wrap: break-word;
                line-height: 1;
            }

            /* التبويبات بأسلوب البطاقات */
            .calc-nav {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
            }
            .nav-item {
                flex: 1;
                padding: 12px;
                border: 1px solid var(--border-color, #ccc);
                border-radius: 8px;
                background: var(--card-bg, #eee);
                color: var(--text-color, #333);
                font-weight: bold;
                cursor: pointer;
                text-align: center;
                font-size: 0.9rem;
                transition: background 0.2s;
            }
            .nav-item.active {
                background: #00ff88;
                color: #000;
                border-color: #00ff88;
            }

            /* شبكة الأزرار */
            .calc-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
            }
            
            .calc-btn {
                height: 55px;
                border: 1px solid var(--border-color, rgba(0,0,0,0.1));
                border-radius: 10px;
                background: var(--card-bg, #f9f9f9);
                color: var(--text-color, #111); 
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s, transform 0.1s, opacity 0.1s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .calc-btn:active { transform: scale(0.95); opacity: 0.8; }
            
            /* ألوان مميزة للعمليات */
            .btn-blue { color: #007bff; }
            .btn-orange { color: #fd7e14; }
            .btn-red { color: #dc3545; font-weight: 900; }
            
            /* زر يساوي المميز */
            .btn-equal { 
                grid-column: span 2; 
                background: #00ff88 !important; 
                color: #000 !important; 
                font-size: 1.5rem;
            }

            /* واجهة الإحصاء */
            .stats-box {
                background: var(--card-bg, rgba(255,255,255,0.05));
                padding: 15px;
                border-radius: 12px;
                border: 1px solid var(--border-color, #ccc);
            }
            .stats-field {
                width: 100%;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid var(--border-color, #ccc);
                background: var(--input-bg, #fff);
                color: #000;
                margin-bottom: 12px;
                box-sizing: border-box;
                font-size: 1rem;
            }

            .home-btn {
                margin-top: 25px;
                width: 100%;
                padding: 12px;
                background: none;
                border: 1px solid var(--border-color, #888);
                color: var(--text-color, #888);
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: border-color 0.2s, color 0.2s;
            }
            .home-btn:hover {
                border-color: #00ff88;
                color: #00ff88;
            }
        </style>

        <div class="calc-master-container">
            <div class="calc-nav">
                <div class="nav-item ${activeModule==='sci'?'active':''}" onclick="switchModule('sci')">SCIENTIFIC</div>
                <div class="nav-item ${activeModule==='stats'?'active':''}" onclick="switchModule('stats')">STATISTICS</div>
            </div>

            <div class="calc-display-unit">
                <div class="calc-formula" id="f-display"></div>
                <div class="calc-output" id="o-display">${lastResult}</div>
            </div>

            <div id="calculator-body">
                ${renderBody()}
            </div>
            
            <button class="home-btn" onclick="loadHomePage()">[ عودة للرئيسية ]</button>
        </div>`;
        
        // تحديث الشاشة فوراً لعرض الصيغة بشكل صحيح عند التبديل
        updateScreen();
    }

    function renderBody() {
        if (activeModule === 'sci') {
            return `
            <div class="calc-grid">
                <button class="calc-btn btn-blue" onclick="add('Math.PI')">π</button>
                <button class="calc-btn btn-blue" onclick="add('Math.E')">e</button>
                <button class="calc-btn btn-blue" onclick="add('**')">xʸ</button>
                <button class="calc-btn btn-red" onclick="clearAll()">AC</button>
                <button class="calc-btn btn-red" onclick="del()">DEL</button>

                <button class="calc-btn btn-blue" onclick="add('Math.sin(')">sin</button>
                <button class="calc-btn btn-blue" onclick="add('Math.cos(')">cos</button>
                <button class="calc-btn btn-blue" onclick="add('Math.tan(')">tan</button>
                <button class="calc-btn btn-blue" onclick="add('Math.sqrt(')">√</button>
                <button class="calc-btn btn-orange" onclick="add('/')">÷</button>

                <button class="calc-btn btn-blue" onclick="add('Math.log(')">ln</button>
                <button class="calc-btn btn-blue" onclick="add('Math.log10(')">log</button>
                <button class="calc-btn btn-blue" onclick="add('window.factorial(')">n!</button>
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

    window.switchModule = (m) => { activeModule = m; renderAcademicCalc(); };
    
    window.add = (t) => { 
        if(t === 'Ans') {
            // إضافة عامل ضرب تلقائي إذا لزم الأمر قبل Ans
            autoMultiplyBefore(t);
            expression += lastResult;
        } else {
            // إضافة عامل ضرب تلقائي قبل الدوال (مثل sin) إذا سبقتها أرقام
            autoMultiplyBefore(t);
            expression += t; 
        }
        updateScreen(); 
    };

    // دالة مساعدة لإضافة عامل الضرب تلقائياً (*)
    function autoMultiplyBefore(newInput) {
        if (expression.length === 0) return;
        const lastChar = expression.slice(-1);
        
        // التحقق مما إذا كان المدخل دالة أو Ans أو ثابت رياضي
        const needsPreMultiply = (
            newInput.includes('Math.') || 
            newInput.includes('window.') || 
            newInput === 'Ans' || 
            newInput === '('
        );

        // إذا كان آخر حرف رقماً أو قوساً مغلقاً، والمدخل يحتاج لضرب
        if (needsPreMultiply && ((lastChar >= '0' && lastChar <= '9') || lastChar === ')')) {
            expression += '*';
        }
    }

    window.clearAll = () => { expression = ""; lastResult = "0"; updateScreen(); };
    window.del = () => { expression = expression.slice(0, -1); updateScreen(); };
    
    window.solve = () => {
        try {
            if (!expression) return;

            // محاولة إغلاق الأقواس المفتوحة تلقائياً لتجنب الخطأ
            let tempExp = expression;
            const openBrackets = (tempExp.match(/\(/g) || []).length;
            const closeBrackets = (tempExp.match(/\)/g) || []).length;
            for(let i=0; i < (openBrackets - closeBrackets); i++) { tempExp += ')'; }

            // حساب النتيجة باستخدام eval
            let res = eval(tempExp);

            // التحقق من صحة النتيجة (ليست NaN أو Infinity)
            if (!Number.isFinite(res)) {
                lastResult = "Error";
            } else {
                // تنسيق النتيجة: تقريب الأرقام العشرية الطويلة
                lastResult = Number.isInteger(res) ? res.toString() : res.toFixed(6).replace(/\.?0+$/,"");
            }
            expression = ""; 
            updateScreen();
        } catch (e) { 
            console.error("Calculation Error:", e);
            lastResult = "Error"; 
            updateScreen(); 
        }
    };

    window.statsCalc = (type) => {
        const input = document.getElementById('stats-input');
        if(!input || !input.value) return;
        // تحويل المدخلات إلى مصفوفة أرقام، وتنظيف أي قيم غير صالحة
        const data = input.value.split(',').map(s => s.trim()).filter(s => s!=='').map(Number).filter(n => !isNaN(n));
        
        if(data.length === 0) { lastResult = "Error"; updateScreen(); return; }
        
        let sum = data.reduce((a,b)=>a+b, 0);
        let mean = sum / data.length;
        let res;
        
        if (type === 'mean') res = mean;
        else if (type === 'sum') res = sum;
        else {
            // حساب التباين (Variance)
            let variance = data.reduce((a,b)=> a + Math.pow(b - mean, 2), 0) / data.length;
            // الانحراف المعياري (SD) هو جذر التباين
            res = (type === 'var') ? variance : Math.sqrt(variance);
        }
        
        lastResult = res.toFixed(4).replace(/\.?0+$/,""); 
        updateScreen();
    };

    function updateScreen() {
        const f = document.getElementById('f-display');
        const o = document.getElementById('o-display');
        if(f) {
            // تحويل رموز البرمجة إلى رموز رياضية للعرض فقط
            let displayExp = expression
                .replace(/\*\*/g, '^')        // تحويل ** إلى ^ لعرض القوى
                .replace(/window\.factorial\(/g, 'fact(') // تبسيط factorial
                .replace(/Math\./g, '')       // حذف Math.
                .replace(/window\./g, '')     // حذف window.
                .replace(/\*/g, '×')          // تحويل * إلى ×
                .replace(/\//g, '÷');         // تحويل / إلى ÷
            f.innerText = displayExp;
        }
        if(o) o.innerText = lastResult;
    }
})();
