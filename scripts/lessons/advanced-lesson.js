/**
 * منطق درس المستوى المتقدم - النسخة المصححة (v3.0)
 * الإصلاح: منع تضارب الأنماط مع المستويات الأخرى
 */

let currentAdvLessonPage = 1;
const ADV_LESSONS_PER_PAGE = 2;
let advLessonDataCache = null; 

// ✅ دالة تنظيف الأنماط القديمة (مشتركة - نفس الدالة في الملف الأول)
function cleanupLessonStyles() {
    const stylesToRemove = ['beginner-lesson-styles', 'advanced-lesson-styles', 'intermediate-lesson-styles', 'complex-lesson-styles', 'lesson-page-styles'];
    stylesToRemove.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

window.loadAdvancedLesson = async function() {
    window.currentLevel = 'learn-advanced'; 
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = "<p style='text-align:center; padding:50px;'>جاري تحميل دروس المستوى المتقدم...</p>";

    try {
        if (!advLessonDataCache) {
            const res = await fetch('data/lessons/advanced.json');
            if (!res.ok) throw new Error("File not found");
            advLessonDataCache = await res.json();
        }
        
        renderAdvancedLessonPage();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('advanced-lesson'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
    } catch (err) {
        console.error('Error:', err);
        mainContent.innerHTML = "<p style='text-align:center; padding:50px; color:red;'>تعذر تحميل دروس المستوى المتقدم.</p>";
    }
    
        // ✅ تحديث الميتا حتى في حالة الخطأ (اختياري لكن مفضل)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('advanced-lesson');
        }
};

function generatePaginationNumbers(currentPage, totalPages) {
    const pages = [];
    
    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    }
    
    if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    
    return pages;
}

function getCurrentTheme() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') return 'dark';
    if (document.body.classList.contains('dark-mode')) return 'dark';
    return 'light';
}

function renderAdvancedLessonPage() {
    const mainContent = document.getElementById('main-content');
    const data = advLessonDataCache;
    
    const totalLessons = data.lessons.length;
    const totalPages = Math.ceil(totalLessons / ADV_LESSONS_PER_PAGE);

    const start = (currentAdvLessonPage - 1) * ADV_LESSONS_PER_PAGE;
    const end = start + ADV_LESSONS_PER_PAGE;
    const paginatedLessons = data.lessons.slice(start, end);
    
    const paginationNumbers = generatePaginationNumbers(currentAdvLessonPage, totalPages);

    // ✅ تنظيف الأنماط القديمة قبل إنشاء الجديد
    cleanupLessonStyles();

    // ✅ استخدام معرف فريد لهذا المستوى فقط
    if (!document.getElementById('advanced-lesson-styles')) {
        const style = document.createElement('style');
        style.id = 'advanced-lesson-styles';
        style.textContent = `
            /* ✅ متغيرات موحدة لجميع المستويات */
            :root {
                --lesson-bg-primary: #ffffff;
                --lesson-bg-secondary: #f9f9f9;
                --lesson-text-primary: #333333;
                --lesson-text-secondary: #666666;
                --lesson-text-muted: #444444;
                --lesson-accent: #9b59b6;
                --lesson-accent-hover: #8e44ad;
                --lesson-border: #eeeeee;
                --lesson-card-shadow: rgba(0,0,0,0.05);
                --lesson-btn-bg: #f4f4f4;
                --lesson-btn-text: #333333;
                --lesson-btn-border: #dddddd;
                --lesson-example-bg: #fdfcff;                --lesson-example-border: #e2d1e8;
            }
            
            [data-theme="dark"], body.dark-mode {
                --lesson-bg-primary: #1a1a2e;
                --lesson-bg-secondary: #16213e;
                --lesson-text-primary: #f0f0f0;
                --lesson-text-secondary: #b0b0b0;
                --lesson-text-muted: #cccccc;
                --lesson-accent: #9b59b6;
                --lesson-accent-hover: #8e44ad;
                --lesson-border: #2a2a4a;
                --lesson-card-shadow: rgba(0,0,0,0.3);
                --lesson-btn-bg: #2a2a4a;
                --lesson-btn-text: #f0f0f0;
                --lesson-btn-border: #3a3a5a;
                --lesson-example-bg: #1e1e3a;
                --lesson-example-border: #3a2a5a;
            }

            .lesson-wrapper { padding: 10px; text-align: right; direction: rtl; font-family: sans-serif; max-width: 100%; overflow-x: hidden; background: var(--lesson-bg-primary); color: var(--lesson-text-primary); }
            
            .lesson-header { background: var(--lesson-bg-secondary); padding: 8px 12px; border-radius: 6px; border-right: 3px solid var(--lesson-accent); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .lesson-title-area { display: flex; flex-direction: column; overflow: hidden; }
            .lesson-title { color: var(--lesson-accent); margin: 0; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .lesson-desc { margin: 0; color: var(--lesson-text-secondary); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }            
            .back-btn { background: var(--lesson-accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; white-space: nowrap; }
            
            .lessons-list-container { display: flex; flex-direction: column; gap: 12px; }
            .lesson-card { background: var(--lesson-bg-primary); padding: 12px; border-radius: 6px; box-shadow: 0 1px 3px var(--lesson-card-shadow); border: 1px solid var(--lesson-border); box-sizing: border-box; max-width: 100%; }
            .lesson-card-header { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
            .lesson-card-title { color: var(--lesson-text-primary); margin: 0; font-size: 0.95rem; }
            .lesson-icon { color: var(--lesson-accent); font-size: 0.9rem; }
            
            .lesson-explanation { color: var(--lesson-text-muted); line-height: 2.0; margin: 0 0 12px 0; font-size: 0.9rem; overflow-x: auto; max-width: 100%; }
            .lesson-steps { font-size: 0.85rem; color: var(--lesson-text-secondary); margin: 0 0 12px 0; padding-right: 20px; line-height: 1.9; overflow-x: auto; max-width: 100%; }
            
            .example-block { background: var(--lesson-example-bg); padding: 10px; border-radius: 4px; margin-top: 8px; border: 1px solid var(--lesson-example-border); overflow-x: auto; max-width: 100%; box-sizing: border-box; }
            .example-question { font-weight: bold; color: var(--lesson-accent); font-size: 0.9rem; margin-bottom: 5px; white-space: nowrap; }
            .example-solution { font-size: 0.85rem; color: var(--lesson-text-primary); line-height: 2.1; padding-right: 5px; white-space: nowrap; }

            .pagination-container { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
            .lesson-pagination { display: flex; justify-content: center; gap: 5px; flex-wrap: wrap; }            
            .page-node { width: 30px; height: 30px; border: 2px solid var(--lesson-accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--lesson-accent); font-weight: bold; font-size: 0.85rem; background: var(--lesson-bg-primary); }
            .page-node:hover { background: var(--lesson-accent); color: white; }
            .page-node.active { background: var(--lesson-accent); color: white; }
            
            .page-ellipsis { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: var(--lesson-text-secondary); font-size: 0.9rem; cursor: default; font-weight: bold; }
            
            .nav-buttons { display: flex; gap: 12px; }            .nav-btn { background: var(--lesson-btn-bg); color: var(--lesson-btn-text); border: 2px solid var(--lesson-btn-border); padding: 6px 18px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 70px; }            
            .nav-btn:hover:not(:disabled) { background: var(--lesson-accent); color: white; border-color: var(--lesson-accent); }
            .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        `;
        document.head.appendChild(style);
    }

    mainContent.innerHTML = `
    <div class="lesson-wrapper">
        <div class="lesson-header">
            <div class="lesson-title-area">
                <h1 class="lesson-title">${data.title}</h1>
                <p class="lesson-desc">${data.description}</p>
            </div>
            <button class="back-btn" onclick="loadHomePage()">الرئيسية</button>
        </div>

        <div class="lessons-list-container">
            ${paginatedLessons.map(lesson => `
                <div class="lesson-card">
                    <div class="lesson-card-header">
                        <i class="fas ${lesson.icon} lesson-icon"></i>
                        <h3 class="lesson-card-title">${lesson.title}</h3>
                    </div>
                    <p class="lesson-explanation">${lesson.explanation}</p>
                    <ul class="lesson-steps">
                        ${lesson.steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                    
                    ${lesson.examples.map(ex => `
                        <div class="example-block">
                            <div class="example-question">مثال: ${ex.question}</div>
                            <div class="example-solution"><strong>الحل التفصيلي:</strong> ${ex.detailed_solution}</div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>

        <div class="pagination-container">
            <div class="lesson-pagination">
                ${paginationNumbers.map(item => {
                    if (item === '...') {
                        return `<span class="page-ellipsis">...</span>`;
                    } else {
                        return `<div class="page-node ${item === currentAdvLessonPage ? 'active' : ''}" 
                                 onclick="changeAdvLessonPage(${item})">${item}</div>`;
                    }
                }).join('')}
            </div>            
            <div class="nav-buttons">
                <button class="nav-btn" onclick="changeAdvLessonPage(currentAdvLessonPage - 1)" 
                        ${currentAdvLessonPage === 1 ? 'disabled' : ''}>◀ السابق</button>
                <button class="nav-btn" onclick="changeAdvLessonPage(currentAdvLessonPage + 1)" 
                        ${currentAdvLessonPage === totalPages ? 'disabled' : ''}>التالي ▶</button>
            </div>
        </div>
    </div>
    `;
    
    if (window.MathJax) {
        window.MathJax.typesetPromise();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.changeAdvLessonPage = (page) => {
    currentAdvLessonPage = page;
    renderAdvancedLessonPage();
};