/**
 * منطق درس المستوى المبتدئ - النسخة المصححة (v3.0)
 * الإصلاح: منع تضارب الأنماط مع المستويات الأخرى
 */

// متغيرات لإدارة الصفحات
let currentLessonPage = 1;
const LESSONS_PER_PAGE = 5;
let lessonDataCache = null;

// ✅ دالة تنظيف الأنماط القديمة (مشتركة)
function cleanupLessonStyles() {
    const stylesToRemove = ['beginner-lesson-styles', 'advanced-lesson-styles', 'intermediate-lesson-styles', 'complex-lesson-styles', 'lesson-page-styles'];
    stylesToRemove.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

window.loadBeginnerLesson = async function() {
    window.currentLevel = 'learn-beginner'; 
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = "<p style='text-align:center; padding:50px;'>جاري تحميل الدرس...</p>";

    try {
        if (!lessonDataCache) {
            const res = await fetch('data/lessons/beginner.json');
            if (!res.ok) throw new Error("Lesson file not found");
            lessonDataCache = await res.json();
        }
        
        renderLessonPage();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('beginner-lesson'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
    } catch (err) {
        console.error('Error:', err);
        mainContent.innerHTML = "<p style='text-align:center; padding:50px; color:red;'>عذراً، تعذر تحميل الدرس.</p>";
    }
    
        // ✅ تحديث الميتا حتى في حالة الخطأ (اختياري لكن مفضل)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('beginner');
        }
};

// === دالة إنشاء أزرار الترقيم الذكي ===
function generateSmartPagination(currentPage, totalPages) {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ type: 'page', value: i });
        }
    } else {        pages.push({ type: 'page', value: 1 });
        
        if (currentPage > 3) {
            pages.push({ type: 'ellipsis', value: 'start' });
        }
        
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            pages.push({ type: 'page', value: i });
        }
        
        if (currentPage < totalPages - 2) {
            pages.push({ type: 'ellipsis', value: 'end' });
        }
        
        pages.push({ type: 'page', value: totalPages });
    }
    
    return pages;
}

function renderLessonPage() {
    const mainContent = document.getElementById('main-content');
    const data = lessonDataCache;
    
    const start = (currentLessonPage - 1) * LESSONS_PER_PAGE;
    const end = start + LESSONS_PER_PAGE;
    const paginatedLessons = data.lessons.slice(start, end);
    const totalPages = Math.ceil(data.lessons.length / LESSONS_PER_PAGE);

    // ✅ تنظيف الأنماط القديمة قبل إنشاء الجديد
    cleanupLessonStyles();

    // ✅ استخدام معرف فريد لهذا المستوى فقط
    if (!document.getElementById('beginner-lesson-styles')) {
        const style = document.createElement('style');
        style.id = 'beginner-lesson-styles';
        style.textContent = `
            /* ✅ متغيرات موحدة لجميع المستويات */
            :root {
                --lesson-bg-primary: #ffffff;
                --lesson-bg-secondary: #f9f9f9;
                --lesson-text-primary: #333333;
                --lesson-text-secondary: #666666;
                --lesson-text-muted: #444444;
                --lesson-accent: #f39c12;
                --lesson-accent-hover: #e67e22;
                --lesson-border: #eeeeee;                --lesson-card-shadow: rgba(0,0,0,0.05);
                --lesson-btn-bg: #f4f4f4;
                --lesson-btn-text: #333333;
                --lesson-btn-border: #dddddd;
                --lesson-example-bg: #fff8e1;
                --lesson-example-border: #f39c12;
            }
            
            [data-theme="dark"], body.dark-mode {
                --lesson-bg-primary: #1a1a2e;
                --lesson-bg-secondary: #16213e;
                --lesson-text-primary: #f0f0f0;
                --lesson-text-secondary: #b0b0b0;
                --lesson-text-muted: #cccccc;
                --lesson-accent: #f39c12;
                --lesson-accent-hover: #e67e22;
                --lesson-border: #2a2a4a;
                --lesson-card-shadow: rgba(0,0,0,0.3);
                --lesson-btn-bg: #2a2a4a;
                --lesson-btn-text: #f0f0f0;
                --lesson-btn-border: #3a3a5a;
                --lesson-example-bg: #2a2a1e;
                --lesson-example-border: #f39c12;
            }

            .lesson-wrapper { padding: 10px; text-align: right; direction: rtl; background: var(--lesson-bg-primary); color: var(--lesson-text-primary); font-family: sans-serif; max-width: 100%; overflow-x: hidden; }
            
            .lesson-header { background: var(--lesson-bg-secondary); padding: 8px 12px; border-radius: 6px; border-right: 4px solid var(--lesson-accent); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
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

            .pagination-wrapper { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
            
            .lesson-pagination { display: flex; justify-content: center; gap: 5px; flex-wrap: wrap; }            
            .page-node { width: 30px; height: 30px; border: 2px solid var(--lesson-accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--lesson-accent); font-weight: bold; font-size: 0.85rem; background: var(--lesson-bg-primary); }            .page-node:hover { background: var(--lesson-accent); color: white; }
            .page-node.active { background: var(--lesson-accent); color: white; }
            .page-node.ellipsis { border: none; width: auto; padding: 0 5px; cursor: default; color: var(--lesson-text-secondary); font-size: 0.9rem; font-weight: bold; }
            
            .page-nav-buttons { display: flex; gap: 12px; }
            .page-nav-btn { background: var(--lesson-btn-bg); color: var(--lesson-btn-text); border: 2px solid var(--lesson-btn-border); padding: 6px 18px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; min-width: 70px; }            
            .page-nav-btn:hover:not(:disabled) { background: var(--lesson-accent); color: white; border-color: var(--lesson-accent); }
            .page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            
            .page-indicator { text-align: center; color: var(--lesson-text-secondary); font-size: 0.85rem; margin-top: 8px; }
        `;
        document.head.appendChild(style);
    }

    const paginationItems = generateSmartPagination(currentLessonPage, totalPages);
    const paginationHTML = paginationItems.map(item => {
        if (item.type === 'ellipsis') {
            return `<span class="page-node ellipsis">...</span>`;
        }
        return `<div class="page-node ${item.value === currentLessonPage ? 'active' : ''}" 
                     onclick="changeLessonPage(${item.value})">${item.value}</div>`;
    }).join('');

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
                    <p style="color: var(--lesson-text-primary); line-height: 1.5; margin:0; font-size: 0.95rem;">${lesson.explanation}</p>
                    <div class="lesson-example">مثال: ${lesson.example}</div>
                </div>
            `).join('')}
        </div>

        <div class="pagination-wrapper">
            <div class="lesson-pagination">
                ${paginationHTML}
            </div>            
            <div class="page-nav-buttons">
                <button class="page-nav-btn" 
                        onclick="changeLessonPage(${currentLessonPage - 1})" 
                        ${currentLessonPage === 1 ? 'disabled' : ''}>
                    ◀ السابق
                </button>
                
                <button class="page-nav-btn" 
                        onclick="changeLessonPage(${currentLessonPage + 1})" 
                        ${currentLessonPage === totalPages ? 'disabled' : ''}>
                    التالي ▶
                </button>
            </div>
            
            <p class="page-indicator">
                صفحة ${currentLessonPage} من ${totalPages}
            </p>
        </div>
    </div>`;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.changeLessonPage = (page) => {
    const totalPages = Math.ceil(lessonDataCache.lessons.length / LESSONS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentLessonPage = page;
    renderLessonPage();
};