/**
 * 🎮 GameCore - النظام الموحد للألعاب
 * يدير: النقاط، الأرواح، التلميحات، الحفظ، التنظيف
 */
(function() {
    'use strict';
    
    const GameCore = {
        // إعدادات افتراضية
        defaults: {
            pointsPerCorrect: 10,
            hintCost: 15,
            freeHints: 3,
            lives: 3
        },
        
        // الحصول على النقاط
        getPoints: () => parseInt(localStorage.getItem('math_user_points') || '0'),
        
        // إضافة/خصم نقاط
        addPoints: (n) => {
            const cur = GameCore.getPoints();
            localStorage.setItem('math_user_points', (cur + n).toString());
            return cur + n;
        },
        deductPoints: (n) => {
            const cur = GameCore.getPoints();
            const newVal = Math.max(0, cur - n);
            localStorage.setItem('math_user_points', newVal.toString());
            return newVal;
        },
        
        // إدارة التلميحات
        useHint: (gameId, onResult) => {
            const key = `hints_${gameId}`;
            const saved = JSON.parse(localStorage.getItem(key) || '{}');
            const free = saved.free ?? GameCore.defaults.freeHints;
            
            if (free > 0) {
                saved.free = free - 1;
                localStorage.setItem(key, JSON.stringify(saved));
                onResult?.(true, 'free');
            } else if (GameCore.getPoints() >= GameCore.defaults.hintCost) {
                if (confirm('شراء تلميح بـ 15 نقطة؟')) {
                    GameCore.deductPoints(GameCore.defaults.hintCost);
                    saved.used = (saved.used || 0) + 1;
                    localStorage.setItem(key, JSON.stringify(saved));
                    onResult?.(true, 'bought');
                } else onResult?.(false, 'cancelled');
            } else onResult?.(false, 'no_points');
        },
        
        // حفظ تقدم اللعبة
        saveProgress: (gameId, data) => {
            localStorage.setItem(`progress_${gameId}`, JSON.stringify({
                ...data, lastPlayed: Date.now()
            }));
        },
        loadProgress: (gameId) => {
            try {
                return JSON.parse(localStorage.getItem(`progress_${gameId}`) || '{}');
            } catch { return {}; }
        },
        
        // Toast موحد
        toast: (msg, type = 'info') => {
            if (typeof window.showToast === 'function') {
                window.showToast(msg, type);
            } else {
                const t = document.createElement('div');
                t.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${type==='error'?'#e74c3c':'#27ae60'};color:#fff;padding:12px 25px;border-radius:30px;z-index:9999;font-family:Cairo;`;
                t.textContent = msg;
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 3000);
            }
        },
        
        // تنظيف الموارد
        cleanup: (gameId) => {
            if (window._ResourceManager?.cleanup) {
                window._ResourceManager.cleanup(gameId);
            }
        }
    };
    
    window.GameCore = GameCore;
    console.log('✅ GameCore loaded');
})();