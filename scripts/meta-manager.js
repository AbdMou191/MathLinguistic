/**
 * Meta Manager & Share System - النسخة الشاملة v3.0
 * دعم تحديث الميتا للمستويات ومشاركة الصفحات/الدروس الحالية بدقة
 */

const MetaManager = {
  sections: {
    'home': {
      title: 'MathLinguistic | الرئيسية • تعلّم الحساب الذهني بسرعة',
      description: 'منصة MathLinguistic لتعليم الحساب الذهني. دروس، تمارين، ألعاب، وتحديات سرعة لجميع المستويات.',
      keywords: 'حساب ذهني, رياضيات, تعلم الرياضيات, MathLinguistic, ألعاب تعليمية'
    },
    'beginner': {
      title: 'المستوى المبتدئ | MathLinguistic - أساسيات الحساب الذهني',
      description: 'ابدأ رحلتك في الحساب الذهني مع المستوى المبتدئ. تمارين بسيطة وشرح مفصل للخطوات الأولى.',
      keywords: 'حساب ذهني للمبتدئين, تعلم الحساب, رياضيات للأطفال, أساسيات الرياضيات, تمارين سهلة'
    },
    'intermediate': {
      title: 'المستوى المتوسط | MathLinguistic - تطوير المهارات الحسابية',
      description: 'طور مهاراتك في الحساب الذهني مع تمارين المستوى المتوسط. عمليات حسابية أكثر تعقيداً وتحديات.',
      keywords: 'حساب ذهني متوسط, تمارين رياضيات, تطوير المهارات الحسابية, حساب عقلي'
    },
    'advanced': {
      title: 'المستوى المتقدم | MathLinguistic - حساب ذهني متقدم',
      description: 'تحديات حسابية متقدمة للمحترفين. عمليات معقدة وسرعة في الحل مع نظام إنجازات.',
      keywords: 'حساب ذهني متقدم, تحديات رياضية, حساب سريع, تدريب الدماغ, رياضيات معقدة'
    },
    'complex': {
      title: 'المستوى المعقد | MathLinguistic - تحديات النخبة في الحساب',
      description: 'أعلى مستوى في الحساب الذهني. تحديات استثنائية للمتميزين فقط.',
      keywords: 'حساب ذهني معقد, تحديات النخبة, رياضيات متقدمة, عباقرة الحساب, حساب عقلي متقدم'
    },
    'learn-beginner': {
      title: 'دروس المبتدئ | MathLinguistic - شرح قواعد الحساب الذهني',
      description: 'دروس مفصلة لشرح قواعد الحساب الذهني للمبتدئين. أمثلة وحلول خطوة بخطوة.',
      keywords: 'دروس حساب ذهني, شرح الرياضيات, قواعد الحساب, تعلم خطوة بخطوة'
    },
    'learn-intermediate': {
      title: 'دروس المتوسط | MathLinguistic - تطوير التقنيات الحسابية',
      description: 'دروس متقدمة لشرح تقنيات الحساب الذهني. استراتيجيات للحساب السريع والدقيق.',
      keywords: 'تقنيات حسابية, استراتيجيات الحساب, دروس رياضيات متوسطة'
    },
    'learn-advanced': {
      title: 'دروس المتقدم | MathLinguistic - إتقان الحساب الذهني',
      description: 'دروس احترافية لإتقان الحساب الذهني. عمليات معقدة وحلول مبتكرة.',
      keywords: 'حساب ذهني احترافي, دروس متقدمة, حلول رياضية مبتكرة'
    },
    'learn-complex': {
      title: 'دروس المعقد | MathLinguistic - تحديات الحساب للنخبة',
      description: 'دروس استثنائية لأعلى مستويات الحساب الذهني. للمتميزين فقط.',
      keywords: 'حساب نخبة, دروس معقدة, تحديات رياضية قصوى'
    },
    'speed-test': {
      title: 'تحدي السرعة | MathLinguistic - اختبر سرعتك في الحساب الذهني',
      description: 'اختبر سرعتك في الحساب الذهني ضد الزمن. سجل أعلى النقاط ونافس نفسك!',
      keywords: 'تحدي السرعة, حساب سريع, مسابقة رياضيات, اختبار سرعة الحساب, تدريب السرعة'
    },
    'mental-math': {
      title: 'الحساب الذهني | MathLinguistic - 5 مستويات تدريبية',
      description: '5 مستويات متدرجة لتدريب الحساب الذهني. ابدأ من السهل إلى الصعب.',
      keywords: 'تدريب حساب ذهني, تمارين يومية, تحسين الذاكرة الرياضية, حساب عقلي'
    },
    'mixed-ops': {
      title: 'العمليات المختلطة | MathLinguistic - تحدي الجمع والطرح والضرب',
      description: 'تمارين تجمع بين عمليات الجمع والطرح والضرب والقسمة. اختبر براعتك!',
      keywords: 'عمليات مختلطة, جمع وطرح, ضرب وقسمة, تمارين شاملة'
    },
    'loudoukou': {
      title: 'لعبة السودوكو | MathLinguistic - ألغاز الأرقام المنطقية',
      description: 'استمتع بلعبة السودوكو الكلاسيكية بمستويات متعددة. طور منطقك الرياضي!',
      keywords: 'سودوكو, ألغاز الأرقام, ألعاب منطقية, تدريب العقل, سودوكو عربي'
    },
    'crossmath': {
      title: 'الأرقام المتقاطعة | MathLinguistic - تحدي الكلمات والأرقام',
      description: 'لعبة الأرقام المتقاطعة تجمع بين الرياضيات والكلمات. مستويات متعددة من الصعوبة.',
      keywords: 'أرقام متقاطعة, ألغاز رياضية, ألعاب كلمات وأرقام, كلمات متقاطعة رياضية'
    },
    'sliding_puzzle': {
      title: 'ترتيب الأرقام | MathLinguistic - لعبة الترتيب والتصنيف',
      description: 'رتب الأرقام بذكاء وسرعة. مستويات متعددة تختبر سرعتك ودقتك.',
      keywords: 'ترتيب الأرقام, ألعاب تصنيف, سرعة البديهة, ألعاب ذكاء, ألغاز ترتيب'
    },
    'calculator': {
      title: 'الآلة الحاسبة التعليمية | MathLinguistic - تعلم عبر التطبيق',
      description: 'آلة حاسبة تفاعلية تساعدك على فهم العمليات الحسابية خطوة بخطوة.',
      keywords: 'آلة حاسبة تعليمية, تعلم الحساب, عمليات حسابية تفاعلية'
    },
    'achievements': {
      title: 'الإنجازات والأوسمة | MathLinguistic - تتبع تقدمك في التعلم',
      description: 'شاهد جميع إنجازاتك وأوسمتك. تتبع تقدمك في رحلة تعلم الحساب الذهني.',
      keywords: 'إنجازات, أوسمة, تتبع التقدم, نظام النقاط, جوائز تعليمية'
    },
    'about': {
      title: 'من نحن | MathLinguistic - عن المنصة وفريق العمل',
      description: 'تعرف على قصة MathLinguistic وفريق العمل وراء هذه المنصة التعليمية.',
      keywords: 'من نحن, عن MathLinguistic, فريق العمل, قصة المنصة'
    },
    'contact': {
      title: 'اتصل بنا | MathLinguistic - تواصل مع فريق الدعم',
      description: 'لديك سؤال أو اقتراح؟ تواصل معنا عبر البريد أو واتساب.',
      keywords: 'اتصل بنا, دعم فني, تواصل, مساعدة, اقتراحات'
    },
    'terms': {
      title: 'شروط الاستخدام | MathLinguistic',
      description: 'شروط وأحكام استخدام منصة MathLinguistic التعليمية.',
      keywords: 'شروط الاستخدام, أحكام, سياسة, قانوني'
    },
    'privacy': {
      title: 'سياسة الخصوصية | MathLinguistic',
      description: 'كيف نحمي بياناتك وخصوصيتك في منصة MathLinguistic.',
      keywords: 'سياسة الخصوصية, حماية البيانات, خصوصية, GDPR'
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

  // ✅ الدالة الرئيسية لتحديث الصفحة العامة
  updateMeta(sectionKey) {
    try {
      const data = this.sections[sectionKey] || this.sections['home'];
      if (!data) return true;

      document.title = data.title;
      this.updateMetaTag('name', 'description', data.description);
      this.updateMetaTag('name', 'keywords', data.keywords);
      this.updateMetaTag('property', 'og:title', data.title);
      this.updateMetaTag('property', 'og:description', data.description);
      this.updateMetaTag('name', 'twitter:title', data.title);
      this.updateMetaTag('name', 'twitter:description', data.description);

      try {
        if (window.history && sectionKey !== 'home') {
          const newUrl = `#${sectionKey}`;
          if (window.location.hash !== newUrl) {
            window.history.pushState({ section: sectionKey }, data.title, newUrl);
          }
        }
      } catch (historyErr) {
        console.warn('⚠️ History update failed:', historyErr);
      }
    } catch (err) {
      console.error('❌ MetaManager Error:', err);
    }
  },

  // ✅ 🚀 دالة جديدة وحصرية: مشاركة الدرس/الصفحة الحالية بدقة
  shareCurrentLesson(pageNumber, customTitle, customImage) {
    try {
      const page = pageNumber || 1;
      const title = customTitle || `درس الصفحة ${page} | MathLinguistic`;
      const description = `تعلم وتمتع بشرح وتمارين الصفحة رقم ${page} في الحساب الذهني على منصة MathLinguistic.`;
      
      // مسار صورة الدرس الخاص بالصفحة لتفادي الصور العشوائية
      const imageUrl = customImage || `${window.location.origin}/assets/lessons/page-${page}.png`;
      
      // رابط المشاركة المباشر مع معامِل الصفحة ?page=XX
      const shareUrl = `${window.location.origin}${window.location.pathname}?page=${page}`;

      // 1. تحديث الـ Meta Tags بالصورة والعنوان الفعليين فوراً للمشاركة
      document.title = title;
      this.updateMetaTag('property', 'og:title', title);
      this.updateMetaTag('property', 'og:description', description);
      this.updateMetaTag('property', 'og:image', imageUrl);
      this.updateMetaTag('property', 'og:url', shareUrl);
      this.updateMetaTag('name', 'twitter:title', title);
      this.updateMetaTag('name', 'twitter:description', description);
      this.updateMetaTag('name', 'twitter:image', imageUrl);

      // 2. تفعيل النافذة التفاعلية للمشاركة في أندرويد/الهاتف (Web Share API)
      if (navigator.share) {
        navigator.share({
          title: title,
          text: description,
          url: shareUrl
        }).then(() => {
          if (window.GameCore && window.GameCore.toast) {
            window.GameCore.toast('🔗 تم مشاركة الصفحة بنجاح!', 'success');
          }
        }).catch((e) => {
          if (e.name !== 'AbortError') this.copyLinkToClipboard(shareUrl);
        });
      } else {
        this.copyLinkToClipboard(shareUrl);
      }
    } catch (err) {
      console.error('❌ Share failed:', err);
    }
  },

  // دالة مساعدة لنسخ الرابط للحافظة
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

  // ✅ التوجيه التلقائي المباشر عند فتح رابط الدرس (Deep-Linking)
  checkUrlParamsOnLoad() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');

      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        console.log(`📌 جاري فتح الصفحة المطلوبة من الرابط: ${pageNum}`);

        // ربط فتح الصفحة مع دالة عرض الدروس الخاصة بموقعك
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

  // ✅ التهيئة
  init() {
    try {
      const initialHash = window.location.hash.replace('#', '') || 'home';
      this.updateMeta(initialHash);
      
      // قراءة معامِلات URL فور دخول المستخدم من رابط مشاركة
      this.checkUrlParamsOnLoad();

      // ==========================================
// 🔗 دالة إنشاء زر المشاركة العائم أوتوماتيكياً
// ==========================================
function injectFloatingShareButton() {
  if (document.getElementById('global-floating-share-btn')) return;

  var shareBtn = document.createElement('button');
  shareBtn.id = 'global-floating-share-btn';
  shareBtn.className = 'floating-share-btn';
  shareBtn.setAttribute('title', 'مشاركة هذه الصفحة / الدرس');
  shareBtn.setAttribute('aria-label', 'مشاركة الصفحة');
  shareBtn.innerHTML = '🔗'; // يمكنك استبدالها بأيقونة FontAwesome أو SVG إذا أردت

  // عند الضغط على الزر
  shareBtn.onclick = function() {
    // 1. جلب رقم الصفحة الحالية المفتوحة في نظام الدروس لديك أوتوماتيكياً
    var pageNum = window.currentPageNumber || window.currentLessonPage || 1;

    // 2. جلب العنوان إن وجد أو الاعتماد على عنوان الصفحة الحالي
    var pageTitle = document.title;

    // 3. استدعاء دالة المشاركة الذكية في MetaManager
    if (window.shareLessonPage) {
      window.shareLessonPage(pageNum, pageTitle);
    } else if (window.MetaManager && window.MetaManager.shareCurrentLesson) {
      window.MetaManager.shareCurrentLesson(pageNum, pageTitle);
    }
  };

  document.body.appendChild(shareBtn);
}

// تفعيل إنشاء الزر بمجرد تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFloatingShareButton);
} else {
  injectFloatingShareButton();
}

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

      console.log('✅ MetaManager v3.0 (مع نظام المشاركة) initialized successfully');
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

// جعل الدوال متاحة عاماً
window.updatePageMeta = (sectionKey) => MetaManager.updateMeta(sectionKey);
window.shareLessonPage = (pageNumber, title, image) => MetaManager.shareCurrentLesson(pageNumber, title, image);


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MetaManager.init());
} else {
  MetaManager.init();
}

// جعل الدوال متاحة عاماً
window.updatePageMeta = (sectionKey) => MetaManager.updateMeta(sectionKey);
window.shareLessonPage = (pageNumber, title, image) => MetaManager.shareCurrentLesson(pageNumber, title, image);
