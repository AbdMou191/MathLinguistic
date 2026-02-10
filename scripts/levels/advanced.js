/**
 * المستوى المتقدم - MathLinguistic
 * التحديث: ربط كامل بنظام الإنجازات، دعم الثيمات، ونظام النقاط الموحد.
 */

let advancedProblems = [];
let userAdvancedAnswers = []; 
let currentAdvancedPage = 1;
const ADV_PER_PAGE = 5;

/**
 * الدالة الرئيسية لتحميل الصفحة
 */
window.loadAdvancedPage = async function() {
    // استدعاء دالة التنظيف من main.js لمنع تداخل الأحداث والمؤقتات
    if (typeof cleanupCurrentPage === 'function') cleanupCurrentPage();
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<div class="adv-loader-msg" style="text-align:center; padding:50px;">جارٍ تحميل التحديات المتقدمة... 🔥</div>`;

    try {
        const response = await fetch('data/levels/advanced.json');
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        advancedProblems = data.problems || data;

        // استعادة التقدم من التخزين المحلي
        const saved = localStorage.getItem('math_adv_achievements');
        userAdvancedAnswers = saved ? JSON.parse(saved) : new Array(advancedProblems.length).fill("");

        renderAdvancedLayout();
    } catch (error) {
        console.error("Advanced Level Error:", error);
        mainContent.innerHTML = `<p style="text-align:center; color:#e74c3c; padding:40px;">❌ عذراً، تعذر تحميل المسائل المتقدمة حالياً.</p>`;
    }
};

/**
 * بناء الهيكل العام للمستوى وحقن التنسيقات
 */
function renderAdvancedLayout() {
    const mainContent = document.getElementById('main-content');
    
    // حقن الأنماط لدعم الوضع الليلي والنهاري
    const styleId = 'adv-scoped-styles';
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.innerText = `
            [data-theme="light"] { --adv-card: #ffffff; --adv-txt: #2c3e50; --adv-brd: #eeeeee; --adv-h-bg: #f8f9fa; }
            [data-theme="dark"] { --adv-card: #2d2d2d; --adv-txt: #e0e0e0; --adv-brd: #404040; --adv-h-bg: #383838; }

            .adv-wrapper { direction: rtl; max-width: 750px; margin: auto; padding: 10px; color: var(--adv-txt); }
            .adv-header { background: linear-gradient(135deg, #8a2387, #e94057); color: white; padding: 5px; border-radius: 20px; text-align: center; margin-bottom: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
            .adv-stats-row { display: flex; justify-content: space-around; font-size: 0.95rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 12px; }
            
            .adv-problem-card { background: var(--adv-card); padding: 25px; margin-bottom: 25px; border-radius: 15px; border: 1px solid var(--adv-brd); box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s; }
            .adv-question-text { font-size: 1.15rem; line-height: 1.7; margin-bottom: 15px; display: block; font-weight: 500; }
            
            .adv-answer-area {
                width: 100%; border: none; border-bottom: 2px solid #8a2387; background: transparent;
                font-size: 1.1rem; padding: 10px 5px; outline: none; color: var(--adv-txt);
                transition: border-color 0.3s; font-family: 'Cairo', sans-serif;
            }
            .adv-answer-area:focus { border-bottom-color: #e94057; }
            
            .adv-hint-link { color: #3498db; cursor: pointer; font-size: 0.85rem; display: inline-block; margin-top: 12px; font-weight: bold; }
            .adv-hint-box { 
                max-height: 0; overflow: hidden; opacity: 0; background: var(--adv-h-bg); 
                border-radius: 8px; border-right: 4px solid #3498db; transition: all 0.4s ease;
            }
            .adv-hint-box.show { max-height: 200px; opacity: 1; margin-top: 10px; padding: 15px; }
            
            .adv-footer { padding: 30px 0; text-align: center; }
            .adv-verify-btn { background: linear-gradient(to left, #8a2387, #e94057); color: white; border: none; padding: 14px 60px; border-radius: 35px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(233, 64, 87, 0.3); }
            .adv-verify-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(233, 64, 87, 0.4); }
            
            .adv-pagination { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
            .adv-page-node { width: 35px; height: 35px; border: 1px solid #8a2387; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8a2387; font-weight: bold; }
            .adv-page-node.active { background: #8a2387; color: white; }
            
            .adv-feedback { margin-top: 10px; font-weight: bold; }
            .adv-correct { color: #27ae60; animation: pulse 0.5s; }
            .adv-wrong { color: #e74c3c; }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        `;
        document.head.appendChild(styleSheet);
    }

    mainContent.innerHTML = `
        <div class="adv-wrapper">
            <header class="adv-header">
                <h3 style="margin:0;">🧩 التحدي المتقدم</h3>
                <div class="adv-stats-row">
                    <span>المنجز: <span id="adv-count">0</span> / ${advancedProblems.length}</span>
                    <span>النقاط: 🏆 <span id="adv-points">0</span></span>
                    <span>الأوسمة: ⭐ <span id="adv-stars">0</span></span>
                </div>
            </header>

            <div id="adv-questions-list"></div>

            <footer class="adv-footer">
                <div id="adv-pages" class="adv-pagination"></div>
                <button onclick="checkAllCurrentPageAnswers()" class="adv-verify-btn">تحقق من الحلول</button>
                <div style="margin-top:20px;">
                   <a href="#" onclick="loadHomePage(); return false;" style="color:#888; font-size:0.9rem; text-decoration: none;">🏠 العودة للرئيسية</a>
                </div>
            </footer>
        </div>
    `;

    updateAdvancedStats();
    displayAdvancedProblems(currentAdvancedPage);
}

/**
 * عرض المسائل حسب الصفحة
 */
window.displayAdvancedProblems = function(page) {
    currentAdvancedPage = page;
    const listDiv = document.getElementById('adv-questions-list');
    const start = (page - 1) * ADV_PER_PAGE;
    const items = advancedProblems.slice(start, start + ADV_PER_PAGE);

    listDiv.innerHTML = items.map((prob, index) => {
        const globalIdx = start + index;
        const isSolved = userAdvancedAnswers[globalIdx] !== "" && userAdvancedAnswers[globalIdx] !== null;
        
        return `
            <div class="adv-problem-card">
                <span class="adv-question-text"><strong>${globalIdx + 1}.</strong> ${prob.question}</span>
                <input type="text" 
                    id="adv-text-${globalIdx}" 
                    class="adv-answer-area" 
                    placeholder="اكتب الحل المكون من كلمات أو أرقام..." 
                    value="${userAdvancedAnswers[globalIdx] || ""}"
                    ${isSolved ? 'disabled' : ''}>
                <div id="adv-feed-${globalIdx}" class="adv-feedback">
                    ${isSolved ? '<span class="adv-correct">✅ تم الحل بنجاح</span>' : ''}
                </div>
                
                <span class="adv-hint-link" onclick="toggleAdvHint(${globalIdx})">💡 أحتاج تلميحاً</span>
                <div id="adv-h-${globalIdx}" class="adv-hint-box">
                    ${prob.explanation || prob.hint || "لا يوجد تلميح متاح لهذه المسألة."}
                </div>
            </div>
        `;
    }).join('');

    renderAdvancedPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * تبديل ظهور التلميح
 */
window.toggleAdvHint = function(idx) {
    const hintBox = document.getElementById(`adv-h-${idx}`);
    hintBox.classList.toggle('show');
};

/**
 * التحقق من إجابات الصفحة الحالية وربطها بالنقاط والإنجازات
 */
window.checkAllCurrentPageAnswers = function() {
    const start = (currentAdvancedPage - 1) * ADV_PER_PAGE;
    let newlyCorrectCount = 0;

    for (let i = start; i < start + ADV_PER_PAGE; i++) {
        const txtInput = document.getElementById(`adv-text-${i}`);
        const feed = document.getElementById(`adv-feed-${i}`);
        if (!txtInput || txtInput.disabled) continue;

        const userVal = txtInput.value.trim();
        if (userVal === "") { feed.innerHTML = ""; continue; }

        // التحقق من الإجابة (مقارنة مرنة)
        const isCorrect = userVal == (advancedProblems[i].correct_answer || advancedProblems[i].answer);

        if (isCorrect) {
            feed.innerHTML = `<span class="adv-correct">✅ مذهل! إجابة صحيحة</span>`;
            userAdvancedAnswers[i] = userVal;
            txtInput.disabled = true;
            newlyCorrectCount++;
            
            // إضافة نقاط (المستوى المتقدم يعطي 10 نقاط لكل مسألة)
            let currentPoints = parseInt(localStorage.getItem('math_user_points') || "0");
            localStorage.setItem('math_user_points', (currentPoints + 10).toString());
        } else {
            feed.innerHTML = `<span class="adv-wrong">❌ الإجابة غير دقيقة، حاول ثانية</span>`;
        }
    }

    if (newlyCorrectCount > 0) {
        localStorage.setItem('math_adv_achievements', JSON.stringify(userAdvancedAnswers));
        
        // إظهار توست نجاح إذا كان متاحاً في main.js
        if (typeof window.showToast === 'function') {
            window.showToast(`أحسنت! ربحت ${newlyCorrectCount * 10} نقطة 🌟`, 'success');
        }

        // --- زناد نظام الإنجازات الذكي ---
        if (typeof window.checkAndUnlockAchievements === 'function') {
            window.checkAndUnlockAchievements();
        }
        
        updateAdvancedStats();
    }
};

/**
 * تحديث الإحصائيات في الهيدر
 */
function updateAdvancedStats() {
    const solved = userAdvancedAnswers.filter(a => a !== "" && a !== null).length;
    const points = localStorage.getItem('math_user_points') || "0";
    
    if (document.getElementById('adv-count')) document.getElementById('adv-count').innerText = solved;
    if (document.getElementById('adv-points')) document.getElementById('adv-points').innerText = points;
    if (document.getElementById('adv-stars')) document.getElementById('adv-stars').innerText = Math.floor(solved / 10);
}

/**
 * بناء أزرار التنقل
 */
function renderAdvancedPagination() {
    const total = Math.ceil(advancedProblems.length / ADV_PER_PAGE);
    const container = document.getElementById('adv-pages');
    if (!container) return;
    
    let html = '';
    for (let i = 1; i <= total; i++) {
        // عرض أول صفحة، آخر صفحة، والصفحات القريبة من الحالية
        if (i === 1 || i === total || (i >= currentAdvancedPage - 2 && i <= currentAdvancedPage + 2)) {
            html += `<div class="adv-page-node ${i === currentAdvancedPage ? 'active' : ''}" onclick="displayAdvancedProblems(${i})">${i}</div>`;
        } else if (i === currentAdvancedPage - 3 || i === currentAdvancedPage + 3) {
            html += `<span style="color:var(--adv-txt)">...</span>`;
        }
    }
    container.innerHTML = html;
}
