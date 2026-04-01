// ==========================================
// 🎮 GameCore - النظام الموحد للألعاب v5.1 (سريع)
// MathLinguistic - إدارة الحالة والتنظيف الشامل
// ==========================================

(function() {
  'use strict';
  
  const GAME_CORE_VERSION = '5.1.0';
  
  // حالة الألعاب النشطة
  const activeGames = new Map();
  
  // جميع المؤقتات النشطة في النظام
  const allTimers = {
    intervals: new Set(),
    timeouts: new Set()
  };
  
  // علم لمنع التنفيذ أثناء التنقل
  let isNavigationInProgress = false;
  let currentActiveGameId = null;
  
  // مفاتيح localStorage الموحدة
  const STORAGE_KEYS = {
    POINTS: 'ml_user_points',
    PROGRESS: 'ml_progress_v5',
    SPEED_DATA: 'ml_speed_data',
    SLIDING_DATA: 'ml_sliding_data'
  };
  
  // ==========================================
  // إدارة المؤقتات العالمية
  // ==========================================
  
  function registerInterval(intervalId) {
    allTimers.intervals.add(intervalId);
    return intervalId;
  }
  
  function unregisterInterval(intervalId) {
    allTimers.intervals.delete(intervalId);
  }
  
  function registerTimeout(timeoutId) {
    allTimers.timeouts.add(timeoutId);
    return timeoutId;
  }
  
  function unregisterTimeout(timeoutId) {    allTimers.timeouts.delete(timeoutId);
  }
  
  function clearAllTimers() {
    // إيقاف جميع الـ intervals
    for (const intervalId of allTimers.intervals) {
      try { clearInterval(intervalId); } catch(e) {}
    }
    allTimers.intervals.clear();
    
    // إيقاف جميع الـ timeouts
    for (const timeoutId of allTimers.timeouts) {
      try { clearTimeout(timeoutId); } catch(e) {}
    }
    allTimers.timeouts.clear();
    
    console.log('🛑 GameCore: تم إيقاف جميع المؤقتات');
  }
  
  // ==========================================
  // التحقق من حالة اللعبة النشطة
  // ==========================================
  
  function canExecuteGame(gameId) {
    if (isNavigationInProgress) {
      return false;
    }
    
    if (currentActiveGameId && currentActiveGameId !== gameId) {
      return false;
    }
    
    if (!activeGames.has(gameId)) {
      return false;
    }
    
    return true;
  }
  
  function setActiveGame(gameId) {
    currentActiveGameId = gameId;
    isNavigationInProgress = false;
  }
  
  function clearActiveGame() {
    currentActiveGameId = null;
  }
  
  // ==========================================
  // إدارة النقاط  // ==========================================
  
  function getPoints() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.POINTS) || '0');
    } catch (e) {
      return 0;
    }
  }
  
  function addPoints(amount, reason = '', gameId = '') {
    try {
      const current = getPoints();
      const newTotal = current + amount;
      localStorage.setItem(STORAGE_KEYS.POINTS, newTotal.toString());
      updatePointsDisplay(newTotal);
      return newTotal;
    } catch (e) {
      return getPoints();
    }
  }
  
  function deductPoints(amount, reason = '') {
    try {
      const current = getPoints();
      const newTotal = Math.max(0, current - amount);
      localStorage.setItem(STORAGE_KEYS.POINTS, newTotal.toString());
      return newTotal;
    } catch (e) {
      return getPoints();
    }
  }
  
  function updatePointsDisplay(newTotal) {
    const pointElements = document.querySelectorAll('.gc-points-display');
    pointElements.forEach(el => {
      el.textContent = newTotal.toString();
    });
  }
  
  // ==========================================
  // إدارة التقدم (حفظ/تحميل)
  // ==========================================
  
  function saveProgress(gameId, data) {
    try {
      const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
      allProgress[gameId] = {
        ...data,
        lastPlayed: Date.now(),        version: GAME_CORE_VERSION
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
      return true;
    } catch (e) {
      return false;
    }
  }
  
  function loadProgress(gameId) {
    try {
      const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
      return allProgress[gameId] || null;
    } catch (e) {
      return null;
    }
  }
  
  function resetProgress(gameId) {
    try {
      const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
      delete allProgress[gameId];
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
      return true;
    } catch (e) {
      return false;
    }
  }
  
  function hasProgress(gameId) {
    const progress = loadProgress(gameId);
    return progress !== null && progress !== undefined;
  }
  
  // ==========================================
  // إدارة الأرواح
  // ==========================================
  
  function getLives(gameId) {
    const progress = loadProgress(gameId);
    return progress?.lives ?? 3;
  }
  
  function setLives(gameId, lives) {
    const progress = loadProgress(gameId) || {};
    progress.lives = lives;
    saveProgress(gameId, progress);
    return lives;
  }
    function deductLife(gameId) {
    const current = getLives(gameId);
    const newLives = Math.max(0, current - 1);
    setLives(gameId, newLives);
    return newLives;
  }
  
  function resetLives(gameId, baseLives = 3) {
    return setLives(gameId, baseLives);
  }
  
  // ==========================================
  // نظام الرسائل Toast (بديل alert)
  // ==========================================
  
  let currentToast = null;
  let toastQueue = [];
  
  function toast(message, type = 'info', duration = 2000) {
    toastQueue.push({ message, type, duration });
    if (!currentToast) {
      processToastQueue();
    }
  }
  
  function processToastQueue() {
    if (toastQueue.length === 0) {
      currentToast = null;
      return;
    }
    
    const { message, type, duration } = toastQueue.shift();
    
    if (currentToast) {
      currentToast.remove();
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `gc-toast gc-toast-${type}`;
    
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      info: '#3498db',
      warning: '#f39c12'
    };
    
    const icons = {
      success: '✅',
      error: '❌',      info: 'ℹ️',
      warning: '⚠️'
    };
    
    toastEl.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type] || colors.info};
      color: #fff;
      padding: 12px 24px;
      border-radius: 25px;
      z-index: 999999;
      font-weight: bold;
      font-size: 1rem;
      font-family: 'Cairo', sans-serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: gc-slideDown 0.3s ease;
      max-width: 90%;
      text-align: center;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    toastEl.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
    document.body.appendChild(toastEl);
    currentToast = toastEl;
    
    const timeoutId = registerTimeout(setTimeout(() => {
      if (toastEl && toastEl.parentNode) {
        toastEl.style.opacity = '0';
        toastEl.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          toastEl.remove();
          currentToast = null;
          unregisterTimeout(timeoutId);
          processToastQueue();
        }, 300);
      }
    }, duration));
  }
  
  // ==========================================
  // نافذة تأكيد مخصصة (بديل confirm)
  // ==========================================
  
  function confirmAction(title, message, onConfirm, onCancel) {
    const existingModal = document.querySelector('.gc-modal-overlay');    if (existingModal) {
      existingModal.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'gc-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #ffffff;
      border-radius: 15px;
      padding: 25px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      font-family: 'Cairo', sans-serif;
      text-align: center;
    `;
    
    modal.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 10px;">🤔</div>
      <h3 style="margin: 0 0 10px 0; color: #9b59b6; font-size: 1.3rem;">${title}</h3>
      <p style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1rem;">${message}</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="gc-modal-cancel" class="gc-btn gc-btn-secondary" style="flex: 1;">إلغاء</button>
        <button id="gc-modal-confirm" class="gc-btn gc-btn-primary" style="flex: 1;">تأكيد</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const closeModal = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      setTimeout(() => {
        overlay.remove();
      }, 200);    };
    
    document.getElementById('gc-modal-confirm').onclick = () => {
      closeModal();
      if (onConfirm) onConfirm();
    };
    
    document.getElementById('gc-modal-cancel').onclick = () => {
      closeModal();
      if (onCancel) onCancel();
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
        if (onCancel) onCancel();
      }
    };
  }
  
  // ==========================================
  // إدارة الألعاب النشطة
  // ==========================================
  
  function registerGame(gameId, cleanupFn) {
    // تنظيف أي لعبة سابقة أولاً
    if (activeGames.size > 0) {
      cleanupAll();
    }
    
    activeGames.set(gameId, {
      cleanupFn,
      startTime: Date.now()
    });
    
    setActiveGame(gameId);
    console.log(`🎮 GameCore: تم تسجيل ${gameId}`);
  }
  
  function cleanupGame(gameId) {
    if (activeGames.has(gameId)) {
      const game = activeGames.get(gameId);
      if (game.cleanupFn) {
        try {
          game.cleanupFn();
        } catch (e) {
          console.error(`❌ GameCore: خطأ في تنظيف ${gameId}:`, e);
        }
      }
      activeGames.delete(gameId);    }
    
    if (currentActiveGameId === gameId) {
      clearActiveGame();
    }
  }
  
  // ⚡ تحسين cleanupAll: إزالة سريعة لجميع العناصر دون تكرار
  function cleanupAll() {
    console.log('🧹 GameCore: تنظيف شامل...');
    var startTime = performance.now();
    
    // 1. إيقاف جميع المؤقتات
    clearAllTimers();
    
    // 2. ✅ إزالة جميع رسائل Toast بسرعة (باستخدام querySelectorAll)
    try {
      var toasts = document.querySelectorAll('.gc-toast, [class*="toast"]');
      // استخدام حلقة عكسية لتجنب مشاكل إزالة العناصر أثناء التكرار
      for (var i = toasts.length - 1; i >= 0; i--) {
        if (toasts[i].parentNode) {
          toasts[i].parentNode.removeChild(toasts[i]);
        }
      }
      // إعادة تعيين المتغيرات
      currentToast = null;
      toastQueue = [];
    } catch (e) {
      console.warn('⚠️ خطأ في إزالة toasts:', e);
    }
    
    // 3. تنظيف الألعاب
    for (var key of activeGames.keys()) {
      var game = activeGames.get(key);
      if (game && game.cleanupFn) {
        try {
          game.cleanupFn();
        } catch (e) {
          console.error('Cleanup error for ' + key + ':', e);
        }
      }
    }
    
    activeGames.clear();
    clearActiveGame();
    
    console.log('✅ GameCore: اكتمل (' + (performance.now() - startTime) + 'ms)');
  }
  
  function isActiveGame(gameId) {
    return activeGames.has(gameId);
  }
  
  // ==========================================
  // إدارة التنقل
  // ==========================================
  
  function startNavigation() {
    isNavigationInProgress = true;
    clearAllTimers();
    cleanupAll();
  }
  
  function endNavigation() {
    isNavigationInProgress = false;
  }
  
  // ==========================================  // مكونات UI الموحدة
  // ==========================================
  
  function createButton(text, onClick, options = {}) {
    const btn = document.createElement('button');
    btn.className = `gc-btn gc-btn-${options.variant || 'primary'}`;
    btn.textContent = text;
    
    const wrappedOnClick = function(e) {
      if (isNavigationInProgress) {
        e.preventDefault();
        return false;
      }
      return onClick(e);
    };
    
    btn.onclick = wrappedOnClick;
    
    if (options.disabled) btn.disabled = true;
    if (options.id) btn.id = options.id;
    
    return btn;
  }
  
  function createHeader(title, showHomeBtn = true) {
    const header = document.createElement('div');
    header.className = 'gc-header';
    
    const h2 = document.createElement('h2');
    h2.textContent = title;
    header.appendChild(h2);
    
    if (showHomeBtn) {
      const homeBtn = createButton('🏠 الرئيسية', () => {
        startNavigation();
        if (typeof window.loadHomePage === 'function') {
          setTimeout(() => {
            loadHomePage();
            endNavigation();
          }, 100);
        }
      }, { variant: 'secondary' });
      header.appendChild(homeBtn);
    }
    
    return header;
  }
  
  function createStatsBar(stats) {
    const bar = document.createElement('div');    bar.className = 'gc-stats-bar';
    
    for (const [key, value] of Object.entries(stats)) {
      const span = document.createElement('span');
      span.innerHTML = value;
      bar.appendChild(span);
    }
    
    return bar;
  }
  
  // ==========================================
  // إضافة الأنماط الأساسية
  // ==========================================
  
  if (!document.getElementById('gc-core-styles')) {
    const style = document.createElement('style');
    style.id = 'gc-core-styles';
    style.textContent = `
      @keyframes gc-slideDown {
        from { top: 20px; opacity: 0; }
        to { top: 80px; opacity: 1; }
      }
      @keyframes gc-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .gc-shake { animation: gc-shake 0.3s ease; }
    `;
    document.head.appendChild(style);
  }
  
  // ==========================================
  // تصدير الدوال العامة
  // ==========================================
  
  window.GameCore = {
    version: GAME_CORE_VERSION,
    
    // النقاط
    getPoints,
    addPoints,
    deductPoints,
    
    // التقدم
    saveProgress,
    loadProgress,
    resetProgress,
    hasProgress,    
    // الأرواح
    getLives,
    setLives,
    deductLife,
    resetLives,
    
    // الرسائل
    toast,
    confirmAction,
    
    // إدارة الألعاب
    registerGame,
    cleanupGame,
    cleanupAll,
    isActiveGame,
    canExecuteGame,
    
    // التنقل
    startNavigation,
    endNavigation,
    
    // مكونات UI
    createButton,
    createHeader,
    createStatsBar,
    
    // المؤقتات
    registerInterval,
    unregisterInterval,
    registerTimeout,
    unregisterTimeout,
    
    // مفاتيح التخزين
    STORAGE_KEYS
  };
  
  console.log(`✅ GameCore v${GAME_CORE_VERSION} جاهز`);
  
})();