/**
 * منطق درس المستوى المعقد - النسخة النهائية (v4.0)
 * الإصلاح: 3 دروس/صفحة + إصلاح كامل لنظام الترقيم
 */

// ✅ ثابت: 3 دروس في كل صفحة
const CPX_LESSONS_PER_PAGE = 3;

let cpxCurrentPage = 1;
let cpxLessonDataCache = null; 
const CPX_DATA_FILE_PATH = 'data/lessons/complex.json'; 

window.loadComplexLesson = async function() {
    window.currentLevel = 'learn-complex'; 
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = "<p style='text-align:center; padding:50px;'>جاري تحميل الدروس...</p>";

    try {
        if (!cpxLessonDataCache) {
            const res = await fetch(CPX_DATA_FILE_PATH);
            if (!res.ok) throw new Error("File not found");
            cpxLessonDataCache = await res.json();
        }
        renderComplexLessonPage();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('complex-lesson'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
    } catch (err) {
        console.error('❌ Complex Lesson Error:', err);
        mainContent.innerHTML = "<p style='text-align:center; padding:50px; color:red;'>تعذر تحميل الدروس.</p>";
    }
    
        // ✅ تحديث الميتا حتى في حالة الخطأ (اختياري لكن مفضل)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('complex-lesson');
        }
};

// ✅ دالة توليد أرقام الصفحات حسب طول المصفوفة
function generateCpxPaginationNumbers(currentPage, totalPages) {
    const pages = [];
    
    if (totalPages <= 7) {
        // عرض كل الصفحات إذا كانت 7 أو أقل
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // عرض ذكي للصفحات الكثيرة
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }    }
    
    return pages;
}

function getCpxCurrentTheme() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') return 'dark';
    if (document.body.classList.contains('dark-mode')) return 'dark';
    return 'light';
}

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

function renderComplexLessonPage() {
    const mainContent = document.getElementById('main-content');
    const data = cpxLessonDataCache;
    const styleId = 'cpx-lesson-page-styles'; 
    
    if (!data || !data.lessons) return;

    const totalLessons = data.lessons.length;
    
    // ✅ حساب عدد الصفحات ديناميكياً: طول المصفوفة / 3
    const totalPages = Math.ceil(totalLessons / CPX_LESSONS_PER_PAGE);
    
    // ✅ التأكد من أن الصفحة الحالية ضمن النطاق الصحيح
    if (cpxCurrentPage > totalPages) cpxCurrentPage = totalPages;
    if (cpxCurrentPage < 1) cpxCurrentPage = 1;
    
    const start = (cpxCurrentPage - 1) * CPX_LESSONS_PER_PAGE;
    const end = Math.min(start + CPX_LESSONS_PER_PAGE, totalLessons);
    const paginatedLessons = data.lessons.slice(start, end);
    
    const paginationNumbers = generateCpxPaginationNumbers(cpxCurrentPage, totalPages);
    const showPagination = totalPages > 1;

    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;        style.textContent = `
            :root {
                --cpx-bg-primary: #ffffff; --cpx-bg-secondary: #f9f9f9;
                --cpx-text-primary: #333333; --cpx-text-secondary: #666666;
                --cpx-text-muted: #444444; --cpx-accent: #2c3e50;
                --cpx-accent-hover: #1a252f; --cpx-border: #eeeeee;
                --cpx-card-shadow: rgba(0,0,0,0.05); --cpx-btn-bg: #f4f4f4;
                --cpx-btn-text: #333333; --cpx-btn-border: #dddddd;
                --cpx-example-bg: #f8f9fa; --cpx-example-border: #dee2e6;
            }
            [data-theme="dark"], body.dark-mode {
                --cpx-bg-primary: #1a1a2e; --cpx-bg-secondary: #16213e;
                --cpx-text-primary: #f0f0f0; --cpx-text-secondary: #b0b0b0;
                --cpx-text-muted: #cccccc; --cpx-accent: #8e99f3;
                --cpx-accent-hover: #6c78e3; --cpx-border: #2a2a4a;
                --cpx-card-shadow: rgba(0,0,0,0.3); --cpx-btn-bg: #2a2a4a;
                --cpx-btn-text: #f0f0f0; --cpx-btn-border: #3a3a5a;
                --cpx-example-bg: #1e1e3a; --cpx-example-border: #3a2a5a;
            }
            .cpx-lesson-wrapper { padding: 10px; text-align: right; direction: rtl; font-family: sans-serif; max-width: 100%; overflow-x: hidden; background: var(--cpx-bg-primary); color: var(--cpx-text-primary); }
            .cpx-lesson-header { background: var(--cpx-bg-secondary); padding: 15px; border-radius: 6px; border-right: 3px solid var(--cpx-accent); margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .cpx-lesson-title-area { display: flex; flex-direction: column; overflow: hidden; }
            .cpx-lesson-title { color: var(--cpx-accent); margin: 0; font-size: 1.3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .cpx-lesson-desc { margin: 5px 0 0 0; color: var(--cpx-text-secondary); font-size: 0.9rem; }
            .cpx-back-btn { background: var(--cpx-accent); color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
            .cpx-lessons-list-container { display: flex; flex-direction: column; gap: 15px; }
            .cpx-lesson-card { background: var(--cpx-bg-primary); padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px var(--cpx-card-shadow); border: 1px solid var(--cpx-border); }
            .cpx-lesson-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
            .cpx-lesson-card-title { color: var(--cpx-text-primary); margin: 0; font-size: 1.1rem; }
            .cpx-lesson-icon { color: var(--cpx-accent); font-size: 1rem; }
            .cpx-lesson-explanation { color: var(--cpx-text-muted); line-height: 1.8; margin: 0 0 15px 0; font-size: 0.95rem; }
            .cpx-lesson-steps { font-size: 0.9rem; color: var(--cpx-text-secondary); margin: 0 0 15px 0; padding-right: 20px; line-height: 1.8; }
            .cpx-example-block { background: var(--cpx-example-bg); padding: 12px; border-radius: 4px; margin-top: 10px; border: 1px solid var(--cpx-example-border); }
            .cpx-example-question { font-weight: bold; color: var(--cpx-accent); font-size: 0.95rem; margin-bottom: 8px; }
            .cpx-example-solution { font-size: 0.9rem; color: var(--cpx-text-primary); line-height: 1.8; padding-right: 5px; white-space: normal; }
            
            /* ✅ تنسيق الترقيم - مهم جداً */
            .cpx-pagination-container { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 25px; }
            .cpx-lesson-pagination { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
            .cpx-page-node { 
                width: 40px; 
                height: 40px; 
                border: 2px solid var(--cpx-accent); 
                border-radius: 6px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                cursor: pointer; 
                color: var(--cpx-accent); 
                font-weight: bold;                 font-size: 1rem; 
                background: var(--cpx-bg-primary);
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
            .cpx-page-node:hover { background: var(--cpx-accent); color: white; }
            .cpx-page-node.active { background: var(--cpx-accent); color: white; cursor: default; }
            .cpx-page-ellipsis { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--cpx-text-secondary); font-size: 1rem; }
            
            .cpx-nav-buttons { display: flex; gap: 10px; }
            .cpx-nav-btn { background: var(--cpx-btn-bg); color: var(--cpx-btn-text); border: 1px solid var(--cpx-btn-border); padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
            .cpx-nav-btn:hover:not(:disabled) { background: var(--cpx-accent); color: white; }
            .cpx-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .cpx-lessons-counter { text-align: center; color: var(--cpx-text-secondary); font-size: 0.85rem; margin-top: 10px; }
            .cpx-hidden { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    const lessonsCounter = `<div class="cpx-lessons-counter">عرض الدروس ${start + 1} - ${end} من ${totalLessons} | صفحة ${cpxCurrentPage} من ${totalPages}</div>`;

    // ✅ بناء HTML للترقيم - باستخدام onclick مباشر وموثوق
    let paginationHTML = '';
    paginationNumbers.forEach(item => {
        if (item === '...') {
            paginationHTML += `<span class="cpx-page-ellipsis">...</span>`;
        } else {
            const isActive = item === cpxCurrentPage ? 'active' : '';
            // ✅ استخدام onclick مباشر مع return false لمنع أي سلوك افتراضي
            paginationHTML += `<div class="cpx-page-node ${isActive}" onclick="window.changeCpxLessonPage(${item}); return false;">${item}</div>`;
        }
    });

    mainContent.innerHTML = `
    <div class="cpx-lesson-wrapper">
        <div class="cpx-lesson-header">
            <div class="cpx-lesson-title-area">
                <h1 class="cpx-lesson-title">${data.title}</h1>
                <p class="cpx-lesson-desc">${data.description}</p>
            </div>
            <button class="cpx-back-btn" onclick="loadHomePage()">الرئيسية</button>
        </div>
        
        ${lessonsCounter}
        
        <div class="cpx-lessons-list-container">
            ${paginatedLessons.map((lesson, index) => `
                <div class="cpx-lesson-card" data-lesson-index="${start + index}">
                    <div class="cpx-lesson-card-header">
                        <i class="fas ${lesson.icon} cpx-lesson-icon"></i>                        <h3 class="cpx-lesson-card-title">${lesson.title}</h3>
                    </div>
                    <p class="cpx-lesson-explanation">${lesson.explanation}</p>
                    <ul class="cpx-lesson-steps">
                        ${lesson.steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                    ${(lesson.examples || []).map(ex => `
                        <div class="cpx-example-block">
                            <div class="cpx-example-question">مثال: ${ex.question}</div>
                            <div class="cpx-example-solution"><strong>الحل التفصيلي:</strong> ${ex.detailed_solution}</div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="cpx-pagination-container ${showPagination ? '' : 'cpx-hidden'}">
            <div class="cpx-lesson-pagination">
                ${paginationHTML}
            </div>
            <div class="cpx-nav-buttons">
                <button class="cpx-nav-btn" onclick="window.changeCpxLessonPage(cpxCurrentPage - 1); return false;" 
                        ${cpxCurrentPage === 1 ? 'disabled' : ''}>◀ السابق</button>
                <button class="cpx-nav-btn" onclick="window.changeCpxLessonPage(cpxCurrentPage + 1); return false;" 
                        ${cpxCurrentPage === totalPages ? 'disabled' : ''}>التالي ▶</button>
            </div>
        </div>
    </div>
    `;
    
    renderMath();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ✅ دالة تغيير الصفحة - متاحة عالمياً
window.changeCpxLessonPage = function(page) {
    const data = cpxLessonDataCache;
    if (!data || !data.lessons) {
        console.error('❌ لا توجد بيانات دروس');
        return;
    }
    
    const totalLessons = data.lessons.length;
    const totalPages = Math.ceil(totalLessons / CPX_LESSONS_PER_PAGE);
    
    console.log('📄 تغيير الصفحة:', page, 'من', totalPages);
    
    // ✅ التحقق من صحة رقم الصفحة
    if (page < 1) {
        console.warn('⚠️ رقم الصفحة أقل من 1');        return;
    }
    if (page > totalPages) {
        console.warn('⚠️ رقم الصفحة أكبر من الإجمالي:', totalPages);
        return;
    }
    
    cpxCurrentPage = page;
    renderComplexLessonPage();
};