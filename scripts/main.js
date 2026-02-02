// ملف JavaScript الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // تحديث سنة الفوتر
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // تهيئة التنقل
    initNavigation();
    
    // تهيئة القائمة المتنقلة
    initMobileMenu();
    
    // تحميل الصفحة الرئيسية
    loadHomePage();
    
    // إضافة مستمعي الأحداث
    addEventListeners();
});

// تهيئة القائمة المتنقلة
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.innerHTML = mainNav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // إغلاق القائمة عند النقر على رابط
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// تهيئة التنقل
function initNavigation() {
    // تحديد الصفحة الحالية من العنوان
    const path = window.location.hash.substring(1) || 'home';
    updateActiveNavLink(path);
}

// تحديث الرابط النشط في التنقل
function updateActiveNavLink(page) {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// إضافة مستمعي الأحداث
function addEventListeners() {
    // مستمعي الأحداث لأزرار التنقل
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // مستمع حدث لزر الطباعة
    
}

// التنقل بين الصفحات
// ===== دالة التنقل بين الصفحات المحسنة =====
async function navigateToPage(page) {
    // تحديث الرابط النشط في القائمة
    updateActiveNavLink(page);
    
    // تحديث عنوان الصفحة مع الهاش
    window.location.hash = page;
    
    // إغلاق القائمة المتنقلة إذا كانت مفتوحة
    closeMobileMenu();
    
    // إضافة مؤشر تحميل
    //showLoadingIndicator();
    
    // تأخير بسيط لتحسين تجربة المستخدم
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
        switch(page) {
            case 'home':
                await loadHomePage();
                break;
                
            case 'beginner':
                await loadBeginnerLevel();
                break;
                
            case 'intermediate':
                await loadIntermediateLevel();
                break;
                
            case 'advanced':
                await loadAdvancedLevel();
                break;
                
            case 'complex':
                await loadComplexLevel();
                break;
                
            case 'achievements':
                await loadAchievementsPage();
                break;
                
            case 'about':
                await loadStaticPage('من نحن', 'about');
                break;
                
            case 'privacy':
                await loadStaticPage('سياسة الخصوصية', 'privacy');
                break;
                
            case 'terms':
                await loadStaticPage('شروط الاستخدام', 'terms');
                break;
                
            case 'contact':
                await loadStaticPage('اتصل بنا', 'contact');
                break;
                
            default:
                await loadHomePage();
        }
        
        // إخفاء مؤشر التحميل بعد اكتمال التحميل
        hideLoadingIndicator();
        
        // التمرير إلى أعلى الصفحة
        scrollToTop();
        
        // تحديث إحصائيات التقدم
        updateGlobalProgress();
        
    } catch (error) {
        console.error('خطأ في تحميل الصفحة:', error);
        showErrorPage(page);
        hideLoadingIndicator();
    }
}

// ===== دوال مساعدة للتنقل =====

// إغلاق القائمة المتنقلة
function closeMobileMenu() {
    const mainNav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (mainNav && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        if (menuToggle) {
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
}

// عرض مؤشر التحميل
function showLoadingIndicator() {
    // إزالة أي مؤشر تحميل سابق
    hideLoadingIndicator();
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'page-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-overlay">
            <div class="loader">
                <i class="fas fa-spinner fa-spin"></i>
                <p>جاري التحميل...</p>
            </div>
        </div>
    `;
    
    // إضافة الأنماط إذا لم تكن موجودة
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            #page-loading-indicator {
                position: fixed;
                top: 0;
                right: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            
            #page-loading-indicator .loading-overlay {
                text-align: center;
            }
            
            #page-loading-indicator .loader i {
                font-size: 3rem;
                color: var(--accent-color);
                margin-bottom: 1rem;
            }
            
            #page-loading-indicator .loader p {
                color: var(--primary-color);
                font-weight: 600;
                font-size: 1.2rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingIndicator);
}

// إخفاء مؤشر التحميل
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('page-loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.animation = 'fadeOut 0.3s ease';
        
        // إضافة أنيميشن للإخفاء
        if (!document.getElementById('fadeOut-animation')) {
            const style = document.createElement('style');
            style.id = 'fadeOut-animation';
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
            }
        }, 300);
    }
}

// التمرير إلى أعلى الصفحة
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// تحديث التقدم العام
function updateGlobalProgress() {
    // يمكنك إضافة منطق لتحديث التقدم العام هنا
    const progressData = getGlobalProgress();
    
    // تحديث شريط التقدم إذا كان موجوداً
    const globalProgressBar = document.getElementById('global-progress-bar');
    if (globalProgressBar) {
        const progress = calculateOverallProgress(progressData);
        globalProgressBar.style.width = `${progress}%`;
    }
}

// الحصول على التقدم العام
function getGlobalProgress() {
    try {
        const progress = {
            beginner: JSON.parse(localStorage.getItem('mathlinguistic_beginner_progress')) || {},
            intermediate: JSON.parse(localStorage.getItem('mathlinguistic_intermediate_progress')) || {},
            advanced: JSON.parse(localStorage.getItem('mathlinguistic_advanced_progress')) || {},
            complex: JSON.parse(localStorage.getItem('mathlinguistic_complex_progress')) || {}
        };
        return progress;
    } catch (error) {
        return {};
    }
}

// حساب التقدم الإجمالي
function calculateOverallProgress(progressData) {
    let totalSolved = 0;
    let totalProblems = 0;
    
    // حساب المسائل المحلولة في كل مستوى
    Object.values(progressData).forEach(level => {
        if (level.userAnswers) {
            const solved = Object.values(level.userAnswers).filter(answer => answer.answer !== '').length;
            totalSolved += solved;
        }
    });
    
    // يمكنك إضافة عدد المسائل الإجمالي لكل مستوى هنا
    // حالياً سنرجع 0 إذا لم يكن هناك بيانات كافية
    return totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
}

// عرض صفحة الخطأ
function showErrorPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const pageNames = {
        'home': 'الرئيسية',
        'beginner': 'المرحلة الابتدائية',
        'intermediate': 'المرحلة المتوسطة',
        'advanced': 'المرحلة المتقدمة',
        'complex': 'المرحلة المعقدة',
        'achievements': 'الإنجازات',
        'about': 'من نحن',
        'privacy': 'سياسة الخصوصية',
        'terms': 'شروط الاستخدام',
        'contact': 'اتصل بنا'
    };
    
    const pageName = pageNames[page] || 'هذه الصفحة';
    
    mainContent.innerHTML = `
        <section class="level-header">
            <div class="container">
                <h2><i class="fas fa-exclamation-triangle"></i> خطأ في التحميل</h2>
                <p>حدث خطأ أثناء تحميل ${pageName}</p>
            </div>
        </section>
        
        <div class="container">
            <div class="error-container" style="text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 5rem; color: var(--danger-color); margin-bottom: 2rem;">
                    <i class="fas fa-bug"></i>
                </div>
                
                <h3 style="color: var(--danger-color); margin-bottom: 1.5rem;">عذراً، حدث خطأ غير متوقع</h3>
                
                <p style="font-size: 1.2rem; color: #666; margin-bottom: 2.5rem; line-height: 1.6;">
                    لم نتمكن من تحميل ${pageName} بسبب خطأ تقني.<br>
                    يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
                </p>
                
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="navigateToPage('home')">
                        <i class="fas fa-home"></i> العودة للرئيسية
                    </button>
                    
                    <button class="btn-secondary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> إعادة تحميل الصفحة
                    </button>
                    
                    <button class="btn-secondary" onclick="navigateToPage('${page}')">
                        <i class="fas fa-sync-alt"></i> المحاولة مرة أخرى
                    </button>
                </div>
                
                <div style="margin-top: 3rem; padding: 2rem; background: #f8f9fa; border-radius: var(--border-radius); text-align: center;">
                    <h4 style="color: var(--primary-color); margin-bottom: 1rem;">اقتراحات أخرى:</h4>
                    <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="navigateToPage('beginner')" style="margin: 0.5rem;">
                            <i class="fas fa-user-graduate"></i> المرحلة الابتدائية
                        </button>
                        <button class="btn-secondary" onclick="navigateToPage('intermediate')" style="margin: 0.5rem;">
                            <i class="fas fa-chalkboard-teacher"></i> المرحلة المتوسطة
                        </button>
                        <button class="btn-secondary" onclick="navigateToPage('achievements')" style="margin: 0.5rem;">
                            <i class="fas fa-trophy"></i> الإنجازات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// تحميل الصفحة الرئيسية
function loadHomePage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <section class="welcome-section">
            <div class="container">
                <h2><i class="fas fa-star"></i> مرحباً بكم في MathLinguistic</h2>
                <p>منصة تعليمية تفاعلية لتعلم الرياضيات باللغة العربية</p>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <h3>المرحلة الابتدائية</h3>
                        <p>جمع، طرح، تفكيك، النصف والضعف</p>
                        <button class="btn-primary" data-page="beginner">ابدأ التعلم</button>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <h3>المرحلة المتوسطة</h3>
                        <p>ضرب، قسمة، كسور ونسب مئوية</p>
                        <button class="btn-primary" data-page="intermediate">ابدأ التعلم</button>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <h3>المرحلة المتقدمة</h3>
                        <p>معادلات، هندسة، إحصاء واحتمالات</p>
                        <button class="btn-primary" data-page="advanced">ابدأ التعلم</button>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-brain"></i>
                        </div>
                        <h3>مرحلة التحدي</h3>
                        <p>مسائل معقدة وتفكير نقدي</p>
                        <button class="btn-primary" data-page="complex">ابدأ التحدي</button>
                    </div>
                </div>
                
            </div>
        </section>
    `;
    
    // إعادة إضافة مستمعي الأحداث للأزرار الجديدة
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// تحميل صفحة الإنجازات

// تحميل صفحة الإنجازات (نسخة ديناميكية)
async function loadAchievementsPage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // جلب بيانات التقدم من localStorage
    const progressData = getGlobalProgress();
    
    // حساب الإحصائيات الشاملة
    const stats = calculateUserStats(progressData);
    
    // حساب حالة كل إنجاز
    const achievements = evaluateAchievements(progressData, stats);

    // حساب التقدم العام (نسبة مئوية)
    const overallProgress = Math.min(100, Math.max(0, stats.overallProgress));

    // بناء HTML ديناميكي
    let achievementsHTML = '';
    achievements.forEach(ach => {
        let statusClass = 'locked';
        let statusText = 'لم يبدأ';
        let bgColor = '#6c757d'; // رمادي

        if (ach.completed) {
            statusClass = 'completed';
            statusText = 'مكتمل';
            bgColor = '#28a745'; // أخضر
        } else if (ach.current > 0) {
            statusClass = 'in-progress';
            statusText = `قيد التقدم (${ach.current}/${ach.target})`;
            bgColor = '#ffc107'; // أصفر
        }

        achievementsHTML += `
            <div class="achievement-card" style="background: white; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 2rem; color: ${ach.color}; margin-bottom: 1rem;">
                    <i class="${ach.icon}"></i>
                </div>
                <h3 style="color: #4a6fa5; margin-bottom: 0.5rem;">${ach.title}</h3>
                <p style="color: #666; font-size: 0.9rem;">${ach.description}</p>
                <div style="margin-top: 1rem; padding: 0.5rem; background: ${bgColor}; color: ${ach.completed ? 'white' : (ach.current > 0 ? '#000' : 'white')}; border-radius: 4px; font-weight: bold;">
                    ${statusText}
                </div>
            </div>
        `;
    });

    // تنسيق الأرقام بالعربية (أو يمكنك استخدام toLocaleString)
    const formatNumber = (num) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d] || d);

    mainContent.innerHTML = `
        <section class="level-header">
            <div class="container">
                <h2><i class="fas fa-trophy"></i> الإنجازات</h2>
                <p>تتبع تقدمك وإنجازاتك في رحلة تعلم الرياضيات</p>
            </div>
        </section>
        
        <div class="container">
            <div class="progress-container">
                <div class="progress-info">
                    <span>تقدمك العام</span>
                    <span>${formatNumber(Math.round(overallProgress))}٪</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${overallProgress}%"></div>
                </div>
            </div>
            
            <div class="achievements-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                ${achievementsHTML}
            </div>
            
            <div class="user-stats" style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #4a6fa5; margin-bottom: 1.5rem; text-align: center;"><i class="fas fa-chart-line"></i> إحصائياتك</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="text-align: center;">
                        <h4 style="color: #666; font-size: 0.9rem;">إجمالي المسائل المحلولة</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #4a6fa5;">${formatNumber(stats.totalSolved)}</p>
                    </div>
                    <div style="text-align: center;">
                        <h4 style="color: #666; font-size: 0.9rem;">المسائل الصحيحة</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #28a745;">${formatNumber(stats.totalCorrect)}</p>
                    </div>
                    <div style="text-align: center;">
                        <h4 style="color: #666; font-size: 0.9rem;">نسبة النجاح</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #17a2b8;">${formatNumber(Math.round(stats.accuracy))}٪</p>
                    </div>
                    <div style="text-align: center;">
                        <h4 style="color: #666; font-size: 0.9rem;">الوقت المستغرق</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: #ffc107;">${formatNumber(Math.round(stats.totalTime / 60000))} د</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
// حساب الإحصائيات الشاملة للمستخدم
function calculateUserStats(progressData) {
    let totalSolved = 0;
    let totalCorrect = 0;
    let totalTime = 0;
    let totalPossible = 0; // لحساب التقدم العام

    // افتراض عدد المسائل في كل مستوى (يجب أن تحددها بدقة لاحقًا)
    const levelProblemCounts = {
        beginner: 100,
        intermediate: 100,
        advanced: 100,
        complex: 100
    };

    Object.keys(progressData).forEach(level => {
        const levelData = progressData[level];
        const answers = levelData.userAnswers || {};
        const solvedInLevel = Object.values(answers).filter(a => a.answer !== '').length;
        const correctInLevel = Object.values(answers).filter(a => a.correct === true).length;
        const timeInLevel = Object.values(answers).reduce((sum, a) => sum + (a.time || 0), 0);

        totalSolved += solvedInLevel;
        totalCorrect += correctInLevel;
        totalTime += timeInLevel;
        totalPossible += levelProblemCounts[level] || 0;
    });

    const accuracy = totalSolved > 0 ? (totalCorrect / totalSolved) * 100 : 0;
    const overallProgress = totalPossible > 0 ? (totalSolved / totalPossible) * 100 : 0;

    return {
        totalSolved,
        totalCorrect,
        accuracy,
        totalTime,
        overallProgress
    };
}

// تقييم حالة الإنجازات
function evaluateAchievements(progressData, stats) {
    // جمع جميع الإجابات من جميع المستويات
    let allAnswers = [];
    Object.values(progressData).forEach(level => {
        if (level.userAnswers) {
            allAnswers = allAnswers.concat(Object.values(level.userAnswers));
        }
    });

    // فلترة المسائل حسب النوع (قد تحتاج إلى تعديل حسب هيكل بياناتك)
    const beginnerAnswers = (progressData.beginner?.userAnswers) ? Object.values(progressData.beginner.userAnswers) : [];
    const decompositionAnswers = allAnswers.filter(a => a.type === 'decomposition'); // تأكد من وجود خاصية "type"
    const additionAnswers = allAnswers.filter(a => a.type === 'addition');
    const halfDoubleAnswers = allAnswers.filter(a => a.type === 'half' || a.type === 'double');

    return [
        {
            title: "المبتدئ المتفوق",
            description: "أكمل ١٠ تمارين في المستوى الابتدائي",
            target: 10,
            current: beginnerAnswers.length,
            completed: beginnerAnswers.length >= 10,
            icon: "fas fa-medal",
            color: "gold"
        },
        {
            title: "محلل الأعداد",
            description: "حل ٥ مسائل تفكيك",
            target: 5,
            current: decompositionAnswers.length,
            completed: decompositionAnswers.length >= 5,
            icon: "fas fa-star",
            color: "silver"
        },
        {
            title: "بطل الجمع",
            description: "اجمع ١٠٠ عدد",
            target: 100,
            current: additionAnswers.reduce((sum, a) => sum + (a.numbersAdded || 0), 0),
            completed: additionAnswers.reduce((sum, a) => sum + (a.numbersAdded || 0), 0) >= 100,
            icon: "fas fa-award",
            color: "#cd7f32"
        },
        {
            title: "تحدي الضعف والنصف",
            description: "حل ٢٠ مسألة ضعف ونصف",
            target: 20,
            current: halfDoubleAnswers.length,
            completed: halfDoubleAnswers.length >= 20,
            icon: "fas fa-graduation-cap",
            color: "#17a2b8"
        }
    ];
}

// تحميل صفحة ثابتة
function loadStaticPage(title, page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const pagesContent = {
        'about': `
            <h3>من نحن</h3>
            <p>MathLinguistic هي منصة تعليمية مبتكرة تهدف إلى تعليم الرياضيات باللغة العربية بطريقة تفاعلية وجذابة.</p>
            <p>نؤمن بأن الرياضيات لغة عالمية يمكن تعلمها وفهمها بسهولة عندما تقدم باللغة الأم.</p>
            <h4>رؤيتنا</h4>
            <p>أن نكون المنصة الرائدة في تعليم الرياضيات باللغة العربية للطلاب في جميع المراحل التعليمية.</p>
            <h4>رسالتنا</h4>
            <p>تبسيط مفاهيم الرياضيات وجعلها في متناول كل طالب عربي من خلال أدوات تعليمية تفاعلية ومبتكرة.</p>
        `,
        'privacy': `
            <h3>سياسة الخصوصية</h3>
            <p>نحن في MathLinguistic نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
            <h4>البيانات التي نجمعها</h4>
            <p>نجمع فقط البيانات الضرورية لتقديم تجربة تعليمية أفضل، مثل تقدمك في حل التمارين والإنجازات.</p>
            <h4>كيف نستخدم بياناتك</h4>
            <p>نستخدم بياناتك لتحسين تجربتك التعليمية وتقديم محتوى مخصص يناسب مستواك.</p>
            <h4>حماية البيانات</h4>
            <p>نطبق أعلى معايير الأمان لحماية بياناتك من الوصول غير المصرح به.</p>
        `,
        'terms': `
            <h3>شروط الاستخدام</h3>
            <p>باستخدامك لمنصة MathLinguistic، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>
            <h4>الاستخدام المقبول</h4>
            <p>يجب استخدام المنصة لأغراض تعليمية فقط ووفقاً للقوانين واللوائح المعمول بها.</p>
            <h4>الملكية الفكرية</h4>
            <p>جميع المحتويات التعليمية على المنصة محمية بحقوق الطبع والنشر ولا يسمح بنسخها أو توزيعها دون إذن.</p>
            <h4>التعديلات</h4>
            <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسنقوم بإعلام المستخدمين بالتغييرات الهامة.</p>
        `,
        'contact': `
            <h3>اتصل بنا</h3>
            <p>نحن هنا لمساعدتك! يمكنك التواصل معنا عبر:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin: 2rem 0;">
                <div style="background: white; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="font-size: 2rem; color: #4a6fa5; margin-bottom: 1rem;">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h4>البريد الإلكتروني</h4>
                    <p>moussa.abderrezagui191@gmail.com</p>
                </div>
                
                <div style="background: white; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="font-size: 2rem; color: #4a6fa5; margin-bottom: 1rem;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h4>ساعات العمل</h4>
                    <p>الأحد - الخميس</p>
                    <p>9 صباحاً - 5 مساءً</p>
                </div>
            </div>
            <h4>أو املأ النموذج التالي:</h4>
            <form style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">الاسم</label>
                    <input type="text" style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">البريد الإلكتروني</label>
                    <input type="email" style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">الرسالة</label>
                    <textarea rows="5" style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">إرسال الرسالة</button>
            </form>
        `
    };
    
    mainContent.innerHTML = `
        <section class="level-header">
            <div class="container">
                <h2><i class="fas fa-info-circle"></i> ${title}</h2>
            </div>
        </section>
        
        <div class="container">
            <div class="static-page-content" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); line-height: 1.8;">
                ${pagesContent[page] || '<p>الصفحة غير متوفرة.</p>'}
            </div>
        </div>
    `;
}

// تحميل المستوى المبتدئ (سيتم تنفيذه في beginner.js)
function loadBeginnerLevel() {
    // هذه الوظيفة ستتم استدعاؤها من beginner.js
    console.log('تحميل المستوى المبتدئ...');
}

// تحميل المستويات الأخرى
// ===== تحميل المرحلة المتوسطة المحسنة =====
async function loadIntermediateLevel() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    // عرض واجهة التحميل
    mainContent.innerHTML = `
        <section class="level-header">
            <div class="container">
                <h2><i class="fas fa-chalkboard-teacher"></i> المرحلة المتوسطة</h2>
                <p>تمارين في الضرب والقسمة والكسور والنسب المئوية</p>
            </div>
        </section>
        
        <div class="container">
            <div class="loading-container" style="min-height: 50vh; display: flex; align-items: center; justify-content: center;">
                <div class="loading-content" style="text-align: center;">
                    <div class="loading-spinner" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 2rem;">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    
                    <h3 style="color: var(--primary-color); margin-bottom: 1rem;">جاري تحميل المرحلة المتوسطة</h3>
                    
                    <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">
                        نعدك بتجربة تعليمية رائعة مع 100 مسألة متنوعة
                    </p>
                    
                    <div class="loading-progress" style="width: 300px; margin: 0 auto;">
                        <div class="progress-bar" style="height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                            <div class="progress-fill" style="height: 100%; background: var(--accent-color); border-radius: 4px; width: 0%; transition: width 0.5s ease;"></div>
                        </div>
                        <div class="progress-text" style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">جاري التحميل...</div>
                    </div>
                    
                    <div class="loading-tips" style="margin-top: 3rem; padding: 1.5rem; background: #f8f9fa; border-radius: var(--border-radius);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">
                            <i class="fas fa-lightbulb"></i> حقائق سريعة عن المرحلة المتوسطة
                        </h4>
                        <ul style="text-align: right; list-style: none; padding: 0;">
                            <li style="margin-bottom: 0.8rem; padding-right: 1.5rem; position: relative;">
                                <i class="fas fa-check" style="color: var(--success-color); position: absolute; right: 0;"></i>
                                <span>100 مسألة متنوعة</span>
                            </li>
                            <li style="margin-bottom: 0.8rem; padding-right: 1.5rem; position: relative;">
                                <i class="fas fa-check" style="color: var(--success-color); position: absolute; right: 0;"></i>
                                <span>5 أنواع مختلفة من المسائل</span>
                            </li>
                            <li style="margin-bottom: 0.8rem; padding-right: 1.5rem; position: relative;">
                                <i class="fas fa-check" style="color: var(--success-color); position: absolute; right: 0;"></i>
                                <span>تلميحات مفيدة لكل مسألة</span>
                            </li>
                            <li style="margin-bottom: 0.8rem; padding-right: 1.5rem; position: relative;">
                                <i class="fas fa-check" style="color: var(--success-color); position: absolute; right: 0;"></i>
                                <span>تتبع تلقائي للتقدم</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    try {
        // محاولة تحميل المستوى المتوسط
        if (window.IntermediateLevel && typeof window.IntermediateLevel.init === 'function') {
            // محاكاة شريط التقدم
            simulateLoadingProgress();
            
            // تأخير بسيط لتحسين تجربة المستخدم
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // تهيئة المستوى المتوسط
            window.IntermediateLevel.init();
            
            // تحديث شريط التقدم إلى 100%
            updateLoadingProgress(100, "تم التحميل بنجاح!");
            
        } else {
            // إذا لم يكن الملف محملاً
            throw new Error('ملف المرحلة المتوسطة غير محمل');
        }
        
    } catch (error) {
        console.error('خطأ في تحميل المرحلة المتوسطة:', error);
        
        // عرض رسالة الخطأ
        mainContent.innerHTML = `
            <section class="level-header">
                <div class="container">
                    <h2><i class="fas fa-exclamation-triangle"></i> المرحلة المتوسطة</h2>
                    <p>تمارين في الضرب والقسمة والكسور والنسب المئوية</p>
                </div>
            </section>
            
            <div class="container">
                <div class="error-message" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 2rem; border-radius: var(--border-radius); margin: 2rem 0; text-align: center;">
                    <h3 style="color: #856404; margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-circle"></i> عذراً، حدث خطأ
                    </h3>
                    <p style="color: #856404; margin-bottom: 1.5rem;">
                        لم نتمكن من تحميل المرحلة المتوسطة. يرجى التأكد من تحميل الملفات المطلوبة.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn-warning" onclick="location.reload()" style="background: #ffc107; color: #000;">
                            <i class="fas fa-redo"></i> إعادة تحميل الصفحة
                        </button>
                        <button class="btn-primary" onclick="navigateToPage('beginner')">
                            <i class="fas fa-arrow-right"></i> الانتقال للمرحلة الابتدائية
                        </button>
                    </div>
                </div>
                
                <!-- عرض معلومات بديلة -->
                <div class="level-info" style="background: white; padding: 2rem; border-radius: var(--border-radius); box-shadow: var(--box-shadow); margin-top: 2rem;">
                    <h3 style="color: var(--primary-color); text-align: center; margin-bottom: 1.5rem;">عن المرحلة المتوسطة</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div class="info-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: var(--border-radius); text-align: center;">
                            <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1rem;">
                                <i class="fas fa-times"></i>
                            </div>
                            <h4>الضرب</h4>
                            <p style="color: #666;">جدول الضرب والضرب في أعداد أكبر</p>
                        </div>
                        
                        <div class="info-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: var(--border-radius); text-align: center;">
                            <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1rem;">
                                <i class="fas fa-divide"></i>
                            </div>
                            <h4>القسمة</h4>
                            <p style="color: #666;">القسمة البسيطة والطويلة</p>
                        </div>
                        
                        <div class="info-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: var(--border-radius); text-align: center;">
                            <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1rem;">
                                <i class="fas fa-fraction"></i>
                            </div>
                            <h4>الكسور</h4>
                            <p style="color: #666;">جمع وطرح وضرب وقسمة الكسور</p>
                        </div>
                        
                        <div class="info-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: var(--border-radius); text-align: center;">
                            <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1rem;">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <h4>النسب المئوية</h4>
                            <p style="color: #666;">حساب النسب والخصومات</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <p style="color: #666; margin-bottom: 1.5rem;">
                            للمساعدة التقنية، يرجى التأكد من تحميل جميع ملفات JavaScript.
                        </p>
                        <button class="btn-secondary" onclick="checkLoadedFiles()">
                            <i class="fas fa-cogs"></i> التحقق من الملفات المحملة
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// ===== دوال مساعدة لتحميل المرحلة المتوسطة =====

// محاكاة شريط التقدم
function simulateLoadingProgress() {
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 90) {
            clearInterval(progressInterval);
            progress = 90;
        }
        updateLoadingProgress(progress, getRandomLoadingMessage());
    }, 200);
}

// تحديث شريط التقدم
function updateLoadingProgress(percentage, message) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = message;
    }
}

// رسائل تحميل متنوعة
function getRandomLoadingMessage() {
    const messages = [
        "جاري تحميل المسائل...",
        "إعداد التمارين التفاعلية...",
        "تحميل نظام التصحيح...",
        "إعداد واجهة المستخدم...",
        "جاري التحضير لتجربة تعليمية ممتعة...",
        "تحميل تلميحات المسائل...",
        "إعداد نظام حفظ التقدم...",
        "جاري تهيئة المرحلة المتوسطة..."
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// التحقق من الملفات المحملة
function checkLoadedFiles() {
    const loadedFiles = [];
    const requiredFiles = [
        'scripts/levels/intermediate.js',
        'data/intermediate.json',
        'scripts/main.js',
        'scripts/navigation.js'
    ];
    
    // التحقق من وجود الكائنات المطلوبة
    if (window.IntermediateLevel) loadedFiles.push('✓ scripts/levels/intermediate.js');
    if (window.navigateToPage) loadedFiles.push('✓ scripts/main.js');
    if (window.NavigationManager) loadedFiles.push('✓ scripts/navigation.js');
    
    // عرض النتائج
    const resultMessage = loadedFiles.length > 0 
        ? `الملفات المحملة:\n${loadedFiles.join('\n')}`
        : 'لم يتم تحميل أي من الملفات المطلوبة. يرجى إعادة تحميل الصفحة.';
    
    alert(resultMessage);
}



function loadComplexLevel() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <section class="level-header">
            <div class="container">
                <h2><i class="fas fa-brain"></i> المرحلة المعقدة</h2>
                <p>مسائل معقدة تتطلب تفكيراً نقدياً وحلاً إبداعياً</p>
            </div>
        </section>
        
        <div class="container">
            <div class="loading-message">
                <i class="fas fa-spinner"></i>
                <p>جاري تحميل التمارين...</p>
            </div>
        </div>
    `;
}