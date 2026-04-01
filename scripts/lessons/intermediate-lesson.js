/**
 * 📚 منطق درس المستوى المتوسط - النسخة الموحدة مع Deep Linking (v4.8)
 * ✅ دعم الانتقال المباشر لدرس معين من البحث
 * ✅ حساب الصفحة تلقائياً والتمرير للدرس المستهدف
 * ✅ دعم URL Parameters (?lesson=5)
 * ✅ تمييز بصري للدرس المستهدف
 * ✅ الحفاظ على جميع المتغيرات الأصلية للتوافق
 */

// === المتغيرات الأصلية (لا تغيير) ===
// ✅ استخدام var بدلاً من let لتجنب خطأ إعادة التعريف
var currentIntLessonPage = window.currentIntLessonPage || 1;
var INT_LESSONS_PER_PAGE = window.INT_LESSONS_PER_PAGE || 3;
var intLessonDataCache = window.intLessonDataCache || null;
var targetIntLessonIndex = window.targetIntLessonIndex || null;

// حفظ في window للاستخدام لاحق
window.currentIntLessonPage = currentIntLessonPage;
window.INT_LESSONS_PER_PAGE = INT_LESSONS_PER_PAGE;

// ✅ دالة الانتقال المباشر لدرس معين (Deep Linking)
window.intermediateLessonGoToLesson = function(lessonIndex) {
    if (!intLessonDataCache) {
        console.warn('⚠️ البيانات غير محملة بعد');
        targetIntLessonIndex = lessonIndex;
        return;
    }
    
    const allItems = intLessonDataCache.lessons || intLessonDataCache.problems || [];
    
    if (lessonIndex < 0 || lessonIndex >= allItems.length) {
        console.error('❌ رقم الدرس غير صالح:', lessonIndex);
        return;
    }
    
    const targetPage = Math.floor(lessonIndex / INT_LESSONS_PER_PAGE) + 1;
    
    // ✅ تأكد أننا لسنا بالفعل في الصفحة الصحيحة لتجنب إعادة التحميل
    if (targetPage !== currentIntLessonPage) {
        window.changeIntLessonPage(targetPage);
    }
    
    // ✅ الانتظار حتى يتم render الصفحة ثم التمرير للدرس
    setTimeout(() => {
        const lessonEl = document.getElementById(`int-lesson-card-${lessonIndex}`);
        if (lessonEl) {
            lessonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            lessonEl.style.transition = 'all 0.4s ease';
            lessonEl.style.background = 'rgba(243, 156, 18, 0.15)';
            lessonEl.style.border = '3px solid var(--accent-color)';
            lessonEl.style.transform = 'scale(1.01)';
            lessonEl.classList.add('highlighted');
            
            setTimeout(() => {
                lessonEl.style.background = '';
                lessonEl.style.border = '';
                lessonEl.style.transform = '';
                lessonEl.classList.remove('highlighted');
            }, 3000);
            
            console.log('✅ تم الانتقال للدرس #' + lessonIndex);
        } else {
            console.warn('⚠️ لم يتم العثور على العنصر: int-lesson-card-' + lessonIndex);
            // ✅ محاولة بديلة: البحث بـ data-idx
            const altEl = document.querySelector(`[data-idx="${lessonIndex}"]`);
            if (altEl) {
                altEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                altEl.classList.add('highlighted');
                setTimeout(() => altEl.classList.remove('highlighted'), 3000);
            }
        }
    }, 150); // وقت كافٍ لـ DOM update
};

// ✅ الدالة الرئيسية: تحميل الدرس (معدلة لدعم targetIndex)
window.loadIntermediateLesson = async function(lessonData, targetIndex = null) {
    window.currentLevel = 'learn-intermediate'; 
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = "<p style='text-align:center; padding:30px; color: var(--text-primary);'>جاري التحميل...</p>";

    try {
        if (lessonData) {
            intLessonDataCache = lessonData;
        } else if (!intLessonDataCache) {
            const res = await fetch('data/lessons/intermediate.json');
            if (!res.ok) throw new Error("File not found");
            intLessonDataCache = await res.json();
        }
        
        // ✅ التحقق من targetIndex أو URL Parameter
        if (targetIndex !== null && targetIndex !== undefined) {
            targetIntLessonIndex = targetIndex;
        } else {
            // ✅ دعم الروابط المباشرة: ?lesson=5
            const urlParams = new URLSearchParams(window.location.search);
            const lessonParam = urlParams.get('lesson');
            if (lessonParam) {
                const lessonId = parseInt(lessonParam);
                const allItems = intLessonDataCache.lessons || intLessonDataCache.problems || [];
                if (!isNaN(lessonId)) {
                    // البحث عن Index الدرس بناءً على ID
                    targetIntLessonIndex = allItems.findIndex(l => l.id === lessonId || l.problem_id === lessonId);
                }
            }
        }
        
        renderIntermediateLessonPage();
        
        // ✅ إذا كان هناك درس مستهدف، انتقل إليه بعد العرض
// ✅ الانتقال للدرس المستهدف بعد التأكد من اكتمال العرض
if (targetIntLessonIndex !== null && targetIntLessonIndex !== undefined) {
    // استخدام requestAnimationFrame لضمان اكتمال الـ DOM
    requestAnimationFrame(() => {
        setTimeout(() => {
            window.intermediateLessonGoToLesson(targetIntLessonIndex);
            targetIntLessonIndex = null; // تنظيف بعد الاستخدام
        }, 100); // وقت قصير كافٍ لـ render
    });
}
        // تهيئة MathJax بعد العرض
        renderMath();
        
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('intermediate-lesson');
        }
    } catch (err) {
        console.error('❌ Intermediate Lesson Error:', err);
        mainContent.innerHTML = "<p style='text-align:center; padding:30px; color:red;'>عذراً، تعذر تحميل المحتوى.</p>";
    }
};

// ✅ دالة دعم MathJax (كما هي)
function renderMath() {
    if (window.MathJax) {
        setTimeout(() => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                MathJax.typesetPromise([mainContent]).catch(err => {
                    console.error('MathJax Error:', err);
                });
            }
        }, 100);
    }
}

// === دالة الترقيم الذكي الديناميكي (كما هي) ===
function generateDynamicPagination(currentPage, totalPages) {
    const pages = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push({ type: 'page', value: i });
    } else {
        pages.push({ type: 'page', value: 1 });
        if (currentPage > 3) pages.push({ type: 'ellipsis' });
        
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) pages.push({ type: 'page', value: i });
        
        if (currentPage < totalPages - 2) pages.push({ type: 'ellipsis' });
        pages.push({ type: 'page', value: totalPages });
    }
    return pages;}

function renderIntermediateLessonPage() {
    const mainContent = document.getElementById('main-content');
    const data = intLessonDataCache;
    const allItems = data.lessons || data.problems || [];
    const totalPages = Math.ceil(allItems.length / INT_LESSONS_PER_PAGE);
    
    const start = (currentIntLessonPage - 1) * INT_LESSONS_PER_PAGE;
    const end = Math.min(start + INT_LESSONS_PER_PAGE, allItems.length);
    const paginatedItems = allItems.slice(start, end);

    // ✅ إضافة CSS للتأثيرات (مع دعم التمييز)
    if (!document.getElementById('int-pro-compact-style')) {
        const style = document.createElement('style');
        style.id = 'int-pro-compact-style';
        style.textContent = `
            .lesson-wrapper { padding: 10px; text-align: right; direction: rtl; color: var(--text-primary); }
            
            .lesson-header-compact { 
                background: var(--card-bg); padding: 8px 15px; border-radius: 8px; 
                border-right: 4px solid var(--accent-color); margin-bottom: 15px;
                display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .lesson-header-compact h1 { font-size: 1.1rem; margin: 0; color: var(--text-primary); }

            .lesson-card { 
                background: var(--card-bg); padding: 15px; border-radius: 10px;
                margin-bottom: 12px; border: 1px solid var(--border-color);
                color: var(--text-primary); transition: all 0.3s ease;
            }
            /* ✅ تأثير التمييز للدرس المستهدف */
            .lesson-card.highlighted {
                animation: lessonPulse 2.5s ease-in-out;
                border: 3px solid var(--accent-color) !important;
            }
            @keyframes lessonPulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.6); }
                50% { box-shadow: 0 0 0 12px rgba(243, 156, 18, 0); }
            }
            
            .problem-box { 
                background: var(--bg-soft); padding: 10px; border-radius: 6px; 
                margin: 10px 0; border-right: 3px solid var(--accent-color);
            }
            .solution-item { 
                display: flex; gap: 8px; background: var(--card-bg); 
                padding: 8px; border-radius: 6px; margin-bottom: 5px;
                border: 1px solid var(--border-color); font-size: 0.9rem;            }
            .golden-rule-box {
                margin-top: 10px; padding: 8px; background: rgba(46, 204, 113, 0.1); 
                color: var(--difficulty-easy); border-radius: 6px; border: 1px dashed var(--difficulty-easy); font-size: 0.85rem;
            }

            .pagination-area { margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
            .page-row { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
            .p-node-ellipsis { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.9rem; cursor: default; }

            .nav-row { display: flex; gap: 10px; }
            .btn-nav { 
                padding: 6px 20px; border-radius: 6px; border: 2px solid var(--accent-color);
                background: var(--card-bg); color: var(--accent-color); cursor: pointer; font-size: 0.9rem;
                transition: all 0.2s;
            }
            .btn-nav:hover:not(:disabled) { background: var(--accent-color); color: #fff; }
            .btn-nav:disabled { opacity: 0.4; cursor: not-allowed; }
            
            .btn-home-small { 
                background: var(--accent-color); color: #fff; border: none; 
                padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }

    const paginationNodes = generateDynamicPagination(currentIntLessonPage, totalPages);

    let paginationHTML = '';
    paginationNodes.forEach(node => {
        if (node.type === 'ellipsis') {
            paginationHTML += `<span class="p-node-ellipsis">...</span>`;
        } else {
            const isActive = node.value === currentIntLessonPage ? 'active' : '';
            paginationHTML += `
              <button class="pagination__btn ${isActive}" 
                      onclick="changeIntLessonPage(${node.value}); return false;"
                      aria-label="الصفحة ${node.value}"
                      aria-current="${isActive ? 'page' : 'false'}">
                ${node.value}
              </button>`;
        }
    });

    // ✅ بناء محتوى الدروس مع إضافة id فريد لكل درس
    mainContent.innerHTML = `
    <div class="lesson-wrapper">
        <div class="lesson-header-compact">
            <h1>المستوى المتوسط : اسلوب الفهم العميق</h1>            <button class="btn-home-small" onclick="loadHomePage()">الرئيسية</button>
        </div>

        <div class="lessons-container">
            ${paginatedItems.map((lesson, localIdx) => {
                const globalIndex = start + localIdx; // ✅ الحساب الصحيح للـ index العالمي
                return `
                <div class="lesson-card" id="int-lesson-card-${globalIndex}" data-idx="${globalIndex}">
                    <strong style="color:var(--accent-color); font-size:1rem;">${lesson.title}</strong>
                    <div class="problem-box">
                        <strong>📌 المسألة:</strong> ${lesson.problem || lesson.question}
                    </div>
                    <div class="solutions-wrap">
                        ${(lesson.solutions || []).map(sol => `
                            <div class="solution-item">
                                <i class="fas fa-${sol.type === 'bolt' ? 'bolt' : 'lightbulb'}" style="color:var(--accent-color); font-size:0.8rem;"></i>
                                <span><strong>${sol.method}:</strong> ${sol.detail}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="golden-rule-box">🏆 القاعدة: ${lesson.golden_rule || lesson.hint}</div>
                </div>`;
            }).join('')}
        </div>

        <div class="pagination-area">
            <div class="page-row">
                ${paginationHTML}
            </div>
            <div class="nav-row">
                <button class="btn-nav" onclick="changeIntLessonPage(currentIntLessonPage - 1); return false;" ${currentIntLessonPage === 1 ? 'disabled' : ''}>◀ السابق</button>
                <button class="btn-nav" onclick="changeIntLessonPage(currentIntLessonPage + 1); return false;" ${currentIntLessonPage === totalPages ? 'disabled' : ''}>التالي ▶</button>
            </div>
        </div>
    </div>`;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ✅ دالة تغيير الصفحة (كما هي مع إضافة renderMath)
window.changeIntLessonPage = function(page) {
    const allItems = intLessonDataCache?.lessons || intLessonDataCache?.problems || [];
    const total = Math.ceil(allItems.length / INT_LESSONS_PER_PAGE);
    
    if (page < 1 || page > total) {
        console.warn('⚠️ رقم الصفحة خارج النطاق');
        return;
    }
    
    currentIntLessonPage = page;    renderIntermediateLessonPage();
    
    // ✅ إعادة تهيئة MathJax عند تغيير الصفحة
    renderMath();
};

// ✅ دوال عامة للوصول الخارجي (اختياري)
window.intermediateLesson = {
    goToLesson: window.intermediateLessonGoToLesson,
    load: window.loadIntermediateLesson,
    changePage: window.changeIntLessonPage
};

console.log('✅ Intermediate Lesson v4.8 loaded - مع دعم الانتقال المباشر! 🚀');