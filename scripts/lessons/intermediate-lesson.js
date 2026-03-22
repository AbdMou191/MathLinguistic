/**
 * منطق درس المستوى المتوسط - النسخة المدمجة (v4.5)
 * ✅ هيدر نحيف وموفر للمساحة
 * ✅ دعم كامل للثيم (الوضع الليلي والنهاري)
 * ✅ ترقيم ذكي ديناميكي (1 2 3 ... Last)
 */

let currentIntLessonPage = 1;
const INT_LESSONS_PER_PAGE = 3; 
let intLessonDataCache = null;

window.loadIntermediateLesson = async function() {
    window.currentLevel = 'learn-intermediate'; 
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = "<p style='text-align:center; padding:30px; color: var(--text-primary);'>جاري التحميل...</p>";

    try {
        if (!intLessonDataCache) {
            const res = await fetch('data/lessons/intermediate.json');
            if (!res.ok) throw new Error("File not found");
            intLessonDataCache = await res.json();
        }
        renderIntermediateLessonPage();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('intermediate-lesson'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
    } catch (err) {
        console.error('Error:', err);
        mainContent.innerHTML = "<p style='text-align:center; padding:30px; color:red;'>عذراً، تعذر تحميل المحتوى.</p>";
    }
    
        // ✅ تحديث الميتا حتى في حالة الخطأ (اختياري لكن مفضل)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('intermediate-lesson');
        }
};

// --- دالة الترقيم الذكي الديناميكي ---
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
    return pages;
}

function renderIntermediateLessonPage() {
    const mainContent = document.getElementById('main-content');
    const data = intLessonDataCache;
    const allItems = data.lessons || data.problems || [];
    const totalPages = Math.ceil(allItems.length / INT_LESSONS_PER_PAGE);
    
    const start = (currentIntLessonPage - 1) * INT_LESSONS_PER_PAGE;
    const end = start + INT_LESSONS_PER_PAGE;
    const paginatedItems = allItems.slice(start, end);

    if (!document.getElementById('int-pro-compact-style')) {
        const style = document.createElement('style');
        style.id = 'int-pro-compact-style';
        style.textContent = `
            .lesson-wrapper { padding: 10px; text-align: right; direction: rtl; color: var(--text-primary); }
            
            /* هيدر أصغر ونحيف */
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
                color: var(--text-primary);
            }
            .problem-box { 
                background: var(--hover-bg); padding: 10px; border-radius: 6px; 
                margin: 10px 0; border-right: 3px solid var(--accent-color);
            }
            .solution-item { 
                display: flex; gap: 8px; background: var(--bg-color); 
                padding: 8px; border-radius: 6px; margin-bottom: 5px;
                border: 1px solid var(--border-color); font-size: 0.9rem;
            }
            .golden-rule-box {
                margin-top: 10px; padding: 8px; background: rgba(46, 204, 113, 0.1); 
                color: #2ecc71; border-radius: 6px; border: 1px dashed #2ecc71; font-size: 0.85rem;
            }

            /* الترقيم */
            .pagination-area { margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
            .page-row { display: flex; gap: 5px; align-items: center; }
            .p-node { 
                width: 32px; height: 32px; border: 1px solid var(--accent-color); 
                border-radius: 6px; display: flex; align-items: center; justify-content: center; 
                cursor: pointer; font-size: 0.85rem; background: var(--card-bg); color: var(--text-primary);
            }
            .p-node.active { background: var(--accent-color); color: #fff; }
            .p-node.ellipsis { border: none; background: none; cursor: default; }

            .nav-row { display: flex; gap: 10px; }
            .btn-nav { 
                padding: 6px 20px; border-radius: 6px; border: none;
                background: var(--accent-color); color: #fff; cursor: pointer; font-size: 0.9rem;
            }
            .btn-nav:disabled { opacity: 0.3; }
            
            .btn-home-small { 
                background: var(--accent-color); color: #fff; border: none; 
                padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }

    const paginationNodes = generateDynamicPagination(currentIntLessonPage, totalPages);

    mainContent.innerHTML = `
    <div class="lesson-wrapper">
        <div class="lesson-header-compact">
            <h1>المستوى المتوسط : اسلوب الفهم العميق</h1>
            <button class="btn-home-small" onclick="loadHomePage()">الرئيسية</button>
        </div>

        <div class="lessons-container">
            ${paginatedItems.map(lesson => `
                <div class="lesson-card">
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
                </div>
            `).join('')}
        </div>

        <div class="pagination-area">
            <div class="page-row">
                ${paginationNodes.map(node => {
                    if (node.type === 'ellipsis') return `<span class="p-node ellipsis">...</span>`;
                    return `<div class="p-node ${node.value === currentIntLessonPage ? 'active' : ''}" 
                                 onclick="changeIntLessonPage(${node.value})">${node.value}</div>`;
                }).join('')}
            </div>
            <div class="nav-row">
                <button class="btn-nav" onclick="changeIntLessonPage(${currentIntLessonPage - 1})" ${currentIntLessonPage === 1 ? 'disabled' : ''}>السابق</button>
                <button class="btn-nav" onclick="changeIntLessonPage(${currentIntLessonPage + 1})" ${currentIntLessonPage === totalPages ? 'disabled' : ''}>التالي</button>
            </div>
        </div>
    </div>`;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.changeIntLessonPage = (page) => {
    const allItems = intLessonDataCache.lessons || intLessonDataCache.problems || [];
    const total = Math.ceil(allItems.length / INT_LESSONS_PER_PAGE);
    if (page < 1 || page > total) return;
    currentIntLessonPage = page;
    renderIntermediateLessonPage();
};
