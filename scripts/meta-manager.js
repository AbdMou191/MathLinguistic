/**
 * Meta Manager & Share System - النسخة الشاملة والمكتملة v4.1
 * دعم كامل للكلمات المفتاحية الثلاثية (عربي - فرنسي - إنجليزي) ووسوم SEO والـ Open Graph
 */

const MetaManager = {
  // 📌 وسوم الموقع العامة الأساسية
  defaultMeta: {
    siteName: 'MathLinguistic',
    locale: 'ar_AR',
    type: 'website',
    defaultImage: `${window.location.origin}/icons/icon-512.png`
  },

  // 📌 الكلمات المفتاحية العامة الشاملة للغات الثلاث (افتراضية)
  globalKeywords: 'حساب ذهني, رياضيات, ألعاب تعليمية, سودوكو, تدريب الدماغ, mental math, soroban, abacus, math games, brain training, speed math, calcul mental, mathématiques, jeux éducatifs, calcul rapide, jeux de logique, MathLinguistic',

  // 📌 الأقسام والوسوم المخصصة مع الكلمات المفتاحية المدمجة باللغات الثلاث
  sections: {
    'home': {
      title: 'MathLinguistic | الرئيسية • تعلّم الحساب الذهني بسرعة | Mental Math & Speed Calculation',
      description: 'منصة MathLinguistic لتعليم الحساب الذهني والسوروبان. دروس، تمارين، ألعاب، وتحديات سرعة بـ 3 لغات. Learn Mental Math & Fast Calculation.',
      keywords: 'حساب ذهني, رياضيات, سوروبان, ألعاب تعليمية, MathLinguistic, mental math, soroban, abacus, speed math, brain training, calcul mental, mathématiques, jeux éducatifs, calcul rapide'
    },
    'beginner': {
      title: 'المستوى المبتدئ | MathLinguistic - أساسيات الحساب الذهني | Beginner Level',
      description: 'ابدأ رحلتك في الحساب الذهني مع المستوى المبتدئ. تمارين بسيطة وشرح مفصل للخطوات الأولى. Learn basic mental arithmetic step by step.',
      keywords: 'حساب ذهني للمبتدئين, أساسيات الرياضيات, تمارين سهلة, beginner mental math, basic arithmetic, math for kids, calcul mental débutant, mathématiques de base'
    },
    'intermediate': {
      title: 'المستوى المتوسط | MathLinguistic - تطوير المهارات الحسابية | Intermediate Level',
      description: 'طور مهاراتك في الحساب الذهني مع تمارين المستوى المتوسط. عمليات حسابية أكثر تعقيداً وتحديات. Improve your mental math skills.',
      keywords: 'حساب ذهني متوسط, تطوير المهارات الحسابية, حساب عقلي, intermediate mental math, speed calculation, mental agility, calcul mental intermédiaire, exercices mathématiques'
    },
    'advanced': {
      title: 'المستوى المتقدم | MathLinguistic - حساب ذهني متقدم | Advanced Level',
      description: 'تحديات حسابية متقدمة للمحترفين. عمليات معقدة وسرعة في الحل مع نظام إنجازات. Master advanced mental calculation.',
      keywords: 'حساب ذهني متقدم, تحديات رياضية, حساب سريع, advanced mental math, master arithmetic, fast math tricks, calcul mental avancé, mathématiques complexes'
    },
    'complex': {
      title: 'المستوى المعقد | MathLinguistic - تحديات النخبة في الحساب | Elite Level',
      description: 'أعلى مستوى في الحساب الذهني. تحديات استثنائية للمتميزين فقط. Elite level mental math challenges.',
      keywords: 'حساب ذهني معقد, تحديات النخبة, عباقرة الحساب, elite mental math, complex arithmetic, math genius, calcul mental complexe, défis mathématiques'
    },
    'learn-beginner': {
      title: 'دروس المبتدئ | MathLinguistic - شرح قواعد الحساب الذهني | Beginner Lessons',
      description: 'دروس مفصلة لشرح قواعد الحساب الذهني للمبتدئين والسوروبان. أمثلة وحلول خطوة بخطوة.',
      keywords: 'دروس حساب ذهني, قواعد الحساب, تعلم السوروبان, beginner math lessons, soroban rules, learn abacus, cours de calcul mental, règles du boulier'
    },
    'learn-intermediate': {
      title: 'دروس المتوسط | MathLinguistic - تطوير التقنيات الحسابية | Intermediate Lessons',
      description: 'دروس متقدمة لشرح تقنيات الحساب الذهني. استراتيجيات للحساب السريع والدقيق.',
      keywords: 'تقنيات حسابية, استراتيجيات الحساب السريع, mental math techniques, fast calculation tricks, techniques de calcul mental, stratégies mathématiques'
    },
    'learn-advanced': {
      title: 'دروس المتقدم | MathLinguistic - إتقان الحساب الذهني | Advanced Lessons',
      description: 'دروس احترافية لإتقان الحساب الذهني والعمود الفقري للسوروبان. عمليات معقدة وحلول مبتكرة.',
      keywords: 'حساب ذهني احترافي, دروس متقدمة, professional mental math, advanced soroban, calcul mental professionnel, cours avancés'
    },
    'learn-complex': {
      title: 'دروس المعقد | MathLinguistic - تحديات الحساب للنخبة | Complex Lessons',
      description: 'دروس استثنائية لأعلى مستويات الحساب الذهني. للمتميزين وعباقرة الأرقام.',
      keywords: 'دروس معقدة, حساب نخبة, elite math lessons, expert mental math, cours de mathématiques complexes, calcul d’élite'
    },
    'speed-test': {
      title: 'تحدي السرعة | MathLinguistic - اختبر سرعتك في الحساب الذهني | Speed Test Challenge',
      description: 'اختبر سرعتك في الحساب الذهني ضد الزمن. سجل أعلى النقاط ونافس نفسك! Test your calculation speed against time.',
      keywords: 'تحدي السرعة, اختبر سرعتك, مسابقة رياضيات, speed math test, calculation challenge, time attack math, test de vitesse de calcul, défi mathématique'
    },
    'mental-math': {
      title: 'الحساب الذهني | MathLinguistic - 5 مستويات تدريبية | Mental Math Practice',
      description: '5 مستويات متدرجة لتدريب الحساب الذهني. ابدأ من السهل إلى الصعب. 5 levels of progressive mental math training.',
      keywords: 'تدريب حساب ذهني, تمارين يومية, تحسين الذاكرة, mental math practice, daily brain workout, entrainement calcul mental, exercice cérébral'
    },
    'mixed-ops': {
      title: 'العمليات المختلطة | MathLinguistic - تحدي الجمع والطرح والضرب | Mixed Operations',
      description: 'تمارين تجمع بين عمليات الجمع والطرح والضرب والقسمة. Mixed operations: addition, subtraction, multiplication & division.',
      keywords: 'عمليات مختلطة, جمع وطرح, ضرب وقسمة, mixed math operations, arithmetic practice, opérations mixtes, addition et multiplication'
    },
    'loudoukou': {
      title: 'لعبة السودوكو | MathLinguistic - ألغاز الأرقام المنطقية | Sudoku Game',
      description: 'استمتع بلعبة السودوكو الكلاسيكية بمستويات متعددة. طور منطقك الرياضي! Play classic Sudoku puzzles online.',
      keywords: 'سودوكو, ألغاز الأرقام, ألعاب منطقية, sudoku game, logic puzzles, number grid, jeu de sudoku, puzzles de logique'
    },
    'crossmath': {
      title: 'الأرقام المتقاطعة | MathLinguistic - تحدي الكلمات والأرقام | Crossmath Game',
      description: 'لعبة الأرقام المتقاطعة تجمع بين الرياضيات والكلمات. Crossmath puzzles combining numbers and logic.',
      keywords: 'أرقام متقاطعة, ألغاز رياضية, crossmath, math crossword, number puzzle, mots croisés mathématiques, puzzle numérique'
    },
    'sliding_puzzle': {
      title: 'ترتيب الأرقام | MathLinguistic - لعبة الترتيب والتصنيف | Sliding Puzzle',
      description: 'رتب الأرقام بذكاء وسرعة. مستويات متعددة تختبر سرعتك ودقتك. Classic sliding tile puzzle game.',
      keywords: 'ترتيب الأرقام, ألعاب تصنيف, sliding tile puzzle, number sorting, order puzzle, jeu de pousse-pousse, puzzle de nombres'
    },
    'calculator': {
      title: 'الآلة الحاسبة التعليمية | MathLinguistic - تعلم عبر التطبيق | Educational Calculator',
      description: 'آلة حاسبة تفاعلية تساعدك على فهم العمليات الحسابية خطوة بخطوة. Interactive learning calculator.',
      keywords: 'آلة حاسبة تعليمية, آلة تفاعلية, educational calculator, interactive math tool, calculatrice éducative, outil mathématique'
    },
    'achievements': {
      title: 'الإنجازات والأوسمة | MathLinguistic - تتبع تقدمك | Achievements & Badges',
      description: 'شاهد جميع إنجازاتك وأوسمتك. تتبع تقدمك في رحلة تعلم الحساب الذهني. Track your progress & earn badges.',
      keywords: 'إنجازات, أوسمة, تتبع التقدم, achievements, math badges, user progress, succès, badges d’apprentissage'
    },
    'about': {
      title: 'من نحن | MathLinguistic - عن المنصة | About Us',
      description: 'تعرف على قصة MathLinguistic وفريق العمل وراء هذه المنصة التعليمية. Learn more about MathLinguistic platform.',
      keywords: 'من نحن, عن المنصة, about us, math platform, à propos, plateforme éducative'
    },
    'contact': {
      title: 'اتصل بنا | MathLinguistic - تواصل مع فريق الدعم | Contact Us',
      description: 'لديك سؤال أو اقتراح؟ تواصل معنا عبر البريد أو واتساب. Get in touch with MathLinguistic support team.',
      keywords: 'اتصل بنا, دعم فني, contact us, support team, contactez-nous, support technique'
    },
    'terms': {
      title: 'شروط الاستخدام | MathLinguistic - Terms of Use',
      description: 'شروط وأحكام استخدام منصة MathLinguistic التعليمية. Terms and conditions of using MathLinguistic.',
      keywords: 'شروط الاستخدام, أحكام, terms of use, legal notice, conditions d’utilisation'
    },
    'privacy': {
      title: 'سياسة الخصوصية | MathLinguistic - Privacy Policy',
      description: 'كيف نحمي بياناتك وخصوصيتك في منصة MathLinguistic. How we protect your data & privacy.',
      keywords: 'سياسة الخصوصية, حماية البيانات, privacy policy, data protection, politique de confidentialité'
    }
  },

  // ✅ دالة تحديث وسوم الـ Meta
  updateMetaTag(attrType, attrValue, content) {
    try {
      let meta = document.querySelector(`meta[${attrType}="${attrValue}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attrType, attrValue);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
      return true;
    } catch (err) {
      console.warn(`⚠️ Meta update failed for ${attrValue}:`, err);
      return false;
    }
  },

  // ✅ التحديث المكتمل لوسوم الـ Meta للصفحة
  updateMeta(sectionKey) {
    try {
      const data = this.sections[sectionKey] || this.sections['home'];
      if (!data) return true;

      const currentUrl = `${window.location.origin}${window.location.pathname}#${sectionKey}`;

      // 1. العنوان والوصف والكلمات المفتاحية
      document.title = data.title;
      this.updateMetaTag('name', 'description', data.description);
      this.updateMetaTag('name', 'keywords', data.keywords);

      // 2. وسوم Facebook Open Graph
      this.updateMetaTag('property', 'og:title', data.title);
      this.updateMetaTag('property', 'og:description', data.description);
      this.updateMetaTag('property', 'og:type', this.defaultMeta.type);
      this.updateMetaTag('property', 'og:site_name', this.defaultMeta.siteName);
      this.updateMetaTag('property', 'og:locale', this.defaultMeta.locale);
      this.updateMetaTag('property', 'og:url', currentUrl);
      this.updateMetaTag('property', 'og:image', this.defaultMeta.defaultImage);

      // 3. وسوم Twitter Cards
      this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
      this.updateMetaTag('name', 'twitter:title', data.title);
      this.updateMetaTag('name', 'twitter:description', data.description);
      this.updateMetaTag('name', 'twitter:image', this.defaultMeta.defaultImage);

      try {
        if (window.history && sectionKey !== 'home') {
          if (window.location.hash !== `#${sectionKey}`) {
            window.history.pushState({ section: sectionKey }, data.title, `#${sectionKey}`);
          }
        }
      } catch (historyErr) {
        console.warn('⚠️ History update failed:', historyErr);
      }
    } catch (err) {
      console.error('❌ MetaManager Error:', err);
    }
  },

  // 🎨 دالة رسم وتوليد بطاقة المشاركة الذكية تلقائياً
  generateDynamicShareCard(page, title, category) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, '#1a202c');
      gradient.addColorStop(0.5, '#2d3748');
      gradient.addColorStop(1, '#2b6cb0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      ctx.strokeStyle = '#4299e1';
      ctx.lineWidth = 10;
      ctx.strokeRect(30, 30, 1140, 570);

      ctx.fillStyle = '#63b3ed';
      ctx.font = 'bold 36px sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('📐 MathLinguistic | Mental Math', 1100, 100);

      ctx.fillStyle = '#ecc94b';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`• ${category || 'درس تفاعلي'}`, 1100, 180);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      const pageText = isNaN(page) ? page : `الصفحة رقم: ${page}`;
      ctx.fillText(pageText, 1100, 280);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'normal 42px sans-serif';
      const displayTitle = title || 'تعلم تقنيات الحساب الذهني السريع';
      ctx.fillText(displayTitle, 1100, 380);

      ctx.fillStyle = '#48bb78';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('🚀 اضغط على الرابط وابدأ التحدي الآن!', 1100, 520);

      canvas.toBlob((blob) => {
        const file = new File([blob], `mathlinguistic-page-${page}.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  },

  // ✅ مشاركة الدرس مع تحديث الوسوم ديناميكياً
  async shareCurrentLesson(pageNumber, customTitle) {
    try {
      const page = pageNumber || window.currentPageNumber || window.currentLessonPage || 1;
      const sectionKey = window.location.hash.replace('#', '') || 'home';
      const sectionData = this.sections[sectionKey] || this.sections['home'];

      const title = customTitle || (sectionKey !== 'home' ? sectionData.title : `درس الصفحة ${page}`);
      const category = sectionKey.includes('learn') ? 'درس تفاعلي' : (sectionKey.includes('loudoukou') ? 'لعبة سودوكو' : 'تمارين حساب');
      const shareUrl = `${window.location.origin}${window.location.pathname}?page=${page}#${sectionKey}`;

      const imageFile = await this.generateDynamicShareCard(page, title, category);

      document.title = title;
      this.updateMetaTag('property', 'og:title', title);
      this.updateMetaTag('property', 'og:description', `شرح وتمارين الصفحة رقم ${page}`);
      this.updateMetaTag('property', 'og:url', shareUrl);

      const shareData = {
        title: title,
        text: `📚 ${title}\n🎯 انضم معي لحل تمارين وشرح الصفحة ${page} على MathLinguistic!\n\n`,
        url: shareUrl,
        files: [imageFile]
      };

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({ title: title, text: shareData.text, url: shareUrl });
      } else {
        this.copyLinkToClipboard(shareUrl);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const page = pageNumber || window.currentPageNumber || 1;
        this.copyLinkToClipboard(`${window.location.origin}${window.location.pathname}?page=${page}`);
      }
    }
  },

  copyLinkToClipboard(url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    if (window.GameCore && window.GameCore.toast) {
      window.GameCore.toast('📋 تم نسخ رابط الصفحة للحافظة!', 'info');
    }
  },

  injectFloatingShareButton() {
    if (document.getElementById('global-floating-share-btn')) return;

    if (!document.getElementById('floating-share-styles')) {
      const style = document.createElement('style');
      style.id = 'floating-share-styles';
      style.textContent = `
        .floating-share-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3182ce, #2b6cb0);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .floating-share-btn:active { transform: scale(0.92); }
        @media (max-width: 480px) {
          .floating-share-btn { bottom: 16px; right: 16px; width: 44px; height: 44px; font-size: 1.1rem; }
        }
      `;
      document.head.appendChild(style);
    }

    const shareBtn = document.createElement('button');
    shareBtn.id = 'global-floating-share-btn';
    shareBtn.className = 'floating-share-btn';
    shareBtn.setAttribute('title', 'مشاركة هذه الصفحة / الدرس');
    shareBtn.setAttribute('aria-label', 'مشاركة الصفحة');
    shareBtn.innerHTML = '🔗';

    shareBtn.onclick = () => {
      const pageNum = window.currentPageNumber || window.currentLessonPage || 1;
      this.shareCurrentLesson(pageNum);
    };

    document.body.appendChild(shareBtn);
  },

  checkUrlParamsOnLoad() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');

      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        window.currentPageNumber = pageNum;

        setTimeout(() => {
          if (typeof window.loadLessonPage === 'function') {
            window.loadLessonPage(pageNum);
          } else if (typeof window.showLesson === 'function') {
            window.showLesson(pageNum);
          }
        }, 300);
      }
    } catch (err) {
      console.warn('⚠️ Deep link check failed:', err);
    }
  },

  init() {
    try {
      const initialHash = window.location.hash.replace('#', '') || 'home';
      this.updateMeta(initialHash);
      
      this.checkUrlParamsOnLoad();
      this.injectFloatingShareButton();

      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        this.updateMeta(hash);
      });

      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-target]');
        if (btn) {
          const target = btn.getAttribute('data-target');
          setTimeout(() => this.updateMeta(target), 100);
        }
        const footerBtn = e.target.closest('[data-static-page]');
        if (footerBtn) {
          const page = footerBtn.getAttribute('data-static-page');
          setTimeout(() => this.updateMeta(page), 100);
        }
      });

      console.log('✅ MetaManager v4.1 (Multilingual SEO) initialized successfully');
    } catch (err) {
      console.error('❌ MetaManager init failed:', err);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MetaManager.init());
} else {
  MetaManager.init();
}

window.MetaManager = MetaManager;
window.updatePageMeta = (sectionKey) => MetaManager.updateMeta(sectionKey);
window.shareLessonPage = (pageNumber, title) => MetaManager.shareCurrentLesson(pageNumber, title);
