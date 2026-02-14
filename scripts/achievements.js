// =============== //
// نظام الإنجازات الموحد - النسخة المصححة لـ Font Awesome
// =============== //

let ALL_ACHIEVEMENTS = null;

async function loadAchievementDefinitions() {
    if (ALL_ACHIEVEMENTS) return ALL_ACHIEVEMENTS;
    try {
        const res = await fetch('data/achievements.json');
        ALL_ACHIEVEMENTS = await res.json();
        return ALL_ACHIEVEMENTS;
    } catch (err) {
        console.error("فشل تحميل achievements.json", err);
        return [];
    }
}

function getEarnedAchievements() {
    return JSON.parse(localStorage.getItem('earned_achievements') || '[]');
}

function saveEarnedAchievements(list) {
    localStorage.setItem('earned_achievements', JSON.stringify(list));
}

function collectStats() {
    const getNum = (key) => parseInt(localStorage.getItem(key) || '0');
    const getBool = (key) => localStorage.getItem(key) === 'true';

    const countSolved = (key) => {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        return data.filter(a => a?.status === 'correct' || (typeof a === 'string' && a.trim() !== "")).length;
    };

    const stats = {
        total_points: getNum('math_user_points'),
        speed_max_level: (window.speedTestData?.currentLevel || 1) - 1,
        mental_beginner_max_level: (window.mentalMathData?.currentLevel || getNum('math_mental_beginner_level') || 1) - 1,
        mental_advanced_max_level: (window.mixedOpsData?.currentLevel || 1) - 1,
        
        beginner_solved: countSolved('math_beg_answers'),
        intermediate_solved: countSolved('math_int_answers'),
        advanced_solved: countSolved('math_adv_achievements'),
        complex_solved: countSolved('math_complex_achievements'),
        
        total_beginner: 50, 
        total_intermediate: 100,
        total_advanced: 200,
        total_complex: 100,

        // المتغيرات التي كانت تسبب ReferenceError في صورك
        consecutive_days: getNum('consecutive_days'),
        total_hints_used: getNum('total_hints_used'),
        first_answer_submitted: getBool('first_answer_done'),
        speed_test_played: getBool('speed_test_played'),
        theme_switched: getBool('theme_switched'),
        pwa_installed: getBool('pwa_installed'),
        achievements_viewed: getBool('achievements_viewed'),
        speed_level_no_hint: getBool('speed_level_no_hint'),
        speed_level_10_perfect: getBool('speed_level_10_perfect'),
        earned_achievements_count: getEarnedAchievements().length
    };

    // حساب الحالات المنطقية المركبة (Flags)
    stats.beginner_complete = stats.beginner_solved >= stats.total_beginner;
    stats.intermediate_complete = stats.intermediate_solved >= stats.total_intermediate;
    stats.advanced_complete = stats.advanced_solved >= stats.total_advanced;
    stats.complex_complete = stats.complex_solved >= stats.total_complex;
    stats.speed_master = stats.speed_max_level >= 50;
    stats.mental_beginner_complete = stats.mental_beginner_max_level >= 5;
    stats.mental_advanced_complete = stats.mental_advanced_max_level >= 5;
    stats.all_levels_beginner = stats.beginner_complete && stats.intermediate_complete && stats.advanced_complete && stats.complex_complete;

    return stats;
}

function evaluateCondition(condition, stats) {
    try {
        const keys = Object.keys(stats);
        const values = Object.values(stats);
        // تمرير القيم كبارامترات يمنع ReferenceError تماماً
        return new Function(...keys, `"use strict"; return (${condition})`)(...values);
    } catch (e) {
        return false;
    }
}

async function checkAndUnlockAchievements() {
    const definitions = await loadAchievementDefinitions();
    let earned = getEarnedAchievements();
    const stats = collectStats();
    let newUnlocks = [];

    for (const ach of definitions) {
        if (earned.includes(ach.id)) continue;
        if (evaluateCondition(ach.condition, stats)) {
            earned.push(ach.id);
            newUnlocks.push(ach);
        }
    }

    if (newUnlocks.length > 0) {
        saveEarnedAchievements(earned);
        newUnlocks.forEach(ach => {
            if (typeof showToast === 'function') {
                showToast(`🏆 ${ach.name}\n${ach.description}`, 'success');
            }
        });
    }
    return newUnlocks;
}

async function loadAchievementsPage() {
    const mainContent = document.getElementById('main-content');
    if(!mainContent) return;

    mainContent.innerHTML = `<div style="text-align:center; padding:50px;">جاري تحميل إنجازاتك... 🏆</div>`;

    const allAchievements = await loadAchievementDefinitions();
    const earnedIds = getEarnedAchievements();

    let html = `
        <div class="achievements-page" style="direction: rtl;">
            <header class="ach-header" style="text-align:center; margin-bottom:20px;">
                <h2>🏆 لوحة الإنجازات</h2>
                <p>لقد حققت ${earnedIds.length} من أصل ${allAchievements.length}</p>
            </header>
            <div class="achievements-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:15px; padding:10px;">
    `;

    allAchievements.forEach(ach => {
        const isEarned = earnedIds.includes(ach.id);
        html += `
            <div class="achievement-card ${isEarned ? 'earned' : 'locked'}" 
                 style="background:#fff; border:2px solid ${isEarned ? '#4CAF50' : '#ddd'}; padding:15px; border-radius:12px; text-align:center; opacity: ${isEarned ? '1' : '0.6'}">
                <div class="ach-icon" style="font-size:35px; margin-bottom:10px; color: ${isEarned ? '#4CAF50' : '#999'}">
                    ${isEarned ? `<i class="${ach.icon}"></i>` : '<i class="fas fa-lock"></i>'}
                </div>
                <div class="ach-info">
                    <h3 style="font-size:16px; margin:5px 0;">${ach.name}</h3>
                    <p style="font-size:11px; color:#666; margin:0;">${ach.description}</p>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;
    mainContent.innerHTML = html;
}

// التصدير للنافذة العالمية لضمان العمل بدون Export
window.checkAndUnlockAchievements = checkAndUnlockAchievements;
window.loadAchievementsPage = loadAchievementsPage;
