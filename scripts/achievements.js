// =============== //
// نظام الإنجازات الذكي
// =============== //

let ALL_ACHIEVEMENTS = null;

// تحميل تعريفات الإنجازات من JSON
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

// الحصول على الإنجازات المحققة حاليًا
function getEarnedAchievements() {
    return JSON.parse(localStorage.getItem('earned_achievements') || '[]');
}

// حفظ الإنجازات المحققة
function saveEarnedAchievements(list) {
    localStorage.setItem('earned_achievements', JSON.stringify(list));
}

// === جمع الإحصائيات من localStorage ===
function collectStats() {
    // 1. النقاط
    const totalPoints = parseInt(localStorage.getItem('math_user_points') || '0');

    // 2. الحساب السريع
    const speedMaxLevel = window.speedTestData?.currentLevel || 1;
    
    // 3. الحساب الذهني الابتدائي
    const mentalBeginnerMax = window.mentalMathData?.currentLevel || 1;
    
    // 4. الحساب الذهني المتقدم
    const mentalAdvancedMax = window.mixedOpsData?.currentLevel || 1;

    // 5. التمارين المحققة في المستويات الثابتة
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
        speed_max_level: speedMaxLevel - 1, // لأن currentLevel يشير للمستوى التالي
        mental_beginner_max_level: mentalBeginnerMax - 1,
        mental_advanced_max_level: mentalAdvancedMax - 1,
        beginner_solved: beginner.solved,
        total_beginner: beginner.total,
        intermediate_solved: intermediate.solved,
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

// === تقييم شرط إنجاز واحد ===
function evaluateCondition(condition, stats) {
    try {
        // تحويل الشروط إلى تعبيرات قابلة للتقييم بأمان
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
            .replace(/==/g, '===') // لتجنب المشاكل
            .replace(/&&/g, ' && ')
            .replace(/\|\|/g, ' || ');

        // تنفيذ آمن (بدون eval خطر)
        return Function('"use strict"; return (' + expr + ')')();    } catch (e) {
        console.warn("خطأ في تقييم شرط:", condition, e);
        return false;
    }
}

// === التحقق من جميع الإنجازات ===
export async function checkAndUnlockAchievements() {
    const definitions = await loadAchievementDefinitions();
    const earned = getEarnedAchievements();
    const stats = collectStats();

    let newUnlocks = [];

    for (const ach of definitions) {
        if (earned.includes(ach.id)) continue; // سبق تحقيقه

        if (evaluateCondition(ach.condition, stats)) {
            earned.push(ach.id);
            newUnlocks.push(ach);
        }
    }

    if (newUnlocks.length > 0) {
        saveEarnedAchievements(earned);
        // عرض إشعار لكل إنجاز جديد (اختياري)
        newUnlocks.forEach(ach => {
            showToast(`🏆 ${ach.name}\n${ach.description}`, 'success');
        });
    }

    return newUnlocks;
}

// === استخدام عام: استدعاء عند الحاجة ===
window.checkAndUnlockAchievements = checkAndUnlockAchievements;

// جعل الدوال متاحة عالمياً لاستخدامها في main.js
window.loadAchievementDefinitions = loadAchievementDefinitions;
window.getEarnedAchievements = getEarnedAchievements;
window.checkAndUnlockAchievements = checkAndUnlockAchievements;
window.loadAchievementsPage = loadAchievementsPage;
