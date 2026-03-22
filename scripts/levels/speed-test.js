/**
 * 🛡️ نظام منع التداخل المدمج - لا تحذف هذا الجزء
 */
(function() {
    if (window._ResourceManager) return;
    const resources = new Map(); const styles = new Map();
    window._ResourceManager = {
        register: function(gameId, cleanupFn) {
            if (resources.has(gameId)) { try { resources.get(gameId)(); } catch(e) {} }
            resources.set(gameId, cleanupFn);
        },
        cleanup: function(gameId) {
            if (resources.has(gameId)) { try { resources.get(gameId)(); } catch(e) {} resources.delete(gameId); }
        },
        cleanupAll: function() { for (const [id, fn] of resources) { try { fn(); } catch(e) {} } resources.clear(); },
        addStyle: function(styleId, css) {
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style'); style.id = styleId; style.textContent = css;
            document.head.appendChild(style);
            styles.set(styleId, () => { const el = document.getElementById(styleId); if(el) el.remove(); });
        },
        removeStyle: function(styleId) { const el = document.getElementById(styleId); if(el) el.remove(); styles.delete(styleId); }
    };
    window.addEventListener('beforeunload', () => window._ResourceManager?.cleanupAll());
    window.safeNavigate = function(loaderFn, gameId) {
        window._ResourceManager?.cleanupAll();
        setTimeout(() => { window.scrollTo(0,0); if(typeof loaderFn === 'function') loaderFn(); }, 50);
    };
})();

// === متغيرات التحكم الجديدة ===
window.speedTestVersion = 0;
window.speedTestInterval = null;
let speedTestData = null;

// === إدارة النقاط ===
const getPoints = () => parseInt(localStorage.getItem('math_user_points') || '0');
const setPoints = (p) => localStorage.setItem('math_user_points', Math.max(0, p).toString());

// === دالة التنبيه المخصصة ===
function showCustomAlert(title, message, isConfirm = false, onConfirm = null) {
  const oldModal = document.getElementById('custom-alert-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'custom-alert-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h3>${title}</h3>        <p>${message}</p>
        <div class="modal-btns">
          <button class="modal-btn-ok" id="modal-ok">حسناً</button>
          ${isConfirm ? `<button class="modal-btn-cancel" id="modal-cancel">إلغاء</button>` : ''}
        </div>
      </div>
    </div>
    <style>
      .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:2000; animation: fadeIn 0.2s; }
      .modal-content { background: white; padding: 25px; border-radius: 20px; text-align: center; max-width: 320px; width: 85%; box-shadow: 0 15px 30px rgba(0,0,0,0.3); }
      .modal-btns { display: flex; gap: 12px; justify-content: center; margin-top: 25px; }
      .modal-btn-ok { background: #27ae60; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; flex: 1; font-weight: bold; }
      .modal-btn-cancel { background: #95a5a6; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; flex: 1; font-weight: bold; }
      [data-theme="dark"] .modal-content { background: #1e272e; color: white; }
    </style>
  `;
  document.body.appendChild(modal);
  document.getElementById('modal-ok').onclick = () => { modal.remove(); if (onConfirm) onConfirm(); };
  if (isConfirm) document.getElementById('modal-cancel').onclick = () => modal.remove();
}

// === دالة التنظيف ===
window.destroySpeedTest = function() {
    window.speedTestVersion++;
    if (window.speedTestInterval) { clearInterval(window.speedTestInterval); window.speedTestInterval = null; }
    if (speedTestData?.timerInterval) { clearInterval(speedTestData.timerInterval); }
    window._ResourceManager?.cleanup('speed-test');
    speedTestData = null;
};

// === توليد الأسئلة ===
function generateLevel(level) {
  const count = 5 + (level - 1) * 3;
  const questions = [];
  const ops = ['+', '-', '×', '÷'];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const op = ops[Math.floor(Math.random() * 4)];
    let text, answer;
    if (op === '+') { text = `${a} + ${b}`; answer = a + b; }
    else if (op === '-') { 
      const min = Math.max(a, b); 
      const sub = Math.min(a, b); 
      text = `${min} - ${sub}`; 
      answer = min - sub; 
    }
    else if (op === '×') { 
      const ma = Math.floor(Math.random() * 12) + 2; 
      const mb = Math.floor(Math.random() * 10) + 2; 
      text = `${ma} × ${mb}`; 
      answer = ma * mb; 
    }
    else { 
      const div = Math.floor(Math.random() * 10) + 1; 
      const target = (Math.floor(Math.random() * 10) + 1) * div; 
      text = `${target} ÷ ${div}`; 
      answer = target / div; 
    }
    questions.push({ id: `q_${level}_${i}`, text, answer });
  }
  return { levelNumber: level, questions };
}

// === نظام التلميحات المحسن ===
function useHint() {  
  if (!speedTestData || speedTestData.isProcessing || speedTestData.version !== window.speedTestVersion) return;
  
  const currentPoints = getPoints();
  const remainingFree = speedTestData.maxFreeHints - speedTestData.hintsUsedInLevel;

  if (remainingFree > 0) {
    speedTestData.hintsUsedInLevel++;
    applyHintEffect(`🆓 تلميح مجاني (${speedTestData.maxFreeHints - speedTestData.hintsUsedInLevel} متبقي)`);
  } else {
    showCustomAlert("شراء تلميح", "انتهت التلميحات المجانية. هل تريد شراء تلميح بـ 15 نقطة؟", true, () => {
      if (!speedTestData || speedTestData.version !== window.speedTestVersion) return;
      if (currentPoints >= 15) {
        setPoints(currentPoints - 15);
        speedTestData.hintsUsedInLevel++;
        applyHintEffect('💰 تم شراء تلميح بـ 15 نقطة');
      } else {
        showCustomAlert("عذراً", "نقاطك غير كافية!");
      }
    });
  }
}

function applyHintEffect(statusMsg) {
  if (!speedTestData) return;
  
  const q = getCurrentQuestion();
  if (!q) return;
  
  const hintVal = q.answer.toString().substring(0, 1);
  const msgEl = document.getElementById('game-message');
  if (msgEl) {
    msgEl.innerHTML = `<div class="hint-text">💡 الإجابة تبدأ بـ: ${hintVal}...</div><small>${statusMsg}</small>`;
    msgEl.style.opacity = '1';
    setTimeout(() => { if(msgEl) msgEl.style.opacity = '0.3'; }, 3000);
  }
  
  // تحديث عداد التلميحات فقط
  updateHintCounter();
  updatePointsDisplay();
}

// === دوال التحديث الجزئي (بدون إعادة بناء الصفحة) ===
function updateQuestionDisplay() {
  if (!speedTestData) return;
  
  const q = getCurrentQuestion();
  if (!q) return;
  
  const mathBox = document.querySelector('.math-box');
  if (mathBox) {
    mathBox.textContent = `${q.text} = ؟`;
  }
  
  updateOptions(q.answer);
}

function updateOptions(correctAnswer) {
  const optionsGrid = document.querySelector('.options-grid');
  if (!optionsGrid || !speedTestData) return;
  
  const options = generateOptions(correctAnswer, 4);
  optionsGrid.innerHTML = options.map(o => 
    `<button class="answer-btn" onclick="window.submitSpeedAnswer(${o})">${o}</button>`
  ).join('');
}

function updateHintCounter() {
  if (!speedTestData) return;
  const hintEl = document.getElementById('hint-counter');
  if (hintEl) {
    const freeLeft = Math.max(0, speedTestData.maxFreeHints - speedTestData.hintsUsedInLevel);
    hintEl.textContent = freeLeft > 0 ? `${freeLeft} مجانية` : `بـ 15 نقطة`;
  }
}

function updatePointsDisplay() {
  const pointsEl = document.getElementById('points-display');
  if (pointsEl) {
    pointsEl.textContent = getPoints();
  }
}

function updateLevelDisplay() {
  if (!speedTestData) return;
  const levelEl = document.querySelector('.status-bar span:first-child');
  if (levelEl) {
    levelEl.textContent = `المستوى: ${speedTestData.currentLevel}`;
  }
}

// === إدارة اللعبة والمؤقت ===
function startTimer() {
  if (!speedTestData || speedTestData.version !== window.speedTestVersion) return;
  if (speedTestData.timerInterval) clearInterval(speedTestData.timerInterval);
  
  speedTestData.startTime = Date.now();
  speedTestData.timeLeft = speedTestData.timeLimit;
  updateTimerDisplay(speedTestData.timeLimit);
  
  speedTestData.timerInterval = setInterval(() => {
    if (speedTestData.version !== window.speedTestVersion) { 
      clearInterval(speedTestData.timerInterval); 
      return; 
    }
    
    const elapsed = Math.floor((Date.now() - speedTestData.startTime) / 1000);
    const remaining = speedTestData.timeLimit - elapsed;
    speedTestData.timeLeft = remaining;
    
    if (remaining <= 0) { 
      clearInterval(speedTestData.timerInterval); 
      handleTimeUp(); 
    } else { 
      updateTimerDisplay(remaining); 
    }
  }, 1000);
}

function updateTimerDisplay(rem) {
  const el = document.getElementById('question-timer');
  if (el) {    
    el.textContent = rem;
    el.style.color = rem <= 5 ? '#ff4757' : '#ffa502'; 
  }
}

function handleTimeUp() {
  showMessage('⏳ انتهى الوقت!', 'error');
  
  // تعطيل الأزرار مؤقتاً
  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
  
  setTimeout(() => {
    if (speedTestData && speedTestData.version === window.speedTestVersion) {
      nextQuestion();
    }
  }, 1500);
}

function showMessage(text, type) {
  const el = document.getElementById('game-message');
  if (el) {
    el.textContent = text;
    el.className = `msg-box ${type}`;
    el.style.opacity = '1';
    
    // رسائل الخطأ تختفي بعد 2 ثانية
    if (type === 'error') {
      setTimeout(() => { 
        if(el && speedTestData && speedTestData.version === window.speedTestVersion) {
          el.style.opacity = '0'; 
        }
      }, 2000);
    }
  }
}

function submitAnswer(val) {
  if (!speedTestData || speedTestData.isProcessing || speedTestData.version !== window.speedTestVersion) return;
  
  const q = getCurrentQuestion();
  if (!q) return;
  
  clearInterval(speedTestData.timerInterval);
  speedTestData.isProcessing = true;
  
  if (Math.abs(val - q.answer) < 0.1) {
    const earned = speedTestData.attempts === 0 ? 5 : 2;
    setPoints(getPoints() + earned);
    showMessage(`✅ +${earned} نقطة`, 'success');
    saveAnswerForAchievements(q.id, true, speedTestData.hintsUsedInLevel > 0);
    updatePointsDisplay();
    
    if (typeof window.checkAndUnlockAchievements === 'function') { 
      window.checkAndUnlockAchievements(); 
    }
    
    setTimeout(() => {
      if (speedTestData && speedTestData.version === window.speedTestVersion) {
        nextQuestion();
      }
    }, 1000);
  } else {
    speedTestData.attempts++;
    
    if (speedTestData.attempts >= 2) {
      showMessage(`❌ الإجابة: ${q.answer}`, 'error');
      setTimeout(() => {
        if (speedTestData && speedTestData.version === window.speedTestVersion) {
          nextQuestion();
        }
      }, 1500);
    } else {
      speedTestData.isProcessing = false;
      showMessage(`❌ حاول مجدداً`, 'error');
      startTimer();
    }
  }
}

function nextQuestion() {
  if (!speedTestData || speedTestData.version !== window.speedTestVersion) return;
  
  speedTestData.isProcessing = false;
  speedTestData.attempts = 0;
  
  const levelData = speedTestData.levels[speedTestData.currentLevel - 1];
  speedTestData.currentQuestionIndex++;
  
  if (speedTestData.currentQuestionIndex >= levelData.questions.length) {
    speedTestData.currentLevel++;
    speedTestData.currentQuestionIndex = 0;
    speedTestData.hintsUsedInLevel = 0; 
  }
  
  if (speedTestData.currentLevel > 50) {
    endGame();
  } else {
    // تحديث الواجهة بدون إعادة بناء كامل
    updateLevelDisplay();
    updateHintCounter();
    updateQuestionDisplay();
    startTimer();
    
    // إعادة تمكين الأزرار وإخفاء رسالة الخطأ
    document.querySelectorAll('.answer-btn').forEach(b => b.disabled = false);
    const msgEl = document.getElementById('game-message');
    if (msgEl) msgEl.style.opacity = '0';
  }
}

function getCurrentQuestion() { 
  if (!speedTestData) return null;
  return speedTestData.levels[speedTestData.currentLevel - 1].questions[speedTestData.currentQuestionIndex]; 
}

// === الواجهة الرئيسية (تُبنى مرة واحدة فقط) ===
function renderUI() {
  if (!speedTestData || speedTestData.version !== window.speedTestVersion) return;
  
  const q = getCurrentQuestion();
  if (!q) return;
  
  const theme = document.body.getAttribute('data-theme') || 'light';
  const options = generateOptions(q.answer, 4);
  const main = document.getElementById('main-content');
  const freeLeft = Math.max(0, speedTestData.maxFreeHints - speedTestData.hintsUsedInLevel);
  const hintDisplay = freeLeft > 0 ? `${freeLeft} مجانية` : `بـ 15 نقطة`;

  main.innerHTML = `
    <div class="speed-game-wrapper ${theme}">
      <div class="status-bar">
        <span>المستوى: ${speedTestData.currentLevel}</span>
        <span>النقاط: <b id="points-display">${getPoints()}</b></span>
        <span>التلميحات: <b id="hint-counter">${hintDisplay}</b></span>
      </div>
      <div class="game-card">
        <div class="timer-circle"><span id="question-timer">15</span></div>
        <div class="math-box">${q.text} = ؟</div>
        <div id="game-message" class="msg-box"></div>
        <div class="options-grid">
          ${options.map(o => `<button class="answer-btn" onclick="window.submitSpeedAnswer(${o})">${o}</button>`).join('')}
        </div>
        <div class="action-footer">
          <button class="side-btn hint" onclick="window.useSpeedHint()">💡 تلميح</button>
          <button class="side-btn restart" onclick="window.restartSpeedGame()">🔄 إعادة</button>
        </div>
      </div>
    </div>
    <style>
      .speed-game-wrapper { max-width: 450px; margin: auto; padding: 15px; direction: rtl; }
      .status-bar { display: flex; justify-content: space-between; padding: 12px; background: rgba(0,0,0,0.07); border-radius: 12px; margin-bottom: 15px; font-weight: bold; }
      .game-card { background: var(--card-bg, #fff); border-radius: 25px; padding: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); text-align: center; min-height: 480px; display: flex; flex-direction: column; justify-content: space-between; }
      .timer-circle { width: 65px; height: 65px; border: 4px solid #f1f1f1; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; }
      .math-box { font-size: 2.6rem; font-weight: bold; margin: 15px 0; color: #2d3436; }
      .msg-box { min-height: 60px; margin: 5px 0; font-weight: bold; transition: opacity 0.4s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; }
      .answer-btn { padding: 18px; border: none; background: #0984e3; color: white; border-radius: 15px; font-size: 1.3rem; cursor: pointer; transition: 0.2s; font-weight: bold; }
      .answer-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .side-btn { flex: 1; padding: 14px; border: none; border-radius: 12px; color: white; cursor: pointer; font-weight: bold; }
      .side-btn.hint { background: #f1c40f; color: #333; }
      .side-btn.restart { background: #ff7675; }
      .success { color: #27ae60; } .error { color: #e74c3c; } .hint-text { color: #f39c12; font-size: 1.2rem; }
      .dark .game-card { background: #2d3436; color: white; }
      .dark .math-box { color: #ecf0f1; }
    </style>
  `;
  
  startTimer();
}

function generateOptions(corr, count) {
  let s = new Set([corr]);
  while(s.size < count) {
    let dev = Math.floor(Math.random() * 15) + 1;
    let val = Math.random() > 0.5 ? corr + dev : corr - dev;
    if (val >= 0) s.add(val);
  }
  return [...s].sort(() => Math.random() - 0.5);
}

window.loadSpeedTestPage = function() {
  window.destroySpeedTest();
  const currentVersion = ++window.speedTestVersion;
  
  window._ResourceManager?.register('speed-test', () => {
    window.speedTestVersion++;
    if (speedTestData?.timerInterval) { clearInterval(speedTestData.timerInterval); }
  });
  
  speedTestData = {
    levels: Array.from({length: 50}, (_, i) => generateLevel(i+1)),
    currentLevel: 1, 
    currentQuestionIndex: 0,
    timeLimit: 15, 
    hintsUsedInLevel: 0, 
    maxFreeHints: 3,
    attempts: 0, 
    isProcessing: false,
    version: currentVersion,
    timeLeft: 15
  };
  
  localStorage.setItem('speed_test_played', 'true');
  document.getElementById('main-content').innerHTML = `
    <div style="text-align:center; padding: 60px 20px; direction: rtl;">
      <h2 style="font-size: 2.2rem; margin-bottom: 20px;">⚡ تحدي السرعة</h2>
      <p style="margin-bottom: 30px; color: #666;">أجب بسرعة! لديك 3 تلميحات مجانية في كل مستوى.</p>
      <button onclick="window.startSpeedGame()" style="padding: 16px 50px; font-size: 1.4rem; background: #27ae60; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: bold;">إبدأ اللعب</button>
    </div>
  `;
};

window.startSpeedGame = function() {
  if (!speedTestData || speedTestData.version !== window.speedTestVersion) return;
  renderUI();
};

function endGame() {
  if (speedTestData?.timerInterval) clearInterval(speedTestData.timerInterval);
  document.getElementById('main-content').innerHTML = `
    <div style="text-align:center; padding:50px;">
      <h2>🏁 انتهى التحدي!</h2>
      <p>نقاطك الكلية: ${getPoints()}</p>
      <button onclick="window.loadSpeedTestPage()" class="answer-btn" style="margin-top:20px;">إعادة المحاولة</button>
    </div>
  `;
}

window.submitSpeedAnswer = submitAnswer;
window.useSpeedHint = useHint;
window.restartSpeedGame = () => {
  showCustomAlert("إعادة اللعبة", "هل تريد البدء من المستوى الأول مجدداً؟", true, () => window.loadSpeedTestPage());
};

// === حفظ الإجابة لدعم الإنجازات ===
function saveAnswerForAchievements(questionId, isCorrect, usedHint = false) {
  if (!speedTestData) return;
  
  const key = 'mathlinguistic_speed_test_answers';
  let answers = JSON.parse(localStorage.getItem(key) || '{}');
  answers[questionId] = {
    correct: isCorrect,
    usedHint: usedHint,
    timestamp: Date.now(),
    type: 'speed_basic_calc',
    level: speedTestData.currentLevel,
    gameId: 'speed-test'
  };
  localStorage.setItem(key, JSON.stringify(answers));
}