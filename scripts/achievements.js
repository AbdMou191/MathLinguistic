// نظام الإنجازات - MathLinguistic (نسخة مضمونة)
// ✅ جميع الدوال معرفة على window مباشرة

console.log('🏆 achievements.js loading...');

let ALL_ACHIEVEMENTS = null;

// 1. تحميل البيانات
window.loadAchievementDefinitions = async function() {
    if (ALL_ACHIEVEMENTS) return ALL_ACHIEVEMENTS;
    try {
        const res = await fetch('data/achievements.json');
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        ALL_ACHIEVEMENTS = Array.isArray(data) ? data : [];
        console.log('✅ تم تحميل', ALL_ACHIEVEMENTS.length, 'إنجاز');
        return ALL_ACHIEVEMENTS;
    } catch (err) {
        console.error("فشل التحميل:", err);
        ALL_ACHIEVEMENTS = [];
        return [];
    }
};

// 2. جلب الإنجازات المحققة
window.getEarnedAchievements = function() {
    try {
        return JSON.parse(localStorage.getItem('earned_achievements') || '[]');
    } catch (e) {
        return [];
    }
};

// 3. جمع الإحصائيات
window.collectStats = function() {
    const getNum = (k) => parseInt(localStorage.getItem(k) || '0');
    const countSolved = (k) => {
        try {
            const d = JSON.parse(localStorage.getItem(k) || '[]');
            return Array.isArray(d) ? d.filter(x => x && (x.status === 'correct' || (typeof x === 'string' && x.trim() !== ""))).length : 0;
        } catch (e) { return 0; }
    };
    return {
        beginner_solved: countSolved('math_beg_answers'),
        intermediate_solved: countSolved('math_int_answers'),
        advanced_solved: countSolved('math_adv_achievements'),
        complex_solved: countSolved('math_complex_achievements'),
        total_beginner: 50,
        total_intermediate: 50,
        total_advanced: 50,        total_complex: 50,
        speed_max_level: getNum('speed_test_max_level'),
        mental_beginner_max_level: getNum('math_mental_beginner_level'),
        mental_advanced_max_level: getNum('math_mixed_ops_level'),
        crossmath_stage: getNum('crossmath_stage'),
        loudoukou_blocks: getNum('loudoukou_blocks'),
        sliding_max_grid: getNum('sliding_max_grid'),
        total_points: getNum('math_user_points'),
        total_hints_used: getNum('total_hints_used'),
        earned_achievements_count: window.getEarnedAchievements().length,
        beginner_complete: countSolved('math_beg_answers') >= 50,
        intermediate_complete: countSolved('math_int_answers') >= 50,
        advanced_complete: countSolved('math_adv_achievements') >= 50,
        complex_complete: countSolved('math_complex_achievements') >= 50,
        speed_master: getNum('speed_test_max_level') >= 50,
        mental_beginner_complete: getNum('math_mental_beginner_level') >= 5,
        mental_advanced_complete: getNum('math_mixed_ops_level') >= 5,
        all_levels_beginner: countSolved('math_beg_answers') >= 50 && countSolved('math_int_answers') >= 50 && countSolved('math_adv_achievements') >= 50 && countSolved('math_complex_achievements') >= 50
    };
};

// 4. تقييم الشرط
window.evaluateCondition = function(condition, stats) {
    if (!condition) return false;
    try {
        const keys = Object.keys(stats);
        const values = Object.values(stats);
        return new Function(...keys, `"use strict"; return (${condition})`)(...values);
    } catch (e) {
        console.warn('⚠️ خطأ في تقييم الشرط:', condition, e);
        return false;
    }
};

// 5. التحقق من الإنجازات الجديدة
window.checkAndUnlockAchievements = async function() {
    console.log('🔍 checkAndUnlockAchievements started');
    const defs = await window.loadAchievementDefinitions();
    if (!defs.length) {
        console.warn('⚠️ لا توجد إنجازات للتحقق');
        return;
    }
    
    let earned = window.getEarnedAchievements();
    const stats = window.collectStats();
    let newUnlocks = [];

    for (const ach of defs) {
        if (earned.includes(ach.id)) continue;
        if (window.evaluateCondition(ach.condition, stats)) {            earned.push(ach.id);
            newUnlocks.push(ach);
            console.log('🎉 إنجاز جديد:', ach.name);
        }
    }

    if (newUnlocks.length > 0) {
        localStorage.setItem('earned_achievements', JSON.stringify(earned));
        newUnlocks.forEach(a => window.showAchievementToast(a.name, a.description, a.icon));
        if (document.querySelector('.games-grid')) window.loadAchievementsPage();
    }
    console.log('✅ checkAndUnlockAchievements completed');
};

// 6. عرض إشعار الإنجاز
window.showAchievementToast = function(title, desc, icon) {
    console.log('📢 Toast:', title);
    const old = document.querySelector('.ach-toast');
    if (old) old.remove();
    
    const t = document.createElement('div');
    t.className = 'ach-toast';
    t.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-100px);background:linear-gradient(135deg,#f1c40f,#f39c12);color:#fff;padding:15px 25px;border-radius:50px;box-shadow:0 10px 25px rgba(0,0,0,0.3);z-index:9999;font-family:'Cairo',sans-serif;text-align:center;min-width:280px;transition:all 0.5s;opacity:0;display:flex;flex-direction:column;align-items:center;border:2px solid #fff;";
    t.innerHTML = `<div style="font-size:1.4rem;font-weight:bold;margin-bottom:5px;"><i class="${icon||'fas fa-trophy'}" style="margin-left:8px;"></i>${title}</div><div style="font-size:0.85rem;opacity:0.9;">${desc}</div>`;
    
    document.body.appendChild(t);
    setTimeout(() => { t.style.transform = "translateX(-50%) translateY(0)"; t.style.opacity = "1"; }, 10);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(-100px)"; setTimeout(()=>t.remove(), 500); }, 4000);
};

// 7. عرض صفحة الإنجازات (لا تتوقع باراميتر)
window.loadAchievementsPage = async function() {
    console.log('🎯 loadAchievementsPage started');
    
    const main = document.getElementById('main-content');
    if (!main) {
        console.error('❌ main-content not found');
        return;
    }

    main.innerHTML = '<div style="text-align:center;padding:50px;color:var(--text-primary, #333);">جاري التحميل... 🏆</div>';

    try {
        const all = await window.loadAchievementDefinitions();
        const earned = window.getEarnedAchievements();

        console.log('📊 الإنجازات:', all.length, '| المحققة:', earned.length);

        if (!all || all.length === 0) {
            main.innerHTML = '<div style="text-align:center;padding:50px;color:#e74c3c;">لا توجد إنجازات متاحة.</div>';            return;
        }

        const groups = {};
        all.forEach(item => {
            const parts = item.id.split('_');
            if (parts.length < 2) return;
            const key = parts[0];
            
            if (!groups[key]) {
                let title = key, desc = "";
                if(key==='beg') { title="المبتدئ"; desc="أسئلة سهلة"; }
                else if(key==='int') { title="المتوسط"; desc="تحديات متوسطة"; }
                else if(key==='adv') { title="المتقدم"; desc="مسائل صعبة"; }
                else if(key==='cmp') { title="المعقد"; desc="للأبطال فقط"; }
                else if(key==='spd') { title="السرعة"; desc="تحدي الوقت"; }
                else if(key==='mnt') { title="ذهني"; desc="حساب سريع"; }
                else if(key==='mix') { title="مختلط"; desc="عمليات متنوعة"; }
                else if(key==='crs') { title="متقاطع"; desc="ألغاز شبكية"; }
                else if(key==='lod') { title="لودوكو"; desc="شبكات منطقية"; }
                else if(key==='sld') { title="انزلاق"; desc="ترتيب أرقام"; }
                groups[key] = { title, desc, stars: [], crowns: [] };
            }

            if (item.id.includes('star') || (item.icon && item.icon.includes('star'))) {
                groups[key].stars.push(item);
            } else {
                groups[key].crowns.push(item);
            }
        });

        const order = ['beg','int','adv','cmp','spd','mnt','mix','crs','lod','sld'];
        const sortedKeys = Object.keys(groups).sort((a,b) => order.indexOf(a) - order.indexOf(b));

        let html = `<style>
            .ach-page-container { direction: rtl; max-width: 1200px; margin: auto; padding: 20px; font-family: 'Cairo', sans-serif; }
            .ach-title { text-align: center; color: var(--text-primary, #333); margin-bottom: 30px; font-size: 2rem; }
            .ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
            .ach-card { background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e0e0e0); border-radius: 15px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s, border-color 0.2s; }
            .ach-card:hover { transform: translateY(-3px); border-color: var(--accent-color, #4a6fa5); }
            .ach-card-title { margin: 0 0 5px 0; color: var(--text-primary, #333); font-size: 1.1rem; font-weight: bold; }
            .ach-card-desc { margin: 0 0 10px 0; color: var(--text-secondary, #666); font-size: 0.8rem; }
            .ach-icons-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 10px; min-height: 24px; flex-wrap: wrap; }
            .ach-stars-box { background: var(--bg-secondary, #f5f5f5); padding: 8px; border-radius: 8px; width: 100%; display: flex; justify-content: center; flex-wrap: wrap; gap: 3px; margin-bottom: 10px; }
            .ach-count { font-size: 0.75rem; color: var(--text-secondary, #666); margin-top: auto; }
            .ach-count span { color: var(--accent-color, #27ae60); font-weight: bold; }
            .icon-star { font-size: 1rem; margin: 2px; transition: 0.3s; }
            .icon-crown { font-size: 1.2rem; margin: 2px; transition: 0.3s; }
            .icon-on { text-shadow: 0 0 5px rgba(255,215,0,0.6); }
            .icon-off { color: var(--text-secondary, #ccc) !important; text-shadow: none; }            @media(max-width: 600px) { .ach-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; } .ach-card { padding: 10px 5px !important; } .ach-card-title { font-size: 0.9rem !important; } .ach-card-desc { display: none; } }
        </style>

        <div class="ach-page-container">
            <h2 class="ach-title">🏆 لوحة الإنجازات</h2>
            <div class="ach-grid">`;

        sortedKeys.forEach(key => {
            const g = groups[key];
            const sCount = g.stars.filter(s => earned.includes(s.id)).length;
            const cCount = g.crowns.filter(c => earned.includes(c.id)).length;
            
            const starsHTML = g.stars.map(s => {
                const isOn = earned.includes(s.id);
                const color = isOn ? '#f1c40f' : 'var(--text-secondary, #ccc)';
                const shadow = isOn ? '0 0 5px rgba(241, 196, 15, 0.6)' : 'none';
                return `<i class="${s.icon||'fas fa-star'} icon-star ${isOn?'icon-on':'icon-off'}" style="color:${color}; text-shadow:${shadow};" title="${s.name}"></i>`;
            }).join('');

            const crownsHTML = g.crowns.map(c => {
                const isOn = earned.includes(c.id);
                const color = isOn ? '#e67e22' : 'var(--text-secondary, #ccc)';
                const shadow = isOn ? '0 0 8px rgba(230, 126, 34, 0.6)' : 'none';
                return `<i class="${c.icon||'fas fa-crown'} icon-crown ${isOn?'icon-on':'icon-off'}" style="color:${color}; text-shadow:${shadow};" title="${c.name}"></i>`;
            }).join('');

            html += `<div class="ach-card">
                <h3 class="ach-card-title">${g.title}</h3>
                <p class="ach-card-desc">${g.desc}</p>
                <div class="ach-icons-row">${crownsHTML || '<span style="font-size:0.7rem; color:var(--border-color, #eee);">-</span>'}</div>
                <div class="ach-stars-box">${starsHTML}</div>
                <div class="ach-count">المكتمل: <span>${sCount+cCount}</span> / ${g.stars.length + g.crowns.length}</div>
            </div>`;
        });

        html += `</div></div>`;
        main.innerHTML = html;
        console.log('✅ loadAchievementsPage completed');

    } catch (e) {
        console.error('❌ Error in loadAchievementsPage:', e);
        main.innerHTML = `<div style="text-align:center;padding:50px;color:#e74c3c;">حدث خطأ أثناء التحميل: ${e.message}</div>`;
    }
};

// تأكيد التحميل
console.log('✅ achievements.js loaded successfully!');
console.log('✅ window.loadAchievementsPage:', typeof window.loadAchievementsPage);
console.log('✅ window.checkAndUnlockAchievements:', typeof window.checkAndUnlockAchievements);