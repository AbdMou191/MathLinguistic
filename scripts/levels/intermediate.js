/**
 * المستوى المتوسط - مسائل مختلطة مع منطق عرض ذكي
 */
var intermediateProblems = [];
var userIntermediateAnswers = [];
var currentIntermediatePage = 1;
var INTER_PER_PAGE = 5;

// أنواع المسائل
var intermediateOperations = ['multiply', 'divide', 'fraction', 'percentage', 'word'];

function generateIntermediateProblem(id) {
    const op = intermediateOperations[Math.floor(Math.random() * intermediateOperations.length)];
    let question, correct;

    switch(op) {
        case 'multiply':
            const a = Math.floor(Math.random() * 12) + 2; // 2-13
            const b = Math.floor(Math.random() * 10) + 1; // 1-10
            question = `${a} × ${b}`;
            correct = a * b;
            break;
            
        case 'divide':
            const product = Math.floor(Math.random() * 100) + 10; // 10-109
            const divisor = Math.floor(Math.random() * 9) + 2;   // 2-10
            const dividend = product * divisor;
            question = `${dividend} ÷ ${divisor}`;
            correct = dividend / divisor;
            break;
            
        case 'fraction':
            const ops = ['+', '-'];
            const opSign = ops[Math.floor(Math.random() * ops.length)];
            const num1 = Math.floor(Math.random() * 4) + 1; // 1-4
            const den1 = Math.floor(Math.random() * 4) + 2; // 2-5
            const num2 = Math.floor(Math.random() * 4) + 1;
            const den2 = Math.floor(Math.random() * 4) + 2;
            
            if (opSign === '+') {
                question = `${num1}/${den1} + ${num2}/${den2}`;
                const result = (num1 * den2 + num2 * den1) / (den1 * den2);
                correct = parseFloat(result.toFixed(2));
            } else {
                question = `${num1}/${den1} - ${num2}/${den2}`;
                const result = (num1 * den2 - num2 * den1) / (den1 * den2);
                correct = parseFloat(result.toFixed(2));
            }
            break;
                    case 'percentage':
            const base = Math.floor(Math.random() * 20) + 10; // 10-29
            const percent = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
            question = `ما هو ${percent}% من ${base * (100 / percent)}؟`;
            correct = base;
            break;
            
        case 'word':
            const price = Math.floor(Math.random() * 200) + 100; // 100-299
            const discount = [10, 20, 25][Math.floor(Math.random() * 3)];
            const finalPrice = price - (price * discount / 100);
            question = `سعر اللعبة ${price} ريال، وخصم ${discount}%. ما السعر بعد الخصم؟`;
            correct = finalPrice;
            break;
            
        default:
            question = "6 × 7";
            correct = 42;
    }

    return { id, question, correct };
}

function generateIntermediateProblems() {
    const problems = [];
    const seen = new Set();
    
    while (problems.length < 500) {
        const prob = generateIntermediateProblem(problems.length + 1);
        const key = `${prob.question}|${prob.correct}`;
        
        if (!seen.has(key)) {
            seen.add(key);
            problems.push(prob);
        }
    }
    
    return problems;
}

window.loadIntermediateLevel = async function() {
    window.currentLevel = 'intermediate';
    if (intermediateProblems.length === 0) {
        intermediateProblems = generateIntermediateProblems();
        
        const saved = localStorage.getItem('mathlinguistic_intermediate_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.answers && data.answers.length === intermediateProblems.length) {                    userIntermediateAnswers = data.answers;
                } else {
                    throw new Error('Mismatched problem count');
                }
            } catch (e) {
                userIntermediateAnswers = new Array(500).fill(null).map(() => ({ value: "", status: "pending" }));
            }
        } else {
            userIntermediateAnswers = new Array(500).fill(null).map(() => ({ value: "", status: "pending" }));
        }
    }
    renderIntermediateUI();
};

function renderIntermediateUI() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const totalPages = Math.ceil(intermediateProblems.length / INTER_PER_PAGE);
    const start = (currentIntermediatePage - 1) * INTER_PER_PAGE;
    const pageProblems = intermediateProblems.slice(start, start + INTER_PER_PAGE);

    const totalSolved = userIntermediateAnswers.filter(a => a.status === 'correct').length;
    const overallProgress = Math.round((totalSolved / intermediateProblems.length) * 100);

    mainContent.innerHTML = `
    <style>
        .level-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; max-width: 800px; margin: auto; padding: 20px; }
        .row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 3px solid #f39c12; padding-bottom: 10px; }
        .progress-bar-container { margin-top: 10px; width: 200px; }
        .progress-label { font-size: 0.9rem; color: #d35400; text-align: center; margin-top: 5px; }
        .progress-bar-bg { height: 8px; background: #ecf0f1; border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #f39c12; border-radius: 4px; width: ${overallProgress}%; transition: width 0.4s ease; }
        
        /* تصميم المسألة - الوضع الافتراضي (قصيرة) */
        .row-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 10px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .problem-number-tag {
            position: absolute;
            top: -12px;            right: 15px;
            background: white;
            padding: 2px 10px;
            font-size: 0.85rem;
            font-weight: bold;
            color: #2c3e50;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            z-index: 2;
        }
        
        .problem-statement {
            font-size: 1.1rem;
            color: #2c3e50;
            margin-right: 10px;
        }
        
        .input-ans {
            width: 120px;
            height: 45px;
            text-align: center;
            font-size: 20px;
            border: 2px solid #ddd;
            border-radius: 5px;
        }
        .input-ans.correct { border-color: #27ae60; background: #e8f5e9; }
        .input-ans.incorrect { border-color: #e74c3c; background: #fdf2f2; }
        
        /* تصميم المسألة الطويلة */
        .row-item-long {
            display: block;
            background: #fff;
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 10px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .problem-statement-long {
            font-size: 1.1rem;
            color: #2c3e50;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        
        .input-ans-full {
            width: 100%;
            height: 45px;            text-align: center;
            font-size: 20px;
            border: 2px solid #ddd;
            border-radius: 5px;
        }
        .input-ans-full.correct { border-color: #27ae60; background: #e8f5e9; }
        .input-ans-full.incorrect { border-color: #e74c3c; background: #fdf2f2; }
        
        .btn-verify-full { 
            width: 100%; 
            padding: 15px; 
            background: #f39c12; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 1.1rem; 
            font-weight: bold; 
            cursor: pointer; 
            margin-top: 10px; 
        }
        .verification-result { 
            padding: 12px; 
            margin: 15px 0; 
            border-radius: 8px; 
            text-align: center; 
            font-weight: bold; 
            display: none;
        }
        .result-success { background: #d4edda; color: #155724; }
        .result-error { background: #f8d7da; color: #721c24; }
        
        .row-nav-btns { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 25px 0; 
        }
        .nav-arrow { 
            padding: 10px 40px; 
            background: white; 
            border: 2px solid #f39c12; 
            color: #f39c12; 
            border-radius: 8px; 
            font-weight: bold; 
            cursor: pointer; 
        }
        .row-pagination { 
            display: flex; 
            justify-content: center; 
            border-top: 1px solid #eee;             padding-top: 20px; 
            flex-wrap: wrap; 
            gap: 5px; 
        }
        .page-node { 
            width: 35px; 
            height: 35px; 
            border: 1px solid #f39c12; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            font-size: 13px; 
        }
        .page-node.active { 
            background: #f39c12; 
            color: white; 
        }
        .btn-home { 
            padding: 10px 20px; 
            background: white; 
            border: 2px solid #f39c12; 
            color: #f39c12; 
            border-radius: 8px; 
            font-weight: bold; 
            cursor: pointer; 
        }
        
    </style>

    <div class="level-wrapper">
        <div class="row-header">
            <div>
                <h2>المستوى المتوسط</h2>
                <div class="progress-bar-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill"></div>                    </div>
                    <div class="progress-label">التقدم: ${overallProgress}%</div>
                </div>
            </div>
            <button class="btn-home" onclick="navigateToPage('home')">الرئيسية</button>
        </div>

        <div class="problems-list">
            ${pageProblems.map((p, i) => {
                const idx = start + i;
                const ans = userIntermediateAnswers[idx] || { value: "", status: "pending" };
                const cls = ans.status === 'correct' ? 'correct' : 
                           ans.status === 'incorrect' ? 'incorrect' : '';
                
                // الشرط الذكي: إذا كانت المسألة طويلة (> 30 حرفًا)
                const isLongQuestion = p.question.length > 30;
                
                if (isLongQuestion) {
                    return `
                        <div class="row-item-long">
                            <div class="problem-number-tag">تمرين ${p.id}</div>
                            <div class="problem-statement-long">${p.question} =</div>
                            <input type="text" class="input-ans-full ${cls}" 
                                   value="${ans.value}" 
                                   oninput="intermediateAnswersStore(${idx}, this.value)">
                        </div>
                    `;
                } else {
                    return `
                        <div class="row-item">
                            <div class="problem-number-tag">تمرين ${p.id}</div>
                            <span class="problem-statement">${p.question} =</span>
                            <input type="text" class="input-ans ${cls}" 
                                   value="${ans.value}" 
                                   oninput="intermediateAnswersStore(${idx}, this.value)">
                        </div>
                    `;
                }
            }).join('')}
        </div>

        <div id="verification-message" class="verification-result"></div>

        <button class="btn-verify-full print-hide" onclick="verifyIntermediateAnswers()">التحقق من الإجابة</button>

        <div class="row-nav-btns print-hide">
            <button class="nav-arrow" onclick="changeInterPage(${currentIntermediatePage - 1})">السابق</button>
            <button class="nav-arrow" onclick="changeInterPage(${currentIntermediatePage + 1})">التالي</button>
        </div>
        <div class="row-pagination print-hide">
            ${renderInterPagination(currentIntermediatePage, totalPages)}
        </div>
    </div>`;
    
}

function intermediateAnswersStore(idx, val) {
    if (idx >= 0 && idx < userIntermediateAnswers.length) {
        userIntermediateAnswers[idx].value = val.trim();
        if (userIntermediateAnswers[idx].status !== 'pending') {
            userIntermediateAnswers[idx].status = 'pending';
        }
    }
}

function verifyIntermediateAnswers() {
    const start = (currentIntermediatePage - 1) * INTER_PER_PAGE;
    const pageProblems = intermediateProblems.slice(start, start + INTER_PER_PAGE);
    let correctCount = 0;

    pageProblems.forEach((p, i) => {
        const idx = start + i;
        const ansObj = userIntermediateAnswers[idx];
        const userAns = ansObj.value.trim();
        const userNum = parseFloat(userAns);
        const correctNum = typeof p.correct === 'number' ? p.correct : parseFloat(p.correct);

        if (!isNaN(userNum) && Math.abs(userNum - correctNum) < 0.01) {
            ansObj.status = 'correct';
            correctCount++;
        } else {
            ansObj.status = 'incorrect';
        }
    });

    saveIntermediateProgress();
    renderIntermediateUI();

    const msgEl = document.getElementById('verification-message');
    const total = pageProblems.length;
    const msg = `أجبت عن ${correctCount} من أصل ${total} بشكل صحيح.`;
    if (msgEl) {
        msgEl.textContent = msg;
        msgEl.className = 'verification-result ' + (correctCount === total ? 'result-success' : 'result-error');
        msgEl.style.display = 'block';
        setTimeout(() => { if (msgEl) msgEl.style.display = 'none'; }, 4000);
    }
}

function saveIntermediateProgress() {    try {
        const data = {
            answers: userIntermediateAnswers,
            timestamp: Date.now()
        };
        localStorage.setItem('mathlinguistic_intermediate_progress', JSON.stringify(data));
    } catch (e) {
        console.warn('فشل حفظ تقدم المستوى المتوسط:', e);
    }
}

function renderInterPagination(current, total) {
    let html = "";
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            html += `<span class="page-node ${i === current ? 'active' : ''}" onclick="changeInterPage(${i})">${i}</span>`;
        } else if (i === current - 3 || i === current + 3) {
            html += `<span style="color:#999">...</span>`;
        }
    }
    return html;
}

function changeInterPage(p) {
    const total = Math.ceil(intermediateProblems.length / INTER_PER_PAGE);
    if (p >= 1 && p <= total) {
        currentIntermediatePage = p;
        renderIntermediateUI();
        window.scrollTo(0, 0);
    }
}