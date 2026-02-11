// =============== //
// نظام الإنجازات الذكي - نسخة متوافقة مع window
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
        ALL_ACHIEVEMENTS = [];
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
    const totalPoints = parseInt(localStorage.getItem('math_user_points') || '0');
    const speedMaxLevel = window.speedTestData?.currentLevel || 1;
    const mentalBeginnerMax = window.mentalMathData?.currentLevel || parseInt(localStorage.getItem('math_mental_beginner_level') || '1');
    const mentalAdvancedMax = window.mixedOpsData?.currentLevel || 1;

    const countCompleted = (key, totalExpected = Infinity) => {
        const answers = JSON.parse(localStorage.getItem(key) || '[]');
        const solved = answers.filter(a => a?.status === 'correct' || (typeof a === 'string' && a.trim() !== "")).length;
        return { solved, total: totalExpected };
    };
    const beginner = countCompleted('math_beg_answers');
    const intermediate = countCompleted('math_int_answers');
    const advanced = countCompleted('math_adv_achievements', 200);
    const complex = countCompleted('math_complex_achievements');

    return {
        total_points: totalPoints,
        speed_max_level: speedMaxLevel - 1,
        mental_beginner_max_level: mentalBeginnerMax - 1,
        mental_advanced_max_level: mentalAdvancedMax - 1,
        beginner_solved: beginner.solved,
        total_beginner: beginner.total,        intermediate_solved: intermediate.solved,
        total_intermediate: intermediate.total,
        advanced_solved: advanced.solved,
        total_advanced: advanced.total,
        complex_solved: complex.solved,
        total_complex: complex.total,
        first_answer_submitted: localStorage.getItem('first_answer_done') === 'true',
        speed_test_played: localStorage.getItem('speed_test_played') === 'true',
        achievements_viewed: localStorage.getItem('achievements_viewed') === 'true',
        theme_switched: localStorage.getItem('theme_switched') === 'true',
        pwa_installed: localStorage.getItem('pwa_installed') === 'true'
    };
}

function evaluateCondition(condition, stats) {
    try {
        let expr = condition
            .replace(/speed_max_level/g, stats.speed_max_level)
            .replace(/mental_beginner_max_level/g, stats.mental_beginner_max_level)
            .replace(/mental_advanced_max_level/g, stats.mental_advanced_max_level)
            .replace(/beginner_solved/g, stats.beginner_solved)
            .replace(/intermediate_solved/g, stats.intermediate_solved)
            .replace(/advanced_solved/g, stats.advanced_solved)
            .replace(/complex_solved/g, stats.complex_solved)
            .replace(/total_points/g, stats.total_points)
            .replace(/total_beginner/g, stats.total_beginner)
            .replace(/total_intermediate/g, stats.total_intermediate)
            .replace(/total_advanced/g, stats.total_advanced)
            .replace(/total_complex/g, stats.total_complex)
            .replace(/==/g, '===')
            .replace(/&&/g, ' && ')
            .replace(/\|\|/g, ' || ');

        return Function('"use strict"; return (' + expr + ')')();
    } catch (e) {
        console.warn("خطأ في تقييم شرط:", condition, e);
        return false;
    }
}

async function checkAndUnlockAchievements() {
    const definitions = await loadAchievementDefinitions();
    const earned = getEarnedAchievements();
    const stats = collectStats();
    let newUnlocks = [];

    for (const ach of definitions) {
        if (earned.includes(ach.id)) continue;
        if (evaluateCondition(ach.condition, stats)) {
            earned.push(ach.id);            newUnlocks.push(ach);
        }
    }

    if (newUnlocks.length > 0) {
        saveEarnedAchievements(earned);
        newUnlocks.forEach(ach => {
            showToast(`🏆 ${ach.name}\n${ach.description}`, 'success');
        });
    }
    return newUnlocks;
}

async function loadAchievementsPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<div style="text-align:center; padding:50px;">جاري تحميل إنجازاتك... 🏆</div>`;

    const allAchievements = await loadAchievementDefinitions();
    const earnedIds = getEarnedAchievements();
    const stats = collectStats();

    let html = `
        <div class="achievements-page">
            <header class="ach-header">
                <h2>🏆 لوحة الإنجازات</h2>
                <p>لقد حققت ${earnedIds.length} من أصل ${allAchievements.length} إنجازاً</p>
            </header>
            <div class="achievements-grid">
    `;

    allAchievements.forEach(ach => {
        const isEarned = earnedIds.includes(ach.id);
        html += `
            <div class="achievement-card ${isEarned ? 'earned' : 'locked'}">
                <div class="ach-icon">
                    ${isEarned ? `<img src="icons/${ach.icon}" alt="icon">` : '🔒'}
                </div>
                <div class="ach-info">
                    <h3>${ach.name}</h3>
                    <p>${ach.description}</p>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;
    mainContent.innerHTML = html;

    localStorage.setItem('achievements_viewed', 'true');
    checkAndUnlockAchievements(); }

// === جعل الدوال عالمية ===
window.loadAchievementDefinitions = loadAchievementDefinitions;
window.getEarnedAchievements = getEarnedAchievements;
window.checkAndUnlockAchievements = checkAndUnlockAchievements;
window.loadAchievementsPage = loadAchievementsPage;
