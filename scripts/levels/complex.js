/**
 * المستوى المعقد - مع تلميحات من حقل explanation (بدون فرض إجابة نموذجية)
 */

let complexProblems = [];
let userComplexAnswers = [];
let currentComplexPage = 1;
var COMPLEX_PER_PAGE = 5;

async function loadComplexLevel() {
    window.currentLevel = 'complex';
    
    try {
        const response = await fetch('data/complex.json');
        const data = await response.json();
        // دعم الهيكل الذي يحتوي على "problems" داخل كائن
        complexProblems = data.problems || data;
    } catch (e) {
        console.error('فشل تحميل complex.json:', e);
        if (complexProblems.length === 0) {
            // بيانات افتراضية للطوارئ
            complexProblems = [
                {
                    id: 1,
                    question: "إذا كانت الدالة س² تتكامل بالنسبة لـ ص، فما هو التفسير الهندسي للنتيجة؟",
                    explanation: "تذكّر أن التكامل المزدوج يُعطي الحجم تحت السطح. هنا، س² ثابت بالنسبة لـ ص، لذا النتيجة تمثل حجم أسطوانة."
                }
            ];
        }
    }

    if (userComplexAnswers.length === 0) {
        const saved = localStorage.getItem('mathlinguistic_complex_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.answers && data.answers.length === complexProblems.length) {
                    userComplexAnswers = data.answers;
                } else {
                    throw new Error('Mismatched problem count');
                }
            } catch (e) {
                userComplexAnswers = new Array(complexProblems.length).fill("");
            }
        } else {
            userComplexAnswers = new Array(complexProblems.length).fill("");
        }
    }

    renderComplexUI();}

function renderComplexUI() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalPages = Math.ceil(complexProblems.length / COMPLEX_PER_PAGE);
    const start = (currentComplexPage - 1) * COMPLEX_PER_PAGE;
    const pageProblems = complexProblems.slice(start, start + COMPLEX_PER_PAGE);

    mainContent.innerHTML = `
    <div class="level-wrapper">
        <div class="row-header">
            <h2 class="title-text">المستوى المعقد</h2>
            <button class="btn-home" onclick="navigateToPage('home')">الرئيسية</button>
        </div>

        <div class="problems-list">
            ${pageProblems.map((p, i) => `
                <div class="complex-card">
                    <div class="problem-number-tag">تمرين ${p.id}</div>
                    <p class="q-text">${p.question}</p>
                    <div class="input-container">
                        <textarea class="auto-expand-input" 
                                  placeholder="اكتب خطوات التفكير والحل النهائي..."
                                  oninput="handleComplexInput(this, ${start + i})">${userComplexAnswers[start + i] || ''}</textarea>
                        <div class="growing-underline"></div>
                    </div>
                    <!-- استخدام explanation كتلميح -->
                    ${p.explanation ? `<button class="btn-hint" onclick="showComplexHint(${p.id}, \`${escapeHtml(p.explanation)}\`)">💡 تلميح</button>` : ''}
                    <div id="hint-complex-${p.id}" class="hint-box" style="display:none;"></div>
                </div>
            `).join('')}
        </div>

        <div id="verification-message-complex" class="verification-result" style="display:none;"></div>

        <button class="btn-verify-full" onclick="saveComplexProgressWithMessage()">حفظ التقدم</button>

        <div class="row-navigation-btns">
            <button class="nav-arrow" onclick="changeComplexPage(${currentComplexPage - 1})">السابق</button>
            <button class="nav-arrow" onclick="changeComplexPage(${currentComplexPage + 1})">التالي</button>
        </div>

        <div class="row-pagination-numbers">
            <div class="pagination-flex">
                ${renderComplexPagination(currentComplexPage, totalPages)}
            </div>
        </div>
    </div>    <style>${getComplexStyles()}</style>
    `;
}

// دالة لتجنب مشاكل الاقتباس في JavaScript
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// دالة الترقيم المختصر
function renderComplexPagination(current, total) {
    let html = "";
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            html += `<span class="page-node ${i === current ? 'active' : ''}" onclick="changeComplexPage(${i})">${i}</span>`;
        } else if (i === current - 3 || i === current + 3) {
            html += `<span class="page-sep">...</span>`;
        }
    }
    return html;
}

function handleComplexInput(el, index) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    const line = el.nextElementSibling;
    const progress = Math.min((el.value.length / 80) * 100, 100);
    line.style.width = progress + '%';
    userComplexAnswers[index] = el.value;
}

function showComplexHint(id, hint) {
    const hintEl = document.getElementById(`hint-complex-${id}`);
    if (hintEl) {
        hintEl.innerHTML = `<strong>تلميح:</strong> ${hint}`;
        hintEl.style.display = 'block';
    }
}

function saveComplexProgressWithMessage() {
    const hasNonEmpty = userComplexAnswers.some(ans => ans.trim() !== "");
    
    if (hasNonEmpty) {
        saveComplexProgress();        const msgEl = document.getElementById('verification-message-complex');
        if (msgEl) {
            msgEl.textContent = "تم حفظ تقدمك بنجاح.";
            msgEl.className = "verification-result result-success";
            msgEl.style.display = "block";
            setTimeout(() => { msgEl.style.display = "none"; }, 3000);
        }
    } else {
        const msgEl = document.getElementById('verification-message-complex');
        if (msgEl) {
            msgEl.textContent = "اكتب إجابة واحدة على الأقل ثم احفظ.";
            msgEl.className = "verification-result result-error";
            msgEl.style.display = "block";
            setTimeout(() => { msgEl.style.display = "none"; }, 3000);
        }
    }
}

function saveComplexProgress() {
    try {
        const data = {
            answers: userComplexAnswers,
            timestamp: Date.now()
        };
        localStorage.setItem('mathlinguistic_complex_progress', JSON.stringify(data));
    } catch (e) {
        console.warn('فشل حفظ تقدم المستوى المعقد:', e);
    }
}

function changeComplexPage(p) {
    const totalPages = Math.ceil(complexProblems.length / COMPLEX_PER_PAGE);
    if (p >= 1 && p <= totalPages) {
        currentComplexPage = p;
        renderComplexUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getComplexStyles() {
    return `
        .level-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; max-width: 800px; margin: auto; padding: 20px; }
        .row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #8e44ad; padding-bottom: 10px; }
        .btn-home { background: #34495e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        
        /* عنوان تمرين X */
        .problem-number-tag {
            position: absolute;
            top: -12px;
            right: 15px;            background: white;
            padding: 2px 10px;
            font-size: 0.85rem;
            font-weight: bold;
            color: #2c3e50;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            z-index: 2;
        }
        
        .complex-card { 
            background: #fff; 
            padding: 25px; 
            border: 1px solid #ddd; 
            border-right: 5px solid #8e44ad; 
            border-radius: 10px; 
            margin-bottom: 20px; 
            position: relative;
        }
        .q-text { 
            font-weight: bold; 
            font-size: 1.15rem; 
            color: #2c3e50; 
            margin-bottom: 15px; 
        }
        
        .input-container { 
            width: 100%; 
            position: relative; 
        }
        .auto-expand-input { 
            width: 100%; 
            min-height: 50px; 
            border: none; 
            border-bottom: 1px solid #eee; 
            font-size: 1.1rem; 
            resize: none; 
            overflow: hidden; 
            font-family: 'Cairo'; 
            padding: 10px 0; 
            background: transparent; 
            transition: 0.3s; 
        }
        .auto-expand-input:focus { 
            outline: none; 
        }
        .growing-underline { 
            height: 3px; 
            background: #8e44ad;             width: 0; 
            transition: width 0.4s ease; 
            margin-top: -3px; 
        }

        .btn-verify-full { 
            width: 100%; 
            padding: 18px; 
            background: #8e44ad; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 1.2rem; 
            font-weight: bold; 
            cursor: pointer; 
        }
        
        /* زر التلميح */
        .btn-hint {
            margin-top: 12px;
            background: #f39c12;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: bold;
        }
        .btn-hint:hover {
            background: #e67e22;
        }
        
        /* صندوق التلميح */
        .hint-box {
            margin-top: 12px;
            padding: 12px;
            background: #fff8e1;
            border-left: 3px solid #f39c12;
            border-radius: 0 8px 8px 0;
            font-size: 0.95rem;
            line-height: 1.5;
            color: #8a6d3b;
        }

        .row-navigation-btns { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 25px 0;         }
        .nav-arrow { 
            padding: 10px 45px; 
            background: #fff; 
            border: 2px solid #8e44ad; 
            color: #8e44ad; 
            border-radius: 8px; 
            font-weight: bold; 
            cursor: pointer; 
            transition: 0.2s; 
        }
        .nav-arrow:hover { 
            background: #8e44ad; 
            color: white; 
        }

        .row-pagination-numbers { 
            display: flex; 
            justify-content: center; 
            border-top: 1px solid #eee; 
            padding-top: 20px; 
        }
        .pagination-flex { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }
        .page-node { 
            width: 35px; 
            height: 35px; 
            border-radius: 50%; 
            border: 1px solid #8e44ad; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            font-size: 14px; 
        }
        .page-node.active { 
            background: #8e44ad; 
            color: white; 
        }
        .page-sep { 
            color: #999; 
        }
        
        /* رسائل التحقق */
        .verification-result { 
            padding: 12px; 
            margin: 15px 0;             border-radius: 8px; 
            text-align: center; 
            font-weight: bold; 
        }
        .result-success { 
            background: #d4edda; 
            color: #155724; 
        }
        .result-error { 
            background: #f8d7da; 
            color: #721c24; 
        }
    `;
}