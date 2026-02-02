/**
 * المستوى المتقدم - مع تلميحات من حقل explanation (بدون فرض إجابة نموذجية)
 */

let advancedProblems = [];
let userAdvancedAnswers = [];
let currentAdvancedPage = 1;
var ADV_PER_PAGE = 5;

async function loadAdvancedLevel() {
    window.currentLevel = 'advanced';
    
    try {
        const response = await fetch('data/advanced.json');
        const data = await response.json();
        // دعم الهيكل الجديد الذي يحتوي على "problems" داخل كائن
        advancedProblems = data.problems || data;
    } catch (e) {
        console.error('فشل تحميل advanced.json:', e);
        if (advancedProblems.length === 0) {
            // بيانات افتراضية للطوارئ
            advancedProblems = [
                {
                    id: 1,
                    question: "إذا كان عمر أحمد ضعف عمر محمد، وعمر محمد يزيد عن عمر سارة بـ 5 سنوات، ومجموع أعمارهم 45 سنة، فما عمر كل منهم؟",
                    explanation: "نفرض عمر محمد = م، إذن عمر أحمد = 2م، وعمر سارة = م - 5. المجموع: م + 2م + (م - 5) = 45 → 4م = 50 → م = 12.5"
                }
            ];
        }
    }
    
    if (userAdvancedAnswers.length === 0) {
        const saved = localStorage.getItem('mathlinguistic_advanced_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.answers && data.answers.length === advancedProblems.length) {
                    userAdvancedAnswers = data.answers;
                } else {
                    throw new Error('Mismatched problem count');
                }
            } catch (e) {
                userAdvancedAnswers = new Array(advancedProblems.length).fill("");
            }
        } else {
            userAdvancedAnswers = new Array(advancedProblems.length).fill("");
        }
    }

    renderAdvancedUI();}

function renderAdvancedUI() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalPages = Math.ceil(advancedProblems.length / ADV_PER_PAGE);
    const start = (currentAdvancedPage - 1) * ADV_PER_PAGE;
    const pageProblems = advancedProblems.slice(start, start + ADV_PER_PAGE);

    mainContent.innerHTML = `
    <div class="level-wrapper">
        <div class="level-header-row">
            <h2 class="level-title">المستوى المتقدم</h2>
            <button class="btn-home" onclick="navigateToPage('home')">الرئيسية</button>
        </div>

        <div class="adv-list">
            ${pageProblems.map((p, i) => `
                <div class="adv-box">
                    <div class="problem-number-tag">تمرين ${p.id}</div>
                    <p class="adv-q-text">${p.question}</p>
                    <div class="input-container">
                        <textarea class="exp-input" 
                                  placeholder="اكتب الحل هنا..."
                                  oninput="handleAdvInput(this, ${start + i})">${userAdvancedAnswers[start + i] || ''}</textarea>
                        <div class="growing-line"></div>
                    </div>
                    <!-- استخدام explanation كتلميح -->
                    ${p.explanation ? `<button class="btn-hint" onclick="showHint(${p.id}, \`${escapeHtml(p.explanation)}\`)">💡 تلميح</button>` : ''}
                    <div id="hint-${p.id}" class="hint-box" style="display:none;"></div>
                </div>
            `).join('')}
        </div>

        <div id="verification-message-adv" class="verification-result" style="display:none;"></div>

        <button class="check-btn-full" onclick="saveAdvancedProgressWithMessage()">حفظ التقدم</button>

        <div class="row-nav-btns">
            <button class="nav-arrow" onclick="changeAdvPage(${currentAdvancedPage - 1})">السابق</button>
            <button class="nav-arrow" onclick="changeAdvPage(${currentAdvancedPage + 1})">التالي</button>
        </div>

        <div class="row-pagination">
            <div class="pagination-bar">
                ${renderAutoPagination(currentAdvancedPage, totalPages, 'changeAdvPage')}
            </div>
        </div>
    </div>    <style>${getAdvancedStyles()}</style>
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

// دالة الترقيم التلقائي والمختصر
function renderAutoPagination(current, total, funcName) {
    let pages = "";
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            pages += `<span class="page-node ${i === current ? 'active' : ''}" onclick="${funcName}(${i})">${i}</span>`;
        } 
        else if (i === current - 3 || i === current + 3) {
            pages += `<span class="page-sep">...</span>`;
        }
    }
    return pages;
}

function handleAdvInput(el, index) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    const line = el.nextElementSibling;
    line.style.width = Math.min((el.value.length / 50) * 100, 100) + '%';
    userAdvancedAnswers[index] = el.value;
}

function showHint(id, hint) {
    const hintEl = document.getElementById(`hint-${id}`);
    if (hintEl) {
        hintEl.innerHTML = `<strong>تلميح:</strong> ${hint}`;
        hintEl.style.display = 'block';
    }
}

function saveAdvancedProgressWithMessage() {
    const hasNonEmpty = userAdvancedAnswers.some(ans => ans.trim() !== "");
    
    if (hasNonEmpty) {
        saveAdvancedProgress();        const msgEl = document.getElementById('verification-message-adv');
        if (msgEl) {
            msgEl.textContent = "تم حفظ تقدمك بنجاح.";
            msgEl.className = "verification-result result-success";
            msgEl.style.display = "block";
            setTimeout(() => { msgEl.style.display = "none"; }, 3000);
        }
    } else {
        const msgEl = document.getElementById('verification-message-adv');
        if (msgEl) {
            msgEl.textContent = "اكتب إجابة واحدة على الأقل ثم احفظ.";
            msgEl.className = "verification-result result-error";
            msgEl.style.display = "block";
            setTimeout(() => { msgEl.style.display = "none"; }, 3000);
        }
    }
}

function saveAdvancedProgress() {
    try {
        const data = {
            answers: userAdvancedAnswers,
            timestamp: Date.now()
        };
        localStorage.setItem('mathlinguistic_advanced_progress', JSON.stringify(data));
    } catch (e) {
        console.warn('فشل حفظ تقدم المستوى المتقدم:', e);
    }
}

function changeAdvPage(p) {
    const totalPages = Math.ceil(advancedProblems.length / ADV_PER_PAGE);
    if (p >= 1 && p <= totalPages) {
        currentAdvancedPage = p;
        renderAdvancedUI();
        window.scrollTo(0, 0);
    }
}

function getAdvancedStyles() {
    return `
        .level-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; max-width: 800px; margin: auto; padding: 20px; }
        .level-header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .btn-home { background: #34495e; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }
        
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
        
        .adv-box { 
            background: #fff; 
            padding: 20px; 
            border: 1px solid #eee; 
            margin-bottom: 15px; 
            border-radius: 8px; 
            position: relative;
        }
        .adv-q-text { 
            font-weight: bold; 
            font-size: 1.1rem; 
            color: #2c3e50; 
            margin-bottom: 15px; 
        }
        .input-container { 
            width: 100%; 
            position: relative; 
            margin-top: 10px; 
        }
        .exp-input { 
            width: 100%; 
            min-height: 40px; 
            border: none; 
            border-bottom: 1px solid #ccc; 
            font-size: 1.1rem; 
            resize: none; 
            overflow: hidden; 
            font-family: 'Cairo'; 
            background: transparent; 
        }
        .growing-line { 
            height: 3px; 
            background: #3498db; 
            width: 0; 
            transition: width 0.3s; 
            margin-top: -3px; 
        }
        .check-btn-full { 
            width: 100%;             padding: 15px; 
            background: #2ecc71; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 18px; 
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
        
        /* أزرار التنقل الموحّدة */
        .row-nav-btns { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 25px 0; 
        }
        .nav-arrow { 
            padding: 10px 40px; 
            background: white; 
            border: 2px solid #2ecc71; 
            color: #2ecc71; 
            border-radius: 8px;             font-weight: bold; 
            cursor: pointer; 
        }
        .nav-arrow:hover {
            background: #2ecc71;
            color: white;
        }
        
        .row-pagination { 
            display: flex; 
            justify-content: center; 
            padding-top: 15px; 
            border-top: 1px solid #eee; 
        }
        .pagination-bar { 
            display: flex; 
            align-items: center; 
            gap: 5px; 
        }
        .page-node { 
            width: 30px; 
            height: 30px; 
            border: 1px solid #3498db; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            font-size: 12px; 
        }
        .page-node.active { 
            background: #3498db; 
            color: white; 
        }
        
        /* رسائل التحقق */
        .verification-result { 
            padding: 12px; 
            margin: 15px 0; 
            border-radius: 8px; 
            text-align: center; 
            font-weight: bold; 
        }
        .result-success { 
            background: #d4edda; 
            color: #155724; 
        }
        .result-error { 
            background: #f8d7da; 
            color: #721c24;         }
    `;
}