/**
 * المستوى المعقد (Complex) - MathLinguistic
 * التحديث: ربط كامل بنظام الإنجازات، دعم الثيمات، ونظام النقاط الموحد (15 نقطة للمسألة).
 */

let complexProblems = [];
let userComplexAnswers = []; 
let currentComplexPage = 1;
const CMP_PER_PAGE = 5;

/**
 * الدالة الرئيسية لتحميل الصفحة
 */
window.loadComplexPage = async function() {
    // استدعاء دالة التنظيف من main.js لمنع تداخل الأحداث والمؤقتات
    if (typeof cleanupCurrentPage === 'function') cleanupCurrentPage();
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<div class="cmp-loader-msg" style="text-align:center; padding:50px;">جارٍ استدعاء الخوارزميات المعقدة... 🧪</div>`;

    try {
        const response = await fetch('data/levels/complex.json');
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        complexProblems = data.problems || data;

        // استعادة التقدم من التخزين المحلي بمفتاح المعقد
        const saved = localStorage.getItem('math_complex_achievements');
        userComplexAnswers = saved ? JSON.parse(saved) : new Array(complexProblems.length).fill("");

        renderComplexLayout();
    } catch (error) {
        console.error("Complex Level Error:", error);
        mainContent.innerHTML = `<p style="text-align:center; color:#e74c3c; padding:40px;">❌ عذراً، تعذر تحميل المسائل المعقدة حالياً.</p>`;
    }
};

/**
 * بناء الهيكل العام للمستوى وحقن التنسيقات
 */
function renderComplexLayout() {
    const mainContent = document.getElementById('main-content');
    
    // حقن الأنماط لدعم الوضع الليلي والنهاري (بألوان كربونية وذهبية للمستوى المعقد)
    const styleId = 'cmp-scoped-styles';
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.innerText = `
            [data-theme="light"] { --cmp-card: #ffffff; --cmp-txt: #2c3e50; --cmp-brd: #dcdde1; --cmp-h-bg: #f5f6fa; }
            [data-theme="dark"] { --cmp-card: #1e272e; --cmp-txt: #f5f6fa; --cmp-brd: #485460; --cmp-h-bg: #2f3640; }

            .cmp-wrapper { direction: rtl; max-width: 750px; margin: auto; padding: 10px; color: var(--cmp-txt); }
            .cmp-header { background: linear-gradient(135deg, #2c3e50, #000000); color: white; padding: 5px; border-radius: 20px; text-align: center; margin-bottom: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); border-bottom: 4px solid #e1b12c; }
            .cmp-stats-row { display: flex; justify-content: space-around; font-size: 0.95rem; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 12px; }
            
            .cmp-problem-card { background: var(--cmp-card); padding: 25px; margin-bottom: 25px; border-radius: 15px; border: 1px solid var(--cmp-brd); box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: 0.3s; }
            .cmp-question-text { font-size: 1.15rem; line-height: 1.7; margin-bottom: 15px; display: block; font-weight: bold; }
            
            .cmp-answer-area {
                width: 100%; border: none; border-bottom: 2px solid #e1b12c; background: transparent;
                font-size: 1.1rem; padding: 10px 5px; outline: none; color: var(--cmp-txt);
                transition: border-color 0.3s; font-family: 'Cairo', sans-serif;
            }
            .cmp-answer-area:focus { border-bottom-color: #f1c40f; }
            
            .cmp-hint-link { color: #e1b12c; cursor: pointer; font-size: 0.85rem; display: inline-block; margin-top: 12px; font-weight: bold; text-decoration: underline; }
            .cmp-hint-box { 
                max-height: 0; overflow: hidden; opacity: 0; background: var(--cmp-h-bg); 
                border-radius: 8px; border-right: 4px solid #e1b12c; transition: all 0.4s ease;
            }
            .cmp-hint-box.show { max-height: 250px; opacity: 1; margin-top: 10px; padding: 15px; }
            
            .cmp-footer { padding: 30px 0; text-align: center; }
            .cmp-verify-btn { background: linear-gradient(to left, #e1b12c, #f39c12); color: #2c3e50; border: none; padding: 14px 60px; border-radius: 35px; font-size: 1.1rem; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(225, 177, 44, 0.3); }
            .cmp-verify-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(225, 177, 44, 0.4); }
            
            .cmp-pagination { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
            .cmp-page-node { width: 35px; height: 35px; border: 1px solid #e1b12c; border-radius: 5px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #e1b12c; font-weight: bold; }
            .cmp-page-node.active { background: #e1b12c; color: #2c3e50; }
            
            .cmp-feedback { margin-top: 10px; font-weight: bold; }
            .cmp-correct { color: #27ae60; animation: pulse 0.5s; }
            .cmp-wrong { color: #e74c3c; }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        `;
        document.head.appendChild(styleSheet);
    }

    mainContent.innerHTML = `
        <div class="cmp-wrapper">
            <header class="cmp-header">
                <h3 style="margin:0;">🧪 المختبر الرياضي (المعقد)</h3>
                <div class="cmp-stats-row">
                    <span>المنجز: <span id="cmp-count">0</span> / ${complexProblems.length}</span>
                    <span>النقاط: 🏆 <span id="cmp-points">0</span></span>
                    <span>الأوسمة: ⭐ <span id="cmp-stars">0</span></span>
                </div>
            </header>

            <div id="cmp-questions-list"></div>

            <footer class="cmp-footer">
                <div id="cmp-pages" class="cmp-pagination"></div>
                <button onclick="checkAllComplexAnswers()" class="cmp-verify-btn">تحليل الإجابات</button>
                <div style="margin-top:20px;">
                   <a href="#" onclick="loadHomePage(); return false;" style="color:#888; font-size:0.9rem; text-decoration: none;">🏠 العودة للرئيسية</a>
                </div>
            </footer>
        </div>
    `;

    updateComplexStats();
    displayComplexProblems(currentComplexPage);
}

/**
 * عرض المسائل حسب الصفحة
 */
window.displayComplexProblems = function(page) {
    currentComplexPage = page;
    const listDiv = document.getElementById('cmp-questions-list');
    const start = (page - 1) * CMP_PER_PAGE;
    const items = complexProblems.slice(start, start + CMP_PER_PAGE);

    listDiv.innerHTML = items.map((prob, index) => {
        const globalIdx = start + index;
        const isSolved = userComplexAnswers[globalIdx] !== "" && userComplexAnswers[globalIdx] !== null;
        
        return `
            <div class="cmp-problem-card">
                <span class="cmp-question-text"><strong>اللغز ${globalIdx + 1}:</strong> ${prob.question}</span>
                <input type="text" 
                    id="cmp-text-${globalIdx}" 
                    class="cmp-answer-area" 
                    placeholder="فك شفرة الحل هنا..." 
                    value="${userComplexAnswers[globalIdx] || ""}"
                    ${isSolved ? 'disabled' : ''}>
                <div id="cmp-feed-${globalIdx}" class="cmp-feedback">
                    ${isSolved ? '<span class="cmp-correct">✅ تم فك التشفير بنجاح</span>' : ''}
                </div>
                
                <span class="cmp-hint-link" onclick="toggleCmpHint(${globalIdx})">🔍 كشف البيانات المساعدة</span>
                <div id="cmp-h-${globalIdx}" class="cmp-hint-box">
                    ${prob.explanation || prob.hint || "يتطلب هذا اللغز تفكيراً تحليلياً عميقاً، لا تلميحات مباشرة."}
                </div>
            </div>
        `;
    }).join('');

    renderComplexPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * تبديل ظهور التلميح
 */
window.toggleCmpHint = function(idx) {
    const hintBox = document.getElementById(`cmp-h-${idx}`);
    hintBox.classList.toggle('show');
};

/**
 * التحقق من إجابات الصفحة الحالية وربطها بالنقاط والإنجازات
 */
window.checkAllComplexAnswers = function() {
    const start = (currentComplexPage - 1) * CMP_PER_PAGE;
    let newlyCorrectCount = 0;

    for (let i = start; i < start + CMP_PER_PAGE; i++) {
        const txtInput = document.getElementById(`cmp-text-${i}`);
        const feed = document.getElementById(`cmp-feed-${i}`);
        if (!txtInput || txtInput.disabled) continue;

        const userVal = txtInput.value.trim();
        if (userVal === "") { feed.innerHTML = ""; continue; }

        // التحقق من الإجابة (بناءً على ملف JSON الخاص بك)
        const isCorrect = userVal == (complexProblems[i].correct_answer || complexProblems[i].answer);

        if (isCorrect) {
            feed.innerHTML = `<span class="cmp-correct">✅ تحليل عبقري! إجابة صحيحة</span>`;
            userComplexAnswers[i] = userVal;
            txtInput.disabled = true;
            newlyCorrectCount++;
            
            // إضافة نقاط (المستوى المعقد يعطي 15 نقطة لكل مسألة)
            let currentPoints = parseInt(localStorage.getItem('math_user_points') || "0");
            localStorage.setItem('math_user_points', (currentPoints + 15).toString());
        } else {
            feed.innerHTML = `<span class="cmp-wrong">❌ خطأ في التحليل، أعد فحص البيانات</span>`;
        }
    }

    if (newlyCorrectCount > 0) {
        localStorage.setItem('math_complex_achievements', JSON.stringify(userComplexAnswers));
        
        if (typeof window.showToast === 'function') {
            window.showToast(`تحليل موفق! ربحت ${newlyCorrectCount * 15} نقطة 🔬`, 'success');
        }

        // --- زناد نظام الإنجازات الذكي ---
        if (typeof window.checkAndUnlockAchievements === 'function') {
            window.checkAndUnlockAchievements();
        }
        
        updateComplexStats();
    }
};

/**
 * تحديث الإحصائيات في الهيدر
 */
function updateComplexStats() {
    const solved = userComplexAnswers.filter(a => a !== "" && a !== null).length;
    const points = localStorage.getItem('math_user_points') || "0";
    
    if (document.getElementById('cmp-count')) document.getElementById('cmp-count').innerText = solved;
    if (document.getElementById('cmp-points')) document.getElementById('cmp-points').innerText = points;
    if (document.getElementById('cmp-stars')) document.getElementById('cmp-stars').innerText = Math.floor(solved / 5);
}

/**
 * بناء أزرار التنقل
 */
function renderComplexPagination() {
    const total = Math.ceil(complexProblems.length / CMP_PER_PAGE);
    const container = document.getElementById('cmp-pages');
    if (!container) return;
    
    let html = '';
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= currentComplexPage - 2 && i <= currentComplexPage + 2)) {
            html += `<div class="cmp-page-node ${i === currentComplexPage ? 'active' : ''}" onclick="displayComplexProblems(${i})">${i}</div>`;
        } else if (i === currentComplexPage - 3 || i === currentComplexPage + 3) {
            html += `<span style="color:var(--cmp-txt)">...</span>`;
        }
    }
    container.innerHTML = html;
}
